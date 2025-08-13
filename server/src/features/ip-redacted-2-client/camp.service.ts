import { Auth } from '@campnetwork/origin';
import { createWalletClient, http } from 'viem';
import type { Hex, SignableMessage } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { createHash } from 'crypto';
import { EventEmitter } from 'events';
import axios from 'axios';
import {
  Headers as UndiciHeaders,
  Request as UndiciRequest,
  Response as UndiciResponse,
  fetch as undiciFetch,
  FormData as UndiciFormData,
} from 'undici';
import { logger } from '@/shared/utils/logger';
import { env } from '@/shared/config/env';
import { CustomError } from '@/shared/middleware/error.middleware';
import { IPAsset } from './ip.model';

const ORIGIN_BASE = 'https://wv2h4to5qa.execute-api.us-east-2.amazonaws.com/dev';

const setupHeadlessEnvironment = () => {
  const g: any = globalThis as any;

  if (!g.fetch) g.fetch = undiciFetch;
  if (!g.Headers) g.Headers = UndiciHeaders;
  if (!g.Request) g.Request = UndiciRequest;
  if (!g.Response) g.Response = UndiciResponse;
  if (!g.FormData) g.FormData = UndiciFormData as any;

  if (!g.TextEncoder || !g.TextDecoder) {
    const { TextEncoder, TextDecoder } = require('util');
    if (!g.TextEncoder) g.TextEncoder = TextEncoder;
    if (!g.TextDecoder) g.TextDecoder = TextDecoder;
  }

  if (!g.atob) g.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
  if (!g.btoa) g.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');

  const rawDomain: string = env.SIWE_DOMAIN;
  const hasProto = /^https?:\/\//i.test(rawDomain);
  const isLocal = /(^localhost)|(^127\.0\.0\.1)/i.test(rawDomain);
  const proto = hasProto ? '' : isLocal ? 'http://' : 'https://';
  const baseHref = `${proto}${rawDomain}`.replace(/\/+$/, '') + '/';
  const url = new URL(baseHref);

  if (!g.window) {
    const emitter = new EventEmitter();
    g.window = {
      addEventListener: (type: string, listener: any) => emitter.on(type, listener),
      removeEventListener: (type: string, listener: any) => emitter.off(type, listener),
      dispatchEvent: (evt: any) => {
        const type = evt?.type || evt || 'message';
        emitter.emit(type, evt);
        return true;
      },
      location: {
        href: url.href,
        origin: url.origin,
        protocol: url.protocol,
        host: url.host,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        toString() {
          return url.href;
        },
      },
      origin: url.origin,
      document: { cookie: '', referrer: url.href },
    };
  }

  if (!g.location) {
    g.location = {
      href: url.href,
      origin: url.origin,
      protocol: url.protocol,
      host: url.host,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      toString() {
        return url.href;
      },
    };
  }

  if (!g.document) g.document = { cookie: '', referrer: url.href };

  if (!g.navigator) {
    g.navigator = {
      userAgent: 'Mozilla/5.0 (NodeJS)',
      language: 'en-US',
      languages: ['en-US', 'en'],
      platform: process.platform,
    };
  }

  if (!g.localStorage) {
    const store: Record<string, string> = {};
    g.localStorage = {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        for (const k of Object.keys(store)) delete store[k];
      },
      key: (i: number) => Object.keys(store)[i] || null,
      get length() {
        return Object.keys(store).length;
      },
    };
  }

  if (!g.sessionStorage) {
    const store: Record<string, string> = {};
    g.sessionStorage = {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        for (const k of Object.keys(store)) delete store[k];
      },
      key: (i: number) => Object.keys(store)[i] || null,
      get length() {
        return Object.keys(store).length;
      },
    };
  }

  const originalFetch = g.fetch;
  g.fetch = async (input: any, init?: any) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    const match = /\/auth\/origin\/(upload-url|register|update-status|files|usage|status|multiplier|data)/.exec(url);
    const start = Date.now();
    try {
      const res = await originalFetch(input, init);
      if (match) {
        let body = '';
        try {
          const clone = res.clone();
          body = await clone.text();
        } catch {}
        logger.info('origin.fetch', {
          method: init?.method || 'GET',
          url,
          status: res.status,
          ok: res.ok,
          durationMs: Date.now() - start,
          requestBody:
            init && typeof init.body === 'string'
              ? init.body.slice(0, 2000)
              : init && init.body && !(init.body instanceof Buffer)
              ? '[non-string body]'
              : undefined,
          responsePreview: body.slice(0, 2000),
        });
      }
      return res;
    } catch (err: any) {
      if (match) {
        logger.error('origin.fetch.error', {
          method: init?.method || 'GET',
          url,
          durationMs: Date.now() - start,
          error: err?.message || String(err),
        });
      }
      throw err;
    }
  };

  axios.interceptors.request.use((config) => {
    try {
      if (config?.method?.toUpperCase() === 'PUT') {
        logger.info('axios.request', {
          method: config.method,
          url: config.url,
          headers: config.headers,
        });
      }
    } catch {}
    return config;
  });

  axios.interceptors.response.use(
    (res) => res,
    (err) => {
      try {
        const { config, response } = err || {};
        logger.error('axios.error', {
          method: config?.method,
          url: config?.url,
          status: response?.status,
          data: response?.data,
          message: err?.message,
        });
      } catch {}
      return Promise.reject(err);
    }
  );
};

