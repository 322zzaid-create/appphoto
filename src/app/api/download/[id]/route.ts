import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp } from "@/lib/security/rate-limit";
import { resolveDownloadUrl } from "@/lib/services/download.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = new URL(request.url).searchParams.get("token") ?? "";

  const result = await resolveDownloadUrl(
    { admin: createAdminClient(), auth: await createClient() },
    {
      wallpaperId: id,
      token,
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent"),
    },
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.redirect(result.data.url);
}
