"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class payment extends Model {
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
  payment.init(
    {
      payment_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      concept: DataTypes.STRING,
      total: DataTypes.DECIMAL,
      order: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "payment",
      tableName: "payment",
      timestamps: true,
      paranoid: true,
    }
  );
  return payment;
};
