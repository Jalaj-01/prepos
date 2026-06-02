const express = require("express");

const router = express.Router();

const {

    getActive,

    getAll,

    create,

    update,

    remove,

    toggleActive

} = require("../controllers/announcementController");

const {
    protect,
    admin
} = require("../middleware/authMiddleware");

// USER ROUTES

router.get(
    "/active",
    protect,
    getActive
);

// ADMIN ROUTES

router.get(
    "/admin/all",
    protect,
    admin,
    getAll
);

router.post(
    "/admin",
    protect,
    admin,
    create
);

router.put(
    "/admin/:id",
    protect,
    admin,
    update
);

router.put(
    "/admin/:id/toggle",
    protect,
    admin,
    toggleActive
);

router.delete(
    "/admin/:id",
    protect,
    admin,
    remove
);

module.exports = router;