const {
    S3Client
} = require("@aws-sdk/client-s3");

// =========================
// BACKBLAZE B2 CLIENT
// (S3-Compatible)
// =========================

const b2Client =
    new S3Client({

        region:
            process.env.B2_REGION,

        endpoint:
            process.env.B2_ENDPOINT,

        credentials: {

            accessKeyId:
                process.env.B2_KEY_ID,

            secretAccessKey:
                process.env.B2_APPLICATION_KEY
        }
    });

module.exports = {

    b2Client,

    BUCKET_NAME:
        process.env.B2_BUCKET_NAME
};