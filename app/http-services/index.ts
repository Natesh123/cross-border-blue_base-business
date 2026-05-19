import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import apiClient, { genericErrorHandler, setClientToken } from "../http-helpers";
import { Authenticate } from "./models/request/authenticate";



const getTokenAndRemitter = async () => {
  try {
    const userData = await AsyncStorage.getItem("user");
    if (!userData) return { tokenId: null, remitterId: null, Email: null };

    const parsed = JSON.parse(userData);
    return {
      tokenId: parsed?.TokenID || parsed?.tokenId || null,
      remitterId: parsed?.RemitterID || parsed?.remitterId || null,
      Email: parsed?.Email || parsed?.email || null
    };
  } catch (error) {
    console.error("Error fetching token/remitter:", error);
    return { tokenId: null, remitterId: null, Email: null };
  }
};

export const getUserData = async () => {
  try {
    const user = await AsyncStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export const authenticate = async (user: Authenticate) => {
  try {
    const postData = getRequest("RemitterLogin", user);
    const response = await apiClient.post("api/RemitterLogin", postData);

    if (response?.data?.StatusCode === "ER0000") {
      await AsyncStorage.setItem("user", JSON.stringify(response.data));

      const storedUser = await getUserData();
      console.log("✅ User fetched after login:", storedUser);

      return storedUser;
    } else {
      console.warn("❌ Login failed:", response?.data?.StatusMsg);
      return null;
    }
  } catch (error) {
    console.error("🚨 Error in authenticate:", error);
    throw error;
  }
};

export const ValidatePreRegistration = async (req: any) => {
  const postData = getRequest('ValidatePreRegistration', req)
  return await apiClient.post('api/ValidatePreRegistration', postData)
};

export const AddBusinesspersonalDetails = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };
  const postData = getRequest('AddBusinesspersonalDetails', request)
  return await apiClient.post('api/AddBusinesspersonalDetails', postData)
};

export const GetBusinesspersonalDetails = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };
  const postData = getRequest('GetBusinesspersonalDetails', request)
  return await apiClient.post('api/GetBusinesspersonalDetails', postData)
};



export const RemitterPreRegistration = async (req: any) => {

  const postData = getRequest('RemitterPreRegistration', req)
  return await apiClient.post('api/RemitterPreRegistration', postData)
};

export const ValidateOTP = async (req: any) => {
  const postData = getRequest('ValidateOTP', req)
  return await apiClient.post('api/ValidateOTP', postData)
};

export const AddPreferCountry = async (req: any) => {
  const postData = getRequest('AddPreferCountry', req)
  return await apiClient.post('api/AddPreferCountry', postData)
};

export const UpdateRemitterProfile = async (req: any) => {
  const postData = getRequest('UpdateRemitterProfile', req)
  return await apiClient.post('api/UpdateRemitterProfile', postData)
};

export const RemitterUpgrade = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };
  const postData = getRequest('RemitterUpgrade', request)
  return await apiClient.post('api/RemitterUpgrade', postData)
};

export const WalletTransfer = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };
  const postData = getRequest('WalletTransfer', request)
  return await apiClient.post('api/WalletTransfer', postData)
};

export const WalletWithdrawal = async (req: any) => {
  const { tokenId, remitterId, Email } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId, Email };
  const postData = getRequest('WalletWithdrawal', request)
  return await apiClient.post('api/WalletWithdrawal', postData)
};

export const MobileNumberLookUp = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };
  const postData = getRequest('MobileNumberLookUp', request)
  return await apiClient.post('api/MobileNumberLookUp', postData)
};






export const EditPreferCountry = async (req: any) => {
  const postData = getRequest('EditPreferCountry', req)
  return await apiClient.post('api/EditPreferCountry', postData)
};


export const RemitterPostRegistration = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };
  const postData = getRequest('RemitterPostRegistration', request)
  return await apiClient.post('api/RemitterPostRegistration', postData)
};

export const AddReceiverInfo = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };
  const postData = getRequest('AddReceiverInfo', request)
  return await apiClient.post('api/AddReceiverInfo', postData)
};

export const EditBeneficiary = async (req: any) => {

  const { tokenId, remitterId } = await getTokenAndRemitter();

  const toCountry = await AsyncStorage.getItem('selectedRecipientCurrency');
  const ChannelTransferType = await AsyncStorage.getItem('ChannelTransferType');
  const bankData = await AsyncStorage.getItem("bankObject");
  const bankObject = bankData ? JSON.parse(bankData) : null;

  const request = {
    ...req,
    tokenId,
    remitterId,
    toCountry: toCountry,
    ChannelTransferType: ChannelTransferType,
    BankName: bankObject?.BankName || "",
    BankCode: bankObject?.BankCode || ""

  };


  const postData = getRequest('EditBeneficiary', request)
  return await apiClient.post('api/EditBeneficiary', postData)
};
export const DeleteBeneficiary = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };
  const postData = getRequest('DeleteBeneficiary', request)
  return await apiClient.post('api/DeleteBeneficiary', postData)
};
export const GetAgentDetails = async (req: any) => {
  const postData = getRequest('GetAgentDetails', req)
  return await apiClient.post('api/GetAgentDetails', postData)
};


export const authenticateBiometrics = async (user: any) => {
  return await apiClient.post('api/company/customers/passKeylogin', user)
};

export const authenticateMpin = async (user: any) => {
  return await apiClient.post('api/company/customers/mpinlogin', user)
};





export const GetReferDetails = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = typeof req === 'object' ? { tokenId, remitterId, ...req } : { tokenId: req || tokenId, remitterId };
  const postData = getRequest('GetReferDetails', request)
  return await apiClient.post('api/GetReferDetails', postData)
};


export const GetReferralCode = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };
  const postData = getRequest('GetReferralCode', request)
  return await apiClient.post('api/GetReferralCode', postData)
};



export const GetOccupation = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };
  const postData = getRequest('GetOccupation', request)
  return await apiClient.post('api/GetOccupation', postData)
};

export const GetIndustry = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };
  const postData = getRequest('GetIndustry', request)
  return await apiClient.post('api/GetIndustry', postData)
};

export const GetAnnualIncome = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };
  const postData = getRequest('GetAnnualIncome', request)
  return await apiClient.post('api/GetAnnualIncome', postData)
};

