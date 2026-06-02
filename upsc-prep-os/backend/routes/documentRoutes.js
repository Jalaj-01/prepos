const express = require("express");

const router = express.Router();
const {

    uploadDocument,

    bulkUpload,

    publishToCommunity,

    unpublish,

    getMyDocuments,

    getViewUrl,

    updateDocument,

    moveDocument,

    deleteDocument,

    browseCommunity,

    getFeatured,

    getCommunityFilters,

    getCommunityGrouped,

    adminDelete,

    adminForcePrivate,

    adminToggleFeatured,

    checkStorage,

    toggleBookmark,

    getMyBookmarks,

    getRecentlyViewed

} = require("../controllers/documentController");

const {
    protect,
    admin
} = require("../middleware/authMiddleware");

const b2Upload =
    require("../middleware/b2UploadMiddleware");

// STORAGE PRE-CHECK

router.post(
    "/check-storage",
    protect,
    checkStorage
);

// UPLOAD

router.post(
    "/upload",
    protect,
    b2Upload.single("file"),
    uploadDocument
);

router.post(
    "/bulk-upload",
    protect,
    b2Upload.array("files", 20),
    bulkUpload
);

// PUBLISH / UNPUBLISH (NEW)

router.put(
    "/:id/publish",
    protect,
    publishToCommunity
);

router.put(
    "/:id/unpublish",
    protect,
    unpublish
);

// MY VAULT

router.get(
    "/my-vault",
    protect,
    getMyDocuments
);

// COMMUNITY

router.get(
    "/community/browse",
    protect,
    browseCommunity
);

router.get(
    "/community/featured",
    protect,
    getFeatured
);

router.get(
    "/community/grouped",
    protect,
    getCommunityGrouped
);

router.get(
    "/community/filters",
    protect,
    getCommunityFilters
);
// =========================
// BOOKMARKS
// =========================

router.put(
    "/:id/bookmark",
    protect,
    toggleBookmark
);

router.get(
    "/my-bookmarks",
    protect,
    getMyBookmarks
);

// =========================
// RECENTLY VIEWED
// =========================

router.get(
    "/recently-viewed",
    protect,
    getRecentlyViewed
);
// VIEW

router.get(
    "/:id/view-url",
    protect,
    getViewUrl
);

// UPDATE / MOVE

router.put(
    "/:id",
    protect,
    updateDocument
);

router.put(
    "/:id/move",
    protect,
    moveDocument
);

// DELETE

router.delete(
    "/:id",
    protect,
    deleteDocument
);

// ADMIN POWERS

router.put(
    "/admin/feature/:id",
    protect,
    admin,
    adminToggleFeatured
);

router.put(
    "/admin/force-private/:id",
    protect,
    admin,
    adminForcePrivate
);

router.delete(
    "/admin/force/:id",
    protect,
    admin,
    adminDelete
);

module.exports = router;