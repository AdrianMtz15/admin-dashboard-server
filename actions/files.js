const { file } = require("../models");


const findFileById = async (file_id) => {
  const data = await file.findByPk(file_id);
  if(data) return data.toJSON(); else return null;
}

module.exports = {
  findFileById
}