//export const BASE_URL = process.env.BASE_URL
// export const BASE_URL = "https://onswinrest.onswin.com/CashUIMR.svc/api";

// export const BASE_URL = "https://service.kashremit.com/CashUIMR.svc/api";


export const BASE_URL = "https://betadev.kashremit.com/CashUIMR.svc/api";

export const IPIFY = "https://api.ipify.org/?format=json";

/* Capture plus API endpoints */
export const CAPTURE_PLUS_API_KEY = "AR33-CA97-JN78-CB43";
export const CAPTURE_PLUS_INTERACTIVE_API_URL = "https://api.addressy.com/Capture/Interactive/Find/v1.10/json3.ws";
export const CAPTURE_PLUS_RETRIEVE_API_URL = "https://api.addressy.com/Capture/Interactive/Retrieve/v1/json3.ws";

/* Auth APIs  */
export const USER_LOGIN = "/RemitterLogin";
export const ADD_BUSINESS = "/AddBusinesspersonalDetails"
export const GET_BUSINESS = "/GetBusinesspersonalDetails"
export const NOTIFICATION_LIST = "/GetNotificationListInfo";
export const UPDATE_NOTIFICATION = "/UpdateNotification";
export const VALIDATE_PRE_REGISTRATION = "/ValidatePreRegistration";
export const PRE_REGISTRATION = "/RemitterPreRegistration";
export const GENERATE_OTP = "/GenerateOTP";
export const VALIDATE_OTP = "/ValidateOTP";
export const VALIDATE_REFERRAL_CODE = "/ValidateReferCode";
export const FORGOT_PASSWORD = "/ForgotPassword";
export const LOGOUT = "/Logout";
export const CHANGE_PASSWORD = "/ChangePassword";

/* Send Money APIs */
export const GET_COUNTRY_LIST = '/GetCountryList';
export const GET_QUICK_WATCH_LIST = '/GetQuickWatchList';
export const ADD_WATCH_LIST = "/AddWatchList";
export const DELETE_QUICK_WATCH_LIST = '/DeleteWatchList';
export const GET_NATIONALITY_LIST = '/GetNationality';
export const SEND_MONEY_CALCULATE = '/SendMoneyCalculate';
export const GET_TRANSACTION_LIMIT = '/GetTransactionLimit';
export const TRANSFER_TYPE = '/TransferType';
export const CHECK_RATE = '/CheckRate';
export const LIST_BENEFICIARIES = '/GetReceiverInfoList';
export const ADD_BENEFICIARY = '/AddReceiverInfo';
export const UPDATE_BENEFICIARY = '/EditBeneficiary';
export const DELETE_BENEFICIARY = '/DeleteBeneficiary';
export const REMITTER_POST_REGISTRATION = '/RemitterPostRegistration';
export const UPDATE_REMITTER_POST_REGISTRATION = '/UpdatePostRegistration';
export const UPDATE_REMITTER_PROFILE = '/UpdateRemitterProfile';
export const REMITTER_UPGRADE = '/RemitterUpgrade';
export const GET_TRANSFER_TYPE_FIELD = '/GetTransferTypeField';
export const GET_REMITTER_PROFILE = '/GetRemitterProfile';
export const GET_DOCUMENT = '/GetDocument';
export const DOWNLOAD_DOCUMENT = '/DownloadDocument';
export const VALIDATE_SEND_MONEY = '/ValidateSendMoney';
export const GET_WALLET_BALANCE = '/GetWalletBalance';
export const GET_WALLET_TRANSFER = '/WalletTransfer';
export const WALLET_WITHDRAWAL = "/WalletWithdrawal";
export const GET_BRANCH_DETAILS = '/GetBranchDetails';
export const GET_SESSION_CODE = '/GetCurrentCorridor';
export const KEEP_SESSION_ALIVE = "/KeepSessionAlive";
export const GET_GDPR = "/GetGDPR";
export const GET_DOCUMENT_LIST = "/GetDocumentList";
export const GET_TRANSFER_TYPES = "/TransferType";
export const GET_AGENT_DETAILS = "/GetAgentDetails";
export const GET_SERVICE_PROVIDER = "/GetTransferTypeField";

/* Payment APIs */
export const VALIDATE_PROMO_CODE = '/GetPromoCode';
export const INIT_TRANSACTION = '/InitTransaction';
export const GENERATE_PAYMENT_GATEWAY_URL = '/GeneratePaymentGatewayURL';
export const GET_CARD_DETAILS = '/GetCardDetails';
export const CONFIRM_TRANSACTION = '/ConformTransaction';
export const REMOVE_CARD = '/RemoveCard';


/* Transaction Preferences APIs */
export const ADD_TRANSACTION_PREFERENCE = '/AddPreferCountry';
export const GET_TRANSACTION_PREFERENCES = '/ViewPreferCountry';
export const UPDATE_TRANSACTION_PREFERENCE = '/EditPreferCountry';


/* Personal details meta */
export const GET_OCCUPATION = '/GetOccupation';
export const GET_INDUSTRY = '/GetIndustry';
export const GET_POT = '/GetPurposeOfTransaction';
export const GET_ANNUAL_INCOME = '/GetAnnualIncome';
export const GET_SOI = '/GetSOI';

/* Receiver list */
export const GET_RECEIVER_INFO_LIST = '/GetReceiverInfoList';

/* Dashboard APIs */
export const GET_DASHBOARD_DETAILS = '/GetDashboardDetails';
export const GET_TRANSACTION_DETAILS = '/GetTransactionDetails';
export const GET_REFER_DETAILS = '/GetReferDetails';
export const GET_REFERRAL_CODE = '/GetReferralCode';

/* Other Public APIs */
export const CONTACT_US = '/ContactUs';

/* Airtime top up */
export const GET_OPERATORS = '/GetOperators';
export const GET_PRODUCTS = '/GetProducts';
export const MOBILE_NUMBER_LOOKUP = "/MobileNumberLookUp";

/*Unsubscribe */
export const UNSUBSCRIBE = "/UnSubscribeConsent"