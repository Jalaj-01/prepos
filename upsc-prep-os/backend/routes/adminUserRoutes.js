const express = require("express");
const router = express.Router();

const {
    listUsers,
    getUserDetail,
    changeRole,
    softDelete,
    hardDelete,
    superStatus,
} = require("../controllers/adminUserController");

const { protect, admin } = require("../middleware/authMiddleware");
const { superAdmin } = require("../middleware/superAdminMiddleware");

// Any admin can check whether they're the super-admin
router.get("/me/super-status", protect, admin, superStatus);

// Only the super-admin can manage users
router.get("/", protect, admin, superAdmin, listUsers);
router.get("/:id", protect, admin, superAdmin, getUserDetail);
router.patch("/:id/role", protect, admin, superAdmin, changeRole);
router.patch("/:id/soft-delete", protect, admin, superAdmin, softDelete);
router.delete("/:id", protect, admin, superAdmin, hardDelete);

module.exports = router;