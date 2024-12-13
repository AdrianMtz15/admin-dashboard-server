const { staff } = require("../models");

const staffRole = async (req, res, next) => {
  try {
    const { staff_id } = req;
    let current_staff = await staff.findOne({
      where: {
        staff_id,
      },
    });
    if (!current_staff) return res.sendStatus(403);
    current_staff = current_staff.toJSON();
    req.staff_id = staff_id;
    req.role = current_staff.role;
  } catch (error) {
    next(error);
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (req.role !== "admin") {
      return res.sendStatus(403);
    }
    next();
  } catch (e) {
    next(e);
  }
};

const isManager = async (req, res, next) => {
  try {
    if (["admin", "manager"].includes(req.role)) {
      return res.sendStatus(403);
    }
    next();
  } catch (e) {
    next(e);
  }
};

module.exports = { staffRole, isAdmin, isManager };
