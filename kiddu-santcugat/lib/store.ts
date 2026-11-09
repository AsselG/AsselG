import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';

export interface KV {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<void>;
  del(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
}

class FileKV implements KV {
  constructor(private dir: string) {}
  private file(key: string) { return path.join(this.dir, `${encodeURIComponent(key)}.json`); }
  async get<T>(key: string) {
    try { return JSON.parse(await fs.readFile(this.file(key), 'utf8')) as T; } catch { return null; }
  }
  async set(key: string, value: unknown) {
    await fs.mkdir(this.dir, { recursive: true });
    await fs.writeFile(this.file(key), JSON.stringify(value));
  }
  async del(key: string) { await fs.rm(this.file(key), { force: true }); }
  async list(prefix: string) {
    try {
      return (await fs.readdir(this.dir)).filter((f) => f.endsWith('.json')).map((f) => decodeURIComponent(f.slice(0, -5))).filter((k) => k.startsWith(prefix));
    } catch { return []; }
  }
}

class BlobsKV implements KV {
  private store: Promise<import('@netlify/blobs').Store> | null = null;
  private get s() {
    this.store ??= import('@netlify/blobs').then((m) => m.getStore({ name: 'kiddu', consistency: 'strong' }));
    return this.store;
  }
  async get<T>(key: string) { return ((await (await this.s).get(key, { type: 'json' })) as T | null) ?? null; }
  async set(key: string, value: unknown) { await (await this.s).setJSON(key, value); }
  async del(key: string) { await (await this.s).delete(key); }
  async list(prefix: string) {
    const out: string[] = [];
    const res = await (await this.s).list({ prefix });
    for (const b of res.blobs) out.push(b.key);
    return out;
  }
}

let kv: KV | null = null;
export function store(): KV {
  if (kv) return kv;
  const dir = process.env.KIDDU_STORE_DIR;
  const onNetlify = !!(process.env.NETLIFY_BLOBS_CONTEXT || process.env.AWS_LAMBDA_FUNCTION_NAME);
  kv = dir ? new FileKV(dir) : onNetlify ? new BlobsKV() : new FileKV('.data');
  return kv;
}
export const storeKind = () => (process.env.KIDDU_STORE_DIR ? 'file(test)' : process.env.NETLIFY_BLOBS_CONTEXT || process.env.AWS_LAMBDA_FUNCTION_NAME ? 'netlify-blobs' : 'file(.data)');
