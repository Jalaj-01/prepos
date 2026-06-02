const express =
    require('express');

const router =
    express.Router();

const {

    createTaxonomy,
    getTaxonomy,
    deleteTaxonomy,
    getSubjects,
    getTopicsBySubject,
    getSubtopicsByTopic,
    updateTaxonomy,

} = require(
    '../controllers/taxonomyController'
);

const {

    protect,

    admin

} = require(
    '../middleware/authMiddleware'
);

// =========================
// CREATE
// =========================

router.post(
    '/',
    protect,
    admin,
    createTaxonomy
);

// =========================
// DELETE
// =========================
router.put(
    '/:id',
    protect,
    admin,
    updateTaxonomy
);

router.delete(
    '/:id',
    protect,
    admin,
    deleteTaxonomy
);

// =========================
// GET ALL
// =========================

router.get(
    '/',
    getTaxonomy
);

// =========================
// SUBJECTS
// =========================

router.get(
    '/subjects',
    getSubjects
);

// =========================
// TOPICS
// =========================

router.get(
    '/topics/:subjectId',
    getTopicsBySubject
);

// =========================
// SUBTOPICS
// =========================

router.get(
    '/subtopics/:topicId',
    getSubtopicsByTopic
);

module.exports = router;