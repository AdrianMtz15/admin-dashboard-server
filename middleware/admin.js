const { staff, user, instructor } = require("../models");
const admin = require("firebase-admin");
const { USER_NOT_FOUND } = require("../constants");

const userAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization;
      const decodedToken = await admin.auth().verifyIdToken(token);
      if (decodedToken) {
        req.uid = decodedToken.uid;
      }
      let current_user = await staff.findOne({
        include: {
          model: user,
          required: true,
          where: {
            uid: decodedToken.uid,
          },
        },
      });
      if (current_user === null) {
        return res.status(401).send({ message: USER_NOT_FOUND });
      }

      current_user = current_user.toJSON();
      req.user_id = current_user.user_id;
      req.role = current_user.role;
      req.staff = current_user;
    }
    next();
  } catch (e) {
    if (!e.code) {
      next(e);
    } else {
      res.status(401).send(e);
    }
  }
};

const isSuperAdmin = async (req, res, next) => {
  try {
    if (!["super_admin"].includes(req.role)) {
      return res.sendStatus(403);
    }
    next();
  } catch (error) {
    next(error);
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (!["super_admin", "admin"].includes(req.role)) {
      return res.sendStatus(403);
    }
    next();
  } catch (error) {
    next(error);
  }
};

const isManager = async (req, res, next) => {
  try {
    next();
    // if (!["super_admin", "admin", "manager"].includes(req.role)) {
    //   return res.sendStatus(403);
    // }
    // next();
  } catch (error) {
    next(error);
  }
};

const isCoach = async (req, res, next) => {
  try {
    if (!["super_admin", "admin", "manager", "coach"].includes(req.role)) {
      return res.sendStatus(403);
    }
    let current_instructor = await instructor.findOne({
      where: {
        user_id: req.user_id,
      },
    });
    if (current_instructor !== null) {
      current_instructor = current_instructor.toJSON();
      req.instructor_id = current_instructor.instructor_id;
      req.instructor = current_instructor;
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { userAuth, isAdmin, isCoach, isManager, isSuperAdmin };
