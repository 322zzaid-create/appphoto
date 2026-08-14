"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { toast } from "@/lib/utils/toast";
import type { Profile } from "@/types";

export default function AdminUsersPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role updated");
    },
  });

  const roleColors: Record<string, "purple" | "blue" | "default"> = {
    admin: "purple",
    artist: "blue",
    user: "default",
  };

  const columns: Column<Profile>[] = [
    {
      key: "username",
      label: "User",
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <img
            src={u.avatar_url || ""}
            alt=""
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-white">{u.full_name || u.username}</p>
            <p className="text-xs text-white/40">@{u.username}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (u) => <span className="text-white/50">{u.id}</span>,
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (u) => (
        <Badge color={roleColors[u.role] || "default"}>
          {u.role}
        </Badge>
      ),
    },
    {
      key: "is_premium",
      label: "Premium",
      render: (u) =>
        u.is_premium ? (
          <Badge color="yellow">Premium</Badge>
        ) : (
          <span className="text-xs text-white/30">Free</span>
        ),
    },
    {
      key: "created_at",
      label: "Joined",
      sortable: true,
      render: (u) => <span className="text-xs text-white/40">{formatDate(u.created_at)}</span>,
    },
    {
      key: "actions",
      label: "",
      render: (u) => (
        <div className="flex items-center gap-1">
          <select
            value={u.role}
            onChange={(e) =>
              roleMutation.mutate({ userId: u.id, role: e.target.value })
            }
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70 focus:outline-none"
          >
            <option value="user">User</option>
            <option value="artist">Artist</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage platform users"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Users", href: "/admin/users" },
        ]}
      />

      <DataTable
        columns={columns}
        data={users}
        searchPlaceholder="Search users..."
      />
    </div>
  );
}
