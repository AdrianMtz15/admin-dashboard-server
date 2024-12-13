const { castInt } = require("../constants");
const { file, product } = require("../models");

const findProductById = async (product_id) => {
  const current_package = await product.findOne({
    where: {
      product_id,
    },
    include: [
      {
        model: file,
        as: "image",
        required: false,
      },
      {
        model: file,
        as: "receipt_file",
        required: false,
      },
    ],
  });
  if (current_package === null) return null;
  return current_package.toJSON();
};

const findProductByParams = async (params={}) => {
  const current_product = await product.findOne({
    where: params,
    include: [
      {
        model: file,
        as: "image",
        required: false,
      },
      {
        model: file,
        as: "receipt_file",
        required: false,
      },
    ],
  });
  if (current_product === null) return null;
  return current_product.toJSON();
};

// const createProductFromData = async (data) => {
//   delete data.product_id;
//   const current_package = await product.create(data);
//   return findProductById(current_package.product_id);
// };

const updateProductFromData = async (data) => {
  data.sale_price = castInt(data.sale_price);
  data.user_limit = castInt(data.user_limit);
  data.limit_per_user = castInt(data.limit_per_user);
  await product.update(data, {
    where: {
      product_id: data.product_id,
    },
  });
  return findProductById(data.product_id);
};

module.exports = {
  findProductById,
  findProductByParams,
  // createProductFromData,
  updateProductFromData,
};
