import fs from 'fs';
import path from 'path';
import { config } from './config';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Use /tmp in serverless environments (Vercel)
const CACHE_DIR = process.env.VERCEL 
  ? '/tmp/.cache' 
  : path.join(process.cwd(), '.cache');

// Ensure cache directory exists
try {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
} catch (error) {
  console.warn('Unable to create cache directory:', error);
}

class Cache {
  private getCacheFilePath(key: string): string {
    const sanitized = key.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return path.join(CACHE_DIR, `${sanitized}.json`);
  }

  set<T>(key: string, data: T, ttlSeconds: number = 60): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttlSeconds * 1000,
      };

      const filePath = this.getCacheFilePath(key);
      fs.writeFileSync(filePath, JSON.stringify(entry));
      console.log(`[CACHE] Set: ${key} (TTL: ${ttlSeconds}s)`);
    } catch (error) {
      console.error(`[CACHE] Error setting cache for ${key}:`, error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const filePath = this.getCacheFilePath(key);

      if (!fs.existsSync(filePath)) {
        console.log(`[CACHE] Miss: ${key}`);
        return null;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const entry: CacheEntry<T> = JSON.parse(content);

      // Check if expired
      const age = Date.now() - entry.timestamp;
      if (age > entry.ttl) {
        console.log(`[CACHE] Expired: ${key} (age: ${Math.round(age / 1000)}s)`);
        this.delete(key);
        return null;
      }

      console.log(`[CACHE] Hit: ${key}`);
      return entry.data;
    } catch (error) {
      console.error(`[CACHE] Error getting cache for ${key}:`, error);
      return null;
    }
  }

  delete(key: string): void {
    try {
      const filePath = this.getCacheFilePath(key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[CACHE] Deleted: ${key}`);
      }
    } catch (error) {
      console.error(`[CACHE] Error deleting cache for ${key}:`, error);
    }
  }

  deletePattern(pattern: string): void {
    try {
      const files = fs.readdirSync(CACHE_DIR);
      const sanitizedPattern = pattern.replace(/[^a-z0-9]/gi, '_').toLowerCase();

      files.forEach(file => {
        if (file.includes(sanitizedPattern)) {
          fs.unlinkSync(path.join(CACHE_DIR, file));
          console.log(`[CACHE] Deleted (pattern): ${file}`);
        }
      });
    } catch (error) {
      console.error(`[CACHE] Error deleting cache pattern ${pattern}:`, error);
    }
  }

  clear(): void {
    try {
      const files = fs.readdirSync(CACHE_DIR);
      files.forEach(file => {
        fs.unlinkSync(path.join(CACHE_DIR, file));
      });
      console.log('[CACHE] Cleared all cache');
    } catch (error) {
      console.error('[CACHE] Error clearing cache:', error);
    }
  }

  getStats() {
    try {
      const files = fs.readdirSync(CACHE_DIR);
      let totalSize = 0;
      let validEntries = 0;
      let expiredEntries = 0;

      files.forEach(file => {
        const filePath = path.join(CACHE_DIR, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;

        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const entry: CacheEntry<unknown> = JSON.parse(content);
          const age = Date.now() - entry.timestamp;

          if (age > entry.ttl) {
            expiredEntries++;
          } else {
            validEntries++;
          }
        } catch {
          // Invalid cache file
        }
      });

      return {
        totalEntries: files.length,
        validEntries,
        expiredEntries,
        totalSizeBytes: totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      };
    } catch (error) {
      console.error('[CACHE] Error getting stats:', error);
      return {
        totalEntries: 0,
        validEntries: 0,
        expiredEntries: 0,
        totalSizeBytes: 0,
        totalSizeMB: '0',
      };
    }
  }
}

export const cache = new Cache();

// Helper function for caching async operations
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds?: number
): Promise<T> {
  // Check if caching is enabled
  if (!config.isFeatureEnabled('ENABLE_CACHING')) {
    return await fn();
  }

  // Use default TTL if not specified
  const ttl = ttlSeconds || config.get('CACHE_TTL_DEFAULT');

  // Try to get from cache
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Execute function and cache result
  const result = await fn();
  cache.set(key, result, ttl);
  return result;
}
