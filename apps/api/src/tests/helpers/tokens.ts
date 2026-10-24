import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from 'jose'
import type { JWTVerifyGetKey } from 'jose'

/**
 * Signing keys and a token minter for the auth middleware tests.
 *
 * Neon Auth signs with EdDSA and publishes a JWKS, so tests mirror that: an
 * Ed25519 pair is generated per suite and the public half is served as a local
 * key set the middleware can be pointed at.
 */

const KEY_ID = 'test-signing-key'
const DEFAULT_SUB = '11111111-1111-4111-8111-111111111111'
const DEFAULT_EMAIL = 'ada@example.com'
const DEFAULT_NAME = 'Ada Lovelace'

export interface TokenClaims {
  /** `null` omits the claim entirely. */
  sub?: string | null
  /** `null` omits the claim entirely. */
  email?: string | null
  /** `null` omits the claim entirely. */
  name?: string | null
  issuer?: string
  /** Negative values produce an already-expired token. */
  expiresInSeconds?: number
}

export interface TestKeys {
  keySet: JWTVerifyGetKey
  mint: (claims?: TokenClaims) => Promise<string>
}

export const testUser = {
  id: DEFAULT_SUB,
  email: DEFAULT_EMAIL,
  name: DEFAULT_NAME,
}

/**
 * Generates a fresh Ed25519 pair and returns its key set plus a token minter.
 *
 * @param issuer - Default `iss` claim; the middleware pins this to the Neon Auth
 *   base URL's origin.
 */
export async function createTestKeys(issuer: string): Promise<TestKeys> {
  const { privateKey, publicKey } = await generateKeyPair('EdDSA', { extractable: true })
  const publicJwk = await exportJWK(publicKey)
  const keySet = createLocalJWKSet({ keys: [{ ...publicJwk, alg: 'EdDSA', kid: KEY_ID }] })

  const mint = async (claims: TokenClaims = {}) => {
    const {
      sub = DEFAULT_SUB,
      email = DEFAULT_EMAIL,
      name = DEFAULT_NAME,
      issuer: tokenIssuer = issuer,
      expiresInSeconds = 900,
    } = claims

    const payload: Record<string, unknown> = {}
    if (sub !== null) payload.sub = sub
    if (email !== null) payload.email = email
    if (name !== null) payload.name = name

    const issuedAt = Math.floor(Date.now() / 1000)

    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'EdDSA', kid: KEY_ID })
      .setIssuer(tokenIssuer)
      .setIssuedAt(issuedAt)
      .setExpirationTime(issuedAt + expiresInSeconds)
      .sign(privateKey)
  }

  return { keySet, mint }
}
