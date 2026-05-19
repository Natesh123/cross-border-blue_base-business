import React, { useEffect, useState } from "react";
import { DrawerActions, useIsFocused, useNavigation } from "@react-navigation/native";
import { FONTS, SIZES, IMAGES } from "../constants/Assets";
import { TouchableOpacity, Image, Text, View, StyleSheet, Platform, useWindowDimensions } from "react-native";
import Vector from "app/assets/vectors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GetNotificationListInfo } from "app/http-services";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  interpolate
} from "react-native-reanimated";

interface IProps {
  showDetails?: boolean;
  reward: string;
  currency: string;
  name: string;
  onPress?: () => void;
}

const HomeHeader = ({ reward, currency }: IProps) => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [firstName, setFirstName] = useState("User");
  const [notifications, setNotifications] = useState<any[]>([]);
  const isFocused = useIsFocused();

  // Animation values
  const haloValue = useSharedValue(0);
  const shimmerValue = useSharedValue(-1);

  useEffect(() => {
    // Pulsing Halo
    haloValue.value = withRepeat(
      withTiming(1, { duration: 2500 }),
      -1,
      true
    );

    // Constant Shimmer for the Pearl Pill
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      false
    );
  }, []);

  const animatedHalo = useAnimatedStyle(() => ({
    opacity: interpolate(haloValue.value, [0, 0.5, 1], [0.2, 0.5, 0.2]),
    transform: [{ scale: interpolate(haloValue.value, [0, 1], [0.95, 1.15]) }],
  }));

  const animatedShimmer = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmerValue.value, [0, 1], [-width * 0.4, width * 0.4]) }],
  }));

  useEffect(() => {
    const fetchName = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const parsed = JSON.parse(userData);
          setFirstName(parsed?.FirstName || "User");
        }
      } catch (error) {
        console.error("Error fetching name:", error);
      }
    };
    fetchName();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await GetNotificationListInfo({});
        const data = response?.data?.Notifications || [];
        const mappedNotifications = data.map((item: any) => ({
          id: item.NotificationLogId,
          unread: item.NotificationIsread === "False",
        }));
        setNotifications(mappedNotifications);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    if (isFocused) fetchNotifications();
  }, [isFocused]);

  const hasUnread = notifications.some((n) => n.unread);

  return (
    <View style={localStyles.topContainer}>
      <LinearGradient
        colors={['#0369a1', '#0ea5e9', '#38bdf8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={localStyles.headerBox}
      >
        {/* Artistic Background Decor */}
        <View style={localStyles.decorOrb1} />
        <View style={localStyles.decorOrb2} />
        <View style={localStyles.meshLayer} />

        {/* Top Actions: Minimalist Row */}
        <View style={localStyles.navRow}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            activeOpacity={0.7}
            style={localStyles.roundActionBtn}
          >
            <Vector as="feather" name="menu" size={22} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Notification")}
            activeOpacity={0.7}
            style={localStyles.roundActionBtn}
          >
            <Vector as="ionicons" name="notifications-outline" size={22} color="#ffffff" />
            {hasUnread && <View style={localStyles.badgeSignal} />}
          </TouchableOpacity>
        </View>

        {/* Center Hero Section */}
        <View style={localStyles.heroCore}>
          <View style={localStyles.avatarHaloBase}>
            <Animated.View style={[localStyles.haloPulse, animatedHalo]} />
            <View style={localStyles.avatarShell}>
              <Image source={IMAGES.MenUser} style={localStyles.avatarImg} />
              <View style={localStyles.activeIcon} />
            </View>
          </View>

          <View style={localStyles.nameCenterBox}>
            <Text style={localStyles.greetBanner}>ELITE ACCESS GRANTED</Text>
            <Text style={localStyles.userNameBig}>{firstName}</Text>
          </View>
        </View>

        {/* The Platinum "Referral Pearl" */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={localStyles.pearlWrapper}>
          <LinearGradient
            colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.06)']}
            style={localStyles.pearlInner}
          >
            <View style={localStyles.pearlBadge}>
              <Vector as="materialcommunityicons" name="star-face" size={16} color="#0ea5e9" />
            </View>
            <View style={localStyles.pearlMainContent}>
              <Text style={localStyles.pearlLabel}>REFERRAL REWARDS</Text>
              <Text style={localStyles.pearlValue}>{currency}{reward || "0"}</Text>
            </View>
            <View style={localStyles.pearlAction}>
              <Vector as="feather" name="arrow-up-right" size={16} color="#ffffff" />
            </View>

            {/* Shimmer Effect */}
            <Animated.View style={[localStyles.pearlShimmer, animatedShimmer]} />
          </LinearGradient>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const localStyles = StyleSheet.create({
  topContainer: {
    backgroundColor: '#ffffff',
  },
  headerBox: {
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    paddingBottom: 15,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: { shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.12, shadowRadius: 15 },
      android: { elevation: 10 },
    }),
  },
  decorOrb1: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
  },
  decorOrb2: {
    position: 'absolute',
    bottom: -90,
    left: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
  },
  meshLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
    zIndex: 20,
  },
  roundActionBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  badgeSignal: {
    position: 'absolute',
    top: 13,
    right: 13,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#0ea5e9',
  },
  heroCore: {
    alignItems: 'center',
    marginBottom: 5,
    marginTop: -30,
    zIndex: 10,
  },
  avatarHaloBase: {
    width: 66,
    height: 66,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  haloPulse: {
    position: 'absolute',
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarShell: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    padding: 2.5,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 6 },
      android: { elevation: 6 },
    }),
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 21,
  },
  activeIcon: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    borderWidth: 3,
    borderColor: '#0ea4e9',
  },
  nameCenterBox: {
    alignItems: 'center',
  },
  greetBanner: {
    fontSize: SIZES.p12,
    fontFamily: FONTS.bold,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 2,
  },
  userNameBig: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: '#ffffff',
    marginTop: -2,
  },
  pearlWrapper: {
    alignItems: 'center',
    zIndex: 10,
    marginTop: 10,
  },
  pearlInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 15,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    position: 'relative',
    overflow: 'hidden',
  },
  pearlBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  pearlMainContent: {
    marginRight: 20,
  },
  pearlLabel: {
    fontSize: SIZES.p11,
    fontFamily: FONTS.bold,
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  pearlValue: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: '#ffffff',
  },
  pearlAction: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pearlShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  }
});

export default HomeHeader;
