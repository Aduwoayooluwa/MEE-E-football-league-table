interface TeamStats {
    won: number;
    drawn: number;
    lost: number;
    goals_for: number; // Changed from goalsFor to match Appwrite schema
    goals_against: number; // Changed from goalsAgainst to match Appwrite schema
  }
  
  export function calculatePoints(stats: TeamStats) {
    return stats.won * 3 + stats.drawn;
  }
  
  export function calculateGoalDifference(stats: TeamStats) {
    return stats.goals_for - stats.goals_against;
  }
  
interface Team {
    points: number;
    goalDifference: number;
    goals_for: number; // Changed from goalsFor to match Appwrite schema
}

export function sortTeams(teams: Team[]): Team[] {
    return teams.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points; 
        if (b.goalDifference !== a.goalDifference)
            return b.goalDifference - a.goalDifference; 
        return b.goals_for - a.goals_for; 
    });
}
  