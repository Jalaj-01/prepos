"use client";

import { useEffect, useState } from "react";
import axios from "axios";

/**
 * Hook to fetch attempted status across ALL questions matching the current filter
 * (not just the visible page). Returns true counts + per-question lookup map.
 *
 * Usage:
 *   const { attemptedMap, isAttempted, totals, refresh } = useQuestionStatus(filters, token);
 *
 *   filters = { year, subject, topic, paper, q, repeated }
 *
 *   <QuestionStatusBadge attempted={isAttempted(q._id)} />
 *   totals = { total, attempted, notAttempted }
 */
export default function useQuestionStatus(filters = {}, token) {
    const [attemptedMap, setAttemptedMap] = useState({});
    const [totals, setTotals] = useState({
        total: 0,
        attempted: 0,
        notAttempted: 0,
    });
    const [loading, setLoading] = useState(false);

    // Stable key based on filters
    const filterKey = JSON.stringify({
        year: filters.year || "",
        subject: filters.subject || "",
        topic: filters.topic || "",
        paper: filters.paper || "",
        q: filters.q || "",
        repeated: !!filters.repeated,
    });

    const fetchStatus = async () => {
        if (!token) {
            setAttemptedMap({});
            setTotals({ total: 0, attempted: 0, notAttempted: 0 });
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/attempts/status-count`,
                filters,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setAttemptedMap(data.attemptedIds || {});
            setTotals({
                total: data.total || 0,
                attempted: data.attempted || 0,
                notAttempted: data.notAttempted || 0,
            });
        } catch (err) {
            console.warn("Status fetch failed:", err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterKey, token]);

    const isAttempted = (id) => !!attemptedMap[String(id)];

    return { attemptedMap, isAttempted, totals, loading, refresh: fetchStatus };
}