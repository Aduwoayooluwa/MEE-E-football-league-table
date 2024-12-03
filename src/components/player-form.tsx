/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { useEffect, useState } from 'react';
import { Form, Input, Button, List, message } from 'antd';
import { databases } from '../services/appwrite';

const DATABASE_ID = import.meta.env.VITE_DATABASE_ID;
const PLAYERS_COLLECTION_ID = import.meta.env.VITE_PLAYERS_COLLECTION_ID;

export default function PlayerForm() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  

  // Fetch players from Appwrite
  const fetchPlayers = async () => {
    try {
      const response = await databases.listDocuments(DATABASE_ID, PLAYERS_COLLECTION_ID);
      setPlayers(response.documents);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
    finally{ setLoading(false); }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  // Add player
  const handleAddPlayer = async (values) => {
    try {
      // Check for duplicate name
      const isDuplicate = players.some((player) => player.name.toLowerCase() === values.name.toLowerCase());
      if (isDuplicate) {
        message.error('Player with this name already exists!');
        return;
      }

      // Add player if no duplicate found
      await databases.createDocument(
        DATABASE_ID,
        PLAYERS_COLLECTION_ID,
        'unique()',
        { name: values.name, matches_played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, points: 0 }
      );
      message.success('Player added successfully!');
      window.location.reload(); 
    } catch (error) {
      console.error('Error adding player:', error);
      message.error('Failed to add player.');
    }
  };

  // Remove player
  const handleRemovePlayer = async (id) => {
    try {
      await databases.deleteDocument(DATABASE_ID, PLAYERS_COLLECTION_ID, id);
      message.success('Player removed successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error removing player:', error);
      message.error('Failed to remove player.');
    }

  };

  return (
    <div>
      <h2>Manage Players</h2>
      <Form onFinish={handleAddPlayer} layout="vertical">
        <Form.Item label="Player Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Add Player
        </Button>
      </Form>
      <List
        dataSource={players}
        loading={loading}
        renderItem={(player) => (
          <List.Item
            actions={[
              <Button type="link" danger onClick={() => handleRemovePlayer(player.$id)}>
                Remove
              </Button>,
            ]}
          >
            {player.name}
          </List.Item>
        )}
      />
    </div>
  );
}
