// src/services/camp.ts
import { createWalletClient, custom, http } from 'viem';

type Address = `0x${string}`;

type LicenseTermsSDK = {
  price: bigint;
  duration: number;
  royaltyBps: number;
  paymentToken: Address;
};

function clampBps(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(10000, Math.floor(n)));
}

export class CampService {
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

  private licenseBase(): LicenseTermsSDK {
    return {
      price: BigInt(0),
      duration: 30 * 24 * 60 * 60,
      royaltyBps: 10000,
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

  private async buildPosterPNG(meta: {
    title: string;
    subtitle?: string;
    details?: string[];
    accent?: 'green' | 'red' | 'blue';
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

    const accents: Record<string, string> = {
      green: '#16a34a',
      red: '#dc2626',
      blue: '#2563eb',
    };
    const bar = accents[meta.accent || 'blue'] || '#2563eb';

    (ctx as any).fillStyle = '#0b1020';
    (ctx as any).fillRect(0, 0, width, height);

    (ctx as any).fillStyle = bar;
    (ctx as any).fillRect(0, height - 10, width, 10);

    (ctx as any).fillStyle = '#ffffff';
    (ctx as any).font = 'bold 64px system-ui, -apple-system, Segoe UI, Roboto, Inter';
    (ctx as any).textBaseline = 'top';
    (ctx as any).fillText(meta.title, 48, 48);

    if (meta.subtitle) {
      (ctx as any).font = '600 36px system-ui, -apple-system, Segoe UI, Roboto, Inter';
      (ctx as any).fillStyle = '#cbd5e1';
      (ctx as any).fillText(meta.subtitle, 48, 120);
    }

    (ctx as any).font = 'normal 28px system-ui, -apple-system, Segoe UI, Roboto, Inter';
    (ctx as any).fillStyle = '#94a3b8';
    let y = 184;
    (meta.details || []).forEach((d) => {
      (ctx as any).fillText(d, 48, y);
      y += 44;
    });

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

    const name = `poster-${Date.now()}.png`;
    return new File([blob], name, { type });
  }

  async checkAccess(tokenId: string | number | bigint): Promise<boolean> {
    try {
      const camp = (window as any).__campAuth || {};
      const origin = camp.origin;
      if (!origin) return true;
      const user = await this.getWalletAddress();
      const ok = await origin.hasAccess(BigInt(tokenId as any), user);
      return !!ok;
    } catch {
      return false;
    }
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
      kind: 'parent',
    };

    const pinned = await this.pinataUploadJSON(baseMeta, `signal-${signal.symbol}-${Date.now()}.json`);
    const enriched = { ...baseMeta, external_url: pinned.url, pinned_cid: pinned.cid };

    const poster = await this.buildPosterPNG({
      title: `${signal.symbol} • ${signal.side.toUpperCase()}`,
      subtitle: `Confidence ${signal.confidence}%`,
      details: [`Entry $${signal.entryPrice}`, `AI ${signal.aiModel || '—'}`],
      accent: signal.side.toLowerCase() === 'long' ? 'green' : 'red',
    });

    const camp = (window as any).__campAuth || {};
    const origin = camp.origin;
    if (!origin) throw new Error('Origin SDK not ready. Connect with Camp Modal first.');
    if (typeof origin.setViemClient === 'function') origin.setViemClient(viem);

    const license = this.licenseBase();
    const tokenIdStr: string = await origin.mintFile(poster, enriched, license);

    return { tokenId: tokenIdStr, transactionHash: tokenIdStr };
  }

  async mintImprovement(
    signal: any,
    improvement: any,
    opts?: { thresholdBps?: number; goodScore?: number }
  ) {
    const wallet = await this.getWalletAddress();
    const viem = await this.ensureViemClient();

    const parentIdRaw =
      signal?.ipTokenId ?? signal?.parentTokenId ?? improvement?.parentTokenId;
    if (!parentIdRaw) throw new Error('Parent token id is required');
    const parentId = BigInt(parentIdRaw);

    const score: number = Number(
      improvement?.qualityScore ?? improvement?.score ?? improvement?.improvementScore ?? 0
    );
    const goodScore = opts?.goodScore ?? 70;
    const improverBps = clampBps(score >= goodScore ? 6000 : 4000);
    const parentBps = clampBps(10000 - improverBps);

    const baseMeta = {
      name: `${signal?.symbol || 'Asset'} Improvement`,
      description: improvement?.description || 'User-submitted improvement',
      attributes: {
        parentTokenId: parentId.toString(),
        symbol: signal?.symbol || null,
        baseSide: signal?.side || null,
        baseConfidence: signal?.confidence ?? null,
        improvementScore: score,
        createdAt: new Date().toISOString(),
      },
      improvement: {
        notes: improvement?.notes ?? improvement?.description ?? '',
        data: improvement?.data ?? null,
        author: wallet,
      },
      revenueSplit: {
        improverBps,
        parentBps,
        reason: 'improvement_score',
        threshold: goodScore,
      },
      owner: wallet,
      kind: 'derivative',
    };

    const pinned = await this.pinataUploadJSON(
      baseMeta,
      `improvement-${signal?.symbol || 'asset'}-${Date.now()}.json`
    );
    const enriched = { ...baseMeta, external_url: pinned.url, pinned_cid: pinned.cid };

    const poster = await this.buildPosterPNG({
      title: `${signal?.symbol || 'Asset'} • Improved`,
      subtitle: `Score ${score}`,
      details: [
        `Improver Share ${Math.round(improverBps / 100)}%`,
        `Parent Share ${Math.round(parentBps / 100)}%`,
      ],
      accent: 'blue',
    });

    const camp = (window as any).__campAuth || {};
    const origin = camp.origin;
    if (!origin) throw new Error('Origin SDK not ready. Connect with Camp Modal first.');
    if (typeof origin.setViemClient === 'function') origin.setViemClient(viem);

    const license = this.licenseBase();
    license.royaltyBps = improverBps;

    const tokenIdStr: string = await origin.mintFile(poster, enriched, license, parentId);

    return { tokenId: tokenIdStr, transactionHash: tokenIdStr };
  }
}

export const campService = new CampService();
