import { describe, expect, it } from "vitest";
import { signAdToken, verifyAdToken } from "@/lib/security/ad-token";
import {
  confirmAdWatch,
  requestDownloadToken,
  resolveDownloadUrl,
  type DownloadServiceClients,
} from "@/lib/services/download.service";

interface DbState {
  rows: Record<string, Array<Record<string, unknown>>>;
  counts: Record<string, number>;
  user: { id: string } | null;
  inserted: Record<string, Array<Record<string, unknown>>>;
  updated: Array<{ table: string; data: Record<string, unknown> }>;
}

class FakeChain {
  private insertRow: Record<string, unknown> | null = null;
  private updateRow: Record<string, unknown> | null = null;
  private head = false;

  constructor(
    private table: string,
    private state: DbState,
  ) {}

  select(_cols?: unknown, opts?: { count?: string; head?: boolean }) {
    if (opts?.count === "exact" && opts.head) this.head = true;
    return this;
  }
  eq() {
    return this;
  }
  is() {
    return this;
  }
  gte() {
    return this;
  }
  insert(row: Record<string, unknown>) {
    this.insertRow = row;
    return this;
  }
  update(row: Record<string, unknown>) {
    this.updateRow = row;
    return this;
  }
  maybeSingle() {
    return Promise.resolve(this.resolve());
  }
  single() {
    return Promise.resolve(this.resolve());
  }
  then<T>(resolve: (v: unknown) => T) {
    return Promise.resolve(this.resolve()).then(resolve);
  }

  private resolve() {
    if (this.head) return { count: this.state.counts[this.table] ?? 0 };
    if (this.insertRow) {
      const list = (this.state.inserted[this.table] ??= []);
      list.push(this.insertRow);
      return { data: { id: `gen-${this.table}-${list.length}` }, error: null };
    }
    if (this.updateRow) {
      this.state.updated.push({ table: this.table, data: this.updateRow });
      return { data: null, error: null };
    }
    const rows = this.state.rows[this.table] ?? [];
    return { data: rows[0] ?? null, error: null };
  }
}

function makeDb(overrides: Partial<DbState> = {}): {
  state: DbState;
  admin: DownloadServiceClients["admin"];
  auth: DownloadServiceClients["auth"];
} {
  const state: DbState = {
    rows: { wallpapers: [], profiles: [], ad_confirmations: [], downloads: [] },
    counts: {},
    user: null,
    inserted: {},
    updated: [],
    ...overrides,
  };
  const admin = { from: (t: string) => new FakeChain(t, state) };
  const auth = {
    from: (t: string) => new FakeChain(t, state),
    auth: {
      getUser: async (_jwt?: string) => ({ data: { user: state.user } }),
    },
  };
  return { state, admin, auth };
}

const publishedWallpaper = (extra: Record<string, unknown> = {}) => ({
  id: "w1",
  is_premium: false,
  original_url: "https://cdn.example.com/w1-original.jpg",
  ...extra,
});

describe("confirmAdWatch", () => {
  it("inserts a confirmation with the nonce, wallpaper and ip", async () => {
    const { state, admin } = makeDb();
    const res = await confirmAdWatch({ admin }, { wallpaperId: "w1", nonce: "n1", ip: "1.2.3.4" });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.id).toBeTruthy();
    expect(state.inserted.ad_confirmations).toHaveLength(1);
    expect(state.inserted.ad_confirmations[0]).toMatchObject({
      nonce: "n1",
      wallpaper_id: "w1",
      ip_address: "1.2.3.4",
    });
  });

  it("is idempotent for an existing nonce", async () => {
    const { state, admin } = makeDb({
      rows: { ...makeDb().state.rows, ad_confirmations: [{ id: "c1", nonce: "n1" }] },
    });
    const res = await confirmAdWatch({ admin }, { wallpaperId: "w1", nonce: "n1", ip: null });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.id).toBe("c1");
    expect(state.inserted.ad_confirmations ?? []).toHaveLength(0);
  });

  it("rejects an invalid nonce", async () => {
    const { admin } = makeDb();
    const res = await confirmAdWatch({ admin }, { wallpaperId: "w1", nonce: "", ip: null });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(400);
  });

  it("rate-limits confirmations per ip", async () => {
    const { admin } = makeDb({ counts: { ad_confirmations: 10 } });
    const res = await confirmAdWatch({ admin }, { wallpaperId: "w1", nonce: "n1", ip: "1.2.3.4" });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(429);
  });
});

