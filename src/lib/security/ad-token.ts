import { createHmac, timingSafeEqual } from "node:crypto";

const SECRET =
  process.env.DOWNLOAD_TOKEN_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const TTL_SECONDS = 120;

export function signAdToken(wallpaperId: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      wallpaperId,
      iat: Date.now(),
      exp: Date.now() + TTL_SECONDS * 1000,
      nonce: Math.random().toString(36).slice(2),
    }),
  ).toString("base64url");

  const signature = createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyAdToken(token: string, wallpaperId: string): boolean {
  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return false;

    const expected = createHmac("sha256", SECRET).update(payload).digest("base64url");
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      wallpaperId: string;
      exp: number;
    };
    if (data.wallpaperId !== wallpaperId) return false;
    if (typeof data.exp !== "number" || data.exp < Date.now()) return false;

    return true;
  } catch {
    return false;
  }
}
