"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class concept extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ rent }) {
      // define association here
      this.belongsTo(rent, { foreignKey: "rent_id" });
    }
  }
  concept.init(
    {
      concept_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      qty: DataTypes.INTEGER,
      price: DataTypes.DECIMAL,
      order: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "concept",
      tableName: "concept",
      timestamps: true,
      paranoid: true,
    }
  );
  return concept;
};
