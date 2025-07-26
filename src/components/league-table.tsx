import  { useEffect, useState } from 'react';
import { Table, Select, Card, Typography, Space, Alert, Button } from 'antd';
import { databases, DATABASE_ID, PLAYERS_COLLECTION_ID, MATCH_RESULTS_COLLECTION_ID } from '../services/appwrite';
import { calculateGoalDifference, sortTeams } from '../utils/calculations';
import { Player, MatchResult, Season } from '../types';
import { Query } from 'appwrite';
import { seasonService } from '../services/seasons';

const { Title } = Typography;

export default function LeagueTable() {
  const [teams, setTeams] = useState<Player[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('LeagueTable render - loading:', loading, 'teams:', teams.length, 'seasons:', seasons.length);

  const fetchSeasons = async () => {
    console.log('fetchSeasons called');
    try {
      const fetchedSeasons = await seasonService.getAllSeasons();
      console.log('Fetched seasons:', fetchedSeasons);
      setSeasons(fetchedSeasons);
      
      // Get current active season
      const activeSeason = await seasonService.getCurrentSeason();
      console.log('Active season:', activeSeason);
      
      // Set selected season to current active season or first available
      if (activeSeason) {
        setSelectedSeason(activeSeason.$id);
      } else if (fetchedSeasons.length > 0) {
        setSelectedSeason(fetchedSeasons[0].$id);
      } else {
        // No seasons found, show empty table
        console.log('No seasons found, showing empty table');
        setSelectedSeason(null);
        setTeams([]);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching seasons:', error);
      // Show the actual error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Check if it's a 401 unauthorized error
      if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('not authorized')) {
        setError(`Permission Error: ${errorMessage}. Please check Appwrite collection permissions.`);
      } else {
        setError(`Failed to fetch seasons: ${errorMessage}`);
      }
      // Show empty table on error
      setTeams([]);
      setLoading(false);
    }
  };

  const fetchLeagueData = async (seasonId: string) => {
    if (!seasonId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get players for the specific season
      const playersResponse = await databases.listDocuments<Player>(
        DATABASE_ID,
        PLAYERS_COLLECTION_ID,
        [Query.equal('season_id', seasonId)]
      );
      
      console.log('Players response:', playersResponse);
      
      // Get match results for the specific season
      const matchResultsResponse = await databases.listDocuments<MatchResult>(
        DATABASE_ID,
        MATCH_RESULTS_COLLECTION_ID,
        [
          Query.equal('season_id', seasonId),
          Query.limit(100),
          Query.offset(0),
        ]
      );

      console.log('Match results response:', matchResultsResponse);

      const playerStats: Record<string, Player> = playersResponse.documents.reduce((acc, player) => {
        acc[player.$id] = {
          ...player,
          season_id: player.season_id || 'legacy-season',
          user_id: player.user_id || 'legacy-user',
          registration_type: player.registration_type || 'admin_added',
          matches_played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goals_for: 0,
          goals_against: 0,
          points: 0,
        };
        return acc;
      }, {} as Record<string, Player>);

      matchResultsResponse.documents.forEach((match) => {
        const { team1_id, team2_id, score1, score2 } = match;

        if (playerStats[team1_id]) {
          const team1 = playerStats[team1_id];
          team1.matches_played += 1;
          team1.goals_for += score1;
          team1.goals_against += score2;

          if (score1 > score2) {
            team1.won += 1;
            team1.points += 3;
          } else if (score1 === score2) {
            team1.drawn += 1;
            team1.points += 1;
          } else {
            team1.lost += 1;
          }
        }

        if (playerStats[team2_id]) {
          const team2 = playerStats[team2_id];
          team2.matches_played += 1;
          team2.goals_for += score2;
          team2.goals_against += score1;

          if (score2 > score1) {
            team2.won += 1;
            team2.points += 3;
          } else if (score1 === score2) {
            team2.drawn += 1;
            team2.points += 1;
          } else {
            team2.lost += 1;
          }
        }
      });

      const updatedTeams = Object.values(playerStats).map((team) => ({
        ...team,
        goalDifference: calculateGoalDifference(team),
      }));

      console.log('Updated teams (season):', updatedTeams);

      const sortedTeams = sortTeams(updatedTeams) as Player[];
      console.log('Sorted teams (season):', sortedTeams);
      setTeams(sortedTeams);
    } catch (error) {
      console.error('Error fetching league data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Check if it's a 401 unauthorized error
      if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('not authorized')) {
        setError(`Permission Error: ${errorMessage}. Please check Appwrite collection permissions.`);
      } else {
        setError(`Failed to fetch season data: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect 1 - fetchSeasons called');
    fetchSeasons();
    
    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached, setting loading to false');
        setLoading(false);
        setError('Loading timeout. Please check your connection and try again.');
      }
    }, 10000); // 10 seconds timeout
    
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    console.log('useEffect 2 - selectedSeason changed:', selectedSeason);
    if (selectedSeason) {
      fetchLeagueData(selectedSeason);
    }
  }, [selectedSeason]);

  const handleSeasonChange = (seasonId: string) => {
    console.log('Season changed to:', seasonId);
    setSelectedSeason(seasonId);
    fetchLeagueData(seasonId);
  };

  const columns = [
    { title: 'Team', dataIndex: 'name', key: 'name' },
    { title: 'Points', dataIndex: 'points', key: 'points' },
    { title: 'GD', dataIndex: 'goalDifference', key: 'goalDifference' },
    { title: 'GF', dataIndex: 'goals_for', key: 'goals_for' },
    { title: 'GA', dataIndex: 'goals_against', key: 'goals_against' },
    { title: 'PL', dataIndex: 'matches_played', key: 'matches_played' },
    { title: 'Won', dataIndex: 'won', key: 'won' },
    { title: 'Drawn', dataIndex: 'drawn', key: 'drawn' },
    { title: 'Lost', dataIndex: 'lost', key: 'lost' },
  ];

  const selectedSeasonData = seasons.find(s => s.$id === selectedSeason);

  return (
    <div className="space-y-6">
      {error && (
        <Alert
          message="Configuration Notice"
          description={
            <div>
              <p>{error}</p>
              {error.includes('Permission Error') && (
                <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-800 font-semibold">How to fix permissions:</p>
                  <ol className="text-sm text-blue-700 mt-1 ml-4 list-decimal">
                    <li>Go to your Appwrite Console</li>
                    <li>Navigate to your database and collections</li>
                    <li>For each collection (players, match_results, seasons), set permissions to:</li>
                    <li className="ml-4">• Read: "Any authenticated user" or "Any user"</li>
                    <li className="ml-4">• Write: "Any authenticated user" (for admin functions)</li>
                    <li>Save the permissions</li>
                  </ol>
                </div>
              )}
            </div>
          }
          type="warning"
          showIcon
          closable
          onClose={() => setError(null)}
        />
      )}

      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div className="flex justify-between items-center">
            <Title level={2} className="mb-0">
              MEE Football League Table
            </Title>
            <Space>
              {seasons.length > 0 && (
                <Select
                  placeholder="Select Season"
                  value={selectedSeason}
                  onChange={handleSeasonChange}
                  style={{ width: 200 }}
                  options={seasons.map(season => ({
                    label: season.name,
                    value: season.$id,
                  }))}
                />
              )}
              <Button 
                onClick={() => {
                  console.log('Manual refresh clicked');
                  setLoading(true);
                  if (selectedSeason) {
                    fetchLeagueData(selectedSeason);
                  } else {
                    setLoading(false);
                  }
                }}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </div>
          
          {selectedSeasonData && (
            <div className="text-gray-600">
              <p><strong>Season:</strong> {selectedSeasonData.name}</p>
              {selectedSeasonData.description && (
                <p><strong>Description:</strong> {selectedSeasonData.description}</p>
              )}
            </div>
          )}
        </Space>
      </Card>

      <Card>
        <Table
          loading={loading}
          className="w-full overflow-x-auto"
          dataSource={teams}
          columns={columns}
          pagination={false}
          rowKey="$id"
          locale={{
            emptyText: loading 
              ? 'Loading...' 
              : seasons.length === 0 
                ? 'No seasons created yet. Create a season to start the league.'
                : 'No teams found for this season. Add some players to see the league table.'
          }}
        />
      </Card>
    </div>
  );
}
