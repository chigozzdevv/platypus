const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

interface ApiError {
  error: {
    code: string;
    message: string;
    details: Record<string, any>;
  };
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      let msg = 'API request failed';
      try {
        const errorData: ApiError = await response.json();
        msg = errorData.error?.message || msg;
      } catch {}
      throw new Error(msg);
    }
    const data: ApiResponse<T> = await response.json();
    return data.data;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: data ? JSON.stringify(data) : undefined });
  }
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body: data ? JSON.stringify(data) : undefined });
  }
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;