declare module '@campnetwork/origin' {
  export class Auth {
    constructor(options: {
      clientId: string;
      redirectUri?: string | object;
      allowAnalytics?: boolean;
    });
    
    connect(): Promise<void>;
    disconnect(): void;
    setProvider(provider: any): void;
    setWalletAddress(address: string): void;
    getJwt(): string | null;
    
    origin: {
      mintFile(
        file: File,
        metadata: Record<string, unknown>,
        license: LicenseTerms,
        parentId?: bigint,
        options?: { progressCallback?: (percent: number) => void }
      ): Promise<string | { tokenId: string; transactionHash?: string }>;
      
      buyAccessSmart(tokenId: bigint, periods: number): Promise<{ transactionHash?: string }>;
      hasAccess(tokenId: bigint, userAddress: string): Promise<boolean>;
      subscriptionExpiry(tokenId: bigint, userAddress: string): Promise<bigint>;
      getData(tokenId: bigint): Promise<any>;
      setViemClient(client: any): void;
    } | null;
  }

  export class TwitterAPI {
    constructor(options: { apiKey: string });
    fetchUserByUsername(username: string): Promise<any>;
  }

  export class SpotifyAPI {
    constructor(options: { apiKey: string });
    fetchSavedTracksById(id: string): Promise<any>;
  }

  interface LicenseTerms {
    price: bigint;
    duration: bigint;
    royaltyBps: number;
    paymentToken: `0x${string}`;
  }
}