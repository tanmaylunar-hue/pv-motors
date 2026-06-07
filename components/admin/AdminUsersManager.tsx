"use client";

import { useEffect, useState } from "react";
import { UserPlus, Power, KeyRound, Check, AlertCircle, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type AdminUser = {
  id: string;
  username: string;
  role: "owner" | "manager";
  disabled: boolean;
  createdAt: string;
};

interface AdminUsersManagerProps {
  currentAdminId: string;
}

export function AdminUsersManager({ currentAdminId }: AdminUsersManagerProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New manager form state
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [addingUser, setAddingUser] = useState(false);

  // Password reset modal/form state
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [resettingUsername, setResettingUsername] = useState("");
  const [resetPasswordVal, setResetPasswordVal] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resettingProgress, setResettingProgress] = useState(false);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Failed to load admin users.");
        return;
      }
      setUsers(data);
    } catch {
      setError("Failed to load admin users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  async function handleAddManager(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setAddingUser(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        setFormError(data.error ?? "Failed to create manager account.");
        return;
      }

      setUsers((current) => [data, ...current]);
      setNewUsername("");
      setNewPassword("");
      triggerSuccess("Manager created successfully!");
    } catch {
      setFormError("Failed to create manager account.");
    } finally {
      setAddingUser(false);
    }
  }

  async function handleToggleStatus(userId: string, currentDisabled: boolean, username: string) {
    const actionLabel = currentDisabled ? "enable" : "disable";
    if (!window.confirm(`Are you sure you want to ${actionLabel} access for admin "${username}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabled: !currentDisabled }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error ?? `Failed to ${actionLabel} account.`);
        return;
      }

      setUsers((current) =>
        current.map((u) => (u.id === userId ? { ...u, disabled: !currentDisabled } : u))
      );
      triggerSuccess(`Account for "${username}" has been ${currentDisabled ? "enabled" : "disabled"}.`);
    } catch {
      alert(`Failed to ${actionLabel} account.`);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resettingUserId) return;
    setResetError(null);
    setResettingProgress(true);

    try {
      const response = await fetch(`/api/admin/users/${resettingUserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: resetPasswordVal }),
      });
      const data = await response.json();

      if (!response.ok) {
        setResetError(data.error ?? "Failed to reset password.");
        return;
      }

      setResettingUserId(null);
      setResetPasswordVal("");
      triggerSuccess(`Password reset successfully for "${resettingUsername}"!`);
    } catch {
      setResetError("Failed to reset password.");
    } finally {
      setResettingProgress(false);
    }
  }

  function triggerSuccess(message: string) {
    setActionSuccess(message);
    setTimeout(() => {
      setActionSuccess(null);
    }, 4000);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 w-full animate-pulse border border-border bg-surface/30" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-600 mb-4">{error}</p>
        <Button onClick={loadUsers} size="sm">
          Retry Loading
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      {/* Users List Column */}
      <div className="space-y-6">
        {actionSuccess && (
          <div className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
            <Check className="h-4 w-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        <div className="border border-border">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1.5fr] gap-4 bg-surface border-b border-border px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted select-none">
            <div>Username</div>
            <div>Role</div>
            <div>Status</div>
            <div>Created Date</div>
            <div className="text-right">Actions</div>
          </div>

          <div className="divide-y divide-border bg-background">
            {users.map((user) => {
              const dateStr = new Date(user.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              const isSelf = user.id === currentAdminId;

              return (
                <div
                  key={user.id}
                  className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1.5fr] gap-4 items-center px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-2 font-medium text-foreground truncate">
                    {user.role === "owner" ? (
                      <Shield className="h-4 w-4 text-neutral-800 shrink-0" />
                    ) : (
                      <User className="h-4 w-4 text-muted shrink-0" />
                    )}
                    <span className="truncate">{user.username}</span>
                    {isSelf && (
                      <span className="text-[10px] bg-neutral-100 border border-neutral-200 px-1.5 py-0.2 font-semibold uppercase tracking-wider text-muted">
                        You
                      </span>
                    )}
                  </div>

                  <div className="capitalize font-medium text-muted">
                    {user.role}
                  </div>

                  <div>
                    {user.disabled ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                        Disabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-muted">{dateStr}</div>

                  <div className="flex items-center justify-end gap-2">
                    {user.role !== "owner" && (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(user.id, user.disabled, user.username)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold border transition-all active:scale-[0.98] ${
                          user.disabled
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        }`}
                        title={user.disabled ? "Enable Account" : "Disable Account"}
                      >
                        <Power className="h-3 w-3" />
                        {user.disabled ? "Enable" : "Disable"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setResettingUserId(user.id);
                        setResettingUsername(user.username);
                        setResetPasswordVal("");
                        setResetError(null);
                      }}
                      className="inline-flex items-center gap-1 bg-background border border-border text-foreground hover:bg-surface px-2.5 py-1 text-xs font-semibold transition-all active:scale-[0.98]"
                      title="Reset Password"
                    >
                      <KeyRound className="h-3 w-3" />
                      Reset
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Side Action Column */}
      <div className="space-y-6">
        {/* Create Manager Account card */}
        <div className="border border-border bg-surface p-5">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add Manager
          </h3>

          <form onSubmit={handleAddManager} className="space-y-4">
            <Input
              label="Username"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Manager username"
              required
            />

            <Input
              label="Initial Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />

            {formError && (
              <p className="text-xs text-red-500 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {formError}
              </p>
            )}

            <Button type="submit" className="w-full" size="sm" disabled={addingUser}>
              {addingUser ? "Creating..." : "Create Account"}
            </Button>
          </form>
        </div>

        {/* Password Reset Modal/Drawer overlay if active */}
        {resettingUserId && (
          <div className="border border-border bg-surface p-5 border-t-2 border-t-neutral-800">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Reset Password
            </h3>
            <p className="text-xs text-muted mb-4">
              Enter a new password for account <strong>{resettingUsername}</strong>.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                value={resetPasswordVal}
                onChange={(e) => setResetPasswordVal(e.target.value)}
                placeholder="At least 6 characters"
                required
                autoFocus
              />

              {resetError && (
                <p className="text-xs text-red-500 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {resetError}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1"
                  size="sm"
                  disabled={resettingProgress}
                >
                  {resettingProgress ? "Resetting..." : "Save"}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setResettingUserId(null);
                    setResetPasswordVal("");
                    setResetError(null);
                  }}
                  className="px-3 border border-border bg-background hover:bg-surface text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
