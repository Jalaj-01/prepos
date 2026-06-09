"use client";

import { useEffect, useState } from "react";
import axios from "axios";

/**
 * Hook to fetch attempted/not-attempted status for a batch of question IDs.
 * Returns: { attemptedMap, isAttempted, loading }
 *
 * Usage:
 *   const { attemptedMap, isAttempted } = useQuestionStatus(questions.map(q => q._id), user?.token);
 *   <QuestionStatusBadge attempted={isAttempted(q._id)} />
 */
export default function useQuestionStatus(questionIds = [], token) {
    const [attemptedMap, setAttemptedMap] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token || !questionIds?.length) {
            setAttemptedMap({});
            return;
        }

        // Stable key so we don't refetch unnecessarily
        const key = [...questionIds].sort().join(",");
        let cancelled = false;

        const fetchStatus = async () => {
            setLoading(true);
            try {
                const { data } = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/attempts/status-map`,
                    { questionIds },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (!cancelled) {
                    setAttemptedMap(data.attempted || {});
                }
            } catch (err) {
                console.warn("Question status fetch failed:", err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchStatus();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questionIds.join(","), token]);

    const isAttempted = (id) => !!attemptedMap[String(id)];

    return { attemptedMap, isAttempted, loading };
}