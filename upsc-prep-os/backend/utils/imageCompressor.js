const sharp =
    require("sharp");

// =========================
// COMPRESS IMAGE
// (Smart resize + optimize)
// =========================

exports.compressImage = async (
    buffer,
    mimeType
) => {

    try {

        // Get original size

        const originalSize = buffer.length;

        // Determine if we should compress

        const shouldCompress =
            originalSize > 500 * 1024;  // > 500KB

        if (!shouldCompress) {

            return {

                buffer,

                originalSize,

                compressedSize: originalSize,

                savings: 0,

                wasCompressed: false
            };
        }

        // Get metadata

        const metadata =
            await sharp(buffer).metadata();

        const {
            width,
            height,
            format
        } = metadata;

        // =========================
        // CHOOSE STRATEGY
        // =========================

        // For very large images: resize first

        const MAX_DIMENSION = 1920;

        let pipeline = sharp(buffer);

        // Resize if too big

        if (
            width > MAX_DIMENSION ||
            height > MAX_DIMENSION
        ) {

            pipeline = pipeline.resize(

                MAX_DIMENSION,

                MAX_DIMENSION,

                {
                    fit: "inside",

                    withoutEnlargement: true
                }
            );
        }

        // =========================
        // FORMAT-SPECIFIC OPTIMIZATION
        // =========================

        let compressedBuffer;

        let outputMime = mimeType;

        if (
            mimeType === "image/png" ||
            format === "png"
        ) {

            // PNG: optimize compression

            compressedBuffer =
                await pipeline

                    .png({
                        quality: 80,
                        compressionLevel: 9,
                        adaptiveFiltering: true
                    })

                    .toBuffer();

        } else if (
            mimeType === "image/webp" ||
            format === "webp"
        ) {

            // WebP: already efficient

            compressedBuffer =
                await pipeline

                    .webp({
                        quality: 80
                    })

                    .toBuffer();

        } else {

            // JPEG / other: convert to JPEG (best compression)

            compressedBuffer =
                await pipeline

                    .jpeg({
                        quality: 80,
                        mozjpeg: true,
                        progressive: true
                    })

                    .toBuffer();

            outputMime = "image/jpeg";
        }

        const compressedSize = compressedBuffer.length;

        const savings =
            Math.round(
                ((originalSize - compressedSize) / originalSize) * 100
            );

        // Only use compressed if actually smaller

        if (compressedSize >= originalSize) {

            return {

                buffer,

                originalSize,

                compressedSize: originalSize,

                savings: 0,

                wasCompressed: false,

                outputMime: mimeType
            };
        }

        return {

            buffer: compressedBuffer,

            originalSize,

            compressedSize,

            savings,

            wasCompressed: true,

            outputMime
        };

    } catch (err) {

        console.error(
            "Image compression error:",
            err.message
        );

        // Fallback to original

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