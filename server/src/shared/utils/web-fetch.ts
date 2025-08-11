import { logger } from './logger';

export class WebFetch {
  async fetchJSON<T = any>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      logger.error('Web fetch failed', { error, url });
      throw error;
    }
  }

  async fetchText(url: string, options?: RequestInit): Promise<string> {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      logger.error('Web fetch failed', { error, url });
      throw error;
    }
  }
}