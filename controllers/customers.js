const { customer } = require("../models");
const admin = require("firebase-admin");


const { Op } = require("sequelize");



const getAllCustomers = async (req, res, next) => {
  try {
    const data = await customer.findAll();
    res.status(200).send({ customers: data });
  } catch (error) {
    next(error);
  }
};


const createCustomer = async (req, res, next) => {
  try {
    const data = req.body;
    const newCustomer = await customer.create(data);
    res.status(200).send({ customer: newCustomer });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCustomers,
  createCustomer
};
