import { useEffect, useState } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { databases } from '../services/appwrite';

const DATABASE_ID = '674ef8a200347a8bf548';
const PLAYERS_COLLECTION_ID = '674ef8cf0001bc97992a';
const MATCH_RESULTS_COLLECTION_ID = '674ef9fa0023434f4943';

interface MatchResultFormValues {
  team1: string;
  team2: string;
  score1: number;
  score2: number;
}

export default function AdminPanel() {
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [selectedTeam1, setSelectedTeam1] = useState<string | null>(null);
  const [selectedTeam2, setSelectedTeam2] = useState<string | null>(null);

  // Fetch teams (players) from Appwrite
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await databases.listDocuments(DATABASE_ID, PLAYERS_COLLECTION_ID);
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

    fetchTeams();
  }, []);

  // Handle form submission
  const handleSubmit = async (values: MatchResultFormValues): Promise<void> => {
    if (values.team1 === values.team2) {
      message.error('Team 1 and Team 2 cannot be the same!');
      return;
    }

    try {
      await databases.createDocument(
        DATABASE_ID,
        MATCH_RESULTS_COLLECTION_ID,
        'unique()',
        {
          team1_id: values.team1,
          team2_id: values.team2,
          score1: Number(values.score1),
          score2: Number(values.score2),
          season: '1st season',
        }
      );
      message.success('Match result recorded!');
    } catch (error) {
      console.error('Error recording match result:', error);
      message.error('Failed to record match result.');
    }
  };

  // Filtered team lists based on the selection
  const team1Options = teams.filter((team) => team.id !== selectedTeam2);
  const team2Options = teams.filter((team) => team.id !== selectedTeam1);

  return (
    <div>
      <h2>Record Match Results</h2>
      <Form
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
          <Input type="number" />
        </Form.Item>
        <Form.Item
          label="Score for Team 2"
          name="score2"
          rules={[{ required: true, message: 'Please enter the score for Team 2!' }]}
        >
          <Input type="number" />
        </Form.Item>
        <Form.Item
          label="Season"
          name="season"
          initialValue={'1st season'}
          rules={[{ required: true }]}
        >
          <Input disabled />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Save Result
        </Button>
      </Form>
    </div>
  );
}
