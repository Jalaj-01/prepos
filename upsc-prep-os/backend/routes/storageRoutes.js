const express =
    require("express");

const router =
    express.Router();

const {

    getMyStorage,

    getAllUsersStorage,

    upgradeTier,

    setCustomQuota

} = require("../controllers/storageController");

const {

    protect,

    admin

} = require("../middleware/authMiddleware");

// =========================
// USER ROUTES
// =========================

router.get(
    "/me",
    protect,
    getMyStorage
);

// =========================
// ADMIN ROUTES
// =========================

router.get(
    "/admin/all",
    protect,
    admin,
    getAllUsersStorage
);

router.put(
    "/admin/upgrade/:userId",
    protect,
    admin,
    upgradeTier
);

router.put(
    "/admin/custom-quota/:userId",
    protect,
    admin,
    setCustomQuota
);

module.exports = router;