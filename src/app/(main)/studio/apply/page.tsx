"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useStudio } from "@/lib/hooks/useStudio";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { studioApplicationSchema } from "@/lib/validators";
import Link from "next/link";

export default function StudioApplyPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { status, apply, isPending, isLoading: studioLoading } = useStudio();

  const [studioName, setStudioName] = useState("");
  const [studioDescription, setStudioDescription] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/studio/apply");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!studioLoading && status !== "none" && status !== "rejected") {
      router.push("/studio");
    }
  }, [status, studioLoading, router]);

  if (authLoading || studioLoading || (status !== "none" && status !== "rejected")) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = studioApplicationSchema.safeParse({
      studio_name: studioName,
      studio_description: studioDescription,
      reason,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const { error } = await apply({
      studio_name: studioName,
      studio_description: studioDescription,
      reason,
    });

    if (error) {
      setErrors({ submit: error });
      return;
    }

    router.push("/studio");
  };

  return (
    <div>
      <PageHeader
        title="Apply for Studio"
        description="Submit your application to open a studio"
        breadcrumbs={[
          { label: "Studio", href: "/studio" },
          { label: "Apply", href: "/studio/apply" },
        ]}
      />

      <div className="mx-auto max-w-lg">
        <div className="glass-card p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
              <Sparkles className="h-7 w-7 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Open Your Studio</h2>
            <p className="mt-1 text-sm text-white/40">
              Tell us about your studio and why you want to join
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Studio Name"
              placeholder="My Awesome Studio"
              value={studioName}
              onChange={(e) => setStudioName(e.target.value)}
            />
            {errors.studio_name && (
              <p className="text-xs text-red-400">{errors.studio_name}</p>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">
                Studio Description
              </label>
              <textarea
                placeholder="Describe what kind of wallpapers you create..."
                value={studioDescription}
                onChange={(e) => setStudioDescription(e.target.value)}
                className="h-24 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 backdrop-blur-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              {errors.studio_description && (
                <p className="mt-1 text-xs text-red-400">{errors.studio_description}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">
                Why do you want to open a studio?
              </label>
              <textarea
                placeholder="Tell us why you'd be a great fit..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-24 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 backdrop-blur-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              {errors.reason && (
                <p className="mt-1 text-xs text-red-400">{errors.reason}</p>
              )}
            </div>

            {errors.submit && (
              <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                {errors.submit}
              </p>
            )}

            <div className="flex gap-3">
              <Link href="/studio" className="flex-1">
                <Button variant="secondary" type="button" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Submit Application
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
