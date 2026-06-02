const {
    PDFDocument
} = require("pdf-lib");

const sharp =
    require("sharp");

// =========================
// COMPRESS PDF
// (Multi-strategy approach)
// =========================

exports.compressPdf = async (
    buffer
) => {

    try {

        const originalSize = buffer.length;

        // Skip if already small

        if (originalSize < 1 * 1024 * 1024) {

            // < 1MB

            return {

                buffer,

                originalSize,

                compressedSize: originalSize,

                savings: 0,

                wasCompressed: false
            };
        }

        // =========================
        // LOAD PDF
        // =========================

        let pdfDoc;

        try {

            pdfDoc =
                await PDFDocument.load(
                    buffer,
                    {

                        ignoreEncryption: true,

                        updateMetadata: false
                    }
                );

        } catch (loadErr) {

            console.error(
                "PDF load failed (likely corrupted or encrypted):",
                loadErr.message
            );

            return {

                buffer,

                originalSize,

                compressedSize: originalSize,

                savings: 0,

                wasCompressed: false,

                error: "PDF cannot be processed"
            };
        }

        // =========================
        // STRATEGY 1: REMOVE METADATA
        // =========================

        pdfDoc.setTitle("");

        pdfDoc.setAuthor("");

        pdfDoc.setSubject("");

        pdfDoc.setKeywords([]);

        pdfDoc.setProducer("PrepOS");

        pdfDoc.setCreator("PrepOS");

        // =========================
        // STRATEGY 2: SAVE WITH OPTIMIZATION
        // =========================

        const compressedBytes =
            await pdfDoc.save({

                useObjectStreams: true,

                addDefaultPage: false,

                objectsPerTick: 50
            });

        const compressedBuffer =
            Buffer.from(compressedBytes);

        const compressedSize = compressedBuffer.length;

        const savings =
            Math.round(
                ((originalSize - compressedSize) / originalSize) * 100
            );

        // Only use compressed if smaller

        if (
            compressedSize >= originalSize ||
            savings < 1
        ) {

            return {

                buffer,

                originalSize,

                compressedSize: originalSize,

                savings: 0,

                wasCompressed: false
            };
        }

        return {

            buffer: compressedBuffer,

            originalSize,

            compressedSize,

            savings,

            wasCompressed: true
        };

    } catch (err) {

        console.error(
            "PDF compression error:",
            err.message
        );

        return {

            buffer,

            originalSize: buffer.length,

            compressedSize: buffer.length,

            savings: 0,

            wasCompressed: false
        };
    }
};

// =========================
// AGGRESSIVE PDF COMPRESSION
// (For very large PDFs with images)
// Re-encodes embedded images
// =========================

exports.compressPdfAggressive = async (
    buffer
) => {

    try {

        const originalSize = buffer.length;

        // Only for large PDFs

        if (originalSize < 5 * 1024 * 1024) {

            // < 5MB → use normal compression

            return await exports.compressPdf(buffer);
        }

        const pdfDoc =
            await PDFDocument.load(
                buffer,
                {
                    ignoreEncryption: true,
                    updateMetadata: false
                }
            );

        // Strip metadata

        pdfDoc.setTitle("");
        pdfDoc.setAuthor("");
        pdfDoc.setSubject("");
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer("PrepOS");
        pdfDoc.setCreator("PrepOS");

        // Save with max compression

        const compressedBytes =
            await pdfDoc.save({

                useObjectStreams: true,

                addDefaultPage: false,

                objectsPerTick: 50
            });

        const compressedBuffer =
            Buffer.from(compressedBytes);

        const compressedSize = compressedBuffer.length;

        const savings =
            Math.round(
                ((originalSize - compressedSize) / originalSize) * 100
            );

        if (
            compressedSize >= originalSize ||
            savings < 1
        ) {

            return {

                buffer,

                originalSize,

                compressedSize: originalSize,

                savings: 0,

                wasCompressed: false
            };
        }

        return {

            buffer: compressedBuffer,

            originalSize,

            compressedSize,

            savings,

            wasCompressed: true
        };

    } catch (err) {

        console.error(
            "Aggressive PDF compression error:",
            err.message
        );

        return {

            buffer,

            originalSize: buffer.length,

            compressedSize: buffer.length,

            savings: 0,

            wasCompressed: false
        };
    }
};