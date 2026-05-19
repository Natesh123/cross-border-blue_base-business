import { LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";

import { RootStackParamList } from "../../types";

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL("/")],
  config: {
    screens: {
      Root: {
        screens: {
          HomeTab: {
            screens: {
              Home: "home",
              Send: "send",
            },
          },
          ProfileTab: {
            screens: {
              Profile: "profile",
            },
          },
        },
      },
      Onboarding: "Onboarding",
      Modal: "modal",
    },
  },
};

export default linking;
