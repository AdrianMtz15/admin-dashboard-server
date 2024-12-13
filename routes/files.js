const express = require("express");
const { getFile, createFile } = require("../controllers/files");
const { authRoute } = require("../middleware/auth");
const router = express.Router();
const { uploadLocalFile } = require("../middleware/files");
const { uploadAwsFile } = require("../middleware/aws-bucket");
const upload = require("multer")();

router.get("/:file_id", getFile);

router.post(
  "/",
  [authRoute, upload.single("file"), uploadLocalFile],
  createFile
);

router.post(
  "/s3",
  [authRoute, upload.single("file"), uploadAwsFile],
  createFile
);


module.exports = router;
