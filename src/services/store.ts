const USER_PREFIX = 'line:user:'

export async function getLineUserId(kv: KVNamespace, userId: string): Promise<string | null> {
  return kv.get(`${USER_PREFIX}${userId}`)
}

export async function saveLineUserId(kv: KVNamespace, userId: string): Promise<void> {
  await kv.put(`${USER_PREFIX}${userId}`, userId)
}

export async function getAllLineUserIds(kv: KVNamespace): Promise<string[]> {
  const list = await kv.list({ prefix: USER_PREFIX })
  return list.keys.map((key) => key.name.replace(USER_PREFIX, ''))
}
