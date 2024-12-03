interface TeamStats {
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
  }
  
  export function calculatePoints(stats: TeamStats) {
    return stats.won * 3 + stats.drawn;
  }
  
  export function calculateGoalDifference(stats: TeamStats) {
    return stats.goalsFor - stats.goalsAgainst;
  }
  
interface Team {
    points: number;
    goalDifference: number;
    goalsFor: number;
}

export function sortTeams(teams: Team[]): Team[] {
    return teams.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points; 
        if (b.goalDifference !== a.goalDifference)
            return b.goalDifference - a.goalDifference; 
        return b.goalsFor - a.goalsFor; 
    });
}
  