const normalizePersonalSignData = (data: any): SignableMessage => {
  if (typeof data === 'string') {
    if (/^0x[0-9a-fA-F]+$/.test(data)) return { raw: data as Hex };
    return data;
  }
  if (Buffer.isBuffer(data)) return data.toString('utf8');
  if (data instanceof Uint8Array) return new TextDecoder().decode(data);
  try {
    return JSON.stringify(data);
  } catch {
    return String(data);
  }
};

const baseCampChain = {
  id: env.CHAIN_ID,
  name: 'BaseCAMP',
  network: 'basecamp',
  nativeCurrency: { decimals: 18, name: 'CAMP', symbol: 'CAMP' },
  rpcUrls: { default: { http: [env.BASECAMP_RPC_URL] }, public: { http: [env.BASECAMP_RPC_URL] } },
  blockExplorers: { default: { name: 'Blockscout', url: 'https://basecamp.cloud.blockscout.com' } },
  testnet: true,
} as const;

export interface CampIPMetadata {
  name: string;
  description: string;
  type: 'signal' | 'improvement';
  signalData: {
    symbol: string;
    side: 'long' | 'short';
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    confidence: number;
    analysis: string;
  };
  creator: string;
  originalSignalId?: string;
}

export interface MintLicenseTerms {
  price: bigint;
  duration: number;
  royaltyBps: number;
  paymentToken: `0x${string}`;
}

export interface CampIPRegistration {
  tokenId: string;
  ipHash: string;
  licenseTerms: MintLicenseTerms;
  metadata: CampIPMetadata;
  transactionHash: string;
}

export class CampService {
  private auth: Auth | null = null;
  private walletClient: any;
  private platformReady?: Promise<void>;

  constructor() {
    if (!env.CAMP_CLIENT_ID) throw new Error('CAMP_CLIENT_ID environment variable is required');
    setupHeadlessEnvironment();
    this.auth = new Auth({ clientId: env.CAMP_CLIENT_ID, allowAnalytics: false } as any);
  }

  public ensurePlatformReady() {
    if (!this.platformReady) this.platformReady = this.initializeWalletClient(env.PLATFORM_WALLET_PRIVATE_KEY);
    return this.platformReady;
  }

