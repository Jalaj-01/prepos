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