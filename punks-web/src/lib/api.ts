/**
 * API Client for The Cyphers Platform
 * Handles all communication with api-punks.24hrmvp.xyz
 */

import type { 
  ApiResponse, 
  PaginatedResponse, 
  AuthChallenge, 
  AuthVerifyRequest, 
  AuthResult, 
  MintSession, 
  MintStats, 
  CypherNFT, 
  User,
  GalleryFilters,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const json = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: json.error || json.message || 'Request failed',
        };
      }

      // Backend returns { success: true, data: {...} }
      // Extract the inner data object
      const data = json.data || json;

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Health check
  async health() {
    return this.request<{ status: string; timestamp: string }>('/health');
  }

  // Auth endpoints
  async getChallenge(address: string): Promise<ApiResponse<AuthChallenge>> {
    return this.request<AuthChallenge>(
      '/auth/doge/challenge',
      {
        method: 'POST',
        body: JSON.stringify({ address }),
      }
    );
  }

  async verifySignature(data: AuthVerifyRequest): Promise<ApiResponse<AuthResult>> {
    return this.request<AuthResult>('/auth/doge/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/me');
  }

  // Mint endpoints
  async requestMint(): Promise<ApiResponse<{ session: MintSession }>> {
    return this.request<{ session: MintSession }>('/mint/request', {
      method: 'POST',
    });
  }

  async getMintStatus(sessionId: string): Promise<ApiResponse<{ session: MintSession }>> {
    return this.request<{ session: MintSession }>(`/mint/status/${sessionId}`);
  }

  async confirmPayment(sessionId: string, txHash: string): Promise<ApiResponse<{ session: MintSession }>> {
    return this.request<{ session: MintSession }>('/mint/confirm-payment', {
      method: 'POST',
      body: JSON.stringify({ sessionId, txHash }),
    });
  }

  async cancelMint(sessionId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(`/mint/cancel/${sessionId}`, {
      method: 'POST',
    });
  }

  async getMintStats(): Promise<ApiResponse<MintStats>> {
    return this.request<MintStats>('/mint/stats');
  }

  // Gallery endpoints
  async getGallery(params?: GalleryFilters & { page?: number; limit?: number }): Promise<ApiResponse<PaginatedResponse<CypherNFT>>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.rarity) searchParams.set('rarity', params.rarity);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    return this.request<PaginatedResponse<CypherNFT>>(`/cyphers${query ? `?${query}` : ''}`);
  }

  async getCypher(id: string): Promise<ApiResponse<CypherNFT>> {
    return this.request<CypherNFT>(`/cyphers/${id}`);
  }

  async getPortfolio(address: string): Promise<ApiResponse<PaginatedResponse<CypherNFT>>> {
    return this.request<PaginatedResponse<CypherNFT>>(`/portfolio/${address}`);
  }
}

export const api = new ApiClient(API_URL);
export default api;
