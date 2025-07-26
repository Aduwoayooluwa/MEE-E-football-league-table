import type { Models } from 'appwrite';

// Ensure the Player type includes all fields from Models.Document
export interface Player extends Models.Document {
    $id: string;
    name: string;
    season_id: string; // Reference to season
    user_id: string; // Required field in Appwrite
    registration_type: 'admin_added' | 'user_registered';
    matches_played: number;
    won: number;
    drawn: number;
    lost: number;
    goals_for: number; // Changed from goalsFor to match Appwrite schema
    goals_against: number; // Changed from goalsAgainst to match Appwrite schema
    points: number;
    goalDifference?: number;
}
  

// Ensure the MatchResult type includes all fields from Models.Document
export interface MatchResult extends Models.Document {
  team1_id: string;
  team2_id: string;
  score1: number;
  score2: number;
  season_id: string; // Reference to season
  season: string; // Keep for backward compatibility
}

// New Season interface
export interface Season extends Models.Document {
  $id: string;
  name: string;
  status: 'registration_open' | 'active' | 'ended' | 'archived';
  registration_start_date: string;
  registration_end_date: string;
  season_start_date: string; // Required field in Appwrite
  season_end_date?: string;
  description?: string;
}

// New Season Registration interface
export interface SeasonRegistration extends Models.Document {
  $id: string;
  season_id: string;
  user_id: string;
  player_name: string;
  email: string;
  status: 'registered' | 'approved' | 'rejected';
  session_id: string; // Required field for Appwrite schema
}
