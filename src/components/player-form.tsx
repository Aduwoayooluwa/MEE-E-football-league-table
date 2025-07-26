/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { useEffect, useState } from 'react';
import { Form, Input, Button, List, message, Select, Card, Typography, Space } from 'antd';
import { databases, DATABASE_ID, PLAYERS_COLLECTION_ID } from '../services/appwrite';
import { seasonService } from '../services/seasons';
import { Player, Season } from '../types';
import { Query } from 'appwrite';

const { Title, Text } = Typography;

export default function PlayerForm() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  // Fetch seasons and players
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch seasons
      const fetchedSeasons = await seasonService.getAllSeasons();
      setSeasons(fetchedSeasons);
      
      // Set selected season to current active season or first available
      const activeSeason = await seasonService.getCurrentSeason();
      if (activeSeason) {
        setSelectedSeason(activeSeason.$id);
      } else if (fetchedSeasons.length > 0) {
        setSelectedSeason(fetchedSeasons[0].$id);
      }
      
      // Fetch players for selected season
      if (selectedSeason) {
        await fetchPlayers(selectedSeason);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to fetch data. Using legacy mode.');
      // Fall back to legacy mode - fetch all players without season filtering
      await fetchLegacyPlayers();
    } finally {
      setLoading(false);
    }
  };

  const fetchLegacyPlayers = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID, 
        PLAYERS_COLLECTION_ID
      );
      setPlayers(response.documents);
    } catch (error) {
      console.error('Error fetching legacy players:', error);
      message.error('Failed to fetch players');
    }
  };

  const fetchPlayers = async (seasonId: string) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID, 
        PLAYERS_COLLECTION_ID,
        [Query.equal('season_id', seasonId)]
      );
      setPlayers(response.documents);
    } catch (error) {
      console.error('Error fetching players:', error);
      message.error('Failed to fetch players');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSeason) {
      fetchPlayers(selectedSeason);
    }
  }, [selectedSeason]);

  // Add player
  const handleAddPlayer = async (values: { name: string }) => {
    if (!selectedSeason) {
      message.error('Please select a season first');
      return;
    }

    try {
      // Check for duplicate name in the same season
      const isDuplicate = players.some((player) => 
        player.name.toLowerCase() === values.name.toLowerCase() && 
        player.season_id === selectedSeason
      );
      
      if (isDuplicate) {
        message.error('Player with this name already exists in this season!');
        return;
      }

      // Prepare player data - handle both new and legacy structures
      const playerData: Record<string, unknown> = { 
        name: values.name, 
        season_id: selectedSeason,
        user_id: 'admin-user', // Default admin user ID
        registration_type: 'admin_added',
        matches_played: 0, 
        won: 0, 
        drawn: 0, 
        lost: 0, 
        goals_for: 0, 
        goals_against: 0, 
        points: 0 
      };

      // Add player if no duplicate found
      await databases.createDocument(
        DATABASE_ID,
        PLAYERS_COLLECTION_ID,
        'unique()',
        playerData
      );
      message.success('Player added successfully!');
      form.resetFields();
      if (selectedSeason) {
        fetchPlayers(selectedSeason);
      } else {
        fetchLegacyPlayers();
      }
    } catch (error) {
      console.error('Error adding player:', error);
      message.error('Failed to add player.');
    }
  };

  // Remove player
  const handleRemovePlayer = async (id: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, PLAYERS_COLLECTION_ID, id);
      message.success('Player removed successfully!');
      if (selectedSeason) {
        fetchPlayers(selectedSeason);
      }
    } catch (error) {
      console.error('Error removing player:', error);
      message.error('Failed to remove player.');
    }
  };

  const handleSeasonChange = (seasonId: string) => {
    setSelectedSeason(seasonId);
  };

  const selectedSeasonData = seasons.find(s => s.$id === selectedSeason);

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3}>Manage Players</Title>
          <Text type="secondary">
            Add and manage players for the selected season
          </Text>
        </div>

        <div>
          <Text strong>Select Season:</Text>
          <Select
            placeholder="Select Season"
            value={selectedSeason}
            onChange={handleSeasonChange}
            style={{ width: '100%', marginTop: 8 }}
            options={seasons.map(season => ({
              label: season.name,
              value: season.$id,
            }))}
          />
        </div>

        {selectedSeasonData && (
          <Card size="small" className="bg-gray-50">
            <Space direction="vertical" size="small">
              <div>
                <Text strong>Season:</Text> {selectedSeasonData.name}
              </div>
              <div>
                <Text strong>Status:</Text> {selectedSeasonData.status}
              </div>
            </Space>
          </Card>
        )}

        <Form onFinish={handleAddPlayer} layout="vertical" form={form}>
          <Form.Item 
            label="Player Name" 
            name="name" 
            rules={[{ required: true, message: 'Please enter player name!' }]}
          >
            <Input placeholder="Enter player name" />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              disabled={!selectedSeason}
            >
              Add Player
            </Button>
          </Form.Item>
        </Form>

        <div>
          <Text strong>Players in {selectedSeasonData?.name || 'Selected Season'}:</Text>
          <List
            dataSource={players}
            loading={loading}
            renderItem={(player) => (
              <List.Item
                actions={[
                  <Button 
                    type="link" 
                    danger 
                    onClick={() => handleRemovePlayer(player.$id)}
                  >
                    Remove
                  </Button>,
                ]}
              >
                {player.name}
              </List.Item>
            )}
          />
        </div>
      </Space>
    </Card>
  );
}
