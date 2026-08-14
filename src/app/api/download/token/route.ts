import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp } from "@/lib/security/rate-limit";
import { requestDownloadToken } from "@/lib/services/download.service";

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { wallpaperId } = (body ?? {}) as { wallpaperId?: unknown };

  if (typeof wallpaperId !== "string" || !wallpaperId) {
    return NextResponse.json({ error: "Missing wallpaper id" }, { status: 400 });
  }

  const result = await requestDownloadToken(
    { admin: createAdminClient(), auth: await createClient() },
    { wallpaperId, ip: getClientIp(request), accessToken: bearerToken(request) },
  );

  return NextResponse.json(
    result.ok ? { token: result.data.token } : { error: result.error },
    { status: result.ok ? 200 : result.status },
  );
}
