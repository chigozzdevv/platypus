import jwt from 'jsonwebtoken';
import { env } from '@/shared/config/env';
import { logger } from '@/shared/utils/logger';
import { generateNonce, encrypt, decrypt } from '@/shared/utils/encryption';
import { validateSignature } from '@/shared/utils/validators';
import { User } from './auth.model';
import { UserDocument } from '@/shared/types/database.types';
import { JWTPayload } from '@/shared/middleware/auth.types';
import { CustomError } from '@/shared/middleware/error.middleware';
import { Types } from 'mongoose';


export class AuthService {
  private nonces = new Map<string, { nonce: string; timestamp: number }>();

  async generateNonce(walletAddress: string): Promise<string> {
    const nonce = generateNonce();
    const timestamp = Date.now();
    
    this.nonces.set(walletAddress.toLowerCase(), { nonce, timestamp });
    
    // Clean up old nonces (5 minutes)
    setTimeout(() => {
      this.nonces.delete(walletAddress.toLowerCase());
    }, 5 * 60 * 1000);
    
    return nonce;
  }

  async verifyAndConnect(
    walletAddress: string,
    signature: string,
    message: string,
    originJWT?: string
  ): Promise<{ user: UserDocument; token: string }> {
    const normalizedAddress = walletAddress.toLowerCase();
    
    // Verify signature
    const isValidSignature = await validateSignature(message, signature, walletAddress);
    if (!isValidSignature) {
      const error = new Error('Invalid signature') as CustomError;
      error.statusCode = 401;
      error.code = 'INVALID_SIGNATURE';
      throw error;
    }

    // Verify nonce if provided in message
    const nonceData = this.nonces.get(normalizedAddress);
    if (nonceData && message.includes(nonceData.nonce)) {
      // Clean up used nonce
      this.nonces.delete(normalizedAddress);
    }

    // Origin JWT is provided by the frontend Origin SDK after user authentication
    // We can use this to make API calls to Origin services on behalf of the user
    if (originJWT) {
      logger.info('Origin JWT received for API access', { walletAddress: normalizedAddress });
      // Store Origin JWT for later use in IP operations
      // The JWT is already validated by Origin SDK on the frontend
    }

    // Find or create user
    let user = await User.findOne({ walletAddress: normalizedAddress });
    
    if (!user) {
      const username = await this.generateUniqueUsername(walletAddress);
      user = new User({
        walletAddress: normalizedAddress,
        username,
      });
      await user.save();
      logger.info('New user created', { walletAddress: normalizedAddress, username });
    } else {
      logger.info('Existing user authenticated', { walletAddress: normalizedAddress, username: user.username });
    }

    // Generate platform JWT
    const payload: JWTPayload = {
      userId: (user._id as Types.ObjectId).toString(),
      walletAddress: normalizedAddress,
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
      const error = new Error('User not found') as CustomError;
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    // Validate username uniqueness if being updated
    if (updates.username && updates.username !== user.username) {
      const existingUser = await User.findOne({ username: updates.username });
      if (existingUser) {
        const error = new Error('Username already taken') as CustomError;
        error.statusCode = 409;
        error.code = 'USERNAME_TAKEN';
        throw error;
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
      const error = new Error('User not found') as CustomError;
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    // Validate privateKey format
    if (!credentials.privateKey.match(/^0x[0-9a-fA-F]{64}$/)) {
      const error = new Error('Invalid private key format') as CustomError;
      error.statusCode = 400;
      error.code = 'INVALID_PRIVATE_KEY';
      throw error;
    }

    // Validate walletAddress format  
    if (!credentials.walletAddress.match(/^0x[0-9a-fA-F]{40}$/)) {
      const error = new Error('Invalid wallet address format') as CustomError;
      error.statusCode = 400;
      error.code = 'INVALID_WALLET_ADDRESS';
      throw error;
    }

    // TODO: Test connection to Hyperliquid before saving
    // const client = createHyperliquidClient(credentials.privateKey);
    // await client.info.perpetuals.getClearinghouseState(credentials.walletAddress);

    // Encrypt sensitive credentials
    const encryptedPrivateKey = encrypt(credentials.privateKey);

    if (exchange === 'hyperliquid') {
      user.connectedExchanges.hyperliquid = {
        connected: true,
        apiKey: JSON.stringify(encryptedPrivateKey), // Store as apiKey for now
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
      const error = new Error('User not found') as CustomError;
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
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
      const customError = new Error('Failed to decrypt credentials') as CustomError;
      customError.statusCode = 500;
      customError.code = 'DECRYPTION_ERROR';
      throw customError;
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
    // Add any cleanup logic here (e.g., invalidate refresh tokens)
  }
}

export const authService = new AuthService();