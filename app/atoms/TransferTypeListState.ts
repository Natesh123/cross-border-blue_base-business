import { atom } from "recoil";

export const TransferTypeListState = atom<string[]>({
  key: "TransferTypeListState",
  default: [],
});
