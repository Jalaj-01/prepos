const express = require("express");

const router = express.Router();

const {

    createFolder,

    getMyFolders,

    getFolderById,

    renameFolder,

    moveFolder,

    deleteFolder,

    getAllFoldersFlat

} = require("../controllers/folderController");

const {
    protect
} = require("../middleware/authMiddleware");

router.post(
    "/",
    protect,
    createFolder
);

router.get(
    "/",
    protect,
    getMyFolders
);

router.get(
    "/flat",
    protect,
    getAllFoldersFlat
);

router.get(
    "/:id",
    protect,
    getFolderById
);

router.put(
    "/:id/rename",
    protect,
    renameFolder
);

router.put(
    "/:id/move",
    protect,
    moveFolder
);

router.delete(
    "/:id",
    protect,
    deleteFolder
);

module.exports = router;