"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, MessageSquare } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";
import toast from "react-hot-toast";

interface Application {
  id: string;
  studio_name: string;
  studio_description: string;
  reason: string;
  status: string;
  admin_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  user?: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export default function AdminStudiosPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [reviewModal, setReviewModal] = useState<Application | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["admin-studios", statusFilter],
    queryFn: async (): Promise<Application[]> => {
      let query = supabase
        .from("studio_applications")
        .select("*, user:profiles!studio_applications_user_id_fkey(id, username, full_name, avatar_url)")
        .order("created_at", { ascending: false });

      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Application[];
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: "approved" | "rejected";
      notes: string;
    }) => {
      // Update application
      const { error } = await supabase
        .from("studio_applications")
        .update({
          status,
          admin_notes: notes,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;

      // Get user_id from application
      const { data: app } = await supabase
        .from("studio_applications")
        .select("user_id")
        .eq("id", id)
        .single();

      if (app) {
        const profileUpdate: Record<string, unknown> = { studio_status: status };
        if (status === "approved") {
          profileUpdate.approved_at = new Date().toISOString();
        }
        const { error: profileError } = await supabase
          .from("profiles")
          .update(profileUpdate)
          .eq("id", app.user_id);
        if (profileError) throw profileError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-studios"] });
      toast.success("Application reviewed");
      setReviewModal(null);
      setAdminNotes("");
    },
  });

  const statusColors: Record<string, "green" | "yellow" | "red" | "default"> = {
    pending: "yellow",
    approved: "green",
    rejected: "red",
  };

  const columns: Column<Application>[] = [
    {
      key: "user",
      label: "User",
      render: (app) => (
        <div className="flex items-center gap-3">
          <img
            src={app.user?.avatar_url || ""}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-medium text-white">
              {app.user?.full_name || app.user?.username || "Unknown"}
            </p>
            <p className="text-xs text-white/30">@{app.user?.username}</p>
          </div>
        </div>
      ),
    },
    {
      key: "studio_name",
      label: "Studio",
      sortable: true,
      render: (app) => (
        <span className="font-medium text-white">{app.studio_name}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (app) => (
        <Badge color={statusColors[app.status] || "default"}>
          {app.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
          {app.status === "approved" && <CheckCircle2 className="mr-1 h-3 w-3" />}
          {app.status === "rejected" && <XCircle className="mr-1 h-3 w-3" />}
          {app.status}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Applied",
      sortable: true,
      render: (app) => (
        <span className="text-xs text-white/40">{formatDate(app.created_at)}</span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (app) => (
        <div className="flex items-center gap-1">
          {app.status === "pending" && (
            <>
              <Button
                size="sm"
                onClick={() => {
                  reviewMutation.mutate({
                    id: app.id,
                    status: "approved",
                    notes: adminNotes || "Approved",
                  });
                }}
              >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setReviewModal(app);
                  setAdminNotes("");
                }}
              >
                <XCircle className="mr-1 h-3 w-3" />
                Reject
              </Button>
            </>
          )}
          {app.status !== "pending" && app.admin_notes && (
            <button
              onClick={() => {
                setReviewModal(app);
                setAdminNotes(app.admin_notes || "");
              }}
              className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
              title="View notes"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Studio Applications"
        description="Review and manage studio applications"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Studios", href: "/admin/studios" },
        ]}
        actions={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        }
      />

      <DataTable
        columns={columns}
        data={applications}
        searchPlaceholder="Search applications..."
      />

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setReviewModal(null)}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#12121a] p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-white">
              Review Application
            </h3>

            <div className="mb-4 space-y-2">
              <div>
                <p className="text-xs text-white/30">Studio Name</p>
                <p className="text-sm text-white">{reviewModal.studio_name}</p>
              </div>
              <div>
                <p className="text-xs text-white/30">Description</p>
                <p className="text-sm text-white/70">{reviewModal.studio_description}</p>
              </div>
              <div>
                <p className="text-xs text-white/30">Reason</p>
                <p className="text-sm text-white/70">{reviewModal.reason}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-1.5 block text-sm font-medium text-white/80">
                Admin Notes
              </label>
              <textarea
                placeholder="Add notes about your decision..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="h-20 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={() =>
                  reviewMutation.mutate({
                    id: reviewModal.id,
                    status: "approved",
                    notes: adminNotes || "Approved",
                  })
                }
                disabled={reviewMutation.isPending}
              >
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() =>
                  reviewMutation.mutate({
                    id: reviewModal.id,
                    status: "rejected",
                    notes: adminNotes || "Rejected",
                  })
                }
                disabled={reviewMutation.isPending}
              >
                <XCircle className="mr-1 h-4 w-4" />
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
