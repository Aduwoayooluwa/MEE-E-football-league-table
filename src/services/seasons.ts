import { databases, DATABASE_ID, SEASONS_COLLECTION_ID, SEASON_REGISTRATIONS_COLLECTION_ID, PLAYERS_COLLECTION_ID } from './appwrite';
import { Season, SeasonRegistration, Player } from '../types';
import { Query } from 'appwrite';

export const seasonService = {
  // Get all seasons
  async getAllSeasons(): Promise<Season[]> {
    try {
      const response = await databases.listDocuments<Season>(
        DATABASE_ID,
        SEASONS_COLLECTION_ID,
        [Query.orderDesc('$createdAt')]
      );
      return response.documents;
    } catch (error) {
      console.error('Error fetching seasons:', error);
      // Return empty array if seasons collection doesn't exist yet
      return [];
    }
  },

  // Get current active season
  async getCurrentSeason(): Promise<Season | null> {
    try {
      const response = await databases.listDocuments<Season>(
        DATABASE_ID,
        SEASONS_COLLECTION_ID,
        [
          Query.equal('status', 'active'),
          Query.limit(1)
        ]
      );
      return response.documents[0] || null;
    } catch (error) {
      console.error('Error fetching current season:', error);
      return null;
    }
  },

  // Get season open for registration
  async getSeasonOpenForRegistration(): Promise<Season | null> {
    try {
      const response = await databases.listDocuments<Season>(
        DATABASE_ID,
        SEASONS_COLLECTION_ID,
        [
          Query.equal('status', 'registration_open'),
          Query.limit(1)
        ]
      );
      return response.documents[0] || null;
    } catch (error) {
      console.error('Error fetching season open for registration:', error);
      return null;
    }
  },

  // Get season by ID
  async getSeasonById(seasonId: string): Promise<Season> {
    try {
      const response = await databases.getDocument<Season>(
        DATABASE_ID,
        SEASONS_COLLECTION_ID,
        seasonId
      );
      return response;
    } catch (error) {
      console.error('Error fetching season:', error);
      throw error;
    }
  },

  // Create new season
  async createSeason(seasonData: Omit<Season, '$id' | '$createdAt' | '$updatedAt' | '$permissions'>): Promise<Season> {
    try {
      const response = await databases.createDocument<Season>(
        DATABASE_ID,
        SEASONS_COLLECTION_ID,
        'unique()',
        seasonData
      );
      return response;
    } catch (error) {
      console.error('Error creating season:', error);
      throw error;
    }
  },

  // Update season status
  async updateSeasonStatus(seasonId: string, status: Season['status'], additionalData?: Partial<Season>): Promise<Season> {
    try {
      const updateData: Record<string, unknown> = { status, ...additionalData };
      const response = await databases.updateDocument<Season>(
        DATABASE_ID,
        SEASONS_COLLECTION_ID,
        seasonId,
        updateData
      );
      return response;
    } catch (error) {
      console.error('Error updating season status:', error);
      throw error;
    }
  },

  // Start a season (change status from registration_open to active)
  async startSeason(seasonId: string): Promise<Season> {
    return this.updateSeasonStatus(seasonId, 'active', {
      season_start_date: new Date().toISOString()
    });
  },

  // End a season (change status from active to ended)
  async endSeason(seasonId: string): Promise<Season> {
    return this.updateSeasonStatus(seasonId, 'ended', {
      season_end_date: new Date().toISOString()
    });
  },

  // Archive a season (change status from ended to archived)
  async archiveSeason(seasonId: string): Promise<Season> {
    return this.updateSeasonStatus(seasonId, 'archived');
  },

  // Delete a season (permanently remove)
  async deleteSeason(seasonId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        SEASONS_COLLECTION_ID,
        seasonId
      );
    } catch (error) {
      console.error('Error deleting season:', error);
      throw error;
    }
  },

  // Get season registrations
  async getSeasonRegistrations(seasonId: string): Promise<SeasonRegistration[]> {
    try {
      const response = await databases.listDocuments<SeasonRegistration>(
        DATABASE_ID,
        SEASON_REGISTRATIONS_COLLECTION_ID,
        [
          Query.equal('season_id', seasonId),
          Query.orderDesc('$createdAt')
        ]
      );
      return response.documents;
    } catch (error) {
      console.error('Error fetching season registrations:', error);
      return [];
    }
  },

  // Register user for a season
  async registerForSeason(registrationData: Omit<SeasonRegistration, '$id' | '$createdAt' | '$updatedAt' | '$permissions'>): Promise<SeasonRegistration> {
    try {
      const response = await databases.createDocument<SeasonRegistration>(
        DATABASE_ID,
        SEASON_REGISTRATIONS_COLLECTION_ID,
        'unique()',
        registrationData
      );
      return response;
    } catch (error) {
      console.error('Error registering for season:', error);
      throw error;
    }
  },

  // Approve/reject registration
  async updateRegistrationStatus(registrationId: string, status: 'approved' | 'rejected'): Promise<SeasonRegistration> {
    try {
      const response = await databases.updateDocument<SeasonRegistration>(
        DATABASE_ID,
        SEASON_REGISTRATIONS_COLLECTION_ID,
        registrationId,
        { status }
      );
      return response;
    } catch (error) {
      console.error('Error updating registration status:', error);
      throw error;
    }
  },

  // Get players for a specific season
  async getSeasonPlayers(seasonId: string): Promise<Player[]> {
    try {
      const response = await databases.listDocuments<Player>(
        DATABASE_ID,
        PLAYERS_COLLECTION_ID,
        [
          Query.equal('season_id', seasonId),
          Query.orderDesc('points')
        ]
      );
      return response.documents;
    } catch (error) {
      console.error('Error fetching season players:', error);
      // If season_id field doesn't exist, return all players
      try {
        const response = await databases.listDocuments<Player>(
          DATABASE_ID,
          PLAYERS_COLLECTION_ID,
          [Query.orderDesc('points')]
        );
        return response.documents;
      } catch (fallbackError) {
        console.error('Error fetching all players:', fallbackError);
        return [];
      }
    }
  }
}; 