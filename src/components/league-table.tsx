import  { useEffect, useState } from 'react';
import { Table } from 'antd';
import { databases } from '../services/appwrite';
import { calculateGoalDifference, sortTeams } from '../utils/calculations';
import { Player, MatchResult } from '../types';
import { Query } from 'appwrite';

const DATABASE_ID = import.meta.env.VITE_DATABASE_ID;
const PLAYERS_COLLECTION_ID = import.meta.env.VITE_PLAYERS_COLLECTION_ID;
const MATCH_RESULTS_COLLECTION_ID = import.meta.env.VITE_MATCH_RESULTS_COLLECTION_ID;

export default function LeagueTable() {
  const [teams, setTeams] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeagueData = async () => {
    try {
      const playersResponse = await databases.listDocuments<Player>(
        DATABASE_ID,
        PLAYERS_COLLECTION_ID,
        
      );
      const matchResultsResponse = await databases.listDocuments<MatchResult>(
        DATABASE_ID,
        MATCH_RESULTS_COLLECTION_ID,
        [
          Query.limit(100),
          Query.offset(0),
        ]
       
      );

      console.log(matchResultsResponse, 'matchResponse')

      const playerStats: Record<string, Player> = playersResponse.documents.reduce((acc, player) => {
        acc[player.$id] = {
          ...player,
          matches_played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        };
        return acc;
      }, {} as Record<string, Player>);

      matchResultsResponse.documents.forEach((match) => {
        const { team1_id, team2_id, score1, score2 } = match;

        if (playerStats[team1_id]) {
          const team1 = playerStats[team1_id];
          team1.matches_played += 1;
          team1.goalsFor += score1;
          team1.goalsAgainst += score2;

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
          team2.goalsFor += score2;
          team2.goalsAgainst += score1;

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

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      setTeams(sortTeams(updatedTeams));
    } catch (error) {
      console.error('Error fetching league data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeagueData();
  }, []);

  const columns = [
    { title: 'Team', dataIndex: 'name', key: 'name' },
    { title: 'Points', dataIndex: 'points', key: 'points' },
    { title: 'GD', dataIndex: 'goalDifference', key: 'goalDifference' },
    { title: 'GF', dataIndex: 'goalsFor', key: 'goalsFor' },
    { title: 'GA', dataIndex: 'goalsAgainst', key: 'goalsAgainst' },
    { title: 'PL', dataIndex: 'matches_played', key: 'matches_played' },
    { title: 'Won', dataIndex: 'won', key: 'won' },
    { title: 'Drawn', dataIndex: 'drawn', key: 'drawn' },
    { title: 'Lost', dataIndex: 'lost', key: 'lost' },
    
  ];

  return (
    <Table
      loading={loading}
      className="w-full overflow-x-auto"
      dataSource={teams}
      columns={columns}
      pagination={false}
      rowKey="$id"
    />
  );
}
