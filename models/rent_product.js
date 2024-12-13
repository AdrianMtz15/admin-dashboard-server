"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class rent_product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ rent, product }) {
      // define association here
      this.belongsTo(rent, { foreignKey: "rent_id" });
      this.belongsTo(product, { foreignKey: "product_id" });

    }
  }
  rent_product.init(
    {
      rent_product_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      qty: DataTypes.INTEGER,
      order: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "rent_product",
      tableName: "rent_product",
      timestamps: true,
      paranoid: true,
    }
  );
  return rent_product;
};
