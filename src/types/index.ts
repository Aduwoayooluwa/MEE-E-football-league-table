import type { Models } from 'appwrite';

// Ensure the Player type includes all fields from Models.Document
export interface Player extends Models.Document {
    $id: string;
    name: string;
    matches_played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
    goalDifference?: number;
}
  

// Ensure the MatchResult type includes all fields from Models.Document
export interface MatchResult extends Models.Document {
  team1_id: string;
  team2_id: string;
  score1: number;
  score2: number;
}
