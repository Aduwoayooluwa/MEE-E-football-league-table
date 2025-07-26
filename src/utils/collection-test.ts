import { databases, DATABASE_ID, PLAYERS_COLLECTION_ID, MATCH_RESULTS_COLLECTION_ID } from '../services/appwrite';

export const testCollectionStructure = async () => {
  const results = {
    players: null as unknown,
    matchResults: null as unknown,
    errors: [] as string[]
  };

  // Test players collection structure
  try {
    const testPlayer = {
      name: 'Test Player',
      season_id: 'test-season',
      user_id: 'test-user-id',
      registration_type: 'admin_added',
      matches_played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      points: 0
    };

    const playerResponse = await databases.createDocument(
      DATABASE_ID,
      PLAYERS_COLLECTION_ID,
      'unique()',
      testPlayer
    );
    
    results.players = playerResponse;
    
    // Clean up
    await databases.deleteDocument(
      DATABASE_ID,
      PLAYERS_COLLECTION_ID,
      playerResponse.$id
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    results.errors.push(`Players collection error: ${errorMessage}`);
  }

  // Test match_results collection structure
  try {
    const testMatch = {
      team1_id: 'test-team-1',
      team2_id: 'test-team-2',
      score1: 0,
      score2: 0,
      season_id: 'test-season',
      season: 'Test Season'
    };

    const matchResponse = await databases.createDocument(
      DATABASE_ID,
      MATCH_RESULTS_COLLECTION_ID,
      'unique()',
      testMatch
    );
    
    results.matchResults = matchResponse;
    
    // Clean up
    await databases.deleteDocument(
      DATABASE_ID,
      MATCH_RESULTS_COLLECTION_ID,
      matchResponse.$id
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    results.errors.push(`Match results collection error: ${errorMessage}`);
  }

  return results;
}; 