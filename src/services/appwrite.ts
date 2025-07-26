import { Client, Databases, Account } from 'appwrite';

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT as string)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID as string);

// Database instance
const databases = new Databases(client);

const account = new Account(client);

// Collection IDs
const DATABASE_ID = import.meta.env.VITE_DATABASE_ID;
const PLAYERS_COLLECTION_ID = import.meta.env.VITE_PLAYERS_COLLECTION_ID;
const MATCH_RESULTS_COLLECTION_ID = import.meta.env.VITE_MATCH_RESULTS_COLLECTION_ID;
const SEASONS_COLLECTION_ID = import.meta.env.VITE_SEASONS_COLLECTION_ID;
const SEASON_REGISTRATIONS_COLLECTION_ID = import.meta.env.VITE_SEASON_REGISTRATIONS_COLLECTION_ID;

export { 
  client, 
  databases, 
  account,
  DATABASE_ID,
  PLAYERS_COLLECTION_ID,
  MATCH_RESULTS_COLLECTION_ID,
  SEASONS_COLLECTION_ID,
  SEASON_REGISTRATIONS_COLLECTION_ID
};

