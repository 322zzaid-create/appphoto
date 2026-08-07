import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp } from "@/lib/security/rate-limit";
import { requestDownloadToken } from "@/lib/services/download.service";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { wallpaperId, nonce } = (body ?? {}) as {
    wallpaperId?: unknown;
    nonce?: unknown;
  };

  if (typeof wallpaperId !== "string" || !wallpaperId) {
    return NextResponse.json({ error: "Missing wallpaper id" }, { status: 400 });
  }

  const result = await requestDownloadToken(
    { admin: createAdminClient(), auth: await createClient() },
    { wallpaperId, nonce: typeof nonce === "string" ? nonce : "", ip: getClientIp(request) },
  );

  return NextResponse.json(
    result.ok ? { token: result.data.token } : { error: result.error },
    { status: result.ok ? 200 : result.status },
  );
}
