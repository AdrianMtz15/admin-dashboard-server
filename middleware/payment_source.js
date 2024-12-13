const { payment_source } = require("../models");

const attachPaymentSource = async (req, res, next) => {
  try {
    const { payment_source_id } = req.body;
    let current_payment_source = await payment_source.findOne({
      where: {
        payment_source_id,
      },
    });
    if (current_payment_source === null) {
      return res.status(400).send({ message: "Método de pago no válido." });
    }
    req.payment_source = current_payment_source;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { attachPaymentSource };
