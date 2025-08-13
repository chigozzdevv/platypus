declare module '@campnetwork/origin' {
  export type RegisterLicenseTerms = {
    price: number;
    duration: number;
    royaltyBps: number;
    paymentToken: `0x${string}`;
  };

  export type MintLicenseTerms = {
    price: bigint;
    duration: number;
    royaltyBps: number;
    paymentToken: `0x${string}`;
  };

  export class Auth {
    constructor(options: {
      clientId: string;
      redirectUri?: string | Record<string, string>;
      allowAnalytics?: boolean;
    });

    connect(options?: { domain?: string }): Promise<void>;
    disconnect(): void;

    setProvider(options: {
      provider: any;
      info?: { name?: string; icon?: string };
      address?: string;
    }): void;

    setWalletAddress(address: string): void;
    getJwt(): string | null;

    origin: {
      setViemClient(client: any): void;

      mintFile(
        file: File,
        metadata: Record<string, unknown>,
        license: MintLicenseTerms,
        parentId?: bigint,
        options?: { progressCallback?: (percent: number) => void }
      ): Promise<string | { tokenId: string; transactionHash?: string }>;

      registerIpNFT(
        source: 'file' | 'twitter' | 'discord' | 'spotify' | 'tiktok',
        deadline: number,
        license: RegisterLicenseTerms,
        metadata: Record<string, unknown>,
        fileKey?: string,
        parentId?: string | number
      ): Promise<
        | string
        | {
            tokenId: string | number | bigint;
            signerAddress?: string;
            creatorContentHash?: `0x${string}` | string;
            signature?: `0x${string}` | string;
            uri?: string;
            transactionHash?: string;
          }
      >;

      mintWithSignature(
        to: string,
        tokenId: bigint,
        parentId: bigint,
        creatorContentHash: `0x${string}` | string,
        uri: string,
        license: MintLicenseTerms,
        deadline: bigint,
        signature: `0x${string}` | string
      ): Promise<any>;

      buyAccessSmart(
        tokenId: bigint,
        periods: number
      ): Promise<{ transactionHash?: string }>;

      hasAccess(tokenId: bigint, userAddress: string): Promise<boolean>;
      subscriptionExpiry(tokenId: bigint, userAddress: string): Promise<bigint>;
      getData(tokenId: bigint): Promise<any>;
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
}