export const GetPurposeOfTransaction = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };
  const postData = getRequest('GetPurposeOfTransaction', request)
  return await apiClient.post('api/GetPurposeOfTransaction', postData)
};





export const GetDashboardDetails = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = typeof req === 'object' ? { tokenId, remitterId, ...req } : { tokenId: req || tokenId, remitterId };
  const postData = getRequest('GetDashboardDetails', request)
  return await apiClient.post('api/GetDashboardDetails', postData)
};



export const GetSOI = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId, SOI: null };
  const postData = getRequest('GetSOI', request)
  return await apiClient.post('api/GetSOI', postData)
};

export const GetWalletBalance = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = typeof req === 'object' ? { tokenId, remitterId, ...req } : { tokenId: req || tokenId, remitterId };
  const postData = getRequest('GetWalletBalance', request)
  return await apiClient.post('api/GetWalletBalance', postData)
};



export const GetCardDetails = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };
  const postData = getRequest('GetCardDetails', request)
  return await apiClient.post('api/GetCardDetails', postData)
};
export const GetTransactionDetails = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };
  const postData = getRequest('GetTransactionDetails', request)
  return await apiClient.post('api/GetTransactionDetails', postData)
};

export const GetReceiverInfoList = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };
  const postData = getRequest('GetReceiverInfoList', request)
  return await apiClient.post('api/GetReceiverInfoList', postData)
};


export const GetReceiverInfoLists = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };
  const postData = getRequest('GetReceiverInfoLists', request)
  return await apiClient.post('api/GetReceiverInfoList', postData)
};

export const GetGDPR = async (req: any) => {
  // const request = {
  //   tokenId: tokenId,
  //   remitterId: remitterId,
  //   mode: "GET",
  //   pageName: "SendMoney"
  // }
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId, mode: "GET", pageName: "SendMoney" };
  const postData = getRequest('GetGDPR', request)
  return await apiClient.post('api/GetGDPR', postData)
};

export const GetDocument = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };
  const postData = getRequest('GetDocument', request)
  return await apiClient.post('api/GetDocument', postData)
};

export const GetDocumentList = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };
  const postData = getRequest('GetDocumentList', request)
  return await apiClient.post('api/GetDocumentList', postData)
};



export const ViewPreferCountry = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };
  const postData = getRequest('ViewPreferCountry', request)
  return await apiClient.post('api/ViewPreferCountry', postData)
};


export const GetCountryList = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };

  const postData = getRequest('GetCountryList', request)
  return await apiClient.post('api/GetCountryList', postData)
};

export const GetCountryLists = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };

  const postData = getRequest('GetCountryList', request)
  return await apiClient.post('api/GetCountryList', postData)
};


export const GetNationality = async (req: any) => {

  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId, nationality: '' };

  const postData = getRequest('GetNationality', request)
  return await apiClient.post('api/GetNationality', postData)
};

export const GetPromoCode = async (req: any) => {

  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };

  const postData = getRequest('GetPromoCode', request)
  return await apiClient.post('api/GetPromoCode', postData)
};

export const GetRemitterProfile = async (req: any) => {
  // const request = {
  //   tokenId: tokenId,
  //   remitterId: remitterId,
  //   nationality: ''
  // }

  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId, nationality: '' };
  const postData = getRequest('GetRemitterProfile', request)
  return await apiClient.post('api/GetRemitterProfile', postData)
};

// export const GetTransactionLimit = async (req: {
//   tokenId: string;
//   remitterId: string;
//   fromcountry: string;
//   tocountry: string;
//   SendAmount: number;
// }) => {
//   const postData = getRequest('GetTransactionLimit', req); // ✅ send full request object
//   return await apiClient.post('api/GetTransactionLimit', postData);
// };

export const GetTransactionLimit = async (req: {
  fromcountry: string;
  tocountry: string;
  SendAmount: number;
}) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const postData = getRequest('GetTransactionLimit', { ...req, tokenId, remitterId });

  return await apiClient.post('api/GetTransactionLimit', postData);
};


export const GetNotificationListInfo = async (req: any) => {


  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId, nationality: '' };
  const postData = getRequest('GetNotificationListInfo', request)
  console.log("Before API CALL, AUTH = ", apiClient.defaults.headers.Authorization);
  return await apiClient.post('api/GetNotificationListInfo', postData)
};

export const UpdateNotification = async (req: any) => {


  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId, nationality: '' };
  const postData = getRequest('UpdateNotification', request)
  return await apiClient.post('api/UpdateNotification', postData)
};

export const GetOperators = async (req: any) => {


  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId, nationality: '' };
  const postData = getRequest('GetOperators', request)
  return await apiClient.post('api/GetOperators', postData)
};

export const GetQuickWatchList = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };
  const postData = getRequest('GetQuickWatchList', request)
  return await apiClient.post('api/GetQuickWatchList', postData)
};



export const AddWatchList = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };
  const postData = getRequest('AddWatchList', request)
  return await apiClient.post('api/AddWatchList', postData)
};

export const UpdateWatchList = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };
  const postData = getRequest('UpdateWatchList', request)
  return await apiClient.post('api/UpdateWatchList', postData)
};







export const DeleteWatchList = async (req: any) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId };
  const postData = getRequest('DeleteWatchList', request)
  return await apiClient.post('api/DeleteWatchList', postData)
};






export const GetProducts = async (req: any) => {

  const { tokenId, remitterId } = await getTokenAndRemitter();
  const request = { ...req, tokenId, remitterId, nationality: '' };
  const postData = getRequest('GetProducts', request)
  return await apiClient.post('api/GetProducts', postData)
};


export const GetTransactionLimits = async (req: {

  fromcountry: string;
  tocountry: string;
  SendAmount: number;
}) => {
  const { tokenId, remitterId } = await getTokenAndRemitter();
  const postData = getRequest('GetTransactionLimits', req); // ✅ send full request object
  return await apiClient.post('api/GetTransactionLimit', postData);
};

