const S3 = require("aws-sdk/clients/s3");
const { findAwsKeys } = require("../actions/appconfig");
const { getAwsConfigFromReq, uploadAwsFileFromReq } = require("../functions/files");

let bucketName = '';
let s3 = null;

const getAwsConfig = async () => {
  const {
    bucketName,
    region,
    accessKeyId,
    secretAccessKey
  } = await findAwsKeys();

  if(s3 === null) {
    s3 = new S3({
      region,
      accessKeyId,
      secretAccessKey,
    });
  }

  return {
    s3,
    bucketName
  }
}

const getAwsFileStream = (s3Config, file_key) => {
  const {
    aws_bucket_name,
    aws_access_key,
    aws_secret_key,
    aws_bucket_region,
  } = s3Config;

  const currentS3 = new S3({
    region: aws_bucket_region,
    accessKeyId: aws_access_key,
    secretAccessKey: aws_secret_key,
  })

  const downloadParams = {
    Key: file_key,
    Bucket: aws_bucket_name,
  };

  return currentS3.getObject(downloadParams, (err, data) => {
    if(err) throw err;
    return data;
  });
};

const uploadAwsFile = async (req, res, next) => {
  try {
    let { s3, bucketName } = await getAwsConfig();
    const currentFile = req.file;
    let fileUploaded;

    if(req.body.data) {
      const data = JSON.parse(req.body.data);
      
      if(data.test) {
        const testBucketName = data.aws_bucket_name;
        const currentS3 = getAwsConfigFromReq({
          region: data.aws_bucket_region,
          accessKeyId: data.aws_access_key,
          secretAccessKey: data.aws_secret_key
        });

        fileUploaded = await uploadAwsFileFromReq(testBucketName, currentFile, currentS3);
      }
    }

    fileUploaded = await uploadAwsFileFromReq(bucketName, currentFile, s3);

    req.fileName = fileUploaded.fileName;
    req.fileType = fileUploaded.fileType;
    req.fileSrc = fileUploaded.fileSrc;

    next();
  } catch (error) {
    next(error);
  }
}

const deleteSingleFile = (fileName) => {
  const params = {
    Bucket: bucketName,
    Key: fileName
  };

  s3.deleteObject(params, (error, data) => {
    if (error) {
      console.error('Error Deleting aws file:', error);
    } 
  });
}


module.exports = { 
  getAwsFileStream, 
  uploadAwsFile, 
  deleteSingleFile 
};