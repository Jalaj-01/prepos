const express = require("express");

const router = express.Router();

const {
    universalSearch
} = require("../controllers/globalSearchController");

const {
    protect
} = require("../middleware/authMiddleware");

router.get(
    "/universal",
    protect,
    universalSearch
);

module.exports = router;