import {  ITransaction, IUser, IcountrySymbol, TcountryCode } from "./../../types";
import { IMAGES } from "./Assets";

export const USER_DATA: IUser = {
  username: "@satoshi",
  amount: 2000.00, 
  address: "satoshi@store",
};
export const COUNTRY: Record<TcountryCode,IcountrySymbol> = {
  INR: {
    id: 1,
    symbol: "RS",
  },
  UK: {
    id: 2, 
    symbol: "UK"
  },
  USA: {
    id: 2, 
    symbol: "USA"
  },
  UAE: {
    id: 2, 
    symbol: "UAE"
  }
};