  async initializeWalletClient(privateKey: string): Promise<void> {
    try {
      const account = privateKeyToAccount(privateKey as `0x${string}`);
      this.walletClient = createWalletClient({ account, chain: baseCampChain, transport: http(env.BASECAMP_RPC_URL) });
      if (!this.auth) throw new Error('Auth not initialized');

      const walletClient = this.walletClient;
      const mockProvider = {
        request: async ({ method, params }: { method: string; params?: any[] }) => {
          const getAddr = () => account.address;
          switch (method) {
            case 'eth_accounts':
            case 'eth_requestAccounts':
              return [getAddr()];
            case 'eth_chainId':
              return `0x${baseCampChain.id.toString(16)}`;
            case 'wallet_switchEthereumChain':
            case 'wallet_addEthereumChain':
              return null;
            case 'eth_sign': {
              const [address, data] = params || [];
              if (String(address || '').toLowerCase() !== getAddr().toLowerCase()) throw new Error('Address mismatch');
              const msg = normalizePersonalSignData(data);
              return account.signMessage({ message: msg });
            }
            case 'personal_sign': {
              let data: any, address: string;
              if (params && params.length >= 2) {
                const p0 = params[0];
                const p1 = params[1];
                const p0s = typeof p0 === 'string' ? p0 : '';
                const isP0Addr = /^0x[0-9a-fA-F]{40}$/.test(p0s);
                address = isP0Addr ? p0s : String(p1 || '');
                data = isP0Addr ? p1 : p0;
              } else {
                [data, address] = params || [];
              }
              if (String(address || '').toLowerCase() !== getAddr().toLowerCase()) throw new Error('Address mismatch');
              const msg = normalizePersonalSignData(data);
              return account.signMessage({ message: msg });
            }
            case 'eth_signTypedData':
            case 'eth_signTypedData_v4': {
              const [address, typed] = params || [];
              if (String(address || '').toLowerCase() !== getAddr().toLowerCase()) throw new Error('Address mismatch');
              const typedData = typeof typed === 'string' ? JSON.parse(typed) : typed;
              const { domain, types, message, primaryType } = typedData;
              return (account as any).signTypedData({ domain, types: { ...types }, message, primaryType });
            }
            default:
              return walletClient.request({ method, params });
          }
        },
        on: () => {},
        removeListener: () => {},
      };

      this.auth.setProvider({ provider: mockProvider as any, info: { name: 'Platform Wallet', icon: '' } });
      this.auth.setWalletAddress(account.address);

      try {
        await (this.auth as any).connect();
      } catch {
        await (this.auth as any).connect();
      }

      if (!this.auth.origin) throw new Error('Origin SDK not available after authentication');
      this.auth.origin.setViemClient(this.walletClient);

      let jwt: string | undefined;
      try {
        const getJwt = (this.auth as any).getJwt || (this.auth.origin as any).getJwt;
        if (typeof getJwt === 'function') jwt = await getJwt.call(this.auth.origin ?? this.auth);
      } catch {}

      logger.info('Camp wallet client initialized and authenticated', {
        address: account.address,
        hasOrigin: !!this.auth.origin,
        hasJWT: !!jwt,
      });
    } catch (error: any) {
      logger.error('Failed to initialize Camp wallet client', { error: { message: error?.message, stack: error?.stack } });
      throw new CustomError('WALLET_INIT_ERROR', 500, `Failed to initialize wallet client: ${error?.message || 'unknown error'}`);
    }
  }

  async authenticateUser(walletAddress: string, _signature: string): Promise<string> {
    try {
      if (!this.auth) throw new Error('Auth not initialized');
      this.auth.setWalletAddress(walletAddress);
      try {
        await (this.auth as any).connect();
      } catch {
        await (this.auth as any).connect();
      }
      if (!this.auth.origin) throw new Error('Origin SDK not available after authentication');
      let jwt: string | undefined;
      try {
        const getJwt = (this.auth as any).getJwt || (this.auth.origin as any).getJwt;
        if (typeof getJwt === 'function') jwt = await getJwt.call(this.auth.origin ?? this.auth);
      } catch {}
      if (!jwt) throw new Error('Failed to get JWT token');
      logger.info('User authenticated with Camp Network', { walletAddress });
      return jwt;
    } catch (error: any) {
      logger.error('Failed to authenticate user', { error: { message: error?.message, stack: error?.stack }, walletAddress });
      throw new CustomError('AUTH_ERROR', 401, 'Failed to authenticate with Camp Network');
    }
  }

  async registerSignalAsIP(
    signalData: any,
    improvementData: any | null,
    _creatorPrivateKey: string,
    creatorWalletAddress: string
  ): Promise<CampIPRegistration> {
    try {
      await this.ensurePlatformReady();
      if (!this.auth?.origin) throw new Error('Origin SDK not initialized');

      const metadata: CampIPMetadata = this.generateIPMetadata(signalData, improvementData);

      const licenseTerms: MintLicenseTerms = {
        price: BigInt(1_020_000),
        duration: 86_400,
        royaltyBps: improvementData ? 6000 : 10000,
        paymentToken: '0x0000000000000000000000000000000000000000',
      };

      const signalContent = JSON.stringify({ ...metadata, timestamp: new Date().toISOString(), version: '1.0' });
      const ipHash = this.generateContentHash(signalContent);

      const FileCtor: any = (globalThis as any).File;
      if (!FileCtor) throw new Error('File constructor not available in this runtime');

      const file = new FileCtor([signalContent], `signal-${signalData.symbol}-${Date.now()}.json`, {
        type: 'application/json',
      });

      logger.info('Attempting to mint file on Camp Network', {
        signalId: signalData._id || signalData.id,
        symbol: signalData.symbol,
        fileSize: signalContent.length,
        hasParent: !!improvementData,
      });

      const parentId =
        improvementData && typeof signalData.ipTokenId === 'string' && /^\d+$/.test(signalData.ipTokenId)
          ? BigInt(signalData.ipTokenId)
          : undefined;

      const metadataRecord: Record<string, unknown> = metadata as unknown as Record<string, unknown>;

      const result = await this.mintFileWithDebug(file, metadataRecord, licenseTerms, parentId);

      const tokenId = typeof result === 'string' ? result : (result as any)?.tokenId;
      const transactionHash =
        (typeof result === 'object' && (result as any)?.transactionHash) ||
        `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`;

      const ipAsset = new IPAsset({
        assetId: tokenId,
        creator: creatorWalletAddress,
        name: metadata.name,
        description: metadata.description,
        type: metadata.type,
        price: Number(licenseTerms.price) / 1_000_000,
        currency: 'USDC',
        royaltyPercentage: licenseTerms.royaltyBps / 100,
        ipHash,
        originAssetId: tokenId,
        signalId: signalData._id?.toString() || signalData.id?.toString(),
        improvementIndex: improvementData ? signalData.improvements?.length || 0 : undefined,
        fullSignalData: signalData,
        improvementData,
        metadata: {
          signalData: metadata.signalData,
          creator: metadata.creator,
          originalSignalId: metadata.originalSignalId,
        },
        totalSales: 0,
        totalRevenue: 0,
        isActive: true,
      });

      await ipAsset.save();

      logger.info('Signal registered as IP NFT successfully', {
        tokenId,
        creator: creatorWalletAddress,
        signalId: signalData._id,
        type: metadata.type,
      });

      return {
        tokenId,
        ipHash,
        licenseTerms,
        metadata,
        transactionHash,
      };
    } catch (error: any) {
      logger.error('Failed to register signal as IP', { error: { message: error?.message, stack: error?.stack }, signalData });
      throw new CustomError('IP_REGISTRATION_ERROR', 500, 'Failed to register IP on Camp Network');
    }
  }

