/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APPWRITE_ENDPOINT: string;
    readonly VITE_APPWRITE_PROJECT_ID: string;
    readonly VITE_DATABASE_ID: string;
    readonly VITE_PLAYERS_COLLECTION_ID: string;
    readonly VITE_MATCH_RESULTS_COLLECTION_ID: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }