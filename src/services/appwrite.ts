import { Client, Databases, Account } from 'appwrite';

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT as string)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID as string);

// Database instance
const databases = new Databases(client);

const account = new Account(client);

export { client, databases, account };

