import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { SafeAreaView } from "react-native-safe-area-context";
import { FONTS, IMAGES, SIZES } from "app/constants/Assets";
import { useRecoilState, useRecoilValue } from "recoil";
import { ProfileState } from "app/atoms";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInLeft, FadeInRight } from "react-native-reanimated";

const CustomDrawer = (props: any) => {
  const navigation = useNavigation();
  const currentToken = useRecoilValue(ProfileState);
  const [ProfileItems, setProfileItems] = useRecoilState(ProfileState);

  const [loading, setLoading] = useState(false);

  const _onSignOutPressed = async () => {
    setLoading(true);
    await AsyncStorage.clear();
    setProfileItems({
      remitterId: currentToken.remitterId,
      firstName: currentToken.firstName,
      lastName: currentToken.lastName,
      email: currentToken.email,
      mobileNo: currentToken.mobileNo,
      tokenId: ''
    });
    await AsyncStorage.removeItem("isLoggedIn");
    navigation.navigate('Login');
    setLoading(false)
  }

  return (
    <View style={stylesLocal.drawerContainer}>
      {/* ELITE HEADER: Curved, Bold, Interactive */}
      <View style={stylesLocal.headerWrapper}>
        <LinearGradient
          colors={['#0369a1', '#0ea5e9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={stylesLocal.headerGradient}
        >
          <SafeAreaView edges={['top']}>
            <View style={stylesLocal.headerContent}>
              <View style={stylesLocal.profileRow}>
                <Animated.View entering={FadeInLeft.delay(200)} style={stylesLocal.avatarOuter}>
                  <Image source={IMAGES.MenUser} style={stylesLocal.mainAvatar} />
                  <View style={stylesLocal.activeIndicator} />
                </Animated.View>

                <View style={stylesLocal.nameBox}>
                  <Animated.Text entering={FadeInRight.delay(300)} numberOfLines={1} style={stylesLocal.userNameText}>
                    {currentToken.firstName} {currentToken.lastName}
                  </Animated.Text>
                  <View style={stylesLocal.badgePill}>
                    <MaterialCommunityIcons name="star-circle" size={14} color="#ffd700" />
                    <Text style={stylesLocal.badgeText}>Elite Member</Text>
                  </View>
                </View>
              </View>

              <View style={stylesLocal.statsRow}>
                <View style={stylesLocal.statItem}>
                  <Text style={stylesLocal.statLabel}>ID NUMBER</Text>
                  <Text style={stylesLocal.statValue}>{currentToken.remitterId || "N/A"}</Text>
                </View>
                <View style={stylesLocal.statDivider} />
                <View style={stylesLocal.statItem}>
                  <Text style={stylesLocal.statLabel}>TIER</Text>
                  <Text style={stylesLocal.statValue}>Business Pro</Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
        {/* Decorative Curve Replacement */}
        <View style={stylesLocal.headerCurve} />
      </View>

      {/* MENU AREA */}
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={{ paddingTop: 0 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={stylesLocal.menuSection}>
            <View style={stylesLocal.itemsContainer}>
              <DrawerItemList {...props} />
            </View>
          </View>


        </DrawerContentScrollView>
      </View>

      {/* FOOTER: Integrated & Premium Card */}
      <View style={stylesLocal.footerArea}>
        <LinearGradient
          colors={['#f8fafc', '#ffffff']}
          style={stylesLocal.footerCard}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("Faq" as never)}
            style={stylesLocal.supportItem}
          >
            <View style={stylesLocal.supportIcon}>
              <MaterialCommunityIcons name="headphones" size={20} color="#0ea5e9" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={stylesLocal.supportTitle}>Customer Support</Text>
              <Text style={stylesLocal.supportSub}>24/7 Priority Assistance</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#cbd5e1" />
          </TouchableOpacity>

          <TouchableOpacity
            style={stylesLocal.logoutAction}
            onPress={_onSignOutPressed}
            activeOpacity={0.7}
          >
            <View style={stylesLocal.logoutIconBox}>
              <MaterialCommunityIcons name="power" size={18} color="#fff" />
            </View>
            <Text style={stylesLocal.logoutActionText}>Log out of Session</Text>
          </TouchableOpacity>
        </LinearGradient>
        <Text style={stylesLocal.appBrandText}>Cross Border Business • v1.0.4 Premium</Text>
      </View>
    </View>
  );
};

export default CustomDrawer;

const stylesLocal = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerWrapper: {
    backgroundColor: '#fff',
    zIndex: 1,
  },
  headerGradient: {
    paddingBottom: 40,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerCurve: {
    height: 30,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarOuter: {
    position: 'relative',
    padding: 3,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  mainAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#fff',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#fff',
  },
  nameBox: {
    marginLeft: 15,
    flex: 1,
  },
  userNameText: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: '#fff',
    letterSpacing: -0.2,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: '#fff',
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 15,
    padding: 12,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: FONTS.semibold,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: '#fff',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 10,
  },
  menuSection: {
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: '#94a3b8',
    letterSpacing: 1.5,
    marginLeft: 15,
    marginBottom: 10,
  },
  itemsContainer: {
    width: '100%',
  },
  customLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  linkIconBox: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  linkText: {
    fontSize: SIZES.font,
    fontFamily: FONTS.medium,
    color: '#64748b',
  },
  footerArea: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#fff',
  },
  footerCard: {
    borderRadius: 20,
    padding: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      }
    })
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  supportIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: '#1e293b',
  },
  supportSub: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: '#64748b',
    marginTop: 1,
  },
  logoutAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: '#fef2f2',
    borderTopWidth: 1,
    borderTopColor: '#fee2e2',
    gap: 10,
  },
  logoutIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutActionText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: '#ef4444',
  },
  appBrandText: {
    textAlign: 'center',
    fontSize: 10,
    fontFamily: FONTS.regular,
    color: '#cbd5e1',
    marginTop: 15,
  }
});