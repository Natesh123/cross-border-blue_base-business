import { FontAwesome } from "@expo/vector-icons";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = useState(false);

  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        // Load fonts with SFProDisplay naming handles
        await Font.loadAsync({
          ...FontAwesome.font,
          "SFProDisplay-Light": require("../assets/fonts/IBMPlexSans-Light.ttf"),
          "SFProDisplay-Regular": require("../assets/fonts/IBMPlexSans-Regular.ttf"),
          "SFProDisplay-Medium": require("../assets/fonts/IBMPlexSans-Medium.ttf"),
          "SFProDisplay-SemiBold": require("../assets/fonts/IBMPlexSans-SemiBold.ttf"),
          "SFProDisplay-Bold": require("../assets/fonts/IBMPlexSans-Bold.ttf"),
        });
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return isLoadingComplete;
}
