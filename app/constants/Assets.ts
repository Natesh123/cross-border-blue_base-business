import { IWalletTab } from "types";

const Wallet = require("../assets/images/wallet.png");
const MenUser = require("../assets/images/user.png");
const WomanUser = require("../assets/images/woman.png");
const User = require("../assets/images/user.png");

export const IMAGES = {
  Wallet,
  MenUser,
  WomanUser,
  User
};

import { Platform } from "react-native";

const elevationNone = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: {
      height: 4,
      width: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  android: {
    elevation: 4,
  },
  web: {
    boxShadow: "0px 4px 4.65px rgba(0,0,0,0.3)",
  },
});

export const SHADOWS = {
  shadow8: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: {
        height: 4,
        width: 0,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    android: {
      elevation: 8,
    },
    web: {
      boxShadow: "0px 4px 4.65px rgba(0,0,0,0.3)",
    },
  }),
  shadow: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: {
        height: 0,
        width: 0,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4.65,
      elevation: 4,
    },
    android: {
      elevation: 4,
    },
    web: {
      boxShadow: "0px 0px 4.65px rgba(0,0,0,0.2)",
    },
  }),
  elevation0: {
    ...(elevationNone as object),
  },
};

import { RFValue } from "react-native-responsive-fontsize";

export const SIZES = {
  h1: RFValue(14),
  h2: RFValue(12),
  h3: RFValue(10),
  h4: RFValue(8.5),
  p60: RFValue(36),
  p50: RFValue(30),
  p48: RFValue(26),
  p45: RFValue(22),
  p40: RFValue(20),
  p34: RFValue(18),
  p30: RFValue(16),
  p26: RFValue(14),
  p24: RFValue(12),
  p22: RFValue(11),
  p20: RFValue(10),
  p19: RFValue(9.5),
  p18: RFValue(9),
  p16: RFValue(8),
  p15: RFValue(8),
  p14: RFValue(7.5),
  p13: RFValue(7),
  p12: RFValue(6.5),
  p11: RFValue(6),
  p10: RFValue(5.5),
  p9: RFValue(5),
  p6: RFValue(4),
  base: RFValue(5),
  small: RFValue(7),
  font: RFValue(8),
  medium: RFValue(9),
  large: RFValue(10),
  extraLarge: RFValue(12),
  half: "50%",
  full: "100%",
};

export const FONTS = {
  light: "SFProDisplay-Light",
  regular: "SFProDisplay-Regular",
  medium: "SFProDisplay-Medium",
  semibold: "SFProDisplay-SemiBold",
  bold: "SFProDisplay-Bold",
  monoLight: "SFProDisplay-Light",
  monoRegular: "SFProDisplay-Regular",
  monoMedium: "SFProDisplay-Medium",
  monoBold: "SFProDisplay-Bold",
};

export const Opacity = {
  opacity2: "rgba(0,0,0, 0.2)",
};