describe("requestDownloadToken", () => {
  it("rejects an unknown wallpaper", async () => {
    const { state, admin, auth } = makeDb();
    const res = await requestDownloadToken({ admin, auth }, { wallpaperId: "nope", ip: null });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(404);
    expect(state.updated).toHaveLength(0);
  });

  it("issues a usable token for a published wallpaper", async () => {
    const { admin, auth } = makeDb({
      rows: { ...makeDb().state.rows, wallpapers: [publishedWallpaper()] },
    });
    const res = await requestDownloadToken({ admin, auth }, { wallpaperId: "w1", ip: "1.2.3.4" });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(verifyAdToken(res.data.token, "w1")).toBe(true);
    }
  });

  it("does not issue a token when rate-limited", async () => {
    const { state, admin, auth } = makeDb({
      counts: { downloads: 5 },
      rows: { ...makeDb().state.rows, wallpapers: [publishedWallpaper()] },
    });
    const res = await requestDownloadToken({ admin, auth }, { wallpaperId: "w1", ip: "1.2.3.4" });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(429);
    expect(state.updated).toHaveLength(0);
  });

  it("rejects premium wallpapers for guests", async () => {
    const { state, admin, auth } = makeDb({
      rows: {
        ...makeDb().state.rows,
        wallpapers: [publishedWallpaper({ is_premium: true })],
      },
    });
    const res = await requestDownloadToken({ admin, auth }, { wallpaperId: "w1", ip: null });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(403);
    expect(state.updated).toHaveLength(0);
  });

  it("allows premium wallpapers for admins", async () => {
    const { admin, auth } = makeDb({
      user: { id: "u1" },
      rows: {
        ...makeDb().state.rows,
        wallpapers: [publishedWallpaper({ is_premium: true })],
        profiles: [{ id: "u1", is_premium: false, role: "admin" }],
      },
    });
    const res = await requestDownloadToken({ admin, auth }, { wallpaperId: "w1", ip: null });
    expect(res.ok).toBe(true);
    if (res.ok) expect(verifyAdToken(res.data.token, "w1")).toBe(true);
  });

  it("resolves the user from the access token for premium gating", async () => {
    const { admin, auth } = makeDb({
      user: { id: "u1" },
      rows: {
        ...makeDb().state.rows,
        wallpapers: [publishedWallpaper({ is_premium: true })],
        profiles: [{ id: "u1", is_premium: true, role: "user" }],
      },
    });
    const res = await requestDownloadToken(
      { admin, auth },
      { wallpaperId: "w1", ip: null, accessToken: "jwt" },
    );
    expect(res.ok).toBe(true);
    if (res.ok) expect(verifyAdToken(res.data.token, "w1")).toBe(true);
  });
});

describe("resolveDownloadUrl", () => {
  it("rejects a missing/invalid token", async () => {
    const { state, admin, auth } = makeDb({
      rows: { ...makeDb().state.rows, wallpapers: [publishedWallpaper()] },
    });
    const res = await resolveDownloadUrl({ admin, auth }, { wallpaperId: "w1", token: "bad", ip: null, userAgent: null });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(403);
    expect(state.inserted.downloads ?? []).toHaveLength(0);
  });

  it("rejects a valid token for a missing wallpaper", async () => {
    const { admin, auth } = makeDb();
    const token = signAdToken("w1");
    const res = await resolveDownloadUrl({ admin, auth }, { wallpaperId: "w1", token, ip: null, userAgent: null });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(404);
  });

  it("redirects to the original url and logs the download", async () => {
    const { state, admin, auth } = makeDb({
      rows: { ...makeDb().state.rows, wallpapers: [publishedWallpaper()] },
    });
    const token = signAdToken("w1");
    const res = await resolveDownloadUrl({ admin, auth }, { wallpaperId: "w1", token, ip: "1.2.3.4", userAgent: "ua" });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.url).toBe("https://cdn.example.com/w1-original.jpg");
    expect(state.inserted.downloads).toHaveLength(1);
    expect(state.inserted.downloads[0]).toMatchObject({ wallpaper_id: "w1", ip_address: "1.2.3.4", user_agent: "ua" });
  });

  it("logs the download with the user id when an access token is provided", async () => {
    const { state, admin, auth } = makeDb({
      user: { id: "u1" },
      rows: { ...makeDb().state.rows, wallpapers: [publishedWallpaper()] },
    });
    const token = signAdToken("w1");
    const res = await resolveDownloadUrl(
      { admin, auth },
      { wallpaperId: "w1", token, ip: null, userAgent: null, accessToken: "jwt" },
    );
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.url).toBe("https://cdn.example.com/w1-original.jpg");
    expect(state.inserted.downloads[0]).toMatchObject({ wallpaper_id: "w1", user_id: "u1" });
  });

  it("does not log the download when rate-limited", async () => {
    const { state, admin, auth } = makeDb({
      counts: { downloads: 5 },
      rows: { ...makeDb().state.rows, wallpapers: [publishedWallpaper()] },
    });
    const token = signAdToken("w1");
    const res = await resolveDownloadUrl({ admin, auth }, { wallpaperId: "w1", token, ip: "1.2.3.4", userAgent: null });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(429);
    expect(state.inserted.downloads ?? []).toHaveLength(0);
  });
});
