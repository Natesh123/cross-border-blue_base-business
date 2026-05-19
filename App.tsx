import 'react-native-gesture-handler';
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useColorScheme, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RecoilRoot } from "recoil";
import useCachedResources from "./app/hooks/useCachedResources";
import Navigation from "./app/navigation";
import Toast from "react-native-toast-message";
import { MenuProvider } from "react-native-popup-menu";
import * as SplashScreen from "expo-splash-screen";
import AnimatedSplashScreen from "./app/components/AnimatedSplashScreen";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error */
});

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  const [splashComplete, setSplashComplete] = useState(false);

  return (
    <RecoilRoot>
      <SafeAreaProvider>
        <MenuProvider>
          {(!isLoadingComplete || !splashComplete) ? (
            <AnimatedSplashScreen onAnimationComplete={() => setSplashComplete(true)} />
          ) : (
            <>
              <Navigation colorScheme={colorScheme} />
              <StatusBar hidden={true} />
              <Toast />
            </>
          )}
        </MenuProvider>
      </SafeAreaProvider>
    </RecoilRoot>
  );
}
