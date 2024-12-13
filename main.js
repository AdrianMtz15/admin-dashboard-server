const { sequelize } = require("./models");

async function start() {
  try {
    await sequelize.sync({alter: true});
    console.log("DB altered");
  }
  catch (err) {
    console.log(err);
  }
}

start();
