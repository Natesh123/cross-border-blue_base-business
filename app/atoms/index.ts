import { atom } from "recoil";
import { IProfile, IProfileImage } from "./../../types";

export const ProfileTabState = atom<number>({
  key: "profileTabState",
  default: 0,
});

export const TransactionsTabState = atom<number>({
  key: "transactionsTabState",
  default: 0,
});

export const SendMoneyTabState = atom<number>({
  key: "sendMoneyTabState",
  default: 1,
});

export const ProfileImageState = atom<IProfileImage>({
  key: "profileImageState",
  default: {
    publicId: "",
    profileImage: ""
  }
});

export const ProfileState = atom<IProfile>({
  key: "profileState",
  default: {
    remitterId: '',
    firstName: '',
    lastName: '',
    email: '',
    mobileNo: '',
    tokenId: ''
  },
});


export const SendMoneyHeaderState = atom<{ progressPercent: number }>({
  key: "sendMoneyHeaderState",
  default: {
    progressPercent: 0
  }
});

export const SelectedRecipientCurrencyState = atom<string | null>({
  key: "selectedRecipientCurrencyState",
  default: null,
});

export const SelectedSenderCurrencyState = atom<string | null>({
  key: "selectedSenderCurrencyState",
  default: null,
});

export const SelectedSenderCountryDataState = atom<any | null>({
  key: "selectedSenderCountryDataState",
  default: null,
});