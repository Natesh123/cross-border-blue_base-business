import React, { useCallback, useMemo } from "react";
import { Dimensions, ImageURISource, Text, useWindowDimensions, View, ViewToken, TouchableOpacity, Image, StyleSheet } from "react-native";
import AppStatusBar from "../../components/AppStatusBar";
import { FONTS, SIZES } from "../../constants/Assets";
import { Navigation } from "../../../types";
import Container from "../../theme/Container";
import Animated, { useAnimatedRef, useAnimatedScrollHandler, useSharedValue, FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import ListItem from "./components/listItem";
import PaginationElement from "./components/paginationElement";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';

const pages = [
  {
    text: 'Fast and Reliable Transfers',
    description: 'Your money reaches its destination swiftly, ensuring timely support for your recipients.',
    image: require('../../assets/logos/kashremit_logo.png'),
    showPlane: true,
  },
  {
    text: 'International Transfers',
    description: 'Send money to over 100+ countries worldwide with competitive exchange rates and low fees.',
    image: require('../../assets/logos/kashremit_logo.png'),
    showPlane: false,
  },
  {
    text: 'Secure Transactions',
    description: 'Rest assured with our robust security measures, safeguarding your funds throughout the transfer process.',
    image: require('../../assets/logos/kashremit_logo.png'),
    showPlane: false,
  },
];

type PageData = typeof pages[0];

type Props = {
  navigation: Navigation;
};

const Onboarding = ({ navigation }: Props) => {
  const { width, height: screenHeight } = useWindowDimensions();
  const x = useSharedValue(0);
  const flatListIndex = useSharedValue(0);
  const flatListRef = useAnimatedRef<Animated.FlatList<PageData>>();

  const completeOnboarding = async (nextRoute: "Login" | "Signup") => {
    try {
      await AsyncStorage.setItem("hasOnboarded", "true");
      navigation.replace(nextRoute);
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        flatListIndex.value = viewableItems[0].index;
      }
    },
    [flatListIndex]
  );

  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 50
  }), []);

  const scrollHandle = useAnimatedScrollHandler({
    onScroll: (event) => {
      x.value = event.contentOffset.x;
    },
  });

  const listItemHeight = screenHeight * 0.6; // Reduced to fit screen without scrolling

  const responsiveStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      overflow: 'hidden', // Strictly prevent vertical content bleed
    },
    background: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: '#075985',
    },
    glowTop: {
      position: 'absolute',
      top: -width * 0.2,
      right: -width * 0.3,
      width: width * 1.2,
      height: width * 1.2,
      borderRadius: width * 0.6,
      backgroundColor: '#38bdf8',
      opacity: 0.1,
    },
    glowBottom: {
      position: 'absolute',
      bottom: -width * 0.2,
      left: -width * 0.2,
      width: width * 1.0,
      height: width * 1.0,
      borderRadius: width * 0.5,
      backgroundColor: '#7dd3fc',
      opacity: 0.1,
    },
    footer: {
      paddingBottom: screenHeight * 0.05,
      paddingHorizontal: 28,
      justifyContent: 'flex-end',
      backgroundColor: 'transparent',
    },
    paginationContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: screenHeight * 0.04, // Reduced margin
    },
    buttonGroup: {
      gap: 16,
    },
    mainButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flex: 1,
      height: 56, // Slightly shorter buttons
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      overflow: 'hidden',
    },
    signupButton: {
      backgroundColor: '#0284C7',
    },
    loginButton: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: '#0ea5e9',
      elevation: 0,
      shadowOpacity: 0,
    },
    buttonTextPrimary: {
      color: '#fff',
      fontSize: SIZES.font,
      fontFamily: FONTS.semibold,
      letterSpacing: 0.5,
    },
    buttonTextSecondary: {
      color: '#0ea5e9',
      fontSize: SIZES.font,
      fontFamily: FONTS.semibold,
      letterSpacing: 0.5,
      fontWeight: '700',
    },
    googleButton: {
      flexDirection: 'row',
      backgroundColor: '#ffffff',
      height: 56,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: '#f1f5f9',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 3,
    },
    googleIcon: {
      width: 22, // Smaller icon
      height: 22,
      marginRight: 10,
    },
    googleText: {
      fontSize: SIZES.font,
      color: '#334155',
      fontFamily: FONTS.medium,
    },
  }), [width, screenHeight]);

  return (
    <View style={{ flex: 1, backgroundColor: '#075985' }}>
      <AppStatusBar style="light" translucent />
      <View style={responsiveStyles.container}>
        <View style={responsiveStyles.background}>
          <LinearGradient
            colors={['#f0f9ff', '#e0f2fe', '#bae6fd']}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
          {/* Decorative Soft Glows */}
          <View style={[responsiveStyles.glowTop, { backgroundColor: '#ffffff', opacity: 0.6 }]} />
          <View style={[responsiveStyles.glowBottom, { backgroundColor: '#7dd3fc', opacity: 0.2 }]} />
        </View>

        <View style={{ flex: 1 }}>
          <Animated.FlatList
            ref={flatListRef}
            onScroll={scrollHandle}
            horizontal
            scrollEventThrottle={16}
            pagingEnabled={true}
            data={pages}
            keyExtractor={(_, index) => index.toString()}
            bounces={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            decelerationRate="fast"
            style={{ flex: 1 }}
            renderItem={({ item, index }) => (
              <ListItem
                item={item}
                index={index}
                x={x}
              />
            )}
          />
        </View>

        <View
          style={responsiveStyles.footer}
        >
          <View style={responsiveStyles.paginationContainer}>
            <PaginationElement length={pages.length} x={x} />
          </View>

          <View style={responsiveStyles.buttonGroup}>
            <View style={responsiveStyles.mainButtons}>
              <TouchableOpacity activeOpacity={0.8} style={responsiveStyles.actionButton} onPress={() => completeOnboarding("Signup")}>
                <LinearGradient
                  colors={['#0ea5e9', '#0284c7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={responsiveStyles.buttonTextPrimary}>Sign up</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[responsiveStyles.actionButton, responsiveStyles.loginButton]}
                onPress={() => completeOnboarding("Login")}
              >
                <Text style={responsiveStyles.buttonTextSecondary}>Log in</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={responsiveStyles.googleButton}
              onPress={() => { }}
            >
              <Image
                source={require('../../assets/icons/google.png')}
                style={responsiveStyles.googleIcon}
              />
              <Text style={responsiveStyles.googleText}>Sign in with Google</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Onboarding;