// export const ValidateSendMoney = async (tokenId: string, remitterId: string) => {
//   try {
//     const toCountry = await AsyncStorage.getItem('selectedRecipientCurrency'); 
//     const sendAmount = await AsyncStorage.getItem('sendAmount');
//     const ReciverAmount = await AsyncStorage.getItem("Amount we'll convert");
//     const ChannelTransferType = await AsyncStorage.getItem('ChannelTransferType');
//     const selectedCountryDisplayValue = await AsyncStorage.getItem('selectedCountryDisplayValue');

//     const request = {
//       tokenId,
//       remitterId,
//       toCountry: toCountry,
//       sendAmount: sendAmount,
//       ChannelTransferType: ChannelTransferType,
//       ReciverAmount: ReciverAmount,

//     };

//     const postData = getRequest('ValidateSendMoney', request);
//     return await apiClient.post('api/ValidateSendMoney', postData);
//   } catch (err) {
//     console.error("Error preparing ValidateSendMoney:", err);
//     throw err;
//   }
// };


export const ValidateSendMoney = async () => {
  try {
    const { tokenId, remitterId } = await getTokenAndRemitter();
    const toCountry = await AsyncStorage.getItem('selectedRecipientCurrency');
    const sendAmount = await AsyncStorage.getItem('sendAmount');
    const ReciverAmount = await AsyncStorage.getItem("Amount we'll convert");
    const ChannelTransferType = await AsyncStorage.getItem('ChannelTransferType');

    const request = {
      tokenId,
      remitterId,
      toCountry,
      sendAmount,
      ReciverAmount,
      ChannelTransferType
    };

    const postData = getRequest('ValidateSendMoney', request);
    return await apiClient.post('api/ValidateSendMoney', postData);
  } catch (err) {
    console.error("Error preparing ValidateSendMoney:", err);
    throw err;
  }
};


export const SendMoneyCalculate = async (amount: number, toCountry?: string, fromCountryCode?: string, reverse?: string) => {
  try {
    const { tokenId, remitterId } = await getTokenAndRemitter();

    // Priority: 1. Argument, 2. AsyncStorage (re-fetched for freshness)
    const finalFrom = fromCountryCode || await AsyncStorage.getItem("selectedCountryDisplayValue") || "GBR";
    const finalTo = toCountry || await AsyncStorage.getItem("selectedRecipientCurrency") || "IND";

    const finalCurrency = await AsyncStorage.getItem("selectedSendCurrency") || "GBP";

    const request = {
      tokenId,
      remitterId,
      toCountry: finalTo,
      sendAmount: amount,
      selectedCountryDisplayValue: finalFrom,
      currency: finalCurrency,
      reverse: reverse || "",
    };

    const postData = getRequest("SendMoneyCalculate", request);
    return await apiClient.post("api/SendMoneyCalculate", postData);
  } catch (err) {
    console.error("Error preparing SendMoneyCalculate:", err);
    throw err;
  }
};




export const SendMoneyCalculates = async (amount: number, toCountry: string, fromCountryCode?: string, reverse?: string) => {
  try {
    const { tokenId, remitterId } = await getTokenAndRemitter();
    const finalFrom = fromCountryCode || await AsyncStorage.getItem("selectedCountryDisplayValue") || "GBR";
    const finalTo = toCountry || await AsyncStorage.getItem("selectedRecipientCurrency") || "IND";
    const finalCurrency = await AsyncStorage.getItem("selectedSendCurrency") || "GBP";

    const request = {
      tokenId,
      remitterId,
      toCountry: finalTo,
      sendAmount: amount,
      selectedCountryDisplayValue: finalFrom,
      currency: finalCurrency,
      reverse: reverse || "",
    };

    const postData = getRequest("SendMoneyCalculates", request);
    return await apiClient.post("api/SendMoneyCalculate", postData);
  } catch (err) {
    console.error("Error preparing SendMoneyCalculates:", err);
    throw err;
  }
};

export const SendMoneyCalculatess = async (amount: number, toCountry: string, fromCountryCode?: string, reverse?: string) => {
  try {
    const { tokenId, remitterId } = await getTokenAndRemitter();
    const finalFrom = fromCountryCode || await AsyncStorage.getItem("selectedCountryDisplayValue") || "GBR";
    const finalTo = toCountry || await AsyncStorage.getItem("selectedRecipientCurrency") || "IND";
    const finalCurrency = await AsyncStorage.getItem("selectedSendCurrency") || "GBP";

    const request = {
      tokenId,
      remitterId,
      toCountry: finalTo,
      sendAmount: amount,
      selectedCountryDisplayValue: finalFrom,
      currency: finalCurrency,
      reverse: reverse || "",
    };

    const postData = getRequest("SendMoneyCalculatess", request);
    return await apiClient.post("api/SendMoneyCalculate", postData);
  } catch (err) {
    console.error("Error preparing SendMoneyCalculatess:", err);
    throw err;
  }
};



export const InitTransaction = async () => {
  try {
    const { tokenId, remitterId } = await getTokenAndRemitter();
    const toCountry = await AsyncStorage.getItem('selectedRecipientCurrency');
    const AccountName = await AsyncStorage.getItem('Account Name');
    const Mobile = await AsyncStorage.getItem('Mobile');
    const SessionCode = await AsyncStorage.getItem('SessionCode');
    const AccountNumber = await AsyncStorage.getItem('Account Number');
    const Amount = await AsyncStorage.getItem('sendAmount');
    const ChannelTransferType = await AsyncStorage.getItem('ChannelTransferType');
    const IFSC_IBAN = await AsyncStorage.getItem('IFSC Code');
    const selectedCountryDisplayValue = await AsyncStorage.getItem('selectedCountryDisplayValue');
    const BeneficiaryID = await AsyncStorage.getItem('BeneficiaryID');
    const bankData = await AsyncStorage.getItem("bankObject");
    const bankObject = bankData ? JSON.parse(bankData) : null;

    const request = {
      tokenId,
      remitterId,
      toCountry: toCountry,
      AccountName: AccountName,
      AccountNumber: AccountNumber,
      MobileNumber: Mobile,
      BeneficiaryID: BeneficiaryID,
      SessionCode: SessionCode,
      Amount: Amount,
      ChannelTransferType: ChannelTransferType,
      IFSC_IBAN: IFSC_IBAN,
      selectedCountryDisplayValue: selectedCountryDisplayValue,
      BankName: bankObject?.BankName || "",
      BankCode: bankObject?.BankCode || ""
    };

    const postData = getRequest('InitTransaction', request);
    return await apiClient.post('api/InitTransaction', postData);
  } catch (err) {
    console.error("Error preparing InitTransaction:", err);
    throw err;
  }
};

