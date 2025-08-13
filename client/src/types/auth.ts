export interface User {
  id: string;
  walletAddress: string;
  username: string;
  bio?: string;
  avatar?: string;
  specialties: string[];
  reputation: number;
  userType: 'user' | 'admin';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

export interface LoginRequest {
  walletAddress: string;
  signature?: string;
  message?: string;
  originJWT?: string;
}

export interface NonceResponse {
  nonce: string;
  message: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}