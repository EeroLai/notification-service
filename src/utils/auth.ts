export function verifyBearerToken(request: Request, expectedToken: string): boolean {
  const header = request.headers.get('Authorization')
  if (!header) return false

  const [scheme, token] = header.split(' ')
  return scheme === 'Bearer' && token === expectedToken
}
