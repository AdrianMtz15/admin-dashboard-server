const { getProductAvailability } = require("../functions/product");
const {
  rent,
  file,
  rent_product,
  product,
  concept,
  customer,
  payment,
} = require("../models");
const moment = require('moment-timezone')
const { Op } = require("sequelize");

const getAllRents = async (req, res, next) => {
  try {
    let rents = await rent.findAll({
      include: [
        customer,
        { 
          model: rent_product, 
          include: {
            model: product,
            required: true
          },
          
        },
        concept,
        payment,
      ],
      order: [["createdAt", "DESC"]],
    });

    if (Array.isArray(rents) && rents.length > 0) {
      const updatedRents = [];
      const promises = rents.map((currentRent) => {
        return new Promise(async (resolve, reject) => {
          currentRent = currentRent.toJSON();
          const updatedRentProducts = [];

          if (
            Array.isArray(currentRent.rent_products) &&
            currentRent.rent_products.length > 0
          ) {
            const promises = currentRent.rent_products.map((rentedProduct) => {
              return new Promise(async (resolve, reject) => {
                if (currentRent.event_date) {
                  const availability = await getProductAvailability(
                    rentedProduct.product,
                    currentRent.event_date
                  );
                  
                  rentedProduct.availability = availability + rentedProduct.qty;
                } else {
                  rentedProduct.availability = rentedProduct.product.stock;
                }

                updatedRentProducts.push(rentedProduct);
                resolve();
              });
            });
            await Promise.all(promises);
          }
          currentRent.rent_products = updatedRentProducts;
          updatedRents.push(currentRent);
          resolve();
          
        });
      });

      await Promise.all(promises)
      rents = updatedRents;
    }

    if(Array.isArray(rents)) {
      rents = rents.sort((a, b) => (new Date(b.createdAt) - new Date(a.createdAt)))
    }

    res.status(200).send({ rents });
  } catch (error) {
    console.log(error.message);

    next(error);
  }
};

const getSingleRent = async (req, res, next) => {
  try {
    const { rent_id } = req.params;
    let data = await rent.findOne({
      where: { rent_id },
      include: [
        customer,
        { model: rent_product, include: product },
        concept,
        payment,
      ],
    });

    if (data) data = data.toJSON();

    let total_price = 0;

    data.rent_products.map((rentedProduct) => {
      const price = rentedProduct.qty * rentedProduct.product.price;
      total_price += price;
    });

    data.total_price = total_price;

    res.status(200).send({ rent: data });
  } catch (error) {
    next(error);
  }
};

const createRent = async (req, res, next) => {
  try {
    const data = req.body;

    const newRent = await rent.create(data);

    if (Array.isArray(data.products)) {
      await Promise.all(
        data.products.map(async (product) => {
          return await rent_product.create({
            rent_id: newRent.rent_id,
            product_id: product.product_id,
            qty: product.qty,
            order: product.order,
          });
        })
      );
    }

    if (Array.isArray(data.concepts)) {
      await Promise.all(
        data.concepts.map(async (conceptData) => {
          return await concept.create({
            rent_id: newRent.rent_id,
            name: conceptData.name,
            qty: conceptData.qty,
            price: conceptData.price,
            order: conceptData.order,
          });
        })
      );
    }

    if (Array.isArray(data.payments)) {
      await Promise.all(
        data.payments.map(async (paymentData) => {
          return await payment.create({
            rent_id: newRent.rent_id,
            concept: paymentData.concept,
            total: paymentData.total,
            order: paymentData.order,
          });
        })
      );
    }

    res.status(200).send({ rent: newRent });
  } catch (error) {
    console.log(error.message);

    next(error);
  }
};

const updateRent = async (req, res, next) => {
  try {
    const data = req.body;

    await rent.update(data, {
      where: {
        rent_id: data.rent_id,
      },
    });

    if (Array.isArray(data.products)) {
      await rent_product.destroy({
        where: { rent_id: data.rent_id },
      });

      const promises = data.products.map((product) => {
        return new Promise(async (resolve, reject) => {
          await rent_product.create({
            rent_id: data.rent_id,
            product_id: product.product_id,
            qty: product.qty,
            order: product.order,
          });
          resolve();
        });
      });

      await Promise.all(promises);
    }

    if (Array.isArray(data.concepts)) {
      await concept.destroy({
        where: { rent_id: data.rent_id },
      });

      await Promise.all(
        data.concepts.map(async (conceptData) => {
          return await concept.create({
            rent_id: data.rent_id,
            name: conceptData.name,
            qty: conceptData.qty,
            price: conceptData.price,
            order: conceptData.order,
          });
        })
      );
    }

    if (Array.isArray(data.payments)) {
      await payment.destroy({
        where: { rent_id: data.rent_id },
      });

      await Promise.all(
        data.payments.map(async (paymentData) => {
          return await payment.create({
            rent_id: data.rent_id,
            concept: paymentData.concept,
            total: paymentData.total,
            order: paymentData.order,
          });
        })
      );
    }

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

const endOutdatedRents = async (req, res, next) => {
  try {
    let currentRents = await rent.findAll({
      where: {
        status: 'Rentado'
      },
    });

    if(Array.isArray(currentRents) && currentRents.length > 0) {
      
      currentRents = currentRents.map(currentRent => {
        currentRent = currentRent.toJSON();
        const event_date = moment(currentRent.event_date);
        const currentDate = moment();

        if(currentDate.isAfter(event_date, 'day')) {
          rent.update({
            status: 'Finalizado'
          },{
            where: {
              rent_id: currentRent.rent_id
            }
          })          
        }
      })
    }

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

const deleteRent = async (req, res, next) => {
  try {
    const { rent_id } = req.params;
    await rent.destroy({
      where: {
        rent_id,
      },
    });
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRents,
  getSingleRent,
  createRent,
  updateRent,
  endOutdatedRents,
  deleteRent,
};
