import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp } from "@/lib/security/rate-limit";
import { confirmAdWatch } from "@/lib/services/download.service";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { nonce, wallpaperId } = (body ?? {}) as {
    nonce?: unknown;
    wallpaperId?: unknown;
  };

  if (
    typeof nonce !== "string" ||
    typeof wallpaperId !== "string" ||
    !nonce ||
    !wallpaperId
  ) {
    return NextResponse.json({ error: "Missing nonce or wallpaper id" }, { status: 400 });
  }

  const result = await confirmAdWatch(
    { admin: createAdminClient() },
    { wallpaperId, nonce, ip: getClientIp(request) },
  );

  return NextResponse.json(
    result.ok ? { confirmed: true } : { error: result.error },
    { status: result.ok ? 201 : result.status },
  );
}
