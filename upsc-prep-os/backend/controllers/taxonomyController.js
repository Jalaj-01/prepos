const Taxonomy =
    require('../models/Taxonomy');

// =========================
// HELPER
// =========================

const createSlug = (text) => {

    return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
};

// =========================
// CREATE TAXONOMY
// =========================

exports.createTaxonomy =
async (req, res) => {

    try {

        const {
            names,
            level,
            parentId
        } = req.body;

        const namesArray =
            Array.isArray(names)
                ? names
                : [names];

        const results = [];

        for (let name of namesArray) {

            const cleanName =
                name.trim();

            if (!cleanName)
                continue;

            const slug =
                createSlug(cleanName);

            const exists =
                await Taxonomy.findOne({

                    slug,

                    level,

                    parentId:
                        parentId || null
                });

            if (!exists) {

                const entry =
                    await Taxonomy.create({

                        name: cleanName,

                        slug,

                        level,

                        parentId:
                            parentId || null
                    });

                results.push(entry);
            }
        }

        res.status(201).json({

            message: "Success",

            items: results
        });

    } catch (error) {

        res.status(500).json({

            message:
                error.message
        });
    }
};

// =========================
// GET FULL TAXONOMY
// =========================

exports.getTaxonomy =
async (req, res) => {

    try {

        const data =
            await Taxonomy.find()

            .populate('parentId')

            .sort({
                createdAt: 1
            });

        res.json(data);

    } catch (error) {

        res.status(500).json({

            message:
                error.message
        });
    }
};

// =========================
// DELETE TAXONOMY
// =========================

exports.deleteTaxonomy =
async (req, res) => {

    try {

        await Taxonomy.findByIdAndDelete(
            req.params.id
        );

        res.json({
            message: "Deleted"
        });

    } catch (error) {

        res.status(500).json({

            message:
                error.message
        });
    }
};
exports.updateTaxonomy =
async (req, res) => {

    try {

        const {
            name
        } = req.body;

        const slug = name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '');

        const updated =
            await Taxonomy.findByIdAndUpdate(

                req.params.id,

                {
                    name,
                    slug
                },

                {
                    new: true
                }
            );

        res.json(updated);

    } catch (error) {

        res.status(500).json({

            message:
                error.message
        });
    }
};
// =========================
// SUBJECTS
// =========================

exports.getSubjects =
async (req, res) => {

    try {

        const subjects =
            await Taxonomy.find({

                level: 'subject'

            }).sort({
                name: 1
            });

        res.json(subjects);

    } catch (error) {

        res.status(500).json({

            message:
                error.message
        });
    }
};

// =========================
// TOPICS BY SUBJECT
// =========================

exports.getTopicsBySubject =
async (req, res) => {

    try {

        const topics =
            await Taxonomy.find({

                level: 'topic',

                parentId:
                    req.params.subjectId

            }).sort({
                name: 1
            });

        res.json(topics);

    } catch (error) {

        res.status(500).json({

            message:
                error.message
        });
    }
};

// =========================
// SUBTOPICS BY TOPIC
// =========================

exports.getSubtopicsByTopic =
async (req, res) => {

    try {

        const subtopics =
            await Taxonomy.find({

                level: 'subtopic',

                parentId:
                    req.params.topicId

            }).sort({
                name: 1
            });

        res.json(subtopics);

    } catch (error) {

        res.status(500).json({

            message:
                error.message
        });
    }
};

// =========================
// FIND OR CREATE HIERARCHY
// =========================

exports.findOrCreateTaxonomyHierarchy =
async (

    subject,

    topic,

    subtopic

) => {

    const taxonomyIds = [];

    let subjectDoc = null;

    let topicDoc = null;

    // SUBJECT

    if (subject) {

        const subjectSlug =
            createSlug(subject);

        subjectDoc =
            await Taxonomy.findOne({

                slug: subjectSlug,

                level: 'subject'
            });

        if (!subjectDoc) {

            subjectDoc =
                await Taxonomy.create({

                    name: subject,

                    slug: subjectSlug,

                    level: 'subject'
                });
        }

        taxonomyIds.push(
            subjectDoc._id
        );
    }

    // TOPIC

    if (topic && subjectDoc) {

        const topicSlug =
            createSlug(topic);

        topicDoc =
            await Taxonomy.findOne({

                slug: topicSlug,

                level: 'topic',

                parentId:
                    subjectDoc._id
            });

        if (!topicDoc) {

            topicDoc =
                await Taxonomy.create({

                    name: topic,

                    slug: topicSlug,

                    level: 'topic',

                    parentId:
                        subjectDoc._id
                });
        }

        taxonomyIds.push(
            topicDoc._id
        );
    }

    // SUBTOPIC

    if (subtopic && topicDoc) {

        const subtopicSlug =
            createSlug(subtopic);

        let subtopicDoc =
            await Taxonomy.findOne({

                slug: subtopicSlug,

                level: 'subtopic',

                parentId:
                    topicDoc._id
            });

        if (!subtopicDoc) {

            subtopicDoc =
                await Taxonomy.create({

                    name: subtopic,

                    slug: subtopicSlug,

                    level: 'subtopic',

                    parentId:
                        topicDoc._id
                });
        }

        taxonomyIds.push(
            subtopicDoc._id
        );
    }

    return taxonomyIds;
};
// =========================
// RENAME (Admin)
// PATCH /api/taxonomy/:id/rename   body: { name }
// =========================
exports.renameTaxonomy = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name?.trim()) {
            return res.status(400).json({ message: "Name is required" });
        }

        const slug = createSlug(name);

        const updated = await Taxonomy.findByIdAndUpdate(
            req.params.id,
            { name: name.trim(), slug },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Node not found" });
        }

        res.json({ message: "Renamed", node: updated });
    } catch (error) {
        console.error("renameTaxonomy:", error);
        res.status(500).json({ message: error.message });
    }
};

