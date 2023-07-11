require("dotenv").config();
const express = require("express");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const multer = require("multer");
const router = express.Router();

const s3Client = new S3Client({
  region: process.env.REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.ACCESSKEYID || "AKIAXFALSUMY6VAASYOP",
    secretAccessKey:
      process.env.SECRETACCESSKEY || "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",
  },
});

const upload = multer({ dest: "uploads/" });

router.post("/uploadImage", upload.single("file"), async (req, res) => {
  const file = req.file;
  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME || "saubhagyadevelopment",
    Key: file.originalname,
    Body: file.buffer,
  });

  try {
    await s3Client.send(command);
    res
      .status(200)
      .json({ msg: "File Upload Successfully...", key: file.originalname });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "Error on file Upload...", error: error });
  }
});

router.post("/imageUrl", async (req, res) => {
  const key = req.body.key;
  console.log(key);
  const command = new GetObjectCommand({
    Bucket:  process.env.BUCKET_NAME || "saubhagyadevelopment",
    Key: key,
  });
  try {
    // Get the presigned URL of the image
    const PresignedUrl = await getSignedUrl(s3Client, command);
    console.log("Presigned URL", PresignedUrl);
    res.status(200).json({ msg: "Image URL fetched successfully...", url: PresignedUrl });
  } catch (err) {
    console.error("Error generating presigned URL:", err);
    res.status(500).json({ error: "Failed to generate presigned URL" });
  }
});

module.exports = router;
