const {

    PutObjectCommand,

    DeleteObjectCommand,

    GetObjectCommand,

    HeadObjectCommand

} = require("@aws-sdk/client-s3");

const {
    getSignedUrl
} = require("@aws-sdk/s3-request-presigner");

const {

    b2Client,

    BUCKET_NAME

} = require("../config/b2");

const crypto =
    require("crypto");

// =========================
// GENERATE UNIQUE FILE KEY
// =========================

const generateFileKey = (
    userId,
    originalName,
    scope = "vault"
) => {

    const timestamp =
        Date.now();

    const random =
        crypto

            .randomBytes(6)

            .toString("hex");

    const cleanName =
        originalName

            .replace(/[^a-zA-Z0-9.-]/g, "_")

            .toLowerCase();

    return `${scope}/${userId}/${timestamp}-${random}-${cleanName}`;
};

// =========================
// UPLOAD FILE TO B2
// =========================

const uploadToB2 = async (
    fileBuffer,
    fileKey,
    mimeType
) => {

    const command =
        new PutObjectCommand({

            Bucket: BUCKET_NAME,

            Key: fileKey,

            Body: fileBuffer,

            ContentType: mimeType
        });

    await b2Client.send(command);

    return {

        key: fileKey,

        bucket: BUCKET_NAME
    };
};

// =========================
// DELETE FILE FROM B2
// =========================

const deleteFromB2 = async (
    fileKey
) => {

    const command =
        new DeleteObjectCommand({

            Bucket: BUCKET_NAME,

            Key: fileKey
        });

    await b2Client.send(command);

    return true;
};

// =========================
// GENERATE SIGNED VIEW URL
// (Default: 5 minutes)
// =========================

const getSignedViewUrl = async (
    fileKey,
    expiresInSeconds = 300
) => {

    const command =
        new GetObjectCommand({

            Bucket: BUCKET_NAME,

            Key: fileKey
        });

    const signedUrl =
        await getSignedUrl(

            b2Client,

            command,

            {
                expiresIn:
                    expiresInSeconds
            }
        );

    return signedUrl;
};

// =========================
// CHECK IF FILE EXISTS
// =========================

const fileExists = async (
    fileKey
) => {

    try {

        const command =
            new HeadObjectCommand({

                Bucket: BUCKET_NAME,

                Key: fileKey
            });

        await b2Client.send(command);

        return true;

    } catch (err) {

        return false;
    }
};

module.exports = {

    generateFileKey,

    uploadToB2,

    deleteFromB2,

    getSignedViewUrl,

    fileExists
};