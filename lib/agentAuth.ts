/** Edge Runtime-compatible agent session helpers (uses Web Crypto only). */

export const agentSessionMaxAgeSeconds = 60 * 60 * 12; // 12 saat

async function hmacBase64(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  const bytes = new Uint8Array(sig);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

/** Creates a signed cookie value: `${agentId}.${expiresAt}.${hmac}` */
export async function createAgentToken(agentId: number): Promise<string> {
  const secret = getSessionSecret();
  const expiresAt = Date.now() + agentSessionMaxAgeSeconds * 1000;
  const mac = await hmacBase64(secret, getAgentSessionMessage(agentId, expiresAt));
  return `${agentId}.${expiresAt}.${mac}`;
}

/** Verifies cookie and returns agentId, or null if invalid. */
export async function verifyAgentCookie(
  cookie: string | undefined,
): Promise<number | null> {
  if (!cookie) return null;

  const [agentIdStr, expiresAtStr, mac] = cookie.split(".");
  const agentId = parseInt(agentIdStr, 10);
  const expiresAt = Number(expiresAtStr);

  if (isNaN(agentId) || agentId <= 0) return null;
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;
  if (!mac) return null;

  const expected = await hmacBase64(
    getSessionSecret(),
    getAgentSessionMessage(agentId, expiresAt),
  );

  if (mac !== expected) return null;
  return agentId;
}

function getAgentSessionMessage(agentId: number, expiresAt: number) {
  return `agent:${agentId}:${expiresAt}`;
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters.");
  }

  return secret;
}
