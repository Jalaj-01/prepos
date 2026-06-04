const Taxonomy = require("../models/Taxonomy");
const Question = require("../models/Question");
const MainsQuestion = require("../models/MainsQuestion");
const SyllabusProgress = require("../models/SyllabusProgress");
const Attempt = require("../models/Attempt");
const MainsAttempt = require("../models/MainsAttempt");

// =========================
// GET TAXONOMY TREE
// Returns DB taxonomy nested: subject -> topic -> subtopic
// Each node has questionCount (prelims + mains combined)
// =========================
exports.getTaxonomyTree = async (req, res) => {
    try {
        const all = await Taxonomy.find().lean();

        // Build lookup maps
        const byId = new Map();
        all.forEach((n) => {
            byId.set(String(n._id), { ...n, children: [] });
        });

        // Link children
        const roots = [];
        byId.forEach((node) => {
            if (node.parentId) {
                const parent = byId.get(String(node.parentId));
                if (parent) parent.children.push(node);
                else roots.push(node);
            } else {
                roots.push(node);
            }
        });

        // Compute question counts per taxonomy node
        const allIds = all.map((n) => n._id);

        const [prelimsCounts, mainsCounts] = await Promise.all([
            Question.aggregate([
                { $match: { taxonomyIds: { $in: allIds } } },
                { $unwind: "$taxonomyIds" },
                { $group: { _id: "$taxonomyIds", count: { $sum: 1 } } },
            ]),
            MainsQuestion.aggregate([
                { $match: { taxonomyIds: { $in: allIds } } },
                { $unwind: "$taxonomyIds" },
                { $group: { _id: "$taxonomyIds", count: { $sum: 1 } } },
            ]),
        ]);

        const countMap = new Map();
        prelimsCounts.forEach((c) => {
            countMap.set(String(c._id), {
                prelims: c.count,
                mains: 0,
            });
        });
        mainsCounts.forEach((c) => {
            const existing = countMap.get(String(c._id)) || {
                prelims: 0,
                mains: 0,
            };
            existing.mains = c.count;
            countMap.set(String(c._id), existing);
        });

        // Attach counts + sort each level
        const attach = (nodes) => {
            nodes.forEach((n) => {
                const c = countMap.get(String(n._id)) || {
                    prelims: 0,
                    mains: 0,
                };
                n.prelimsCount = c.prelims;
                n.mainsCount = c.mains;
                n.totalCount = c.prelims + c.mains;
                if (n.children?.length) {
                    n.children.sort((a, b) =>
                        a.name.localeCompare(b.name)
                    );
                    attach(n.children);
                }
            });
        };
        attach(roots);
        roots.sort((a, b) => a.name.localeCompare(b.name));

        res.json({ tree: roots, totalNodes: all.length });
    } catch (err) {
        console.error("getTaxonomyTree:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// GET USER PROGRESS
// Returns map of nodeKey -> { covered, bookmarked, attempted, accuracy }
// =========================
exports.getProgress = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Manual progress flags
        const progressDocs = await SyllabusProgress.find({ userId }).lean();
        const map = {};
        progressDocs.forEach((p) => {
            map[p.nodeKey] = {
                covered: p.covered,
                bookmarked: p.bookmarked,
                lastVisitedAt: p.lastVisitedAt,
            };
        });

        // 2. Attempt-based progress for taxonomy nodes
        //    For each taxonomy node, count how many distinct questions the
        //    user has attempted vs total questions tagged with it.
        const taxonomyIds = (await Taxonomy.find().select("_id").lean()).map(
            (t) => t._id
        );

        const [
            prelimsAttempted,
            mainsAttempted,
            prelimsTotals,
            mainsTotals,
        ] = await Promise.all([
            Attempt.aggregate([
                { $match: { user: userId } },
                {
                    $lookup: {
                        from: "questions",
                        localField: "question",
                        foreignField: "_id",
                        as: "q",
                    },
                },
                { $unwind: "$q" },
                { $unwind: "$q.taxonomyIds" },
                {
                    $group: {
                        _id: "$q.taxonomyIds",
                        attempted: { $addToSet: "$question" },
                        correct: {
                            $sum: { $cond: ["$isCorrect", 1, 0] },
                        },
                        total: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        attempted: { $size: "$attempted" },
                        correct: 1,
                        total: 1,
                    },
                },
            ]).catch(() => []),

            MainsAttempt.aggregate([
                { $match: { user: userId } },
                {
                    $lookup: {
                        from: "mainsquestions",
                        localField: "question",
                        foreignField: "_id",
                        as: "q",
                    },
                },
                { $unwind: "$q" },
                { $unwind: "$q.taxonomyIds" },
                {
                    $group: {
                        _id: "$q.taxonomyIds",
                        attempted: { $addToSet: "$question" },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        attempted: { $size: "$attempted" },
                    },
                },
            ]).catch(() => []),

            Question.aggregate([
                { $match: { taxonomyIds: { $in: taxonomyIds } } },
                { $unwind: "$taxonomyIds" },
                { $group: { _id: "$taxonomyIds", total: { $sum: 1 } } },
            ]),

            MainsQuestion.aggregate([
                { $match: { taxonomyIds: { $in: taxonomyIds } } },
                { $unwind: "$taxonomyIds" },
                { $group: { _id: "$taxonomyIds", total: { $sum: 1 } } },
            ]),
        ]);

        const taxonomyProgress = {};
        const seed = (id) => {
            if (!taxonomyProgress[id]) {
                taxonomyProgress[id] = {
                    prelimsAttempted: 0,
                    mainsAttempted: 0,
                    prelimsTotal: 0,
                    mainsTotal: 0,
                    correct: 0,
                    answeredTotal: 0,
                };
            }
            return taxonomyProgress[id];
        };

        prelimsAttempted.forEach((p) => {
            const t = seed(String(p._id));
            t.prelimsAttempted = p.attempted;
            t.correct = p.correct;
            t.answeredTotal = p.total;
        });
        mainsAttempted.forEach((p) => {
            seed(String(p._id)).mainsAttempted = p.attempted;
        });
        prelimsTotals.forEach((p) => {
            seed(String(p._id)).prelimsTotal = p.total;
        });
        mainsTotals.forEach((p) => {
            seed(String(p._id)).mainsTotal = p.total;
        });

        // Merge into final map using nodeKey "taxonomy:<id>"
        Object.entries(taxonomyProgress).forEach(([taxId, t]) => {
            const key = `taxonomy:${taxId}`;
            const total = t.prelimsTotal + t.mainsTotal;
            const attempted = t.prelimsAttempted + t.mainsAttempted;
            map[key] = {
                ...(map[key] || {}),
                attempted,
                total,
                percent: total ? Math.round((attempted / total) * 100) : 0,
                accuracy: t.answeredTotal
                    ? Math.round((t.correct / t.answeredTotal) * 100)
                    : null,
            };
        });

        res.json({ progress: map });
    } catch (err) {
        console.error("getProgress:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// TOGGLE COVERED / BOOKMARKED
// body: { nodeKey, nodeLabel, breadcrumb, field: 'covered'|'bookmarked', value: bool }
// =========================
exports.toggleProgress = async (req, res) => {
    try {
        const { nodeKey, nodeLabel, breadcrumb, field, value } = req.body;

        if (!nodeKey || !["covered", "bookmarked"].includes(field)) {
            return res.status(400).json({ message: "Invalid payload" });
        }

        const update = {
            $set: {
                [field]: !!value,
                lastVisitedAt: new Date(),
            },
            $setOnInsert: {
                userId: req.user._id,
                nodeKey,
            },
        };

        if (nodeLabel) update.$set.nodeLabel = nodeLabel;
        if (breadcrumb) update.$set.breadcrumb = breadcrumb;

        const doc = await SyllabusProgress.findOneAndUpdate(
            { userId: req.user._id, nodeKey },
            update,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json({ progress: doc });
    } catch (err) {
        console.error("toggleProgress:", err);
        res.status(500).json({ message: err.message });
    }
};

// =========================
// STATS — high-level numbers for the hero card
// =========================
exports.getStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const [coveredCount, bookmarkedCount, taxonomyTotal] =
            await Promise.all([
                SyllabusProgress.countDocuments({
                    userId,
                    covered: true,
                }),
                SyllabusProgress.countDocuments({
                    userId,
                    bookmarked: true,
                }),
                Taxonomy.countDocuments(),
            ]);

        res.json({
            covered: coveredCount,
            bookmarked: bookmarkedCount,
            taxonomyTotal,
        });
    } catch (err) {
        console.error("getStats:", err);
        res.status(500).json({ message: err.message });
    }
};