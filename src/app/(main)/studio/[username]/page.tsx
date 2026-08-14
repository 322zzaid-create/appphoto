import { createClient } from "@supabase/supabase-js";
import { StudioContent } from "./studio-content";

export async function generateStaticParams() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("studio_status", "approved")
      .limit(10000);

    if (error) {
      throw new Error(`Failed to fetch studio usernames: ${error.message}`);
    }

    return (data ?? []).map((p) => ({ username: p.username }));
  } catch (err) {
    if (process.env.NEXT_EXPORT === "true") {
      throw err;
    }
    return [];
  }
}

export default async function StudioPublicPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <div>
      <StudioContent username={username} />
    </div>
  );
}
