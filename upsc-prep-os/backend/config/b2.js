const {
    S3Client
} = require("@aws-sdk/client-s3");

// =========================
// BACKBLAZE B2 CLIENT
// (S3-Compatible)
// =========================

const ENDPOINT = process.env.B2_ENDPOINT;
const REGION = process.env.B2_REGION;
const BUCKET_NAME = process.env.B2_BUCKET_NAME;

console.log("✅ B2 configured:");
console.log("   Endpoint:", ENDPOINT || "❌ MISSING");
console.log("   Region:  ", REGION || "❌ MISSING");
console.log("   Bucket:  ", BUCKET_NAME || "❌ MISSING");

const b2Client = new S3Client({
    region: REGION,
    endpoint: ENDPOINT,
    credentials: {
        accessKeyId: process.env.B2_KEY_ID,
        secretAccessKey: process.env.B2_APPLICATION_KEY,
    },
    forcePathStyle: true,  // ← important for B2
});

module.exports = {
    b2Client,
    BUCKET_NAME,
};