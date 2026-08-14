"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Modal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/modal";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/lib/utils/toast";
import type { AdConfiguration } from "@/types";

export default function AdminAdsPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adType, setAdType] = useState<string>("banner");
  const [provider, setProvider] = useState("");
  const [adUnitId, setAdUnitId] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [frequencyCap, setFrequencyCap] = useState("5");
  const [cooldownSeconds, setCooldownSeconds] = useState("300");

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ["admin-ads"],
    queryFn: async (): Promise<AdConfiguration[]> => {
      const { data, error } = await supabase
        .from("ad_configurations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ad_type: adType as AdConfiguration["ad_type"],
        provider,
        ad_unit_id: adUnitId,
        is_enabled: isEnabled,
        frequency_cap: parseInt(frequencyCap) || null,
        cooldown_seconds: parseInt(cooldownSeconds) || 300,
      };
      if (editingId) {
        const { error } = await supabase.from("ad_configurations").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("ad_configurations").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      toast.success(editingId ? "Ad config updated" : "Ad config created");
      setShowModal(false);
      resetForm();
    },
    onError: () => toast.error("Failed to save"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ad_configurations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      toast.success("Deleted");
    },
  });

  const toggleEnabled = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase.from("ad_configurations").update({ is_enabled: enabled }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
    },
  });

  const resetForm = () => {
    setAdType("banner");
    setProvider("");
    setAdUnitId("");
    setIsEnabled(true);
    setFrequencyCap("5");
    setCooldownSeconds("300");
    setEditingId(null);
  };

  const openEdit = (config: AdConfiguration) => {
    setEditingId(config.id);
    setAdType(config.ad_type);
    setProvider(config.provider);
    setAdUnitId(config.ad_unit_id);
    setIsEnabled(config.is_enabled);
    setFrequencyCap(String(config.frequency_cap ?? 5));
    setCooldownSeconds(String(config.cooldown_seconds ?? 300));
    setShowModal(true);
  };

  return (
    <div>
      <PageHeader
        title="Ad Management"
        description="Configure advertisement settings"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Ads", href: "/admin/ads" },
        ]}
        actions={
          <Button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Ad Config
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : configs.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16">
          <p className="text-sm text-white/40">No ad configurations yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {configs.map((config) => (
            <div
              key={config.id}
              className="glass-card flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-sm font-bold text-white/40 uppercase">
                  {config.ad_type.slice(0, 2)}
                </div>
                <div>
                  <p className="font-medium text-white capitalize">{config.ad_type}</p>
                  <p className="text-xs text-white/40">
                    {config.provider} · {config.ad_unit_id || "No unit ID"}
                  </p>
                  <p className="text-xs text-white/30">
                    Cap: {config.frequency_cap ?? "None"} · Cooldown: {config.cooldown_seconds}s
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Toggle
                  checked={config.is_enabled}
                  onChange={(enabled) => toggleEnabled.mutate({ id: config.id, enabled })}
                  size="sm"
                />
                <button
                  onClick={() => openEdit(config)}
                  className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this ad config?")) {
                      deleteMutation.mutate(config.id);
                    }
                  }}
                  className="rounded-lg p-1.5 text-white/40 hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} size="sm">
        <ModalHeader>
          <h2 className="text-lg font-bold text-white">
            {editingId ? "Edit Ad Config" : "New Ad Config"}
          </h2>
        </ModalHeader>
        <ModalContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/80">Ad Type</label>
            <select
              value={adType}
              onChange={(e) => setAdType(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="banner">Banner</option>
              <option value="interstitial">Interstitial</option>
              <option value="rewarded">Rewarded</option>
              <option value="native">Native</option>
            </select>
          </div>
          <Input
            label="Provider"
            placeholder="e.g. admob"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          />
          <Input
            label="Ad Unit ID"
            placeholder="Ad unit identifier"
            value={adUnitId}
            onChange={(e) => setAdUnitId(e.target.value)}
          />
          <Input
            label="Frequency Cap"
            type="number"
            value={frequencyCap}
            onChange={(e) => setFrequencyCap(e.target.value)}
          />
          <Input
            label="Cooldown (seconds)"
            type="number"
            value={cooldownSeconds}
            onChange={(e) => setCooldownSeconds(e.target.value)}
          />
          <Toggle checked={isEnabled} onChange={setIsEnabled} label="Enabled" />
        </ModalContent>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
            {editingId ? "Save Changes" : "Create"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