// =========================
// MOVE (Admin) — change parentId
// PATCH /api/taxonomy/:id/move   body: { newParentId }
// =========================
exports.moveTaxonomy = async (req, res) => {
    try {
        const { id } = req.params;
        const { newParentId } = req.body;

        const node = await Taxonomy.findById(id);
        if (!node) {
            return res.status(404).json({ message: "Node not found" });
        }

        // Root level (subject) — can't be moved
        if (node.level === "subject") {
            return res
                .status(400)
                .json({ message: "Subjects can't be moved" });
        }

        // Allow null to detach
        let newParent = null;
        if (newParentId) {
            newParent = await Taxonomy.findById(newParentId);
            if (!newParent) {
                return res
                    .status(404)
                    .json({ message: "Target parent not found" });
            }

            // Hierarchy rules
            // topic → must go into a subject
            // subtopic → must go into a topic
            if (node.level === "topic" && newParent.level !== "subject") {
                return res
                    .status(400)
                    .json({ message: "Topics can only be moved into a subject" });
            }
            if (node.level === "subtopic" && newParent.level !== "topic") {
                return res
                    .status(400)
                    .json({ message: "Subtopics can only be moved into a topic" });
            }

            // Circular reference check — can't drop into self or descendant
            if (String(newParent._id) === String(node._id)) {
                return res
                    .status(400)
                    .json({ message: "Can't drop into itself" });
            }

            const descendantIds = await getDescendantIds(node._id);
            if (descendantIds.some((d) => String(d) === String(newParent._id))) {
                return res
                    .status(400)
                    .json({
                        message: "Can't drop into a descendant (would create cycle)",
                    });
            }
        }

        node.parentId = newParent ? newParent._id : null;
        await node.save();

        res.json({ message: "Moved", node });
    } catch (error) {
        console.error("moveTaxonomy:", error);
        res.status(500).json({ message: error.message });
    }
};

// =========================
// CASCADE DELETE (Admin)
// DELETE /api/taxonomy/:id/cascade
// Removes node + all descendants + unlinks from questions
// =========================
exports.cascadeDeleteTaxonomy = async (req, res) => {
    try {
        const { id } = req.params;

        const node = await Taxonomy.findById(id);
        if (!node) {
            return res.status(404).json({ message: "Node not found" });
        }

        const descendantIds = await getDescendantIds(id);
        const allIds = [node._id, ...descendantIds];

        // Unlink from Prelims questions
        const Question = require("../models/Question");
        const MainsQuestion = require("../models/MainsQuestion");

        await Promise.all([
            Question.updateMany(
                { taxonomyIds: { $in: allIds } },
                { $pull: { taxonomyIds: { $in: allIds } } }
            ).catch(() => null),
            MainsQuestion.updateMany(
                { taxonomyIds: { $in: allIds } },
                { $pull: { taxonomyIds: { $in: allIds } } }
            ).catch(() => null),
        ]);

        const result = await Taxonomy.deleteMany({ _id: { $in: allIds } });

        res.json({
            message: `${result.deletedCount} node(s) deleted, questions unlinked`,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error("cascadeDeleteTaxonomy:", error);
        res.status(500).json({ message: error.message });
    }
};

// =========================
// BULK CASCADE DELETE (Admin)
// POST /api/taxonomy/bulk-delete   body: { ids: [...] }
// =========================
exports.bulkDeleteTaxonomy = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "ids array is required" });
        }

        // Collect all descendants of every selected node
        const allIdsSet = new Set(ids.map(String));
        for (const id of ids) {
            const desc = await getDescendantIds(id);
            desc.forEach((d) => allIdsSet.add(String(d)));
        }
        const allIds = Array.from(allIdsSet);

        const Question = require("../models/Question");
        const MainsQuestion = require("../models/MainsQuestion");

        await Promise.all([
            Question.updateMany(
                { taxonomyIds: { $in: allIds } },
                { $pull: { taxonomyIds: { $in: allIds } } }
            ).catch(() => null),
            MainsQuestion.updateMany(
                { taxonomyIds: { $in: allIds } },
                { $pull: { taxonomyIds: { $in: allIds } } }
            ).catch(() => null),
        ]);

        const result = await Taxonomy.deleteMany({ _id: { $in: allIds } });

        res.json({
            message: `${result.deletedCount} node(s) deleted, questions unlinked`,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error("bulkDeleteTaxonomy:", error);
        res.status(500).json({ message: error.message });
    }
};

// =========================
// HELPER — get all descendant IDs recursively
// =========================
async function getDescendantIds(parentId) {
    const result = [];
    const queue = [parentId];

    while (queue.length) {
        const current = queue.shift();
        const children = await Taxonomy.find({ parentId: current }).select("_id");
        for (const c of children) {
            result.push(c._id);
            queue.push(c._id);
        }
    }
    return result;
}