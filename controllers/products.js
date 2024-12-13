const {
  findProductById,
  findProductByParams,
  saveProductCustomFieldValues,
} = require("../actions/products");
const {
  createProductFromData,
  updateProductFromData,
} = require("../functions/product");

const { product, file, rent, rent_product } = require("../models");
const { Op, Sequelize } = require("sequelize");
const moment = require("moment-timezone");

const getProducts = async (req, res, next) => {
  try {
    const products = await product.findAll({
      include: [file],
    });
    res.status(200).send({ products });
  } catch (error) {
    next(error);
  }
};

const getSingleProduct = async (req, res, next) => {
  try {
    const { product_id } = req.params;
    const current_package = await findProductById(product_id);
    res.status(200).send({ product: current_package });
  } catch (error) {
    next(error);
  }
};

const getProductAvailability = async (req, res, next) => {
  try {
    const { product_id } = req.params;
    let { start_date, end_date, event_date, current_rent_id } = req.query;

    console.log(event_date);

    let currentProduct = await product.findOne({
      where: {
        product_id: Number(product_id)
      }
    })

    currentProduct = currentProduct.toJSON();

    const params = {
      status: {
        [Op.like]: "Rentado",
      },
    }

    if(!isNaN(current_rent_id)) {
      params.rent_id = {
        [Op.not]: Number(current_rent_id),
      }
    }

    let rents = await rent.findAll({
      where: params,
      include: [
        {
          model: rent_product,
          where: { product_id },
          required: true,
        },
      ],
    });

    let amount_rented = 0;

    if (rents) {

      rents.map((rent) => {
        rent = rent.toJSON();
        const rent_date = moment(rent.event_date);
        const isSameDate = moment(event_date).isSame(rent_date, "day");
        
        if (isSameDate) {
          amount_rented += rent.rent_products[0].qty;
        }
      });
    }

    const stock = currentProduct.stock;
    const available_stock = stock - amount_rented;

    res.status(200).send({
      stock,
      amount_rented,
      available_stock
    });
  } catch (error) {
    console.log(error.message);

    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const data = req.body;

    if (data.file) {
      const newFile = await file.create({
        name: data.file.name,
      });

      data.file_id = newFile.file_id;
    }

    const newProduct = await product.create(data);

    res.status(200).send({ product: newProduct });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const data = req.body;

    if (data.file) {
      const newFile = await file.create({
        name: data.file.name,
      });

      data.file_id = newFile.file_id;
    }

    console.log(data);

    await product.update(data, {
      where: {
        product_id: data.product_id,
      },
    });

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { product_id } = req.params;
    await product.destroy({
      where: {
        product_id,
      },
    });
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductAvailability,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
