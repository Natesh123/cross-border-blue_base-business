import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions
} from "react-native";
import { useRecoilState } from "recoil";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue
} from "react-native-reanimated";
import { ProfileTabState } from "../atoms";
import { FONTS, SIZES } from "../constants/Assets";

const ROUTES = [
  { title: "Personal", key: "PersonalDetails" },
  { title: "Business", key: "BusinessDetails", businessOnly: true },
  { title: "Additional", key: "AdditionalDetails" },
  { title: "Security", key: "ChangePassword" },
];

type Props = {
  accountType: string | null;
};

const ProfileTapHeader = ({ accountType }: Props) => {
  const { width: screenWidth } = useWindowDimensions();
  const [tabIndex, setTabIndex] = useRecoilState(ProfileTabState);

  const visibleRoutes = ROUTES.filter(
    (item) => !(item.businessOnly && accountType !== "Y")
  );

  const containerWidth = Math.min(screenWidth - 40, 560);
  const tabWidth = containerWidth / visibleRoutes.length;
  const translateX = useSharedValue(tabIndex * tabWidth);

  useEffect(() => {
    translateX.value = withSpring(tabIndex * tabWidth, {
      damping: 20,
      stiffness: 90,
    });
  }, [tabIndex, tabWidth]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: tabWidth,
  }));

  return (
    <View style={localStyles.wrapper}>
      <View style={[localStyles.container, { width: containerWidth }]}>
        <Animated.View style={[localStyles.indicator, animatedIndicatorStyle]} />
        {visibleRoutes.map(({ key, title }, index) => {
          const isActive = tabIndex === index;
          return (
            <TouchableOpacity
              key={key}
              activeOpacity={0.7}
              onPress={() => setTabIndex(index)}
              style={[localStyles.tab, { width: tabWidth }]}
            >
              <Text
                style={[
                  localStyles.tabText,
                  isActive && localStyles.activeTabText,
                ]}
              >
                {title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  wrapper: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    height: 54,
    backgroundColor: '#F1F5F9', // Light slate background
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    height: 46,
    backgroundColor: '#0EA5E9', // Elite Sky Blue
    borderRadius: 16,
    left: 4,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  tabText: {
    fontSize: SIZES.p13 || 13,
    fontFamily: FONTS.bold,
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
});

export default ProfileTapHeader;
