const adminSessionMessagePrefix = "admin_authenticated";

async function signAdminSession(message: string): Promise<string> {
  const secret = getAdminSessionSecret();
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

export async function createAdminSessionToken(maxAgeSeconds: number) {
  const expiresAt = Date.now() + maxAgeSeconds * 1000;
  const message = `${adminSessionMessagePrefix}:${expiresAt}`;
  const signature = await signAdminSession(message);

  return `${expiresAt}.${signature}`;
}

export async function verifyAdminSessionToken(cookie: string | undefined) {
  if (!cookie) return false;

  const dotIndex = cookie.indexOf(".");
  if (dotIndex === -1) return false;

  const expiresAt = Number(cookie.slice(0, dotIndex));
  const signature = cookie.slice(dotIndex + 1);

  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return false;
  }

  const expectedSignature = await signAdminSession(
    `${adminSessionMessagePrefix}:${expiresAt}`,
  );

  return signature === expectedSignature;
}

function getAdminSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters.");
  }

  return `${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}:${secret}`;
}
