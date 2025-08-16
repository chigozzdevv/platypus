import { createWalletClient, custom, http } from 'viem';

type Address = `0x${string}`;

type LicenseTermsSDK = {
  price: bigint;
  duration: number;
  royaltyBps: number;
  paymentToken: Address;
};

class CampService {
  private _viem: any | null = null;
  private _jwt: string | null = null;
  private _wallet: Address | null = null;

  setClients({ viem }: { viem: any }) {
    this._viem = viem ?? null;
  }

  setJwt(jwt: string) {
    this._jwt = jwt || null;
  }

  setWalletAddress(addr: string | null | undefined) {
    this._wallet = addr ? (addr as Address) : null;
  }

  private get chainConfig() {
    const id = Number(import.meta.env.VITE_CAMP_CHAIN_ID || 0);
    const name = String(import.meta.env.VITE_CAMP_CHAIN_NAME || 'Camp');
    const symbol = String(import.meta.env.VITE_CAMP_NATIVE_SYMBOL || 'CAMP');
    const rpc = String(import.meta.env.VITE_CAMP_RPC_URL || '');
    return {
      id,
      name,
      nativeCurrency: { name: symbol, symbol, decimals: 18 },
      rpcUrls: { default: { http: [rpc] } },
      rpcUrlString: rpc,
    } as const;
  }

  private async ensureViemClient(): Promise<any> {
    if (this._viem?.getAddresses) {
      try {
        const addrs = await this._viem.getAddresses();
        if (Array.isArray(addrs) && addrs.length) return this._viem;
      } catch {}
    }
    const eth: any = (window as any).ethereum;
    const { id, name, nativeCurrency, rpcUrls, rpcUrlString } = this.chainConfig;
    const transport = eth ? custom(eth) : http(rpcUrlString);
    let accountAddr: Address | null = null;
    if (eth?.request) {
      try {
        const accs: string[] = await eth.request({ method: 'eth_accounts' });
        accountAddr = (accs?.[0] || null) as Address | null;
        if (!accountAddr) {
          const req: string[] = await eth.request({ method: 'eth_requestAccounts' });
          accountAddr = (req?.[0] || null) as Address | null;
        }
      } catch {}
    }
    if (!accountAddr) throw new Error('Wallet not connected');
    const chain = { id, name, nativeCurrency, rpcUrls } as any;
    const client = createWalletClient({ chain, account: accountAddr as any, transport });
    this._viem = client;
    this._wallet = accountAddr;
    return client;
  }

  private async getWalletAddress(): Promise<Address> {
    if (this._wallet?.startsWith('0x')) return this._wallet;
    try {
      const viem = await this.ensureViemClient();
      const addrs: string[] = await viem.getAddresses();
      if (addrs?.[0]) {
        this._wallet = addrs[0] as Address;
        return this._wallet;
      }
    } catch {}
    const eip1193: any = (window as any).ethereum;
    if (eip1193?.request) {
      const accs: string[] = await eip1193.request({ method: 'eth_requestAccounts' });
      const a = accs?.[0];
      if (a) {
        this._wallet = a as Address;
        return this._wallet;
      }
    }
    throw new Error('No wallet address');
  }

  private licenseForParent(): LicenseTermsSDK {
    return {
      price: 0n,
      duration: 30 * 24 * 60 * 60,
      royaltyBps: 0,
      paymentToken: '0x0000000000000000000000000000000000000000',
    };
  }

  private licenseForImprovement(): LicenseTermsSDK {
    const ONE_CAMP = 10n ** 18n;
    return {
      price: ONE_CAMP,
      duration: 30 * 24 * 60 * 60,
      royaltyBps: 4000, // 40% (child 60 / parent 40 intent; will take effect when linked)
      paymentToken: '0x0000000000000000000000000000000000000000',
    };
  }

