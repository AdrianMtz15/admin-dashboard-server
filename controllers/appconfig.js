const { findPublicAppConfig, findAdminAppConfig } = require("../actions/appconfig");
const { updateAppConfigKeys } = require("../functions/appconfig");
const { appconfig } = require("../models");

const getAppConfig = async (req, res, next) => {
  try {
    const data = await findPublicAppConfig();
    res.status(200).send({ config: data });
  } catch (error) {
    next(error);
  }
};

const getAdminAppConfig = async (req, res, next) => {
  try {
    const data = await findAdminAppConfig();
    res.status(200).send({ config: data });
  } catch (error) {
    next(error);
  }
}

const updateAppConfig = async (req, res, next) => {
  try {
    const data = req.body;
    const public = req.role === 'super_admin' ? false : true;

    await updateAppConfigKeys(data, public);

    const config = await appconfig.findAll();
    res.status(200).send({ config });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getAppConfig,
  getAdminAppConfig,
  updateAppConfig
};
