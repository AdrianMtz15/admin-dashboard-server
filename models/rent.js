"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class rent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ customer, rent_product, concept, payment }) {
      // define association here
      this.belongsTo(customer, { foreignKey: "customer_id" });
      this.hasMany(rent_product, { foreignKey: "rent_id" });
      this.hasMany(concept, { foreignKey: "rent_id" });
      this.hasMany(payment, { foreignKey: "rent_id" });
    }
  }
  rent.init(
    {
      rent_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      address: DataTypes.STRING,
      people: DataTypes.INTEGER,
      event_date: DataTypes.DATE,
      iva: DataTypes.BOOLEAN,
      place: DataTypes.STRING,
      delivery_date: DataTypes.DATE,
      return_date: DataTypes.DATE,
      freight: DataTypes.INTEGER,
      maneuvers: DataTypes.INTEGER,
      cleaning: DataTypes.INTEGER,
      discount: DataTypes.INTEGER,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "rent",
      tableName: "rent",
      timestamps: true,
      paranoid: true,
    }
  );
  return rent;
};
