const { writeFileSync } = require("fs");
const sequelizeErd = require("sequelize-erd");

(async function () {
  const db = require("./models").sequelize;
  // Import DB models here

  const svg = await sequelizeErd({ source: db }); // sequelizeErd() returns a Promise
  writeFileSync("./erd.svg", svg);

  // Writes erd.svg to local path with SVG file from your Sequelize models
})();