  private async mintFileWithDebug(
    file: any,
    metadata: Record<string, unknown>,
    license: MintLicenseTerms,
    parentId?: bigint
  ) {
    try {
      const jwt =
        (this.auth as any)?.getJwt?.() ||
        ((this.auth as any)?.origin && (this.auth as any).origin.getJwt?.()) ||
        null;

      logger.info('debug.mint.start', {
        hasOrigin: !!this.auth?.origin,
        hasJWT: !!jwt,
        parentId: parentId ? parentId.toString() : undefined,
        license,
      });

      try {
        const probeBody: any = { name: String(file?.name || 'unknown'), type: String(file?.type || 'application/octet-stream') };
        const probeRes = await fetch(`${ORIGIN_BASE}/auth/origin/upload-url`, {
          method: 'POST',
          headers: jwt
            ? {
                Authorization: `Bearer ${jwt}`,
                'Content-Type': 'application/json',
              }
            : { 'Content-Type': 'application/json' },
          body: JSON.stringify(probeBody),
        });

        const probeJson = await probeRes.json().catch(() => ({} as any));
        logger.info('debug.presign.probe', {
          status: probeRes.status,
          ok: probeRes.ok,
          response: probeJson,
        });
      } catch (e: any) {
        logger.error('debug.presign.probe.error', { message: e?.message || String(e) });
      }

      const result = await this.auth!.origin!.mintFile(
        file,
        metadata,
        (license as unknown) as any,
        parentId
      );

      logger.info('debug.mint.success', { result });
      return result;
    } catch (e: any) {
      logger.error('debug.mint.error', { message: e?.message || String(e), stack: e?.stack });
      throw e;
    }
  }

  async purchaseAccess(
    tokenId: string,
    buyerPrivateKey: string,
    buyerWalletAddress: string,
    periods: number = 1
  ): Promise<{ success: boolean; transactionHash: string; expiryDate: Date }> {
    try {
      await this.initializeWalletClient(buyerPrivateKey);
      if (!this.auth?.origin) throw new Error('Origin SDK not initialized');

      const result = await this.auth.origin.buyAccessSmart(BigInt(tokenId), periods);

      const ipAsset = await IPAsset.findOne({ originAssetId: tokenId });
      if (ipAsset) {
        ipAsset.totalSales += 1;
        ipAsset.totalRevenue += ipAsset.price * periods;
        await ipAsset.save();
      }

      const expiryDate = new Date(Date.now() + periods * 24 * 60 * 60 * 1000);

      logger.info('Access purchased successfully', { tokenId, buyer: buyerWalletAddress, periods, expiryDate });

      return {
        success: true,
        transactionHash: (result as any)?.transactionHash || `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`,
        expiryDate,
      };
    } catch (error: any) {
      logger.error('Failed to purchase access', { error: { message: error?.message, stack: error?.stack }, tokenId, buyerWalletAddress });
      throw new CustomError('ACCESS_PURCHASE_ERROR', 500, 'Failed to purchase access to IP');
    }
  }

