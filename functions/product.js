const { Op } = require("sequelize");
const { 
  rent,
  rent_product
} = require("../models");
const moment = require("moment-timezone");

const getProductAvailability = async (productData, event_date) => {
  const product_id = productData.product_id;
  let rents = await rent.findAll({
    where: {
      status: {
        [Op.like]: "Rentado",
      },
    },
    include: [
      {
        model: rent_product,
        where: { product_id },
        required: true,
      },
    ],
  });

  let amount_rented = 0;

  
  if (rents) {

    rents.map((rent) => {
      rent = rent.toJSON();
      
      const rent_date = moment(rent.event_date);
      const isSameDate = moment(event_date).isSame(rent_date, "day");
      
      if (isSameDate) {
        amount_rented += rent.rent_products[0].qty;
      }
    });
  }

  
  const stock = productData.stock;
  const available_stock = stock - amount_rented;
  return available_stock;  
}



module.exports = { 
  getProductAvailability
};