  private async pinataUploadJSON(obj: any, name: string) {
    const JWT = String(import.meta.env.VITE_PINATA_JWT || '');
    const gateway = String(import.meta.env.VITE_PINATA_GATEWAY || '').replace(/\/$/, '');
    if (!JWT) throw new Error('Missing VITE_PINATA_JWT');
    const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: { Authorization: `Bearer ${JWT}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinataContent: obj, pinataMetadata: { name } }),
    });
    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(text?.slice(0, 300) || 'Pinata error');
    }
    if (!res.ok) {
      const msg = json?.error?.reason || json?.error || json?.message || 'Pinata upload failed';
      throw new Error(msg);
    }
    const cid: string = json?.IpfsHash || json?.cid;
    const url = gateway ? `${gateway}/ipfs/${cid}` : `https://gateway.pinata.cloud/ipfs/${cid}`;
    return { cid, url };
  }

  private async generateSignalPNGPoster(meta: {
    symbol: string;
    side: string;
    confidence: number;
    entryPrice: number;
  }): Promise<File> {
    const width = 1024;
    const height = 576;
    let canvas: HTMLCanvasElement | OffscreenCanvas;
    let ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null = null;
    if ('OffscreenCanvas' in window) {
      canvas = new (window as any).OffscreenCanvas(width, height);
      ctx = (canvas as OffscreenCanvas).getContext('2d');
    } else {
      const c = document.createElement('canvas');
      c.width = width;
      c.height = height;
      canvas = c;
      ctx = (canvas as HTMLCanvasElement).getContext('2d');
    }
    if (!ctx) throw new Error('Canvas context not available');
    (ctx as any).fillStyle = '#0b1020';
    (ctx as any).fillRect(0, 0, width, height);
    (ctx as any).fillStyle = meta.side.toLowerCase() === 'long' ? '#16a34a' : '#dc2626';
    (ctx as any).fillRect(0, height - 10, width, 10);
    (ctx as any).fillStyle = '#ffffff';
    (ctx as any).font = 'bold 72px system-ui, -apple-system, Segoe UI, Roboto, Inter';
    (ctx as any).textBaseline = 'top';
    (ctx as any).fillText(`${meta.symbol} • ${meta.side.toUpperCase()}`, 48, 48);
    (ctx as any).font = 'normal 36px system-ui, -apple-system, Segoe UI, Roboto, Inter';
    (ctx as any).fillStyle = '#cbd5e1';
    (ctx as any).fillText(`Confidence: ${meta.confidence}%`, 48, 140);
    (ctx as any).fillText(`Entry: $${meta.entryPrice}`, 48, 196);
    const type = 'image/png';
    const toBlob = (): Promise<Blob> => {
      if ('convertToBlob' in canvas) {
        return (canvas as OffscreenCanvas).convertToBlob({ type });
      }
      return new Promise((resolve, reject) => {
        (canvas as HTMLCanvasElement).toBlob((blob) => {
          if (blob) resolve(blob);
          else {
            try {
              const dataUrl = (canvas as HTMLCanvasElement).toDataURL(type);
              const bin = atob(dataUrl.split(',')[1]);
              const arr = new Uint8Array(bin.length);
              for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
              resolve(new Blob([arr], { type }));
            } catch {
              reject(new Error('Failed to encode PNG'));
            }
          }
        }, type);
      });
    };
    const blob = await toBlob();
    const sizeMB = blob.size / (1024 * 1024);
    if (sizeMB > 10) throw new Error(`File too large: ${sizeMB.toFixed(2)}MB`);
    const name = `signal-${meta.symbol}-${Date.now()}.png`;
    return new File([blob], name, { type });
  }

  async mintSignalAsParent(signal: {
    id?: string;
    symbol: string;
    side: string;
    confidence: number;
    entryPrice: number;
    stopLoss?: number;
    takeProfit?: number;
    aiModel?: string;
    analysis: { technicalAnalysis: string; marketAnalysis: string };
  }) {
    const wallet = await this.getWalletAddress();
    const viem = await this.ensureViemClient();
    const baseMeta = {
      name: `${signal.symbol} ${signal.side.toUpperCase()} Signal`,
      description: `AI trading signal for ${signal.symbol}`,
      attributes: {
        symbol: signal.symbol,
        side: signal.side,
        confidence: signal.confidence,
        entryPrice: signal.entryPrice,
        stopLoss: signal.stopLoss ?? null,
        takeProfit: signal.takeProfit ?? null,
        aiModel: signal.aiModel ?? null,
        createdAt: new Date().toISOString(),
      },
      analysis: signal.analysis,
      owner: wallet,
    };
    const pinned = await this.pinataUploadJSON(baseMeta, `signal-${signal.symbol}-${Date.now()}.json`);
    const enrichedMeta = { ...baseMeta, external_url: pinned.url, pinned_cid: pinned.cid };
    const poster = await this.generateSignalPNGPoster({
      symbol: signal.symbol,
      side: signal.side,
      confidence: signal.confidence,
      entryPrice: signal.entryPrice,
    });
    const campAuth = (window as any).__campAuth;
    const origin = campAuth?.origin;
    if (!origin) throw new Error('Origin SDK not ready. Connect with Camp Modal first.');
    if (typeof origin.setViemClient === 'function') origin.setViemClient(viem);
    const license = this.licenseForParent();
    const res = await origin.mintFile(poster, enrichedMeta, license, undefined, { progressCallback: () => {} });
    const tokenIdStr = String(res && typeof res === 'object' && 'tokenId' in res ? (res as any).tokenId : res);
    const transactionHash = String(res && typeof res === 'object' && (res as any).transactionHash ? (res as any).transactionHash : tokenIdStr);
    return { tokenId: tokenIdStr, transactionHash };
  }

  async mintImprovement(
    signal: {
      id?: string;
      symbol: string;
      side: string;
      confidence: number;
      entryPrice: number;
      stopLoss?: number;
      takeProfit?: number;
      aiModel?: string;
      analysis: { technicalAnalysis: string; marketAnalysis: string; sentimentAnalysis?: string; riskAssessment?: string };
      registeredAsIP?: boolean;
      ipTokenId?: string | bigint;
    },
    improvement: {
      improvementType: string;
      originalValue: any;
      improvedValue: any;
      reasoning: string;
      qualityScore?: number;
      revenueShare?: number;
    }
  ) {
    const wallet = await this.getWalletAddress();
    const viem = await this.ensureViemClient();
    const baseMeta = {
      name: `${signal.symbol} ${signal.side.toUpperCase()} Improvement`,
      description: `Derivative improvement for ${signal.symbol}`,
      attributes: {
        parentSymbol: signal.symbol,
        parentSide: signal.side,
        entryPrice: signal.entryPrice,
        stopLoss: signal.stopLoss ?? null,
        takeProfit: signal.takeProfit ?? null,
        aiModel: signal.aiModel ?? null,
        improvementType: improvement.improvementType,
        originalValue: improvement.originalValue ?? null,
        improvedValue: improvement.improvedValue ?? null,
        qualityScore: improvement.qualityScore ?? null,
        revenueShare: improvement.revenueShare ?? 0.6,
        confidence: signal.confidence,
        createdAt: new Date().toISOString(),
      },
      analysis: {
        technicalAnalysis: signal.analysis.technicalAnalysis,
        marketAnalysis: signal.analysis.marketAnalysis,
        sentimentAnalysis: signal.analysis.sentimentAnalysis ?? '',
        riskAssessment: signal.analysis.riskAssessment ?? '',
      },
      owner: wallet,
    };
    const pinned = await this.pinataUploadJSON(baseMeta, `improvement-${signal.symbol}-${Date.now()}.json`);
    const enrichedMeta = { ...baseMeta, external_url: pinned.url, pinned_cid: pinned.cid };
    const poster = await this.generateSignalPNGPoster({
      symbol: signal.symbol,
      side: signal.side,
      confidence: signal.confidence,
      entryPrice: signal.entryPrice,
    });
    const campAuth = (window as any).__campAuth;
    const origin = campAuth?.origin;
    if (!origin) throw new Error('Origin SDK not ready. Connect with Camp Modal first.');
    if (typeof origin.setViemClient === 'function') origin.setViemClient(viem);
    const license = this.licenseForImprovement(); // price = 1 CAMP native
    const res = await origin.mintFile(poster, enrichedMeta, license, undefined, { progressCallback: () => {} });
    const tokenIdStr = String(res && typeof res === 'object' && 'tokenId' in res ? (res as any).tokenId : res);
    const transactionHash = String(res && typeof res === 'object' && (res as any).transactionHash ? (res as any).transactionHash : tokenIdStr);
    return { tokenId: tokenIdStr, transactionHash };
  }

  async buyAccess(tokenId: string | bigint, periods: number = 1): Promise<any> {
    const campAuth = (window as any).__campAuth;
    const origin = campAuth?.origin;
    if (!origin) throw new Error('Origin SDK not ready. Connect with Camp Modal first.');

    const viem = await this.ensureViemClient();
    if (typeof origin.setViemClient === 'function') origin.setViemClient(viem);

    const tid = typeof tokenId === 'bigint' ? tokenId : BigInt(String(tokenId).trim());
    const terms = await origin.getTerms(tid);
    const price: bigint = BigInt(terms?.price ?? 0);
    const totalPrice = price * BigInt(Math.max(1, periods));

    if (price === 0n) {
      throw new Error('Listing not priced (0 CAMP). Ask the creator to set price > 0.');
    }

    const isNative =
      String(terms.paymentToken).toLowerCase() === '0x0000000000000000000000000000000000000000';

    if (!isNative) {
      const erc20Contract = {
        address: terms.paymentToken as Address,
        abi: [
          {
            name: 'approve',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'spender', type: 'address' },
              { name: 'amount', type: 'uint256' }
            ],
            outputs: [{ name: '', type: 'bool' }]
          }
        ] as const
      };

      const marketplaceAddress = String(import.meta.env.VITE_MARKETPLACE_ADDRESS || '');
      if (!marketplaceAddress) throw new Error('Marketplace address not configured');

      await viem.writeContract({
        ...erc20Contract,
        functionName: 'approve',
        args: [marketplaceAddress as Address, totalPrice]
      });

      return await origin.buyAccess(tid, Math.max(1, periods), 0n);
    }

