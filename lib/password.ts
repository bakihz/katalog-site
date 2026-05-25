import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString(
    "hex",
  );
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const colonIdx = stored.indexOf(":");
  if (colonIdx === -1) return false;
  const salt = stored.substring(0, colonIdx);
  const hash = stored.substring(colonIdx + 1);
  const verifyHash = pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString(
    "hex",
  );
  try {
    return timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(verifyHash, "hex"),
    );
  } catch {
    return false;
  }
}
