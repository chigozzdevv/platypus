const REGISTER_PATH = '/auth/origin/register';
const SIGN_PATH = '/ipnft/sign';

type AnyHeaders = HeadersInit | undefined;

function normalizeHeaders(h: AnyHeaders): Headers {
  if (!h) return new Headers();
  if (h instanceof Headers) return new Headers(h);
  return new Headers(h as Record<string, string>);
}

async function readBody(init?: RequestInit) {
  if (!init?.body) return '';
  if (typeof init.body === 'string') return init.body;
  try {
    const clone = new Response(init.body as BodyInit);
    return await clone.text();
  } catch {
    return '[non-text body]';
  }
}

export function installCampNetworkLogger(opts: {
  clientId: string;
  apiKey?: string;
  verbose?: boolean;
}): void {
  if ((window as any).__campNetLoggerInstalled) return;
  (window as any).__campNetLoggerInstalled = true;

  const matchInteresting = (url: string) =>
    url.includes(REGISTER_PATH) || url.includes(SIGN_PATH);

  const origFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : (input as Request).url;
    const isInteresting = matchInteresting(url);

    let headers = normalizeHeaders(
      init?.headers || (typeof input !== 'string' ? (input as Request).headers : undefined)
    );

    if (isInteresting) {
      if (opts.clientId && !headers.has('x-client-id')) {
        headers.set('x-client-id', opts.clientId);
      }
      if (opts.apiKey && !headers.has('x-api-key')) {
        headers.set('x-api-key', opts.apiKey);
      }
      if (!headers.has('content-type')) {
        headers.set('content-type', 'application/json');
      }

      const bodyText = await readBody(init);
      if (opts.verbose) {
        // eslint-disable-next-line no-console
        console.groupCollapsed(
          `[Origin] → ${new URL(url).pathname} ${init?.method || (typeof input !== 'string' && (input as Request).method) || 'GET'}`
        );
        // eslint-disable-next-line no-console
        console.log('url', url);
        // eslint-disable-next-line no-console
        console.log('headers', Object.fromEntries(headers.entries()));
        // eslint-disable-next-line no-console
        console.log('body', bodyText);
        // eslint-disable-next-line no-console
        console.groupEnd();
      }

      const res = await origFetch(url, { ...init, headers });
      let text = '';
      try { text = await res.clone().text(); } catch {}
      if (opts.verbose) {
        // eslint-disable-next-line no-console
        console.groupCollapsed(`[Origin] ← ${res.status} ${new URL(url).pathname}`);
        // eslint-disable-next-line no-console
        console.log('status', res.status);
        // eslint-disable-next-line no-console
        console.log('response', text);
        // eslint-disable-next-line no-console
        console.groupEnd();
      }
      return res;
    }

    return origFetch(input as any, init);
  };
}
