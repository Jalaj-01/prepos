const {
    compressImage
} = require("./imageCompressor");

const {
    compressPdf,
    compressPdfAggressive
} = require("./pdfCompressor");

// =========================
// SMART FILE COMPRESSOR
// (Auto-detects type)
// =========================

exports.compressFile = async (
    buffer,
    mimeType
) => {

    try {

        const sizeInMB = buffer.length / (1024 * 1024);

        // =========================
        // IMAGE
        // =========================

        if (mimeType && mimeType.startsWith("image/")) {

            return await compressImage(buffer, mimeType);
        }

        // =========================
        // PDF
        // =========================

        if (mimeType === "application/pdf") {

            // Use aggressive for large files

            if (sizeInMB > 10) {

                return await compressPdfAggressive(buffer);
            }

            return await compressPdf(buffer);
        }

        // =========================
        // OTHER FILES — return as-is
        // =========================

        return {

            buffer,

            originalSize: buffer.length,

            compressedSize: buffer.length,

            savings: 0,

            wasCompressed: false,

            outputMime: mimeType
        };

    } catch (err) {

        console.error(
            "File compression error:",
            err.message
        );

        // Always fallback to original

        return {

            buffer,

            originalSize: buffer.length,

            compressedSize: buffer.length,

            savings: 0,

            wasCompressed: false,

            outputMime: mimeType
        };
    }
};

// =========================
// HELPER — FORMAT BYTES
// =========================

exports.formatBytes = (bytes) => {

    if (!bytes) return "0 B";

    const k = 1024;

    const sizes = ["B", "KB", "MB", "GB"];

    const i =
        Math.floor(
            Math.log(bytes) / Math.log(k)
        );

    return (
        parseFloat(
            (bytes / Math.pow(k, i)).toFixed(1)
        ) + " " + sizes[i]
    );
};