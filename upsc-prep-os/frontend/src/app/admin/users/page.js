"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Link from "next/link";
import ConfirmModal from "@/components/admin/ConfirmModal";
import {
    Users,
    Search,
    Shield,
    ChevronLeft,
    ChevronRight,
    Eye,
    UserCheck,
    UserX,
    Trash2,
    ArrowLeft,
    Flame,
    Crown,
    AlertCircle,
    RotateCcw,
    Filter,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

import { showToast } from "@/components/ui/Toast";
import UserDetailModal from "@/components/admin/UserDetailModal";
import DeleteUserModal from "@/components/admin/DeleteUserModal";

const ROLES = [
    { id: "all", label: "All" },
    { id: "admin", label: "Admins" },
    { id: "user", label: "Users" },
];

const ACTIVITY = [
    { id: "all", label: "Any" },
    { id: "active", label: "Active 7d" },
    { id: "inactive", label: "Inactive" },
];

const SORTS = [
    { id: "newest", label: "Newest" },
    { id: "oldest", label: "Oldest" },
    { id: "active", label: "Most Active" },
    { id: "streak", label: "Top Streak" },
];

const formatBytes = (bytes = 0) => {
    if (!bytes) return "0 MB";
    const mb = bytes / 1024 / 1024;
    return mb < 1024
        ? `${mb.toFixed(0)} MB`
        : `${(mb / 1024).toFixed(1)} GB`;
};

export default function AdminUsersPage() {
    const [me, setMe] = useState(null);
    const [users, setUsers] = useState([]);
    const [summary, setSummary] = useState({});
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [forbidden, setForbidden] = useState(false);

    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [role, setRole] = useState("all");
    const [activity, setActivity] = useState("all");
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);
    const [showDeleted, setShowDeleted] = useState(false);

    const [detailOpen, setDetailOpen] = useState(false);
    const [detailUserId, setDetailUserId] = useState(null);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteUser, setDeleteUser] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
    confirmLabel: "Confirm",
    onConfirm: null,
    loading: false,
});

