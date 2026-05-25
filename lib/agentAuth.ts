/** Edge Runtime-compatible agent session helpers (uses Web Crypto only). */

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

/** Creates a signed cookie value: `${agentId}.${hmac}` */
export async function createAgentToken(agentId: number): Promise<string> {
  const secret = process.env.SESSION_SECRET ?? "default_secret_change_me";
  const mac = await hmacBase64(secret, `agent:${agentId}`);
  return `${agentId}.${mac}`;
}

/** Verifies cookie and returns agentId, or null if invalid. */
export async function verifyAgentCookie(
  cookie: string | undefined,
): Promise<number | null> {
  if (!cookie) return null;
  const dotIndex = cookie.indexOf(".");
  if (dotIndex === -1) return null;
  const agentIdStr = cookie.substring(0, dotIndex);
  const agentId = parseInt(agentIdStr, 10);
  if (isNaN(agentId) || agentId <= 0) return null;
  const expected = await createAgentToken(agentId);
  if (cookie !== expected) return null;
  return agentId;
}
