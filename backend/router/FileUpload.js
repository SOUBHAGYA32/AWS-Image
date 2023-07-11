require("dotenv").config();
const path = require('path');
const express = require("express");
const {
  S3Client
} = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");
const multer = require("multer");

const router = express.Router();

//Set The AWS Client S3
const s3Client = new S3Client({
  region: process.env.REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
  },
});

const s3Storage = multerS3({
  s3: s3Client, // S3 instance
  bucket: process.env.BUCKET_NAME, // Change it as per your project requirement
  acl: "public-read", // Storage access type
  metadata: (req, file, cb) => {
    cb(null, { fieldname: file.fieldname });
  },
  key: (req, file, cb) => {
    const fileName =
      Date.now() + "_" + file.fieldname + "_" + file.originalname;
    cb(null, fileName);
  },
});

//Function to sanitize files and send error for Unsupported files
function sanitizeFile(file, cb) {
  // Define the allowed extension
  const fileExts = [".png", ".jpg", ".jpeg", ".gif"];

  // Check allowed extensions
  const isAllowedExt = fileExts.includes(
    path.extname(file.originalname.toLowerCase())
  );

  // Mime type must be an image
  const isAllowedMimeType = file.mimetype.startsWith("image/");

  if (isAllowedExt && isAllowedMimeType) {
    return cb(null, true); // no errors
  } else {
    // pass error msg to callback, which can be displaye in frontend
    cb("Error: File type not allowed!");
  }
}

const uploadImage = multer({
  storage: s3Storage,
  fileFilter: (req, file, callback) => {
    sanitizeFile(file, callback);
  },
  limits: {
    fileSize: 1024 * 1024 * 2, // 2mb file size
  },
});

router.post("/uploadImage", uploadImage.single("file"), async (req, res, next) => {
  const file = req.file;
   // location key in req.file holds the s3 url for the image
   let data = {}
   if(file) {
       data.image = req.file.location
       return res.status(200).json({ msg: "Image Upload Successfully...", url: req.file.location, key: req.file.key, type: req.file.mimetype, size: req.file.size })
   } else {
    return res.status(400).json({msg: "Image Upload Failed!"})
   }
});

module.exports = router;
