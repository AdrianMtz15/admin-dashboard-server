const { deleteSingleFile, getAwsFileStream } = require("../middleware/aws-bucket");
const { file } = require("../models");
const fs = require("fs");

const getFile = async (req, res, next) => {
  try {
    const { file_id } = req.params;
    const filePath = `${__dirname}/files/${file_id}`;
    if (!fs.existsSync(filePath)) {
      return res.sendStatus(404);
    }
    res.status(200).sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

const createFile = async (req, res, next) => {
  try {
    const { fileName, fileType, fileSrc } = req;

    const newFile = await file.create(
      {
        name: fileName,
        type: fileType,
        src: fileSrc
      }
    );

    res
      .status(200)
      .send({
        file_id: newFile.file_id,
        file: { file_id: req.file_id, name: fileName, type: fileType, src: fileSrc },
      });
  } catch (error) {
    next(error);
  }
};

const deleteAwsFile = async (req, res, next) => {
  try {
    const { last_file_id } = req.params;
    const { file_name } = req.query;    
    await file.destroy(
      {
        where: {
          file_id: last_file_id,
        },
      }
    );

    deleteSingleFile(file_name);

    res.status(200).send('File deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = { getFile, createFile, deleteAwsFile };
