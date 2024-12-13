const S3 = require("aws-sdk/clients/s3");
const { processFileName } = require("../middleware/files");
const { file } = require("../models");


const getAwsConfigFromReq = ({
  region,
  accessKeyId,
  secretAccessKey
}) => {
  const newS3 = new S3({
    region,
    accessKeyId,
    secretAccessKey,
  });

  return newS3;
}

const getFileDataFromReq = (file) => {
  const awsBaseUrl = 'https://cctapp.s3.us-east-2.amazonaws.com/';
  let fileName = file.originalname;
  let nameSplit = file.originalname.split(".");
  
  if (nameSplit.length > 1) {
    fileName = nameSplit[0] + "." + nameSplit[nameSplit.length - 1];
  }

  const fileType = fileName.match(/\.[0-9a-z]+$/i)[0].replace(".", "");
  fileName = processFileName(fileName);
  const fileSrc = `${awsBaseUrl}${fileName}.${fileType}`;

  return {
    fileKey: `${fileName}.${fileType}`,
    fileName,
    fileType,
    fileSrc
  }
}

const createFileFromData = async (data) => {
}

const uploadAwsFileFromReq = async (bucketName, fileData, s3) => {
  const {
    fileKey,
    fileName,
    fileType,
    fileSrc
  } = getFileDataFromReq(fileData);

  const params = {
    Body: fileData.buffer,
    Bucket: bucketName,
    Key: fileKey
  }

  return await new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if(err) reject(err);

      if(data) {
        resolve({
          fileName,
          fileType,
          fileSrc,
        });
      }
    });
  })
}

const uploadLocalFile = async () => {
  try {
  } catch (error) {
    res.status(500).send({ error });
  }
};


module.exports = {
  getAwsConfigFromReq,
  getFileDataFromReq,
  uploadAwsFileFromReq,
  uploadLocalFile
}