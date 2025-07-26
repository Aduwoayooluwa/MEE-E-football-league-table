import { useEffect, useState } from 'react';
import { Form, Input, Button, Select, message, Card, Typography, Space } from 'antd';
import { databases, DATABASE_ID, PLAYERS_COLLECTION_ID, MATCH_RESULTS_COLLECTION_ID } from '../services/appwrite';
import { seasonService } from '../services/seasons';
import { Season } from '../types';
import { Query } from 'appwrite';

const { Title, Text } = Typography;

interface MatchResultFormValues {
  team1: string;
  team2: string;
  score1: number;
  score2: number;
}

export default function AdminPanel() {
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [selectedTeam1, setSelectedTeam1] = useState<string | null>(null);
  const [selectedTeam2, setSelectedTeam2] = useState<string | null>(null);
  const [form] = Form.useForm();

  // Fetch seasons and teams
  const fetchData = async () => {
    try {
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
    } catch (error) {
      console.error('Error fetching seasons:', error);
      message.error('Failed to fetch seasons. Using legacy mode.');
      // Fall back to legacy mode - fetch all teams without season filtering
      await fetchLegacyTeams();
    }
  };

  const fetchLegacyTeams = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID, 
        PLAYERS_COLLECTION_ID
      );
      const fetchedTeams = response.documents.map((team) => ({
        id: team.$id,
        name: team.name,
      }));
      setTeams(fetchedTeams);
    } catch (error) {
      console.error('Error fetching legacy teams:', error);
      message.error('Failed to fetch teams.');
    }
  };

  // Fetch teams (players) for selected season
  const fetchTeams = async (seasonId: string) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID, 
        PLAYERS_COLLECTION_ID,
        [Query.equal('season_id', seasonId)]
      );
      const fetchedTeams = response.documents.map((team) => ({
        id: team.$id,
        name: team.name,
      }));
      setTeams(fetchedTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      message.error('Failed to fetch teams.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSeason) {
      fetchTeams(selectedSeason);
    }
  }, [selectedSeason]);

  // Handle form submission
  const handleSubmit = async (values: MatchResultFormValues): Promise<void> => {
    if (!selectedSeason) {
      message.error('Please select a season first');
      return;
    }

    if (values.team1 === values.team2) {
      message.error('Team 1 and Team 2 cannot be the same!');
      return;
    }

    try {
      // Prepare match data - handle both new and legacy structures
      const matchData: Record<string, unknown> = {
        team1_id: values.team1,
        team2_id: values.team2,
        score1: Number(values.score1),
        score2: Number(values.score2),
      };

      // Add season-related fields if we have a selected season
      if (selectedSeason) {
        matchData.season_id = selectedSeason;
        matchData.season = seasons.find(s => s.$id === selectedSeason)?.name || 'Unknown Season';
      } else {
        matchData.season = 'Legacy Season';
      }

      await databases.createDocument(
        DATABASE_ID,
        MATCH_RESULTS_COLLECTION_ID,
        'unique()',
        matchData
      );
      message.success('Match result recorded!');
      form.resetFields();
      setSelectedTeam1(null);
      setSelectedTeam2(null);
    } catch (error) {
      console.error('Error recording match result:', error);
      message.error('Failed to record match result.');
    }
  };

  const handleSeasonChange = (seasonId: string) => {
    setSelectedSeason(seasonId);
    setSelectedTeam1(null);
    setSelectedTeam2(null);
    form.resetFields();
  };

  // Filtered team lists based on the selection
  const team1Options = teams.filter((team) => team.id !== selectedTeam2);
  const team2Options = teams.filter((team) => team.id !== selectedTeam1);

  const selectedSeasonData = seasons.find(s => s.$id === selectedSeason);

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3}>Record Match Results</Title>
          <Text type="secondary">
            Record match scores for the selected season
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
              <div>
                <Text strong>Available Teams:</Text> {teams.length}
              </div>
            </Space>
          </Card>
        )}

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          onValuesChange={(changedValues) => {
            if (changedValues.team1) setSelectedTeam1(changedValues.team1);
            if (changedValues.team2) setSelectedTeam2(changedValues.team2);
          }}
        >
          <Form.Item
            label="Team 1"
            name="team1"
            rules={[{ required: true, message: 'Please select Team 1!' }]}
          >
            <Select
              placeholder="Select Team 1"
              onChange={(value) => setSelectedTeam1(value)}
              disabled={!selectedSeason || teams.length === 0}
            >
              {team1Options.map((team) => (
                <Select.Option key={team.id} value={team.id}>
                  {team.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Team 2"
            name="team2"
            rules={[{ required: true, message: 'Please select Team 2!' }]}
          >
            <Select
              placeholder="Select Team 2"
              onChange={(value) => setSelectedTeam2(value)}
              disabled={!selectedSeason || teams.length === 0}
            >
              {team2Options.map((team) => (
                <Select.Option key={team.id} value={team.id}>
                  {team.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Score for Team 1"
            name="score1"
            rules={[{ required: true, message: 'Please enter the score for Team 1!' }]}
          >
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item
            label="Score for Team 2"
            name="score2"
            rules={[{ required: true, message: 'Please enter the score for Team 2!' }]}
          >
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              disabled={!selectedSeason || teams.length < 2}
            >
              Save Result
            </Button>
          </Form.Item>
        </Form>
      </Space>
    </Card>
  );
}
