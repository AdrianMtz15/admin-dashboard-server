const { appconfig, sequelize } = require("../models");
const { Op } = require("sequelize");


const findAppConfigByKey = async (key) => {
  const configValue = await appconfig.findOne({
    where: {
      key,
    },
  });
  if (configValue === null) return configValue;
  return configValue.toJSON();
};

const findAwsKeys = async () => {
  const bucketData = await findAppConfigByKey('aws_bucket_name');
  const regionData = await findAppConfigByKey('aws_bucket_region');
  const accessKeyData = await findAppConfigByKey('aws_access_key');
  const secretKeyData = await findAppConfigByKey('aws_secret_key');

  return {
    bucketName: bucketData.value,
    region: regionData.value,
    accessKeyId: accessKeyData.value,
    secretAccessKey: secretKeyData.value,
  }
}

const findPublicAppConfig = async () => {
  const data = await appconfig.findAll({
    where: {
      public: true
    }
  });

  return data;

}

const findAdminAppConfig = async () => {
  const data = await appconfig.findAll();
  return data;
}

const updateAppConfigKey = async (keyData, public) => {
  const { value, key } = keyData;

  const params = {
    id: {
      [Op.gt]: 0,
    },
    key,
  }

  if(public) params.public = true;

  await appconfig.update(
    { value },
    { where: params }
  );
}

module.exports = { 
  findPublicAppConfig,
  findAdminAppConfig,
  findAppConfigByKey,
  findAwsKeys,
  updateAppConfigKey
};
