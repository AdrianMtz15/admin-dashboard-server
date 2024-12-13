const admin = require("firebase-admin");
const { findSingleUserParams } = require("../actions/user");

const userData = async (req, res, next) => {
  try {
    const token = req.headers?.authorization;
    if (token) {
      let uid = "";
      if (String(token).length > 15) {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.uid = decodedToken.uid;
      } else {
        req.uid = token;
      }
      uid = req.uid;
      
      let current_user = await findSingleUserParams({ uid });
      req.user = current_user;
      req.role = current_user?.staff?.role;
      req.staff = current_user?.staff;
      req.user_id = current_user?.user_id;
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  userData,
};
