const { updateAppConfigKey } = require("../actions/appconfig");

const updateAppConfigKeys = async (data, public) => {
  const promises = [];

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];

      promises.push(
        new Promise(async (resolve, reject) => {
          try {
            await updateAppConfigKey({ value, key }, public);

            resolve();
          } catch (error) {
            reject(error)
          }
        })
      );
    }
  }

  await Promise.all(promises);

}

module.exports = {
  updateAppConfigKeys,
}