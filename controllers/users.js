const {
  user,
  file,
  product,
} = require("../models");
const admin = require("firebase-admin");
const { signUpBonus } = require("../functions/user");

const {
  deleteUserById,
  findUsersQuery,
  findUserByEmail,
  createUserFromData,
  updateUserFromData,
  findSingleUserParams,
} = require("../actions/user");
const { Op } = require("sequelize");

const getResetPasswordLink = async (req, res, next) => {
  try {
    const { email } = req.body;
    const link = await admin.auth().generatePasswordResetLink(email);
    res.status(200).send({ link });
  } catch (error) {
    next(error);
  }
};

const getUserByPhone = async (req, res, next) => {
  try {
    const { phone } = req.query;
    const current_user = await findSingleUserParams({ phone });
    res.status(200).send({ user: current_user });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { page, query } = req.query;
    const users = await findUsersQuery(query, page);
    res.status(200).send({ users });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const { user_id } = req;
    let current_user = await user.findOne({
      where: {
        user_id,
      },
      include: [ ],
    });
    if (current_user === null) {
      return res.sendStatus(404);
    }
    current_user = current_user.toJSON();
  
    const promises = [];
    promises.push(
      new Promise((resolve, reject) => {
        admin
          .auth()
          .getUser(current_user.uid)
          .then((userRecord) => {
            current_user.emailVerified = userRecord.emailVerified;
            resolve();
          })
          .catch(reject);
      })
    );

    await Promise.all(promises);
    res.status(200).send({ user: current_user });
  } catch (error) {
    console.log(error.message);

    next(error);
  }
};

const getUsersByQuery = async (req, res, next) => {
  try {
    const { query } = req.query;
    const users = await findUsersQuery(query, 1);
    res.status(200).send({ users });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    let current_user = await user.findOne({
      where: {
        user_id,
      },
      include: [
        file,
        {
          model: ticket,
          include: [
            event,
            {
              model: user,
              as: "participant",
            },
          ],
        },
        {
          model: purchase,
          include: [product, discount, payment_method],
        },
        {
          model: sponsor,
          as: "user_sponsors",
          include: [sponsor_credit],
        },
      ],
    });
    if (!current_user || current_user === null) {
      return res.sendStatus(404);
    }
    res.status(200).send({ user: current_user });
  } catch (error) {
    next(error);
  }
};

const getAvailableUsername = async (req, res, next) => {
  try {
    const query = req.query?.username;
    const users = await findSingleUserParams({
      username: {
        [Op.like]: `%${query}%`,
      },
    });

    if (Array.isArray(users) && users.length > 0) {
      return res.status(200).send({ isAvailable: false });
    }

    return res.status(200).send({ isAvailable: true });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const data = req.body;
    delete data.user_id;
    if (data.phone && data.phone !== null) {
      let current = await findSingleUserParams({ phone: data.phone });
      if (current !== null) {
        return res.status(409).send({
          message:
            "Lo sentimos, ya existe un usuario con ese número de teléfono.",
        });
      }
    }
    if (data.email && data.email !== null && data.email !== "") {
      data.email = String(data.email).toLowerCase().trim();
      let current = await findUserByEmail(data.email);
      if (current !== null) {
        return res.status(409).send({
          message:
            "Lo sentimos, ya existe un usuario con ese correo electrónico.",
        });
      }
      if (!data.uid || data.uid === null) {
        try {
          const userExists = await admin.auth().getUserByEmail(data.email);
          if (userExists && userExists !== null) {
            return res.status(409).send({
              message:
                "Lo sentimos, ya existe un usuario con ese correo electrónico.",
            });
          }
        } catch (error) {
          if (error.code !== "auth/staff-not-found") {
            throw error;
          }
        }
        const firebaseUser = await admin
          .auth()
          .createUser({ email: data.email });
        data.uid = firebaseUser.uid;
      }
    }

    const current_user = await createUserFromData(data);
    const { user_id } = current_user;
    if (!data.address_id || data.address_id === null) {
      const { address_id } = await createAddressFromData({ user_id });
      await updateUserFromData({ user_id, address_id });
    }
    signUpBonus(current_user.user_id);
    res.status(200).send({ user: current_user });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const data = req.body;
    const { address } = data;
    if (address && address !== null) {
      if (!isNaN(parseInt(address.address_id))) {
        data.address_id = parseInt(address.address_id);
        await updateAddressById(parseInt(address.address_id), address);
      } else {
        const addressData = await createAddressFromData({ ...address });
        data.address_id = addressData.address_id;
      }
    }
    const user = await updateUserFromData(data);
    res.status(200).send({ user });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const user = await deleteUserById(user_id);
    res.status(200).send({ user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserById,
  getUserByPhone,
  getCurrentUser,
  getUsersByQuery,
  getResetPasswordLink,
  getAvailableUsername,
};
