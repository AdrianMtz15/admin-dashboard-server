const { findProductById } = require("../actions/products");
const { appconfig } = require("../models");
const moment = require("moment");

const signUpBonus = async (user_id) => {
  let configProduct = await appconfig.findOne({
    where: {
      key: "signup_bonus",
    },
  });
  if (configProduct !== null) {
    configProduct = configProduct.toJSON();
    const current_package = await findProductById(configProduct.value);
    if (current_package && current_package !== null) {
      const bonus = {
        amount: 0,
        is_gift: true,
        amount: 0,
        status: "completed",
        payment_method_id: 5,
        class_amount: current_package.class_amount,
        expiration_days: current_package.expiration_days,
        product_id: current_package.product_id,
      };
      let current_purchase = await createPurchaseFromData({
        user_id,
        ...bonus,
      });
    }
  }
};

const giveUserOnlineAccess = async ({
  current_package,
  purchase_id,
  user_id,
  invoice_id,
}) => {
  if (current_package.include_online) {
    const start_access = moment().startOf("day").format("YYYY-MM-DD");
    const end_access = moment()
      .add(current_package.expiration_days, "days")
      .set("hours", 23)
      .set("minutes", 59)
      .set("seconds", 59)
      .utc(true);

    await createUserOnlineAccess({
      start_date: start_access,
      expiration_date: end_access,
      status: "active",
      purchase_id,
      user_id,
      invoice_id,
    });
  }
};

module.exports = {
  signUpBonus,
  giveUserOnlineAccess,
};
