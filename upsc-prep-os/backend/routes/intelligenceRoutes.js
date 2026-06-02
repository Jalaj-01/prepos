const express =
    require('express');

const router =
    express.Router();

const {

    getRepeatedThemes,
    getSubjectTrendHeatmap

} = require(
    '../controllers/intelligenceController'
);

const {

    protect

} = require(
    '../middleware/authMiddleware'
);

// =========================
// ROUTES
// =========================

router.get(

    '/repeated-themes',

    protect,


    getRepeatedThemes
);

router.get(

    '/trends',

    getSubjectTrendHeatmap
);

module.exports = router;