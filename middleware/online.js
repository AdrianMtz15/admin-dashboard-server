const { sequelize, invoice, staff } = require("../models");

const userHasOnline = async (user_id) => {
  //Check if it's a staff staff
  let current_user = await staff.findOne({
    where: {
      user_id,
    },
  });
  //Allow managers and admins to use TBM Online for Free
  if (current_user !== null) {
    current_user = current_user.toJSON();
    if (["manager", "admin"].includes(current_user.role)) {
      return true;
    }
  }
  //Get last online membership
  let current_purchase = (
    await sequelize.query(`
        SELECT * FROM purchase
        WHERE include_online = 1
        AND user_id = ${user_id}
        AND isnull(deletedAt)
        AND (status <> "pending" AND status <> "revoked")
        ORDER BY createdAt DESC
        LIMIT 1;
    `)
  )[0][0];
  //Access denied if not found
  if (!current_purchase || current_purchase === null) {
    return false;
  }
  //Get all paid invoices
  const invoices = await invoice.findAll({
    where: {
      purchase_id: current_purchase.purchase_id,
      status: "completed",
    },
    order: [["createdAt", "DESC"]],
  });
  //Get last invoice paid
  if (current_purchase.subscription_id !== null && invoices.length === 0) {
    return false;
  }
  let last_invoice_date;
  if (invoices !== null && invoices.length > 0) {
    let last_invoice = invoices[0].toJSON();
    last_invoice_date = last_invoice.createdAt;
  } else {
    last_invoice_date = current_purchase.createdAt;
  }
  const createdAt = moment(last_invoice_date);
  let expiration_date = "";
  //If in free trial, check if it's cancelled before trial expires
  if (
    current_purchase.free_trial_length !== null &&
    current_purchase.free_trial_length > 0 &&
    invoices.length <= 1
  ) {
    const free_trial_end = createdAt.add(
      current_purchase.free_trial_length,
      "days"
    );
    if (current_purchase.status === "cancelled") {
      const cancelTime = moment(current_purchase.updatedAt);
      //If user cancels before trial expires, end of trial is expiration date
      if (cancelTime.isBefore(free_trial_end)) {
        return free_trial_end.isAfter(moment());
      }
    }
    //Start counting on last payment date
    //Get expiration date for admin enabled packages
  }
  if (
    current_purchase.admin_enabled ||
    current_purchase.subscription_period === null ||
    current_purchase.subscription_interval === null
  ) {
    expiration_date = createdAt.add(current_purchase.expiration_days, "days");
  } else {
    //Get expiration for online paid packages
    expiration_date = createdAt.add(
      current_purchase.subscription_interval,
      current_purchase.subscription_period
    );
  }
  if (expiration_date.isBefore(moment())) {
    return false;
  }
  return true;
};

const moment = require("moment");

const hasOnline = async (req, res, next) => {
  try {
    let { user_id } = req;
    //Added handle for testing
    if (!user_id) {
      user_id = req.query.user_id;
    }
    const has_access = await userHasOnline(user_id);
    if (!has_access) return res.sendStatus(412);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { hasOnline, userHasOnline };
