const adminSessionMessagePrefix = "admin_authenticated";
export const adminSessionMaxAgeSeconds = 60 * 60;

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

type ParsedAdminSessionToken = {
  expiresAt: number;
  userId: number | null;
  signature: string;
  signedMessage: string;
};

export async function createAdminSessionToken(
  maxAgeSeconds: number,
  userId?: number | null,
) {
  const expiresAt = Date.now() + maxAgeSeconds * 1000;
  const message = getAdminSessionMessage(expiresAt, userId);
  const signature = await signAdminSession(message);

  return userId ? `${expiresAt}.${userId}.${signature}` : `${expiresAt}.${signature}`;
}

export async function verifyAdminSessionToken(cookie: string | undefined) {
  const parsed = parseAdminSessionToken(cookie);

  if (!parsed || parsed.expiresAt <= Date.now()) {
    return false;
  }

  const expectedSignature = await signAdminSession(parsed.signedMessage);

  return parsed.signature === expectedSignature;
}

export async function getAdminSessionUserId(cookie: string | undefined) {
  const parsed = parseAdminSessionToken(cookie);

  if (!parsed || parsed.expiresAt <= Date.now()) {
    return null;
  }

  const expectedSignature = await signAdminSession(parsed.signedMessage);

  return parsed.signature === expectedSignature ? parsed.userId : null;
}

function getAdminSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters.");
  }

  return secret;
}

function getAdminSessionMessage(expiresAt: number, userId?: number | null) {
  return userId
    ? `${adminSessionMessagePrefix}:${expiresAt}:${userId}`
    : `${adminSessionMessagePrefix}:${expiresAt}`;
}

function parseAdminSessionToken(
  cookie: string | undefined,
): ParsedAdminSessionToken | null {
  if (!cookie) {
    return null;
  }

  const parts = cookie.split(".");

  if (parts.length !== 2 && parts.length !== 3) {
    return null;
  }

  const expiresAt = Number(parts[0]);

  if (!Number.isFinite(expiresAt)) {
    return null;
  }

  if (parts.length === 2) {
    return {
      expiresAt,
      userId: null,
      signature: parts[1],
      signedMessage: getAdminSessionMessage(expiresAt),
    };
  }

  const userId = Number(parts[1]);

  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  return {
    expiresAt,
    userId,
    signature: parts[2],
    signedMessage: getAdminSessionMessage(expiresAt, userId),
  };
}
