import { beforeAll, describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import type { verifyAdToken as VerifyAdToken, signAdToken as SignAdToken } from "@/lib/security/ad-token";

describe("ad-token", () => {
  let signAdToken: typeof SignAdToken;
  let verifyAdToken: typeof VerifyAdToken;

  beforeAll(async () => {
    process.env.DOWNLOAD_TOKEN_SECRET = "test-secret";
    const mod = await import("@/lib/security/ad-token");
    signAdToken = mod.signAdToken;
    verifyAdToken = mod.verifyAdToken;
  });

  it("verifies a freshly signed token", () => {
    const token = signAdToken("wall-1");
    expect(verifyAdToken(token, "wall-1")).toBe(true);
  });

  it("rejects a token for a different wallpaper", () => {
    const token = signAdToken("wall-1");
    expect(verifyAdToken(token, "wall-2")).toBe(false);
  });

  it("rejects a tampered signature", () => {
    const token = signAdToken("wall-1");
    const tampered = `${token.slice(0, -4)}aaaa`;
    expect(verifyAdToken(tampered, "wall-1")).toBe(false);
  });

  it("rejects an expired token", () => {
    const payload = Buffer.from(
      JSON.stringify({
        wallpaperId: "wall-1",
        iat: Date.now() - 60_000,
        exp: Date.now() - 10_000,
        nonce: "n",
      }),
    ).toString("base64url");
    const signature = createHmac("sha256", process.env.DOWNLOAD_TOKEN_SECRET!)
      .update(payload)
      .digest("base64url");
    const expired = `${payload}.${signature}`;
    expect(verifyAdToken(expired, "wall-1")).toBe(false);
  });

  it("rejects garbage", () => {
    expect(verifyAdToken("not-a-token", "wall-1")).toBe(false);
    expect(verifyAdToken("", "wall-1")).toBe(false);
  });
});