export const InitTransactions = async (requestPayload: any) => {
  try {
    const { tokenId, remitterId } = await getTokenAndRemitter();
    // const selectedRecipient = JSON.parse(localStorage.getItem("selectedRecipient") || "{}");
    // const receiverId = selectedRecipient?.ReceiverID || null;
    const storedRecipient = await AsyncStorage.getItem("selectedRecipient");
    const selectedRecipient = storedRecipient ? JSON.parse(storedRecipient) : {};
    const receiverId = selectedRecipient?.ReceiverID || null;

    const postData = getRequest("InitTransactions", {
      ...requestPayload,
      tokenId,
      remitterId,
    });

    // Set up request body with dynamic amounts
    postData.request = {
      ...(postData.request || {}),
      AccountName: null,
      AccountNumber: null,
      AgentCode: null,
      AgentName: null,
      AirTime: {
        operator_id: requestPayload.operator_id,
        operator_name: requestPayload.operator_name,
        product_id: requestPayload.product_id,
        product_name: requestPayload.product_name,
        type: "FIXED_VALUE_RECHARGE",
        benefit_types: null,
        service_id: "1",
        service_name: "Mobile",
        source: {
          amount: requestPayload.price,  // pkg.price
          unit: "GBP",
          unit_type: "CURRENCY",
        },
        destination: {
          amount: requestPayload.displayvalue,
          unit: requestPayload.unit,
          unit_type: "CURRENCY",
        },
      },
      Amount: requestPayload.price,
      creditedAmount: requestPayload.price,
      BankBranchName: null,
      BankCode: null,
      BankName: null,
      BeneficiaryCurrency: null,
      BenificeryID: receiverId,
      BranchCode: null,
      ChannelTransferType: "AIRTOPUP",
      Currency: "GBP",
      FromCountry: "GBR",
      IFSC_IBAN: null,
      IsPartialPaymentType: "N",
      MobileNumber: requestPayload.Mobile,
      PartialGatewayAmount: null,
      PartialWalletAmount: null,
      PaymentType: "WALLET",
      PromoAmount: null,
      PromoCode: null,
      PurposeOfRemittance: null,
      ReverseCurrency: null,
      SessionCode: null,
      SourceOfIncome: null,
      ToCountry: requestPayload.toCountry,
    };

    // Send request to API
    return await apiClient.post("api/InitTransaction", postData);
  } catch (err) {
    console.error("Error in InitTransactions:", err);
    throw err;
  }
};



export const TransferType = async (toCountryArg?: string, fromCountryArg?: string) => {
  try {
    const { tokenId, remitterId } = await getTokenAndRemitter();

    const finalTo = toCountryArg || await AsyncStorage.getItem('selectedRecipientCurrency') || "IND";
    const finalFrom = fromCountryArg || await AsyncStorage.getItem('selectedCountryDisplayValue') || "GBR";

    const finalCurrency = await AsyncStorage.getItem("selectedSendCurrency") || "GBP";

    const request = {
      tokenId,
      remitterId,
      toCountry: finalTo,
      selectedCountryDisplayValue: finalFrom,
      currency: finalCurrency
    };

    const postData = getRequest('TransferType', request);
    return await apiClient.post('api/TransferType', postData);
  } catch (err) {
    console.error("Error preparing TransferType:", err);
    throw err;
  }
};
export const CheckRate = async (toCountryArg?: string, fromCountryArg?: string): Promise<any> => {
  try {
    const { tokenId, remitterId } = await getTokenAndRemitter();

    const finalTo = toCountryArg || await AsyncStorage.getItem('selectedRecipientCurrency') || "IND";
    const finalFrom = fromCountryArg || await AsyncStorage.getItem('selectedCountryDisplayValue') || "GBR";

    const finalCurrency = await AsyncStorage.getItem("selectedSendCurrency") || "GBP";

    const request = {
      tokenId,
      remitterId,
      toCountry: finalTo,
      selectedCountryDisplayValue: finalFrom,
      currency: finalCurrency,
    };

    const postData = getRequest('CheckRate', request);
    return await apiClient.post('api/CheckRate', postData);
  } catch (err) {
    console.error("fetchCheckRate error:", err);
    throw err;
  }
};

export const PutChangePassword = async (request: any) => {
  const postData = getRequest('ChangePassword', request)
  return await apiClient.post('api/ChangePassword', postData)

};
export const getBranchDetail = async (request: any) => {
  console.log('request', request)
  const postData = getRequest('GetBranchDetails', request)
  console.log('postData', postData)
  return await apiClient.post('api/GetBranchDetails', postData)
};
export const getProfileImage = async () => {
  return await apiClient.get('/api/company/customers/getProfileImage')
    .then((res) => {
      return res
    })
    .catch((error) => {
      genericErrorHandler(error)
      console.error('errror', error.response?.data?.message)
    })
};

export const UpdateProfileImage = async (user: any) => {
  return apiClient.post('/api/company/customers/setProfileImage', user)
    .then((res) => {
      return res
    })
    .catch((error) => {
      console.log(error)

      genericErrorHandler(error)
    })
}

export const getNotifications = async () => {
  return await apiClient.get('/api/company/notifications/customer/getAll')
    .then((res) => {
      return res
    })
    .catch((err) => {
      console.error('error', err)
    })
};

export const readNotification = async (request: any) => {
  return await apiClient.post('/api/company/notifications/customer/read', request)
    .then((res) => {
      return res
    })
    .catch((error) => {
      console.error('scanPay', error)
    })
};