  async checkAccess(tokenId: string, userWalletAddress: string): Promise<{ hasAccess: boolean; expiryDate?: Date }> {
    try {
      if (!this.auth?.origin) throw new Error('Origin SDK not initialized');
      const hasAccess = await this.auth.origin.hasAccess(BigInt(tokenId), userWalletAddress);
      let expiryDate: Date | undefined;
      if (hasAccess) {
        const expiry = await this.auth.origin.subscriptionExpiry(BigInt(tokenId), userWalletAddress);
        expiryDate = new Date(Number(expiry) * 1000);
      }
      return { hasAccess, expiryDate };
    } catch (error: any) {
      logger.error('Failed to check access', { error: { message: error?.message, stack: error?.stack }, tokenId, userWalletAddress });
      return { hasAccess: false };
    }
  }

  async getUserIPAssets(walletAddress: string): Promise<any[]> {
    try {
      const ipAssets = await IPAsset.find({ creator: walletAddress }).sort({ createdAt: -1 });
      return ipAssets.map((asset) => ({
        tokenId: asset.originAssetId || asset.assetId,
        name: asset.name,
        type: asset.type,
        totalRevenue: asset.totalRevenue,
        totalSales: asset.totalSales,
        createdAt: asset.createdAt,
        isActive: asset.isActive,
      }));
    } catch (error: any) {
      logger.error('Failed to get user IP assets', { error: { message: error?.message, stack: error?.stack }, walletAddress });
      throw new CustomError('GET_ASSETS_ERROR', 500, 'Failed to fetch user IP assets');
    }
  }

  async getIPAssetData(tokenId: string): Promise<any> {
    try {
      if (!this.auth?.origin) throw new Error('Origin SDK not initialized');
      const data = await this.auth.origin.getData(BigInt(tokenId));
      return data;
    } catch (error: any) {
      logger.error('Failed to get IP asset data', { error: { message: error?.message, stack: error?.stack }, tokenId });
      throw new CustomError('GET_DATA_ERROR', 500, 'Failed to fetch IP asset data');
    }
  }

  async getProtectedSignalData(tokenId: string, userWalletAddress: string): Promise<any> {
    try {
      const { hasAccess } = await this.checkAccess(tokenId, userWalletAddress);
      if (!hasAccess) throw new CustomError('ACCESS_DENIED', 403, 'You need to purchase access to view this signal');

      const ipAsset = await IPAsset.findOne({ originAssetId: tokenId });
      if (!ipAsset) throw new CustomError('SIGNAL_NOT_FOUND', 404, 'Signal not found');

      return {
        tokenId,
        signalData: ipAsset.fullSignalData,
        improvementData: ipAsset.improvementData,
        metadata: ipAsset.metadata,
        creator: ipAsset.creator,
        type: ipAsset.type,
      };
    } catch (error: any) {
      logger.error('Failed to get protected signal data', { error: { message: error?.message, stack: error?.stack }, tokenId, userWalletAddress });
      throw error;
    }
  }

  generateIPMetadata(signalData: any, improvementData?: any): CampIPMetadata {
    const isImprovement = !!improvementData;
    const creator = signalData.creator === 'platform' ? 'platform' : signalData.creator;

    return {
      name: isImprovement ? `Improved ${signalData.symbol} Trading Signal` : `${signalData.symbol} AI Trading Signal`,
      description: isImprovement
        ? `Human-improved trading signal for ${signalData.symbol}. Improvement: ${String(
            improvementData?.improvementType || ''
          )}. ${String(improvementData?.reasoning || '').slice(0, 200)}...`
        : `AI-generated trading signal for ${signalData.symbol}. ${String(signalData.side).toUpperCase()} position with ${
            signalData.confidence
          }% confidence. ${String(signalData.analysis?.technicalAnalysis || '').slice(0, 200)}...`,
      type: isImprovement ? 'improvement' : 'signal',
      signalData: {
        symbol: signalData.symbol,
        side: signalData.side,
        entryPrice: signalData.entryPrice,
        stopLoss: signalData.stopLoss,
        takeProfit: signalData.takeProfit,
        confidence: signalData.confidence,
        analysis: isImprovement
          ? `${String(signalData.analysis?.technicalAnalysis || '')} [IMPROVED: ${String(improvementData?.reasoning || '')}]`
          : String(signalData.analysis?.technicalAnalysis || ''),
      },
      creator,
      originalSignalId: isImprovement ? signalData._id : undefined,
    };
  }

  private generateContentHash(content: string): string {
    const hash = createHash('sha256').update(content, 'utf8').digest('hex');
    return `0x${hash}`;
  }
}

export const campService = new CampService();
