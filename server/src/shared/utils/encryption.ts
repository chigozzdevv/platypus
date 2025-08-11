import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { env } from '@/shared/config/env';

const SALT_ROUNDS = 12;
const ALGORITHM = 'aes-256-cbc';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const encrypt = (text: string): { encrypted: string; iv: string } => {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(env.JWT_SECRET, 'salt', 32);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex'),
  };
};

export const decrypt = (encrypted: string, iv: string): string => {
  const key = crypto.scryptSync(env.JWT_SECRET, 'salt', 32);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

export const generateNonce = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

export const generateApiKey = (): string => {
  return crypto.randomBytes(32).toString('hex');
};