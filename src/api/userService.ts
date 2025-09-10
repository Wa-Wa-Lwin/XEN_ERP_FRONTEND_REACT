import { type DatabaseUser, type ApiResponse } from '../types'
import { apiClient } from './config';
import { API_ENDPOINTS } from './const';

export const userService = {
  /**
   * Fetch user data by email from database
   */
  async getUserByEmail(email: string): Promise<DatabaseUser> {
    try {
      const response = await apiClient.get<ApiResponse<DatabaseUser>>(
        API_ENDPOINTS.USER_BY_EMAIL(email)
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  },

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<DatabaseUser> {
    try {
      const response = await apiClient.get<ApiResponse<DatabaseUser>>(
        API_ENDPOINTS.USER_PROFILE
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
};

export default userService;