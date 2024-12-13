const SibApiV3Sdk = require("sib-api-v3-sdk");
const { findAppConfigByKey } = require("../actions/appconfig");
let defaultClient = SibApiV3Sdk.ApiClient.instance;


let apiKey = defaultClient.authentications["api-key"];
let FROM_ADDRESS = "";
let FROM_NAME = "";

(async () => {
  const brevoApiKey = await findAppConfigByKey('brevo_api_key');
  const fromAddress = await findAppConfigByKey('email_from_address');
  const fromName = await findAppConfigByKey('email_from_name');

  FROM_ADDRESS = fromAddress.value;
  FROM_NAME = fromName.value;
  apiKey.apiKey = brevoApiKey.value;
})();


let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendTemplateEmail = async (staff, templateId, params, options) => {
  if (typeof options !== "object") options = [];
  return apiInstance
    .sendTransacEmail({
      params,
      sender: {
        email: FROM_ADDRESS,
        name: FROM_NAME,
      },
      templateId,
      to: [staff],
      ...options,
    })
    .catch((error) => {
      throw error;
    });
};

const SignUpEmail = (user_name) => ({
  templateId: 1,
  params: {
    user_name,
  },
});

const PurchaseSuccess = ({
  date,
  status,
  amount,
  purchase_id,
  product_name,
}) => ({
  templateId: 2,
  params: {
    date,
    status,
    amount,
    purchase_id,
    product_name,
  },
});

const PurchaseError = ({
  date,
  status,
  amount,
  purchase_id,
  product_name,
}) => ({
  templateId: 3,
  params: {
    date,
    status,
    amount,
    purchase_id,
    product_name,
  },
});

const AdminPurchase = ({
  date,
  status,
  amount,
  user_id,
  purchase_id,
  user_name,
  user_email,
  product_name,
}) => ({
  templateId: 4,
  params: {
    date,
    status,
    amount,
    user_id,
    purchase_id,
    user_name,
    user_email,
    product_name,
  },
});


const RateOnlineClass = ({ class_name, coach_name, video_id }) => ({
  templateId: 9,
  params: {
    video_id,
    class_name,
    coach_name,
  },
});

const RateOnsiteClass = ({ class_name, coach_name, ticket_id }) => ({
  templateId: 10,
  params: {
    class_name,
    coach_name,
    ticket_id,
  },
});

const NewVideoNotification = ({ class_name, coach_name }) => ({
  templateId: 12,
  params: {
    class_name,
    coach_name,
  },
});

const AbandonedCart = ({ product_id, product_name }) => ({
  templateId: 14,
  params: {
    product_id,
    product_name,
  },
});

const UpcomingRenewal = (product_name, days_due) => ({
  templateId: 17,
  params: {
    product_name,
    days_due
  }
})


module.exports = {
  SignUpEmail,
  AbandonedCart,
  AdminPurchase,
  PurchaseError,
  RateOnlineClass,
  RateOnsiteClass,
  PurchaseSuccess,
  UpcomingRenewal,
  sendTemplateEmail,
  NewVideoNotification,
};
