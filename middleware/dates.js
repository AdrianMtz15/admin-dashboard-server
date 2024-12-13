const moment = require("moment");

const formatDate = (date_time) => {
  return moment(date_time, "YYYY-MM-DD HH:mm:ss")
    .utc(true)
    .format("YYYY-MM-DD");
};

const formatDateTime = (date_time) => {
  return moment(date_time, "YYYY-MM-DD HH:mm:ss")
    .utc(true)
    .format("YYYY-MM-DD HH:mm:ssZ");
};

const getDateTime = (date_time) => {
  return moment.utc(date_time, "YYYY-MM-DD HH:mm:ss").local();
};

module.exports = { formatDate, formatDateTime, getDateTime };