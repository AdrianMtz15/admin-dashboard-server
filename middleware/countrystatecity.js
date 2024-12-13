const axios = require("axios");

const findAllCountries = async () => {
  const reponse = await axios.get(
    "https://api.countrystatecity.in/v1/countries",
    {
      headers: {
        "X-CSCAPI-KEY": process.env.COUNTRIES_STATES_CITIES_API_KEY,
      },
    }
  );
  return reponse.data;
};

const findStatesByCountry = async (countryCode) => {
  const reponse = await axios.get(
    `https://api.countrystatecity.in/v1/countries/${countryCode}/states`,
    {
      headers: {
        "X-CSCAPI-KEY": process.env.COUNTRIES_STATES_CITIES_API_KEY,
      },
    }
  );
  return reponse.data;
};

const findCitiesByState = async (countryCode, stateCode) => {
  const reponse = await axios.get(
    `https://api.countrystatecity.in/v1/countries/${countryCode}/states/${stateCode}/cities`,
    {
      headers: {
        "X-CSCAPI-KEY": process.env.COUNTRIES_STATES_CITIES_API_KEY,
      },
    }
  );
  return reponse.data;
};

module.exports = { findAllCountries, findStatesByCountry, findCitiesByState };
