
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ImageSourcePropType } from "react-native";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}

export type RootStackParamList = {
  App: NavigatorScreenParams<RootTabParamList> | undefined;
  Root: NavigatorScreenParams<any> | undefined;
  Dashboard: undefined;
  Home: undefined;
  Onboarding: undefined;
  Modal: undefined;
  Exchange: undefined;
  Scanner: undefined;
  Send: undefined;
  Receive: undefined;
  Payment: PaymentParamList | undefined;
  AddMoney: undefined;
  CashOut: undefined;
  HomeAuth: undefined;
  Login: undefined;
  Signup: undefined;
  ValidateRegistration: ValidateRegistrationParamList | undefined;
  PostRegistration: undefined;
  AddRecipients: undefined;
  AddRecipient: undefined;
  YourProfile: undefined;
  Review: undefined;
  Recipient: undefined;
  UploadnewDocuments: undefined;
  ReferandEarn: undefined;
  Faq: undefined;
  Notification: undefined;
  IdDocuments: undefined;
  AirtimeTopup: undefined;
  AirtimeTopupList: undefined;
  MyWalletTransfer: undefined;
  withdraw: undefined;
  AddFund: undefined;
  FinalStage: undefined;
  ToastConfig: undefined;
  AirtimeTopupPay: undefined;
  SendMoney: undefined;
  SetConfirmPin: { mpin: any } | undefined;
  SetPin: undefined;
  EnterPin: undefined;
  QuickAddWatchlistForm: undefined;
  Transactions: undefined;
  MPINRegister: undefined;
  AirtimeTopupForm: undefined;
  Register: undefined;
  Profile: undefined;
  ForgotPassword: undefined;
  Notifications: undefined;
  NotificationsList: undefined;
  AccountSetting: undefined;
  ResetPassword: undefined;
  TransactionCompleted: undefined;
  HomeTab: undefined;
  HomeDrawer: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type RootTabParamList = {
  HomeTab: undefined;
  RecipientsTab: undefined;
  SendMoneyTab: undefined;
  ProfileTab: undefined;
  TransactionsTab: undefined;
};

export type ValidateRegistrationParamList = {
  email: string | undefined;
  mobile: string | undefined;
  password: string | undefined;
  referralId?: string;
};

export type PaymentParamList = {
  publicId: undefined;
  name: undefined;
  amount: undefined;
  type: boolean;
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, Screen>,
    NativeStackScreenProps<RootStackParamList>
  >;

export interface IUser {
  username: string;
  amount: number;
  address: string;
}

export type TSymbol = "RS" | "UK" | "USA" | "UAE";
export type TActivity = "ADD" | "SCAN" | "SEND" | "REQUEST" | "TRANSFER" | "REFUND";
export type TcountryCode = "INR" | "UK" | "USA" | "UAE";

export type CountryDetail = {
  Alpha_2_Code: string;
  Alpha_3_Code: string;
  CountryFlag?: string;
  CountryName?: string;
  CurrencyCode?: string;
  CurrencyName?: string;
  ISDCode?: string;
  Is_FromCountry?: string;
  Is_ToCountry?: string;
  Nationality?: string;
  PostcodeApplicable?: string;
  SupportedCurrencies?: string;
  TranBlock?: string;
};


export interface IcountrySymbol {
  id?: number;
  symbol: TSymbol;
}

export interface ITransaction {
  TransactionDate: string;
  Country: string;
  Amount: string;
  TransactionMode: string;
  Currency: string;
  ReceiverLastName: string;
  ReceiverFirstName: string;
  TransferType: string;
  flagUrl: string | undefined;
  TransID: any;
  publicId: string;
  transactionCode: string;
  transactionType: TActivity;
  amount?: number;
  currencySymbol?: string;
  transactionDate: string;
  branches: any;
  toCustomers: any;
  DestinationCountry: string;
}

export interface IRecipientList {
  country: string;
  countryCode?: string;
  countryFlag?: string;
  recipients: IRecipient[]
}

export interface IRecipient {
  accountName: string;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  mobileNumber: string;
  city: string;
  country: string;
  nationality: string;
  relationship: string;

}


export interface IProfileImage {
  publicId: string;
  profileImage: string;
}

export interface IProfile {
  tokenHash?: any;
  Password?: any;
  Login?: any;
  remitterId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNo: string;
  tokenId: string;
}
export interface DateTimeFormat {
  month: "short";
  day: "numeric";
  year: "numeric";
}

export interface IWalletTab {
  title: string;
  id: number;
  route: any;
  vector: string;
}

export type Navigation = {
  replace(nextRoute: string): unknown;
  navigate: (scene: string) => void;

};

export type TDropDown = {
  name: string;
  Alpha_2_Code: string;
  price: any;
  description: any;
  flag: string | undefined;
  ISDCode: any;
  dataValue: string;
  displayvalue: string;
  // description: string;
};