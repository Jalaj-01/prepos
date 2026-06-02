const multer =
    require("multer");

// =========================
// MEMORY STORAGE
// (We stream buffer → R2 manually)
// =========================

const storage =
    multer.memoryStorage();

// =========================
// FILE FILTER
// =========================

const fileFilter = (
    req,
    file,
    cb
) => {

    const allowedMimes = [

        "application/pdf",

        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg",

        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",

        "text/plain"
    ];

    if (
        allowedMimes.includes(file.mimetype)
    ) {

        cb(null, true);

    } else {

        cb(

            new Error(
                "Unsupported file type. Allowed: PDF, Images, Word, PPT, Text"
            ),

            false
        );
    }
};

// =========================
// MULTER INSTANCE
// Max: 100 MB per file
// =========================

const r2Upload =
    multer({

        storage,

        fileFilter,

        limits: {
            fileSize:
                100 * 1024 * 1024
        }
    });

module.exports = r2Upload;