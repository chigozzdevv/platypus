export interface JWTPayload {
  userId: string;
  walletAddress: string;
  userType: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  walletAddress: string;
  userType: 'user' | 'admin';
  username?: string;
}