export const getRequest = (api: string, req: any) => {
  const postData: any = {
    request: {
      ClientCredentials: {
        AuthenticationAgentCode: null,
        ChannelType: "03",
        Login: "KashRemit",
        Password: "D91880531DC2628EF6D98799641CCE9479326B88D0F37D5269F0715DB61AD97A4CB5F802B1EB97BE98AD924E374119FD5E6E712B4DA4324E6EF9B018F22B5700",
        control: null
      },
      DeviceInformation: {
        DeviceID: null,
        DeviceName: Platform.OS === 'android' ? 'android_mobile' : (Platform.OS === 'ios' ? 'ios_mobile' : 'MOBILE'),
        MobileNumber: null,
        DeviceIP: null,
        OS: Platform.OS || "android"
      },
      Login: "KashRemit",
      Password: "D91880531DC2628EF6D98799641CCE9479326B88D0F37D5269F0715DB61AD97A4CB5F802B1EB97BE98AD924E374119FD5E6E712B4DA4324E6EF9B018F22B5700",
      RemitterID: null
    }
  };

  if (api === 'GetReferDetails' || api === 'GetReferralCode' || api === 'MobileNumberLookUp' || api === 'GetRemitterProfile' || api === 'GetDashboardDetails' || api === 'GetWalletBalance' || api === 'GetSOI' || api === 'GetCardDetails' || api === 'GetTransactionDetails' || api === 'GetReceiverInfoList' || api === 'GetReceiverInfoLists' || api === 'GetGDPR' || api === 'GetDocument' || api === 'GetDocumentList' || api === 'ViewPreferCountry' || api === 'ChangePassword' || api === 'GetCountryList' || api === 'GetCountryLists' || api === 'GetNationality' || api === 'GetPromoCode' || api === 'RemitterPostRegistration'
    || api === 'AddReceiverInfo' || api === 'EditBeneficiary' || api === 'GetAgentDetails' || api === 'DeleteBeneficiary' || api === 'AddPreferCountry' || api === 'EditPreferCountry' || api === 'UpdateRemitterProfile' || api === 'RemitterUpgrade' || api === 'AddBusinesspersonalDetails' || api === 'GetBusinesspersonalDetails' || api === 'WalletTransfer' || api === 'WalletWithdrawal' || api === 'SendMoneyCalculate' || api === 'SendMoneyCalculates' || api === 'SendMoneyCalculatess' || api === 'ValidateSendMoney' || api === 'CheckRate' || api === 'TransferType' || api === 'InitTransaction' || api === 'InitTransactions' || api === 'GetTransactionLimit' || api === 'GetNotificationListInfo' || api === 'UpdateNotification' || api === 'GetOperators' || api === 'GetQuickWatchList' || api === "AddWatchList" || api === "UpdateWatchList" || api === 'DeleteWatchList' || api === 'GetProducts' || api === 'GetTransactionLimits') {
    postData.request.RemitterID = req.remitterId;
    postData.request.ClientCredentials.TokenID = req.tokenId;
  }

  if (api === 'RemitterLogin') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        Authenticate: req
      }
    }
    return request
  }



  if (api === 'GetCardDetails') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        CardDetails: {
          RemitterID: req.remitterId,
          Status: "CREATED"
        }
      }
    }
    return request
  }


  if (api === 'GetTransactionDetails') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        Email: '',
        FromDate: req.fromDate,
        NumberTranList: req.numberTranList,
        ToDate: req.toDate,
        TranList: req.tranList,
        TransID: req.transId,
        TransactionType: req.transactionType,
        Wallet_Mode: req.walletMode
      }
    }
    return request
  }

  if (api === 'GetReceiverInfoList') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        ChannelTransferType: '',
        ReceiverID: '',

      }
    }
    return request
  }

  if (api === 'GetReceiverInfoLists') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        ChannelTransferType: "AIRTOPUP",
        ReceiverID: null,

      }
    }
    return request
  }

  if (api === 'GetGDPR') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        Mode: req.mode,
        PageName: req.pageName,
      }
    }
    return request
  }

  if (api === 'ChangePassword') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        NewPassword: req.newPassword,
        OldPassword: req.oldPassword,

      }
    }
    return request
  }

  if (api === 'GetBranchDetails') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        "BankDetail": {
          "CountryCode": req.CountryCode,
          "BankName": req.BankName,
          "BankNameCode": req.BankNameCode,
          "BankCode": req.BankCode,
          "SessionCode": req.SessionCode,
          "City": req.City,
          "State": req.State,
          "SearchText": req.SearchText,
          "StartFrom": req.StartFrom,
          "EndWith": req.EndWith,
        },
      }
    }
    return request
  }

  if (api === 'ValidatePreRegistration') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        Sender: {
          Email: req.email,
          MobileNumber: req.mobileNumber,
          Password: req.password,
          ReferralId: req.referralId,
        }

      }
    }
    return request
  }



  if (api === 'GetBusinesspersonalDetails') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        BusinessDetail: {
          RemitterID: req.remitterId
        }

      }
    }
    return request
  }



  if (api === 'AddBusinesspersonalDetails') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        BusinessDetail: {
          CompanyName: req.CompanyName,
          CompanyType: req.CompanyType,
          Country: req.Country,
          IncorporateDate: req.IncorporateDate,
          RegisteredBusinessName: req.RegisteredBusinessName,
          RegistrationNumber: req.RegistrationNumber,
          RemitterID: req.remitterId
        }

      }
    }
    return request
  }


  if (api === 'RemitterPreRegistration') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        Sender: {
          Email: req.email,
          MobileNumber: req.mobileNumber,
          Password: req.password,
          IsPerBusType: req.IsPerBusType,
          ReferralId: req.referralId,
        }

      }
    }
    return request
  }

  if (api === 'GetAgentDetails') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        AgentDetail: {
          City: req.City,
          State: req.State,
          ZipCode: req.ZipCode,
          CountryCode: req.CountryCode,
          SessionCode: req.SessionCode,
          StartFrom: 1,
          EndWith: 10000,
          RemitterID: req.remitterId,
        }
      }
    }
    return request
  }

  if (api === 'InitTransaction') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        AccountName: req.AccountName,
        AccountNumber: req.AccountNumber,
        AgentCode: "",
        AgentName: "",
        Amount: req.Amount,
        BankBranchName: null,
        BankCode: req.BankCode,
        BankName: req.BankName,
        BeneficiaryCurrency: null,
        BenificeryID: req.BeneficiaryID,
        BranchCode: null,
        ChannelTransferType: req.ChannelTransferType,
        Currency: req.currency || "GBP",
        FromCountry: req.selectedCountryDisplayValue || "GBR",
        IFSC_IBAN: req.IFSC_IBAN,
        IsPartialPaymentType: "N",
        MobileNumber: req.Mobile,
        PartialGatewayAmount: null,
        PartialWalletAmount: null,
        PaymentType: "WALLET",
        PromoAmount: null,
        PromoCode: null,
        PurposeOfRemittance: "P51",
        ReverseCurrency: null,
        SessionCode: req.SessionCode,
        SourceOfIncome: "",
        ToCountry: req.toCountry,


      }

    }
    return request
  }

  if (api === 'InitTransactions') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        AccountName: null,
        AccountNumber: null,
        AgentCode: null,
        AgentName: null,
        AirTime: {
          operator_id: req.operator_id,
          operator_name: req.operator_name,
          product_id: req.product_id,
          product_name: req.product_name,
          type: "FIXED_VALUE_RECHARGE",
          benefit_types: null,
          service_id: "1",
          service_name: "Mobile",
          source: {
            amount: req.amount,
            unit: "GBP",
            unit_type: "CURRENCY"
          },
          destination: {
            amount: req.amount,
            unit: req.unit,
            unit_type: "CURRENCY"
          },
        },
        Amount: 0.15,
        BankBranchName: null,
        BankCode: null,
        BankName: null,
        BeneficiaryCurrency: null,
        BenificeryID: "BNF0000748852",
        BranchCode: null,
        ChannelTransferType: "AIRTOPUP",
        Currency: req.currency || "GBP",
        FromCountry: req.selectedCountryDisplayValue || "GBR",
        IFSC_IBAN: null,
        IsPartialPaymentType: "N",
        MobileNumber: req.Mobile,
        PartialGatewayAmount: null,
        PartialWalletAmount: null,
        PaymentType: "WALLET",
        PromoAmount: null,
        PromoCode: null,
        PurposeOfRemittance: null,
        ReverseCurrency: null,
        SessionCode: null,
        SourceOfIncome: null,
        ToCountry: req.toCountry,


      }

    }
    return request
  }

  if (api === 'TransferType') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        FromCountry: req.selectedCountryDisplayValue || "GBR",
        ToCountry: req.toCountry,
      }

    }
    return request
  }


  if (api === 'GetNotificationListInfo') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
      }
    };
    return request;
  }



  if (api === 'GetOperators') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        country_iso_code: req.country_iso_code
      }
    };
    return request;
  }

  if (api === 'GetQuickWatchList') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        QuickWatchDetail: {
          RemitterID: postData.request.RemitterID
        }
      }
    };
    return request;
  }

  if (api === 'AddWatchList') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        QuickWatchDetail: {
          AlertFlag: req.AlertFlag,
          AmountAbove: "100.87",
          AmountBelow: req.AmountBelow,
          RemitterID: postData.request.RemitterID,
          ToCountryCode: req.ToCountryCode,
          ToCountryName: req.ToCountryName,
          ToCurrency: req.ToCurrency
        }
      }
    };
    return request;
  }

  if (api === 'UpdateWatchList') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        QuickWatchDetail: {
          AlertFlag: req.AlertFlag,
          AmountAbove: req.AmountAbove,
          AmountBelow: req.AmountBelow,
          RemitterID: postData.request.RemitterID,
          ToCountryCode: req.ToCountryCode,
          ToCountryName: req.ToCountryName,
          ToCurrency: req.ToCurrency
        }
      }
    };
    return request;
  }





  if (api === 'DeleteWatchList') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        QuickWatchDetail: {
          ToCountryCode: req.ToCountryCode,
          RemitterID: postData.request.RemitterID
        }
      }
    };
    return request;
  }






  if (api === 'GetProducts') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        country_iso_code: req.country_iso_code,
        operator_id: req.operator_id
      }
    };
    return request;
  }


  if (api === 'UpdateNotification') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        NotificationlogId: req.NotificationlogId,
        NotificationMasterId: req.NotificationMasterId
      }
    };
    return request;
  }

  if (api === 'GetTransactionLimit') {

    //  const sessionCode = AsyncStorage.getItem("SessionCode");
    const request = {
      ...postData,
      request: {
        ...postData.request,
        FromCountry: req.fromcountry || req.selectedCountryDisplayValue || "GBR",
        Amount: req.SendAmount,
        ChannelTransferType: "Banks",
        Currency: req.currency || "GBP",
        SessionCode: req.sessionCode || "19",
        ReverseCurrency: null,
        ToCountry: req.tocountry,
      }
    };
    return request;
  }

  if (api === 'GetTransactionLimits') {
    // const sessionCode = localStorage.getItem("SessionCode");
    const sessionCode = AsyncStorage.getItem("SessionCode");
    const request = {
      ...postData,
      request: {
        ...postData.request,
        FromCountry: req.fromcountry || req.selectedCountryDisplayValue || "GBR",
        Amount: req.SendAmount,
        ChannelTransferType: "CGMONEY",
        Currency: req.currency || "GBP",
        SessionCode: sessionCode || "19",
        ReverseCurrency: null,
        ToCountry: req.tocountry,
      }
    };
    return request;
  }





  if (api === 'ValidateSendMoney') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        FromCountry: req.selectedCountryDisplayValue,
        Amount: req.sendAmount,
        Currency: req.currency || "GBP",
        SessionCode: "04",
        ReverseSendingCurrency: "",
        ToCountry: req.toCountry,
        ReciverAmount: req.ReciverAmount,
        ToCountryCurrency: null,
        ReverseCurrency: null,
        ChannelTransferType: req.ChannelTransferType

      }

    }
    return request
  }

  if (api === 'SendMoneyCalculate') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        FromCountry: req.selectedCountryDisplayValue || "GBR",
        Amount: req.sendAmount,
        Currency: req.currency || "GBP",
        ReverseSendingCurrency: req.reverse || "",
        ToCountry: req.toCountry,
        TransferType: "BANKS"
      }

    }
    return request
  }

  if (api === 'SendMoneyCalculates') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        FromCountry: req.selectedCountryDisplayValue || "GBR",
        Amount: req.sendAmount,
        Currency: req.currency || "GBP",
        ReverseSendingCurrency: req.reverse || "",
        ToCountry: req.toCountry,
        TransferType: "CGMONEY"
      }
    }
    return request
  }

  if (api === 'SendMoneyCalculatess') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        FromCountry: req.selectedCountryDisplayValue || "GBR",
        Amount: req.sendAmount,
        Currency: req.currency || "GBP",
        ReverseSendingCurrency: req.reverse || "",
        ToCountry: req.toCountry,
        TransferType: "M-Pesa"
      }
    }
    return request
  }

  if (api === 'CheckRate') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        FromCountry: req.selectedCountryDisplayValue || "GBR",
        PaymentCorridor: null,
        ToCountry: req.toCountry,

      }

    }
    return request
  }



  if (api === 'MobileNumberLookUp') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        ReceiverInfo: {
          Country: req.CountryCode,
          Address: '',
          City: '',
          HouseNo: '',
          Nationality: '',
          PostCode: '',
          ReceiverID: '',
          State: '',
          operator_id: req.operator_id,
          CountryCode: req.CountryCode,
          Email: req.Email,
          FirstName: req.FirstName,
          LastName: req.LastName,
          MobileNumber: req.MobileNumber,
          RemitterID: req.remitterId,


        }
      }
    }
    return request
  }

  if (api === 'AddReceiverInfo') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        ReceiverInfo: {
          AccountName: req.AccountName,
          AccountNumber: req.AccountNumber,
          AgentSessionCode: '',
          BankName: req.BankName,
          Comments: '',
          Country: '',
          TokenID: req.tokenId,
          Address: req.Country,
          BankCode: req.BankCode,
          BenefType: 'Individual',
          City: req.City,
          CountryCode: req.CountryCode,
          Email: req.Email,
          mode: req.mode,
          FirstName: req.FirstName,
          LastName: req.LastName,
          MiddleName: '',
          MobileNumber: req.MobileNumber,
          DialCode: req.DialCode,
          Relationship: req.Relationship,
          RemitterID: req.remitterId,
          SessionCode: req.SessionCode || '',
          BranchCode: req.BranchCode,
          BranchName: req.BranchName,
          IFSC_IBAN: req.IFSC_IBAN,
          ModeOfTransfer: req.mode,
          Nationality: req.nationality,
          AgentName: req.AgentName,
          AgentCode: req.AgentCode,
          payoutPostcode: req.payoutPostcode,
          PostCode: req.payoutPostcode,
          State: req.State,
          MobileWalletNumber: req.MobileWalletNumber,
          MobileWalletProvider: req.MobileWalletProvider,


        }
      }
    }
    return request
  }
  if (api === 'EditBeneficiary') {
    const request = {
      ...postData,
      // postData.request.ClientCredentials.TokenID = req.tokenId;
      request: {
        ...postData.request,
        DeviceInformation: {
          ...postData.request.DeviceInformation,
          MobileNumber: null,
        },
        ReceiverInfo: {
          ChannelTransferType: req.ChannelTransferType,
          ReceiverID: req.ReceiverID,
          AccountName: req.AccountName,
          AccountNumber: req.AccountNumber,
          AgentSessionCode: '',
          BankName: req.BankName,
          Comments: '',
          Country: req.Country,
          TokenID: req.tokenId,
          Address: '',
          BankCode: req.BankCode,
          BenefType: '',
          City: req.City,
          CountryCode: req.CountryCode,
          Email: req.Email,
          ModeOfTransfer: req.mode,
          FirstName: req.FirstName,
          LastName: req.LastName,
          MiddleName: '',
          MobileNumber: req.MobileNumber,
          DialCode: req.DialCode,
          Relationship: req.Relationship,
          RemitterID: req.remitterId,
          SessionCode: req.SessionCode || '',
          BranchCode: req.BranchCode,
          BranchName: req.BranchName,
          IFSC_IBAN: req.IFSC_IBAN,
          Nationality: req.nationality,
          AgentName: req.AgentName,
          AgentCode: req.AgentCode,
          payoutPostcode: req.payoutPostcode,
          State: req.State,
          MobileWalletNumber: req.MobileWalletNumber,
          MobileWalletProvider: req.MobileWalletProvider,
          MobileWalletProviderName: req.MobileWalletProviderName || "",



        }
      }
    }
    return request
  }
  if (api === 'RemitterPostRegistration') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        Sender: {
          Address1: req.addressLine1,
          Address2: req.addressLine2,
          City: req.city,
          Country: req.country,
          CountryName: req.countryName,
          PostCode: req.postCode,
          DOB: req.dateOfBirth,
          Email: req.email,
          RemitterID: req.remitterId,
          Title: req.title,
          FirstName: req.firstName,
          LastName: req.lastName,
          Gender: req.gender,
          Mobile: req.mobile,
          Nationality: req.nationality,
          AnnualIncome: '',
          AvailableLimit: '',
          BackSideImageType: '',
          BackSideImagebase64: '',
          BackSideImagename: '',
          CompanyName: '',
          HouseNo: '',
          IdExpiryDate: '',
          IdIssuedBy: '',
          IdIssuedDate: '',
          IdIssuedPlace: '',
          IdNumber: '',
          IdStartDate: '',
          IdType: '',
          ImageType: '',
          Imagebase64: '',
          Imagename: '',
          Is_Suspicious: '',
          KYC_Status: '',
          MaxLimit: '',
          Occupation: '',
          OrgType: '',
          Password: '',
          PaymentMethod: '',
          PremiseName: '',
          RemittancePurpose: '',
          SourceIncome: '',
          Street: '',
          SubbuildingNo: '',
          Telephone: '',
          TransferType: '',
          UserType: '',
        }

      }
    }
    return request
  }

  if (api === 'UpdateRemitterProfile') {
    postData.request.RemitterID = req.remitterId;
    postData.request.ClientCredentials.TokenID = req.tokenId;

    const request = {
      ...postData,
      request: {
        ...postData.request,

        Sender: {
          Address1: req.addressLine1,
          Address2: req.addressLine2,
          City: req.city,
          Country: req.country,
          CountryName: req.countryName,
          PostCode: req.postCode,
          DOB: req.dateOfBirth,
          Email: req.email,
          RemitterID: req.remitterId,
          Title: req.title,
          FirstName: req.firstName,
          LastName: req.lastName,
          Gender: req.gender,
          Mobile: req.mobile,
          Nationality: req.nationality,
          AnnualIncome: req.AnnualIncome,
          AvailableLimit: "0",
          BackSideImageType: '',
          BackSideImagebase64: '',
          BackSideImagename: '',
          CompanyName: req.CompanyName,
          HouseNo: '',
          IdExpiryDate: '',
          IdIssuedBy: '',
          IdIssuedDate: '',
          IdIssuedPlace: '',
          IdNumber: '',
          IdStartDate: '',
          IdType: '',
          ImageType: '',
          Imagebase64: '',
          Imagename: '',
          Is_Suspicious: '',
          KYC_Status: '',
          MaxLimit: "0",
          Occupation: req.Occupation,
          OrgType: req.OrgType,
          Password: '',
          PaymentMethod: '',
          PremiseName: '',
          RemittancePurpose: '',
          SourceIncome: '',
          Street: '',
          SubbuildingNo: '',
          Telephone: '',
          TransferType: '',
          UserType: '',
        }
      }
    };
    return request;
  }

  if (api === 'WalletWithdrawal') {
    postData.request.RemitterID = req.remitterId;
    postData.request.ClientCredentials.TokenID = req.tokenId;

    const request = {
      ...postData,
      request: {
        ...postData.request,
        RemitterID: req.remitterId,
        Amount: req.Amount,
        RemitterDate: "test",
        Email: req.Email


      }
    };
    return request;
  }

  if (api === 'WalletTransfer') {
    postData.request.RemitterID = req.remitterId;
    postData.request.ClientCredentials.TokenID = req.tokenId;

    const request = {
      ...postData,
      request: {
        ...postData.request,
        RemitterID: req.remitterId,
        Amount: req.Amount,
        RemitterEmail: req.RemitterEmail,
        ToRemitterID: req.ToRemitterID


      }
    };
    return request;
  }


  if (api === "RemitterUpgrade") {
    postData.request.RemitterID = req.RemitterId;
    postData.request.ClientCredentials.TokenID = req.TokenId;

    const request = {
      ...postData,
      request: {
        ...postData.request,

        Sender: {
          AvailableLimit: 0,
          MaxLimit: 0,

          RemitterID: req.RemitterId,
          IdType: req.IdType,

          ImageType: req.ImageType,
          Imagebase64: req.Imagebase64,
          Imagename: req.Imagename,

          BackSideImageType: req.BackSideImageType,
          BackSideImagebase64: req.BackSideImagebase64,
          BackSideImagename: req.BackSideImagename,
        },
      },
    };


    console.log("Request", request)

    return request;
  }




  if (api === 'AddPreferCountry') {
    postData.request.RemitterID = req.remitterId;
    postData.request.ClientCredentials.TokenID = req.tokenId;

    const request = {
      ...postData,
      request: {
        ...postData.request,
        Country: req.Country,
        Reason: req.Reason,
        Amount: req.Amount,
        Count: req.Count,
        User: "Saga" // ✅ Add this line exactly as in original payload
      }
    };
    return request;
  }

  if (api === 'EditPreferCountry') {
    postData.request.RemitterID = req.remitterId;
    postData.request.ClientCredentials.TokenID = req.tokenId;

    const request = {
      ...postData,
      request: {
        ...postData.request,
        Country: req.Country,
        Reason: req.Reason,
        Amount: req.Amount,
        Count: req.Count,
        User: "Saga" // ✅ Add this line exactly as in original payload
      }
    };
    return request;
  }



  if (api === 'DeleteBeneficiary') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        RemitterID: req.remitterId,
        "BeneficiaryID": req.ReceiverID,
        "ChannelTransferType": null,
        // Sender: {
        //   Address1: req.addressLine1,
        //   Address2: req.addressLine2,
        //   City: req.city,
        //   Country: req.country,
        //   CountryName: req.countryName,
        //   PostCode: req.postCode,
        //   DOB: req.dateOfBirth,
        //   Email: req.email,
        //   RemitterID: req.remitterId,
        //   Title: req.title,
        //   FirstName: req.firstName,
        //   LastName: req.lastName,
        //   Gender: req.gender,
        //   Mobile: req.mobile,
        //   Nationality: req.nationality,
        //   AnnualIncome: '',
        //   AvailableLimit: '',
        //   BackSideImageType: '',
        //   BackSideImagebase64: '',
        //   BackSideImagename: '',
        //   CompanyName: '',
        //   HouseNo: '',
        //   IdExpiryDate: '',
        //   IdIssuedBy: '',
        //   IdIssuedDate: '',
        //   IdIssuedPlace: '',
        //   IdNumber: '',
        //   IdStartDate: '',
        //   IdType: '',
        //   ImageType: '',
        //   Imagebase64: '',
        //   Imagename: '',
        //   Is_Suspicious: '',
        //   KYC_Status: '',
        //   MaxLimit: '',
        //   Occupation: '',
        //   OrgType: '',
        //   Password: '',
        //   PaymentMethod: '',
        //   PremiseName: '',
        //   RemittancePurpose: '',
        //   SourceIncome: '',
        //   Street: '',
        //   SubbuildingNo: '',
        //   Telephone: '',
        //   TransferType: '',
        //   UserType: '',
        // }

      }
    }
    return request
  }

  if (api === 'ValidateOTP') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        Email: req.email,
        EmailOTPValue: req.emailOTP,
        MobileNumber: req.mobile,
        OTPType: req.type,
        OTPValue: req.mobileOTP

      }
    }
    return request
  }

  if (api === 'GetCountryList') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        CountryDetail: {
          Alpha_3_Code: '',
          Is_FromCountry: 'Y',
          Is_ToCountry: ''
        }
      }
    }
    return request
  }

  if (api === 'GetCountryLists') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        CountryDetail: {
          Alpha_3_Code: '',
          Is_FromCountry: '',
          Is_ToCountry: 'Y'
        }
      }
    }
    return request
  }


  if (api === 'GetNationality') {
    const request = {
      ...postData,
      request: {
        ...postData.request,
        Nationality: req.nationality
      }
    }
    return request
  }

  if (api === 'GetPromoCode') {
    const request = {
      request: {
        ...postData.request,
        Promocode: {
          Amount: req.Amount,
          PromocodeValue: req.PromocodeValue,
          RemitterID: req.remitterId,
        }
      },

    };

    return request;
  }


  return postData
};



export { apiClient };
