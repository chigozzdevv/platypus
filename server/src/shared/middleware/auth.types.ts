export interface JWTPayload {
  userId: string;
  walletAddress: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  walletAddress: string;
  username?: string;
}