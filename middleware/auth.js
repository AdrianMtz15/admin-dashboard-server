const admin = require("firebase-admin");
const { staff } = require("../models");
const { USER_NOT_FOUND } = require("../constants");
const { findSingleUserParams } = require("../actions/user");

const fbAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (token && token !== null && token !== "undefined") {
      if (String(token).length > 15) {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.uid = decodedToken.uid;
      } else {
        req.uid = token;
      }
      return next();
    }
    res.status(401).send({ message: USER_NOT_FOUND });
  } catch (e) {
    if (!e.code) {
      next(e);
    } else {
      res.status(401).send(e);
    }
  }
};

const token = async (req, res, next) => {
  if (req.headers.authorization) {
    return next();
  }
  return res.status(400).send("La solicitud no incluye un token");
};

const userAuth = async (req, res, next) => {
  try {
    const { uid } = req;
    let current_user = await findSingleUserParams({ uid });
    if (!current_user || current_user === null) {
      return res.sendStatus(403);
    }
    req.user = current_user;
    req.role = current_user?.staff?.role;
    req.staff = current_user?.staff;
    req.user_id = current_user?.user_id;
    next();
  } catch (error) {
    next(error);
  }
};

const staffAuth = async (req, res, next) => {
  try {
    next();
    // const { user_id } = req;
    // let current_staff = await staff.findOne({
    //   where: {
    //     user_id,
    //   },
    // });
    // if (!current_staff) return res.sendStatus(403);
    // current_staff = current_staff.toJSON();
    // req.staff_id = staff_id;
    // req.role = current_staff.role;
  } catch (error) {
    next(error);
  }
};

const authRoute = [token, fbAuth, userAuth];

const staffRoute = [
  authRoute, //,staffAuth
];

module.exports = {
  token,
  fbAuth,
  authRoute,
  staffRoute,
};
