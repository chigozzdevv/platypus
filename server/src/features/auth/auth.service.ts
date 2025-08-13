import jwt from 'jsonwebtoken';
import * as jose from 'jose';
import { env } from '@/shared/config/env';
import { logger } from '@/shared/utils/logger';
import { encrypt, decrypt } from '@/shared/utils/encryption';
import { User } from './auth.model';
import { UserDocument } from '@/shared/types/database.types';
import { JWTPayload } from '@/shared/middleware/auth.types';
import { CustomError } from '@/shared/middleware/error.middleware';
import { Types } from 'mongoose';

export class AuthService {
  private async verifyOriginJWT(originJWT: string): Promise<any> {
    try {
      const JWKS = jose.createRemoteJWKSet(new URL('https://api.origin.campnetwork.xyz/.well-known/jwks'));
      
      const { payload } = await jose.jwtVerify(originJWT, JWKS, {
        issuer: 'https://api.origin.campnetwork.xyz',
        audience: env.CAMP_CLIENT_ID,
      });

      return payload;
    } catch (error) {
      logger.error('Invalid Origin JWT', { error });
      throw new CustomError('INVALID_ORIGIN_JWT', 401, 'Invalid Camp Network authentication token');
    }
  }

  async verifyAndConnect(
    walletAddress: string,
    signature: string,
    message: string,
    originJWT?: string
  ): Promise<{ user: UserDocument; token: string }> {
    const normalizedAddress = walletAddress.toLowerCase();
    
    if (!originJWT) {
      throw new CustomError('CAMP_JWT_REQUIRED', 401, 'Camp Network authentication required');
    }

    const jwtPayload = await this.verifyOriginJWT(originJWT);
    
    if (jwtPayload.walletAddress?.toLowerCase() !== normalizedAddress) {
      throw new CustomError('WALLET_MISMATCH', 401, 'JWT wallet address does not match provided address');
    }

    logger.info('Camp Network authentication verified', { walletAddress: normalizedAddress });

    const isPlatformWallet = normalizedAddress === env.PLATFORM_WALLET_ADDRESS?.toLowerCase();

    let user = await User.findOne({ walletAddress: normalizedAddress });
    
    if (!user) {
      const username = isPlatformWallet ? 'admin' : await this.generateUniqueUsername(walletAddress);
      user = new User({
        walletAddress: normalizedAddress,
        username,
        userType: isPlatformWallet ? 'admin' : 'user',
      });
      await user.save();
      logger.info('New user created', { walletAddress: normalizedAddress, userType: user.userType });
    } else if (isPlatformWallet && user.userType !== 'admin') {
      user.userType = 'admin';
      await user.save();
      logger.info('User promoted to admin', { walletAddress: normalizedAddress });
    }

    const payload: JWTPayload = {
      userId: (user._id as Types.ObjectId).toString(),
      walletAddress: normalizedAddress,
      userType: user.userType,
    };
    
    const token = jwt.sign(payload, env.JWT_SECRET);

    return { user, token };
  }

  async getUserById(userId: string): Promise<UserDocument | null> {
    return User.findById(userId);
  }

  async getUserByWallet(walletAddress: string): Promise<UserDocument | null> {
    return User.findOne({ walletAddress: walletAddress.toLowerCase() });
  }

  async updateUserProfile(
    userId: string,
    updates: Partial<Pick<UserDocument, 'username' | 'bio' | 'avatar' | 'specialties'>>
  ): Promise<UserDocument> {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('USER_NOT_FOUND', 404, 'User not found');
    }

    if (updates.username && updates.username !== user.username) {
      const existingUser = await User.findOne({ username: updates.username });
      if (existingUser) {
        throw new CustomError('USERNAME_TAKEN', 409, 'Username already taken');
      }
    }

    Object.assign(user, updates);
    await user.save();
    
    logger.info('User profile updated', { userId, updates: Object.keys(updates) });
    return user;
  }

  async connectExchange(
    userId: string,
    exchange: 'hyperliquid',
    credentials: { privateKey: string; walletAddress: string }
  ): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('USER_NOT_FOUND', 404, 'User not found');
    }

    if (!credentials.privateKey.match(/^0x[0-9a-fA-F]{64}$/)) {
      throw new CustomError('INVALID_PRIVATE_KEY', 400, 'Invalid private key format');
    }

    if (!credentials.walletAddress.match(/^0x[0-9a-fA-F]{40}$/)) {
      throw new CustomError('INVALID_WALLET_ADDRESS', 400, 'Invalid wallet address format');
    }

    const encryptedPrivateKey = encrypt(credentials.privateKey);

    if (exchange === 'hyperliquid') {
      user.connectedExchanges.hyperliquid = {
        connected: true,
        apiKey: JSON.stringify(encryptedPrivateKey),
        walletAddress: credentials.walletAddress,
      };
    }

    await user.save();
    logger.info('Exchange connected', { userId, exchange, walletAddress: credentials.walletAddress });
  }

  async getExchangeCredentials(
    userId: string,
    exchange: 'hyperliquid'
  ): Promise<{ privateKey: string; walletAddress: string } | null> {
    const user = await User.findById(userId).select('+connectedExchanges.hyperliquid.apiKey');
    if (!user) {
      throw new CustomError('USER_NOT_FOUND', 404, 'User not found');
    }

    const exchangeConfig = user.connectedExchanges?.hyperliquid;
    if (!exchangeConfig?.connected || !exchangeConfig.apiKey) {
      return null;
    }

    try {
      const encryptedPrivateKey = JSON.parse(exchangeConfig.apiKey);
      const privateKey = decrypt(encryptedPrivateKey.encrypted, encryptedPrivateKey.iv);

      return {
        privateKey,
        walletAddress: exchangeConfig.walletAddress!,
      };
    } catch (error) {
      logger.error('Error decrypting exchange credentials', { userId, exchange, error });
      throw new CustomError('DECRYPTION_ERROR', 500, 'Failed to decrypt credentials');
    }
  }

  private async generateUniqueUsername(walletAddress: string): Promise<string> {
    const baseUsername = `user_${walletAddress.slice(2, 8)}`;
    let username = baseUsername;
    let counter = 1;

    while (await User.findOne({ username })) {
      username = `${baseUsername}_${counter}`;
      counter++;
    }

    return username;
  }

  async disconnect(userId: string): Promise<void> {
    logger.info('User disconnected', { userId });
  }
}

export const authService = new AuthService();