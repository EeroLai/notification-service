import type { Env } from '../types'

export function createMockKV(store: Record<string, string> = {}): KVNamespace {
  return {
    get: async (key: string) => store[key] ?? null,
    put: async (key: string, value: string) => { store[key] = value },
    delete: async (key: string) => { delete store[key] },
    list: async (opts?: { prefix?: string }) => {
      const prefix = opts?.prefix ?? ''
      const keys = Object.keys(store)
        .filter((k) => k.startsWith(prefix))
        .map((name) => ({ name }))
      return { keys, list_complete: true, cacheStatus: null }
    },
    getWithMetadata: async () => ({ value: null, metadata: null, cacheStatus: null }),
  } as unknown as KVNamespace
}

export function createMockEnv(kvStore: Record<string, string> = {}): Env {
  return {
    NOTIFICATION_KV: createMockKV(kvStore),
    LINE_CHANNEL_ACCESS_TOKEN: 'test-line-token',
    TASK_API_KEY: 'test-api-key',
    LINE_CHANNEL_SECRET: 'test-secret',
  }
}
