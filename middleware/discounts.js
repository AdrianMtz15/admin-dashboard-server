const moment = require("moment");
const { discount, purchase } = require("../models");
const {
  validateDiscountProduct,
} = require("../functions/discount_products");
const {
  DISCOUNT_NO_PAYMENT_PLANS,
  DISCOUNT_INVALID,
  DISCOUNT_INVALID_CLASS_PACKAGE,
  DISCOUNT_INVALID_USER,
} = require("../constants/discounts");
const { findDiscountByCode } = require("../actions/discounts");
const { validateDiscountUser } = require("../functions/discounts");

const attachDiscount = async (req, res, next) => {
  try {
    const current_user = req.user;
    const { discountCode, product_id, payment_plan_id } = req.body;
    if (discountCode && discountCode !== null) {
      if (
        payment_plan_id &&
        payment_plan_id !== "" &&
        payment_plan_id !== null
      ) {
        return res.status(409).send({
          message: DISCOUNT_NO_PAYMENT_PLANS,
        });
      }
      const descuento = await validarDescuento(discountCode);
      if (!descuento || descuento === null) {
        return res.status(404).send({
          message: DISCOUNT_INVALID,
        });
      }
      if (product_id && product_id !== null) {
        const validProduct = await validateDiscountProduct(
          descuento.discount_id,
          product_id
        );
        if (!validProduct) {
          return res.status(412).send({
            message: DISCOUNT_INVALID_CLASS_PACKAGE,
          });
        }
      }
      const clienteValido = await validateDiscountUser(
        descuento,
        current_user.user_id
      );
      if (!clienteValido) {
        return res.status(412).send({
          message: DISCOUNT_INVALID_USER,
        });
      }
      req.discount = descuento;
    }
    next();
  } catch (error) {
    next(error);
  }
};

const validarDescuento = async (codigo) => {
  let descuento = await findDiscountByCode(codigo);

  if (descuento === null) return false;

  const currentMoment = moment().subtract(6, "hours");
  
  if (descuento.start_date !== null && moment(descuento.start_date).isValid()) {
    const start_date = moment(descuento.start_date).add(1, "day");
    if (currentMoment.isBefore(start_date)) {      
      return null;
    }
  }

  if (
    descuento.expiration_date !== null &&
    moment(descuento.expiration_date).isValid()
  ) {
    const expiration_date = moment(descuento.expiration_date).add(1, "day");
    if (!currentMoment.isBefore(expiration_date)) {
      return null;
    }
  }

  if(!descuento.available) {
    return null;
  }
  
  return descuento;
};

const validarDescuentoCliente = async (discount_id, user_id) => {
  const conteo = await purchase.findAll({
    where: {
      user_id,
      discount_id,
    },
  });
  const descuento = await discount.findOne({
    where: {
      discount_id,
    },
  });
  if (descuento.first_purchase_only) {
    const purchases = await purchase.findAll({
      where: {
        user_id,
      },
    });
    if (purchases !== null && purchases.length > 0) return false;
  }
  if (descuento.limit_per_user !== null) {
    return conteo.length < descuento.limit_per_user;
  }
  return true;
};

const validarDescuentoGlobal = async (discount_id) => {
  const descuento = await discount.findOne({
    where: {
      discount_id,
    },
  });
  if (descuento === null) return false;
  if (descuento.total !== null) {
    const purchases = await purchase.findAll({
      where: {
        discount_id: descuento.discount_id,
      },
    });
    return purchases.length < descuento.total;
  }
  return true;
};

const aplicarDescuento = (total, amount, is_percent) => {
  if (is_percent) {
    const discountAmount = total * (amount / 100);
    total -= discountAmount;
  } else {
    total -= amount;
  }
  return total;
};

module.exports = {
  attachDiscount,
  aplicarDescuento,
  validarDescuento,
  validarDescuentoCliente,
  validarDescuentoGlobal,
};