    return await origin.buyAccess(tid, Math.max(1, periods), totalPrice);
  }

  async renewAccess(tokenId: string | bigint, periods: number = 1): Promise<any> {
    const campAuth = (window as any).__campAuth;
    const origin = campAuth?.origin;
    if (!origin) throw new Error('Origin SDK not ready. Connect with Camp Modal first.');
    const viem = await this.ensureViemClient();
    if (typeof origin.setViemClient === 'function') origin.setViemClient(viem);
    const tid = typeof tokenId === 'bigint' ? tokenId : BigInt(String(tokenId).trim());
    return await origin.renewAccess(tid, Math.max(1, periods));
  }

  async checkAccess(tokenId: string | bigint): Promise<boolean> {
    const campAuth = (window as any).__campAuth;
    const origin = campAuth?.origin;
    if (!origin) return false;
    try {
      const wallet = await this.getWalletAddress();
      const tid = typeof tokenId === 'bigint' ? tokenId : BigInt(String(tokenId).trim());
      const has = await origin.hasAccess(tid, wallet);
      return !!has;
    } catch {
      return false;
    }
  }

  async getSubscriptionExpiry(tokenId: string | bigint): Promise<Date | null> {
    const campAuth = (window as any).__campAuth;
    const origin = campAuth?.origin;
    if (!origin) return null;
    try {
      const wallet = await this.getWalletAddress();
      const tid = typeof tokenId === 'bigint' ? tokenId : BigInt(String(tokenId).trim());
      const expiry = await origin.subscriptionExpiry(tid, wallet);
      if (expiry && Number(expiry) > 0) {
        return new Date(Number(expiry) * 1000);
      }
      return null;
    } catch {
      return null;
    }
  }

  async getTokenData(tokenId: string | bigint): Promise<any> {
    const campAuth = (window as any).__campAuth;
    const origin = campAuth?.origin;
    if (!origin) return null;
    const tid = typeof tokenId === 'bigint' ? tokenId : BigInt(String(tokenId).trim());
    try {
      const data = await origin.getData(tid);
      return data;
    } catch (error) {
      console.error('Failed to get token data:', error);
      return null;
    }
  }

  async getTerms(tokenId: string | bigint): Promise<LicenseTermsSDK | null> {
    const campAuth = (window as any).__campAuth;
    const origin = campAuth?.origin;
    if (!origin) return null;
    const tid = typeof tokenId === 'bigint' ? tokenId : BigInt(String(tokenId).trim());
    try {
      const terms = await origin.getTerms(tid);
      return terms;
    } catch (error) {
      console.error('Failed to get terms:', error);
      return null;
    }
  }

  explorerTxUrl(txHash: string): string {
    const base = String(import.meta.env.VITE_EXPLORER_URL || 'https://explorer.camp.network');
    return `${base.replace(/\/$/, '')}/tx/${txHash}`;
  }

  async waitForTransaction(txHash: string, confirmations: number = 1): Promise<any> {
    const viem = await this.ensureViemClient();
    const publicClient = viem.getPublicClient ? await viem.getPublicClient() : viem;
    if (publicClient.waitForTransactionReceipt) {
      return await publicClient.waitForTransactionReceipt({
        hash: txHash as any,
        confirmations,
      });
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve({ status: 'success' }), 3000);
    });
  }
}

export const campService = new CampService();
