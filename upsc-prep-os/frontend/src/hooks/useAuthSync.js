"use client";

import { useEffect } from "react";
import axios from "axios";

const SYNC_INTERVAL_MS = 60 * 1000; // 60 seconds

/**
 * Periodically refreshes user info from server.
 * Detects when admin/tier changes happen server-side and syncs localStorage.
 * If isAdmin changes, soft-reloads the page so UI reflects new permissions.
 */
export default function useAuthSync() {
    useEffect(() => {
        const syncUser = async () => {
            try {
                const info = localStorage.getItem("userInfo");
                if (!info) return;

                const cached = JSON.parse(info);
                if (!cached?.token) return;

                const { data: fresh } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`,
                    {
                        headers: { Authorization: `Bearer ${cached.token}` },
                    }
                );

                if (!fresh) return;

                // Detect critical changes
                const isAdminChanged = !!cached.isAdmin !== !!fresh.isAdmin;
                const tierChanged = cached.userTier !== fresh.userTier;

                if (isAdminChanged || tierChanged) {
                    // Build updated userInfo, preserve token
                    const updated = {
                        ...cached,
                        ...fresh,
                        token: cached.token,
                    };
                    localStorage.setItem("userInfo", JSON.stringify(updated));

                    // If admin status changed, hard refresh to update sidebar/protected routes
                    if (isAdminChanged) {
                        window.location.reload();
                    }
                }
            } catch (err) {
                // Token invalid → force logout
                if (err.response?.status === 401) {
                    localStorage.removeItem("userInfo");
                    window.location.href = "/login";
                }
            }
        };

        // Run once immediately
        syncUser();

        // Then every 60 seconds
        const id = setInterval(syncUser, SYNC_INTERVAL_MS);

        // Also sync when tab regains focus (user comes back to the tab)
        const handleVisibility = () => {
            if (!document.hidden) syncUser();
        };
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            clearInterval(id);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, []);
}