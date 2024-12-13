const { Op } = require("sequelize");
const { PAGE_SIZE } = require("../constants");
const { file, user, staff, address } = require("../models");

const user_includes = [

];

const findUserById = async (user_id) => {
  const current_user = await user.findOne({
    where: {
      user_id,
    },
    include: user_includes
  });
  if (current_user === null) return current_user;
  return current_user.toJSON();
};

const findAllUsers = async () => {
  const users = await user.findAll({
    include: user_includes
  });
  return users.map((current) => current.toJSON());
};

const findUsersQuery = async (query, page) => {
  let params = {};
  if (isNaN(page)) page = 1;
  const limit = PAGE_SIZE;
  const offset = (page - 1) * PAGE_SIZE;
  if (query && query !== null && query !== "" && query !== "undefined") {
    params = {
      [Op.or]: [
        {
          email: {
            [Op.like]: `%${query}%`,
          },
        },
        {
          name: {
            [Op.like]: `%${query}%`,
          },
        },
        {
          last_name: {
            [Op.like]: `%${query}%`,
          },
        },
      ],
    };
  }
  const users = await user.findAll({
    order: [["name", "ASC"]],
    where: params,
    include: user_includes,
    offset,
    limit,
  });

  return users.map((current) => current.toJSON());
};

const findSingleUserParams = async (params) => {
  const current = await user.findOne({
    where: params,
    include: user_includes
  });
  if (current === null) return current;
  return current.toJSON();
};

const findUsersParams = async (params) => {
  const users = await user.findAll({
    where: params,
    include: user_includes
  });
  return users.map((current) => current.toJSON());
};

const findUserByEmail = async (email) => {
  const current_user = await user.findOne({
    where: {
      email: {
        [Op.like]: `%${email}%`,
      },
    },
    include: user_includes
  });
  if (current_user === null) return current_user;
  return current_user.toJSON();
};

const createUserFromData = async (data) => {
  delete data.user_id;
  const current_user = await user.create(data);
  return current_user;
};

const updateUserFromData = async (data) => {
  const { user_id } = data;
  await user.update(data, { where: { user_id } });
  return findUserById(user_id);
};

const deleteUserById = async (user_id) => {
  const current_user = await findUserById(user_id);
  await user.destroy({
    where: {
      user_id,
    },
  });
  return current_user;
};

module.exports = {
  findUserById,
  findAllUsers,
  findUsersQuery,
  deleteUserById,
  findUsersParams,
  findUserByEmail,
  updateUserFromData,
  createUserFromData,
  findSingleUserParams,
};
