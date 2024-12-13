const { purchase, course_access, payment_source } = require("../models");
const { Op } = require("sequelize");
const moment = require("moment");

const attachPaymentMethod = async (req, res, next) => {
  try {
    const { payment_method, payment_source_id } = req.body;
    let paymentMethod;
    let current_payment_source = null;
    if (payment_source_id && payment_source_id !== null) {
      current_payment_source = await payment_source.findOne({
        where: {
          payment_source_id,
        },
      });
      if (current_payment_source === null) {
        return res.sendStatus(400);
      }
      current_payment_source = current_payment_source.toJSON();
      req.paymentMethod = current_payment_source;
      req.paymentMethod.id = current_payment_source.source;
    } else if (!payment_method) {
      return res.sendStatus(400);
    } else {
      paymentMethod = payment_method.paymentMethod;
      req.paymentMethod = paymentMethod;
    }

    if (!payment_source_id && paymentMethod) {
      await payment_source.create({
        user_id: req.user_id,
        source: paymentMethod.id,
        card_type: paymentMethod.card.brand,
        last_digits: paymentMethod.card.last4,
        card_token: paymentMethod.card.fingerpint,
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

const myPurchase = async (req, res, next) => {
  try {
    const { purchase_id } = req.params;
    const { user_id } = req;
    const current_purchase = await purchase.findOne({
      where: {
        purchase_id,
        user_id,
      },
      include: course_access,
    });
    if (current_purchase === null) return res.sendStatus(403);
    req.purchase = current_purchase;
    next();
  } catch (error) {
    next(error);
  }
};

const notExpired = async (req, res, next) => {
  try {
    const { user_id } = req;
    const { course_id } = req.params;
    const current_date = moment()
      .utc()
      .subtract(12, "hours")
      .format("YYYY-MM-DD HH:mm:ss");
    const current_purchase = await course_access.findAll({
      where: {
        course_id,
        expiration_date: {
          [Op.gt]: current_date,
        },
      },
      include: {
        model: purchase,
        where: {
          user_id,
          status: ["active", "success", "completed"],
        },
      },
    });
    if (
      !current_purchase ||
      current_purchase === null ||
      current_purchase.length === 0
    ) {
      return res.sendStatus(412);
    }
    next();
  } catch (error) {
    next(error);
  }
};

const canPurchaseProduct = async (current_product, user_id) => {
  const { product_id, limit_per_user } = current_product;
  if (limit_per_user !== null) {
    const purchases = await purchase.findAll({
      where: {
        user_id,
        product_id,
        status: {
          [Op.not]: "pending",
        },
      },
    });
    return purchases.length >= limit_per_user;
  }
  return true;
};

const canRefundPurchase = async (req, res, next) => {
  try {
    const { purchase_id } = req.body;
    const currentPurchase = await purchase.findByPk(purchase_id);

    if (
      currentPurchase.status === "completed" &&
      currentPurchase.subscription_id === null
    ) {
      req.body.purchase;
      return next();
    }
    res.status(400).send({ message: "Esta compra no puede ser reembolsada" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  myPurchase,
  notExpired,
  canPurchaseProduct,
  attachPaymentMethod,
  canRefundPurchase,
};
