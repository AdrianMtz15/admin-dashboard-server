const { findSingleUserParams } = require("../actions/user");

const isUser = async (req, res, next) => {
  try {
    const { uid } = req;
    let current_user = await findSingleUserParams({ uid });
    if (!current_user || current_user === null) {
      return res.sendStatus(403);
    }
    req.user = current_user;
    req.user_id = current_user.user_id;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { isUser };
