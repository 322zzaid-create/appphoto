"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { toast } from "@/lib/utils/toast";

interface Setting {
  key: string;
  value: unknown;
  description: string | null;
}

export default function AdminSettingsPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async (): Promise<Setting[]> => {
      const { data, error } = await supabase.from("app_settings").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoApprove, setAutoApprove] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const getSettingValue = (key: string, fallback: unknown = "") => {
    const setting = settings.find((s) => s.key === key);
    return setting ? setting.value : fallback;
  };

  if (!initialized && settings.length > 0) {
    setSiteName(String(getSettingValue("site_name", "apex")));
    setSiteDescription(String(getSettingValue("site_description", "")));
    setMaintenanceMode(Boolean(getSettingValue("maintenance_mode", false)));
    setAutoApprove(Boolean(getSettingValue("auto_approve_uploads", false)));
    setInitialized(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      await supabase
        .from("app_settings")
        .upsert([
          { key: "site_name", value: siteName as unknown, description: "Site name" },
          { key: "site_description", value: siteDescription as unknown, description: "Site description" },
          { key: "maintenance_mode", value: maintenanceMode as unknown, description: "Maintenance mode" },
          { key: "auto_approve_uploads", value: autoApprove as unknown, description: "Auto-approve uploads" },
        ], { onConflict: "key" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["app-settings"] });
      toast.success("Settings saved");
    },
    onError: () => toast.error("Failed to save settings"),
  });

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Application settings"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings", href: "/admin/settings" },
        ]}
        actions={
          <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
            Save Settings
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">General</h3>
            <div className="space-y-4">
              <Input
                label="Site Name"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">
                  Site Description
                </label>
                <textarea
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  className="h-24 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 backdrop-blur-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Feature Toggles</h3>
            <div className="space-y-4">
              <Toggle
                checked={autoApprove}
                onChange={setAutoApprove}
                label="Auto-approve uploads"
              />
              <Toggle
                checked={maintenanceMode}
                onChange={setMaintenanceMode}
                label="Maintenance mode"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
