// =========================
// REVISION LOGIC (Pure Utility)
// Spaced Repetition Algorithm
// =========================
//
// Stages & Intervals:
//   Stage 0 (just wrong) → next revision in  1 day
//   Stage 1 (1st pass)   → next revision in  3 days
//   Stage 2 (2nd pass)   → next revision in  7 days
//   Stage 3 (3rd pass)   → next revision in 21 days
//   After Stage 3 correct → MASTERED (removed from queue)
//
// On wrong answer at any stage → reset to Stage 0 (Anki style)
// =========================

// Intervals in days for stages 0 → 1, 1 → 2, 2 → 3, 3 → mastered
const REVISION_INTERVALS = [1, 3, 7, 21];

const MAX_STAGE = 3;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// =========================
// HELPERS
// =========================

const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};

const startOfDay = (date = new Date()) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const endOfDay = (date = new Date()) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
};

const daysBetween = (date1, date2) => {
    const diff = Math.abs(new Date(date2) - new Date(date1));
    return Math.ceil(diff / ONE_DAY_MS);
};

// =========================
// CORE FUNCTION
// Calculate next revision state after an answer
// =========================
//
// Input:
//   currentStage: 0 | 1 | 2 | 3
//   isCorrect:    boolean
//
// Output:
//   {
//     newStage:         number,
//     nextRevisionDate: Date | null  (null = mastered)
//     mastered:         boolean,
//     action:           "advanced" | "mastered" | "reset"
//   }
// =========================

const calculateNextRevision = (currentStage, isCorrect) => {

    const stage = Math.max(0, Math.min(currentStage || 0, MAX_STAGE));

    // =========================
    // WRONG ANSWER → RESET
    // =========================

    if (!isCorrect) {

        return {
            newStage: 0,
            nextRevisionDate: addDays(new Date(), REVISION_INTERVALS[0]),
            mastered: false,
            action: "reset"
        };
    }

    // =========================
    // CORRECT AT FINAL STAGE → MASTERED
    // =========================

    if (stage >= MAX_STAGE) {

        return {
            newStage: MAX_STAGE,
            nextRevisionDate: null,
            mastered: true,
            action: "mastered"
        };
    }

    // =========================
    // CORRECT → ADVANCE
    // =========================

    const newStage = stage + 1;
    const intervalDays = REVISION_INTERVALS[newStage];

    return {
        newStage,
        nextRevisionDate: addDays(new Date(), intervalDays),
        mastered: false,
        action: "advanced"
    };
};

// =========================
// GET DUE QUESTIONS
// Filters + sorts a track.wrongQuestions[] array
// =========================
//
// Input:
//   wrongQuestions: [{ questionId, revisionStage, nextRevisionDate, mastered, ... }]
//   limit:          number (default 20)
//
// Output:
//   {
//     dueNow:    [...]   (capped by limit, sorted oldest first)
//     totalDue:  number  (all due, ignoring limit)
//     hasMore:   boolean (true if totalDue > limit)
//   }
// =========================

const getDueQuestions = (wrongQuestions = [], limit = 20) => {

    const now = endOfDay();   // include anything due today

    const allDue = wrongQuestions

        .filter(wq =>
            !wq.mastered &&
            wq.nextRevisionDate &&
            new Date(wq.nextRevisionDate) <= now
        )

        .sort((a, b) =>
            new Date(a.nextRevisionDate) - new Date(b.nextRevisionDate)
        );

    return {
        dueNow:   allDue.slice(0, limit),
        totalDue: allDue.length,
        hasMore:  allDue.length > limit
    };
};

// =========================
// STAGE BREAKDOWN
// Counts per stage + mastered count
// =========================

const getStageBreakdown = (wrongQuestions = []) => {

    const breakdown = {
        stage0:   0,
        stage1:   0,
        stage2:   0,
        stage3:   0,
        mastered: 0,
        total:    wrongQuestions.length
    };

    wrongQuestions.forEach(wq => {

        if (wq.mastered) {
            breakdown.mastered++;
            return;
        }

        const stage = Math.max(0, Math.min(wq.revisionStage || 0, MAX_STAGE));
        breakdown[`stage${stage}`]++;
    });

    return breakdown;
};

// =========================
// NEXT DUE DATE
// Earliest future nextRevisionDate (for "All caught up" screen)
// =========================
//
// Returns:
//   { date: Date | null, daysAway: number | null, count: number }
//
// If no future dues → date = null
// =========================

const getNextDueInfo = (wrongQuestions = []) => {

    const now = endOfDay();

    const futureDues = wrongQuestions

        .filter(wq =>
            !wq.mastered &&
            wq.nextRevisionDate &&
            new Date(wq.nextRevisionDate) > now
        )

        .sort((a, b) =>
            new Date(a.nextRevisionDate) - new Date(b.nextRevisionDate)
        );

    if (futureDues.length === 0) {
        return {
            date:     null,
            daysAway: null,
            count:    0
        };
    }

    const nextDate = new Date(futureDues[0].nextRevisionDate);

    // Count how many questions are due on that same earliest date
    const sameDayCount = futureDues.filter(wq => {
        const d = new Date(wq.nextRevisionDate);
        return d.toDateString() === nextDate.toDateString();
    }).length;

    return {
        date:     nextDate,
        daysAway: daysBetween(new Date(), nextDate),
        count:    sameDayCount
    };
};

// =========================
// UPCOMING IN N DAYS
// How many revisions due in next N days (for dashboard widget)
// =========================

const getUpcomingCount = (wrongQuestions = [], days = 7) => {

    const now      = startOfDay();
    const horizon  = endOfDay(addDays(now, days));

    return wrongQuestions.filter(wq =>
        !wq.mastered &&
        wq.nextRevisionDate &&
        new Date(wq.nextRevisionDate) >= now &&
        new Date(wq.nextRevisionDate) <= horizon
    ).length;
};

// =========================
// EXPORTS
// =========================

module.exports = {

    // Constants
    REVISION_INTERVALS,
    MAX_STAGE,

    // Core
    calculateNextRevision,

    // Queries
    getDueQuestions,
    getStageBreakdown,
    getNextDueInfo,
    getUpcomingCount,

    // Helpers (exposed for testing/reuse)
    addDays,
    startOfDay,
    endOfDay,
    daysBetween
};