const closeConfirm = () =>
    setConfirmModal((m) => ({ ...m, open: false, loading: false }));

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    // Load self
    useEffect(() => {
        const info = localStorage.getItem("userInfo");
        if (!info) {
            window.location.href = "/login";
            return;
        }
        setMe(JSON.parse(info));
    }, []);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    const fetchUsers = useCallback(async () => {
        if (!me) return;
        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${me.token}` },
            };
            const params = new URLSearchParams({
                page,
                limit: 50,
                search,
                role,
                activity,
                sort,
                includeDeleted: showDeleted ? "true" : "false",
            });
            const { data } = await axios.get(
                `${baseUrl}/api/admin/users?${params}`,
                config
            );
            setUsers(data.users);
            setSummary(data.summary);
            setPagination(data.pagination);
            setForbidden(false);
        } catch (e) {
            if (e.response?.status === 403) {
                setForbidden(true);
            } else {
                showToast.error("Couldn't load users");
            }
        } finally {
            setLoading(false);
        }
    }, [me, baseUrl, page, search, role, activity, sort, showDeleted]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const promote = (user) => {
    setConfirmModal({
        open: true,
        type: "promote",
        title: `Promote ${user.name}?`,
        message: `${user.name} will gain admin access. They'll be able to manage syllabus, questions and announcements. They will NOT be able to manage other users (that's super-admin only).`,
        confirmLabel: "Promote",
        onConfirm: async () => {
            setConfirmModal((m) => ({ ...m, loading: true }));
            try {
                const config = {
                    headers: { Authorization: `Bearer ${me.token}` },
                };
                await axios.patch(
                    `${baseUrl}/api/admin/users/${user._id}/role`,
                    { role: "admin" },
                    config
                );
                showToast.success(`${user.name} is now an admin`);
                closeConfirm();
                fetchUsers();
            } catch (e) {
                showToast.error(
                    e.response?.data?.message || "Couldn't promote"
                );
                closeConfirm();
            }
        },
    });
};
   const demote = (user) => {
    setConfirmModal({
        open: true,
        type: "demote",
        title: `Demote ${user.name}?`,
        message: `${user.name} will lose admin access and become a regular user. They can be promoted back any time.`,
        confirmLabel: "Demote",
        onConfirm: async () => {
            setConfirmModal((m) => ({ ...m, loading: true }));
            try {
                const config = {
                    headers: { Authorization: `Bearer ${me.token}` },
                };
                await axios.patch(
                    `${baseUrl}/api/admin/users/${user._id}/role`,
                    { role: "user" },
                    config
                );
                showToast.success(`${user.name} demoted`);
                closeConfirm();
                fetchUsers();
            } catch (e) {
                showToast.error(
                    e.response?.data?.message || "Couldn't demote"
                );
                closeConfirm();
            }
        },
    });
};
    const restore = (user) => {
    setConfirmModal({
        open: true,
        type: "info",
        title: `Restore ${user.name}?`,
        message: `This will bring ${user.name} back to the platform with all their data intact.`,
        confirmLabel: "Restore",
        onConfirm: async () => {
            setConfirmModal((m) => ({ ...m, loading: true }));
            try {
                const config = {
                    headers: { Authorization: `Bearer ${me.token}` },
                };
                await axios.patch(
                    `${baseUrl}/api/admin/users/${user._id}/soft-delete`,
                    { restore: true },
                    config
                );
                showToast.success(`${user.name} restored`);
                closeConfirm();
                fetchUsers();
            } catch (e) {
                showToast.error("Couldn't restore");
                closeConfirm();
            }
        },
    });
};

    const softDelete = async (user) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${me.token}` },
            };
            await axios.patch(
                `${baseUrl}/api/admin/users/${user._id}/soft-delete`,
                { restore: false },
                config
            );
            showToast.success(`${user.name} soft-deleted`);
            setDeleteOpen(false);
            fetchUsers();
        } catch (e) {
            showToast.error(
                e.response?.data?.message || "Couldn't soft-delete"
            );
        }
    };

    const hardDelete = async (user, confirmText) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${me.token}` },
                data: { confirm: confirmText },
            };
            await axios.delete(
                `${baseUrl}/api/admin/users/${user._id}`,
                config
            );
            showToast.success(`${user.name} permanently deleted`);
            setDeleteOpen(false);
            fetchUsers();
        } catch (e) {
            showToast.error(
                e.response?.data?.message || "Couldn't delete"
            );
        }
    };

    if (!me) return null;

    if (forbidden) {
        return (
            <div className="min-h-screen bg-brand-light flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl border border-brand-border max-w-md w-full p-8 text-center">
                    <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={24} className="text-red-600" />
                    </div>
                    <h2 className="text-lg font-black text-brand-dark mb-1">
                        Super-Admin Only
                    </h2>
                    <p className="text-xs font-medium text-brand-muted mb-5 leading-relaxed">
                        User management is reserved for the platform owner.
                        Other admins cannot promote, demote or delete users.
                    </p>
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-accent transition-all"
                    >
                        <ArrowLeft size={14} /> Back to Admin
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-light p-4 sm:p-6 lg:p-10">
            <div className="max-w-[1400px] mx-auto">
                {/* HEADER */}
                <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                    <div>
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-brand-dark mb-2"
                        >
                            <ArrowLeft size={12} /> Admin
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tighter flex items-center gap-2">
                            <Crown
                                size={22}
                                className="text-amber-500 fill-amber-100"
                            />
                            User Management
                        </h1>
                        <p className="text-xs font-medium text-brand-muted mt-1">
                            Super-admin controls. Use responsibly.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <StatChip
                            label="Total"
                            value={summary.total || 0}
                            color="bg-blue-50 text-blue-700 border-blue-100"
                        />
                        <StatChip
                            label="Admins"
                            value={summary.admins || 0}
                            color="bg-purple-50 text-purple-700 border-purple-100"
                        />
                        <StatChip
                            label="Active 7d"
                            value={summary.activeLast7Days || 0}
                            color="bg-green-50 text-green-700 border-green-100"
                        />
                    </div>
                </div>

                {/* TOOLBAR */}
                <div className="bg-white border border-brand-border rounded-2xl p-3 mb-4 flex flex-col lg:flex-row lg:items-center gap-3">
                    <div className="relative flex-1 min-w-[220px]">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted"
                        />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full pl-9 pr-3 py-2 bg-brand-light border border-brand-border rounded-xl text-xs font-bold outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
                        />
                    </div>

                    <FilterGroup
                        icon={Shield}
                        options={ROLES}
                        value={role}
                        onChange={(v) => {
                            setRole(v);
                            setPage(1);
                        }}
                    />
                    <FilterGroup
                        icon={Flame}
                        options={ACTIVITY}
                        value={activity}
                        onChange={(v) => {
                            setActivity(v);
                            setPage(1);
                        }}
                    />
                    <FilterGroup
                        icon={Filter}
                        options={SORTS}
                        value={sort}
                        onChange={(v) => {
                            setSort(v);
                            setPage(1);
                        }}
                    />

                    <button
                        onClick={() => {
                            setShowDeleted(!showDeleted);
                            setPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                            showDeleted
                                ? "bg-red-600 text-white"
                                : "bg-brand-light text-brand-muted hover:text-brand-dark"
                        }`}
                    >
                        {showDeleted ? "Hide" : "Show"} Deleted
                    </button>
                </div>

                {/* TABLE */}
                <div className="bg-white border border-brand-border rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-brand-light/50 border-b border-brand-border">
                                <tr>
                                    <Th>User</Th>
                                    <Th>Role</Th>
                                    <Th>Joined</Th>
                                    <Th>Streak</Th>
                                    <Th>Attempts</Th>
                                    <Th>Storage</Th>
                                    <Th>Last Active</Th>
                                    <Th align="right">Actions</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="text-center py-12 text-xs font-bold text-brand-muted"
                                        >
                                            Loading...
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="text-center py-12 text-xs font-bold text-brand-muted"
                                        >
                                            No users match your filters
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((u) => {
                                        const isMe =
                                            String(u._id) ===
                                            String(me._id);
                                        return (
                                            <tr
                                                key={u._id}
                                                className={`border-b border-brand-border last:border-0 hover:bg-brand-light/40 transition-colors ${
                                                    u.isDeleted ? "opacity-50" : ""
                                                }`}
                                            >
                                                <Td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-gradient-to-br from-brand-accent to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0">
                                                            {u.name
                                                                ?.charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-black text-brand-dark truncate flex items-center gap-1.5">
                                                                {u.name}
                                                                {isMe && (
                                                                    <span className="text-[9px] font-black bg-brand-dark text-white px-1.5 py-0.5 rounded">
                                                                        YOU
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-[10px] font-medium text-brand-muted truncate">
                                                                {u.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Td>
                                                <Td>
                                                    {u.isAdmin ? (
                                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-black uppercase tracking-widest rounded-full">
                                                            Admin
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 bg-brand-light text-brand-muted text-[9px] font-black uppercase tracking-widest rounded-full">
                                                            User
                                                        </span>
                                                    )}
                                                </Td>
                                                <Td>
                                                    <span className="text-[11px] font-bold text-brand-dark">
                                                        {format(
                                                            new Date(u.createdAt),
                                                            "d MMM yy"
                                                        )}
                                                    </span>
                                                </Td>
                                                <Td>
                                                    <span className="flex items-center gap-1 text-[11px] font-black text-orange-600">
                                                        <Flame
                                                            size={11}
                                                            className="fill-orange-500"
                                                        />
                                                        {u.streak || 0}
                                                    </span>
                                                </Td>
                                                <Td>
                                                    <span
                                                        className="text-[11px] font-black text-brand-dark"
                                                        title={`${u.prelimsAttempts} prelims · ${u.mainsAttempts} mains`}
                                                    >
                                                        {u.totalAttempts}
                                                    </span>
                                                </Td>
                                                <Td>
                                                    <span className="text-[11px] font-bold text-brand-muted">
                                                        {formatBytes(
                                                            u.storageUsedBytes
                                                        )}
                                                    </span>
                                                </Td>
                                                <Td>
                                                    <span className="text-[11px] font-bold text-brand-muted">
                                                        {u.lastActiveDate
                                                            ? formatDistanceToNow(
                                                                  new Date(
                                                                      u.lastActiveDate
                                                                  ),
                                                                  {
                                                                      addSuffix:
                                                                          true,
                                                                  }
                                                              )
                                                            : "—"}
                                                    </span>
                                                </Td>
                                                <Td align="right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <IconBtn
                                                            title="View details"
                                                            onClick={() => {
                                                                setDetailUserId(
                                                                    u._id
                                                                );
                                                                setDetailOpen(
                                                                    true
                                                                );
                                                            }}
                                                            icon={Eye}
                                                        />
                                                        {!isMe &&
                                                            !u.isDeleted &&
                                                            (u.isAdmin ? (
                                                                <IconBtn
                                                                    title="Demote to user"
                                                                    onClick={() =>
                                                                        demote(u)
                                                                    }
                                                                    icon={UserX}
                                                                    color="text-orange-600 hover:bg-orange-50"
                                                                />
                                                            ) : (
                                                                <IconBtn
                                                                    title="Promote to admin"
                                                                    onClick={() =>
                                                                        promote(u)
                                                                    }
                                                                    icon={
                                                                        UserCheck
                                                                    }
                                                                    color="text-purple-600 hover:bg-purple-50"
                                                                />
                                                            ))}
                                                        {!isMe &&
                                                            (u.isDeleted ? (
                                                                <IconBtn
                                                                    title="Restore user"
                                                                    onClick={() =>
                                                                        restore(u)
                                                                    }
                                                                    icon={
                                                                        RotateCcw
                                                                    }
                                                                    color="text-green-600 hover:bg-green-50"
                                                                />
                                                            ) : (
                                                                <IconBtn
                                                                    title="Delete"
                                                                    onClick={() => {
                                                                        setDeleteUser(
                                                                            u
                                                                        );
                                                                        setDeleteOpen(
                                                                            true
                                                                        );
                                                                    }}
                                                                    icon={Trash2}
                                                                    color="text-red-600 hover:bg-red-50"
                                                                />
                                                            ))}
                                                    </div>
                                                </Td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-brand-border bg-brand-light/30">
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                                Page {pagination.page} of {pagination.totalPages}
                                {" · "}
                                {pagination.total} users
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page <= 1}
                                    className="p-2 rounded-lg bg-white border border-brand-border text-brand-muted hover:text-brand-dark disabled:opacity-40 transition-all"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page >= pagination.totalPages}
                                    className="p-2 rounded-lg bg-white border border-brand-border text-brand-muted hover:text-brand-dark disabled:opacity-40 transition-all"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <UserDetailModal
                open={detailOpen}
                userId={detailUserId}
                onClose={() => setDetailOpen(false)}
                token={me.token}
            />

            <DeleteUserModal
                open={deleteOpen}
                user={deleteUser}
                onClose={() => setDeleteOpen(false)}
                onSoftDelete={softDelete}
                onHardDelete={hardDelete}
            />

            <ConfirmModal
                open={confirmModal.open}
                type={confirmModal.type}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmLabel={confirmModal.confirmLabel}
                onConfirm={confirmModal.onConfirm}
                onCancel={closeConfirm}
                loading={confirmModal.loading}
            />
        </div>

        
    );
}

function Th({ children, align = "left" }) {
    return (
        <th
            className={`px-4 py-3 text-[9px] font-black uppercase tracking-widest text-brand-muted text-${align}`}
        >
            {children}
        </th>
    );
}

function Td({ children, align = "left" }) {
    return (
        <td className={`px-4 py-3 text-${align} align-middle`}>{children}</td>
    );
}

function StatChip({ label, value, color }) {
    return (
        <div
            className={`flex items-center gap-2 px-3 py-1.5 border rounded-full ${color}`}
        >
            <span className="text-xs font-black">{value}</span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                {label}
            </span>
        </div>
    );
}

function FilterGroup({ icon: Icon, options, value, onChange }) {
    return (
        <div className="flex items-center gap-1 bg-brand-light rounded-lg p-1">
            <Icon size={12} className="text-brand-muted ml-1" />
            {options.map((o) => (
                <button
                    key={o.id}
                    onClick={() => onChange(o.id)}
                    className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all ${
                        value === o.id
                            ? "bg-brand-dark text-white"
                            : "text-brand-muted hover:text-brand-dark"
                    }`}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}

function IconBtn({ icon: Icon, onClick, title, color = "text-brand-muted hover:bg-brand-light hover:text-brand-dark" }) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={`p-1.5 rounded-lg transition-all ${color}`}
        >
            <Icon size={13} />
        </button>
    );
}