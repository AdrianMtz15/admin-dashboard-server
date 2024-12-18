"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class file extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({  }) {
      // define association here
    }
  }
  file.init(
    {
      file_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      type: DataTypes.STRING,
      src: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "file",
      tableName: "file",
      timestamps: true,
      paranoid: true,
    }
  );
  return file;
};
