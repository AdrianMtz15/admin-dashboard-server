const moment = require("moment");
const path = require("path");
const fs = require("fs");

const processFileName = (name) => {
  name = name.split(".")[0];
  if (String(name).length > 200) {
    name = name.substring(200);
  }
  name = name.replace(" ", "_");
  name = name.replace(":", "_");
  const momentString = moment().format("YYYY_MM_DD_HH_mm_ss");
  if (String(name).length > 200) {
    name = `${name.substring(200)}_${momentString}`;
  } else {
    name = `${name}_${momentString}`;
  }
  return name;
};

const validateFileName = async (req, res, next) => {
  try {
    let name = req.file.originalname;
    name = processFileName(name);
    req.fileName = name;
    next();
  } catch (error) {
    res.status(500).send({ error });
  }
};

const uploadLocalFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: "Missing file." });
    }
    
    const serverBaseUrl = 'https://cctapp.s3.us-east-2.amazonaws.com/';
    let fileName = req.file.originalname;
    let nameSplit = req.file.originalname.split(".");

    if (nameSplit.length > 1) {
      fileName = nameSplit[0] + "." + nameSplit[nameSplit.length - 1];
    }

    const fileType = fileName.match(/\.[0-9a-z]+$/i)[0].replace(".", "");
    fileName = processFileName(fileName);

    const dirPath = path.join(__dirname, "..");
    const filePath = `${dirPath}/files/${fileName}.${fileType}`;
    const fileSrc = `${serverBaseUrl}${fileName}.${fileType}`;

    req.fileName = fileName;
    req.fileType = fileType
    req.fileSrc = fileSrc;

    await fs.writeFileSync(filePath, req.file.buffer);

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { validateFileName, processFileName, uploadLocalFile };
