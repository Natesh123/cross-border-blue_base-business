import { View, Text, useWindowDimensions, TouchableOpacity, StyleSheet, Platform, Image } from "react-native";
import React from "react";
import { FONTS, SIZES } from "../../../constants/Assets";
import { useNavigation } from "@react-navigation/native";
import Vector from "app/assets/vectors";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, withRepeat, withTiming, useSharedValue, interpolate } from "react-native-reanimated";

interface IProps {
  currency: string;
  balance: string;
}

const WalletBalanceCard = ({ currency, balance }: IProps) => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const [integerPart, decimalPart] = (balance ?? "0.00").toString().split(".");

  const shimmer = useSharedValue(0);
  React.useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 4000 }),
      -1,
      false
    );
  }, []);

  const animatedShine = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-width, width * 1.5]) }],
  }));

  return (
    <View style={localStyles.mainWrapper}>
      {/* The Premium Card */}
      <Animated.View entering={FadeInDown.delay(200).duration(800)} style={localStyles.cardShadow}>
        <LinearGradient
          colors={['#0ea5e9', '#0369a1', '#0c4a6e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={localStyles.premiumCard}
        >
          {/* Artistic Mesh Orbs */}
          <View style={localStyles.meshOrb1} />
          <View style={localStyles.meshOrb2} />
          <View style={localStyles.meshOrb3} />

          <View style={localStyles.cardHeader}>
            <View style={localStyles.chipCont}>
              <Vector as="materialcommunityicons" name="integrated-circuit-chip" size={32} color="rgba(255,255,255,0.7)" />
            </View>
            <View style={localStyles.networkBadge}>
              <Vector as="materialicons" name="wifi-tethering" size={14} color="#ffffff" />
              <Text style={localStyles.networkTxt}>TAP & PAY</Text>
            </View>
          </View>

          <View style={localStyles.balanceDisplay}>
            <Text style={localStyles.cardLabel}>Available Funds</Text>
            <View style={localStyles.amountRow}>
              <Text style={localStyles.currencyChar}>{currency}</Text>
              <Text style={localStyles.integerValue}>{integerPart || "0"}</Text>
              <Text style={localStyles.decimalValue}>.{decimalPart || "00"}</Text>
            </View>
          </View>

          <View style={localStyles.cardFooter}>
            <View style={localStyles.userInfo}>
              <Text style={localStyles.cardHolderLabel}>WALLET ID</Text>
              <Text style={localStyles.cardHolderName}>PREMIUM ACCOUNT</Text>
            </View>
            <View style={localStyles.cardLogoBox}>
              <Image
                source={require('../../../assets/logos/kashremit_logo.png')}
                style={localStyles.logoTiny}
                tintColor="rgba(255,255,255,0.6)"
              />
            </View>
          </View>

          {/* Shimmer Effect */}
          <Animated.View style={[localStyles.shimmerLine, animatedShine]} />
        </LinearGradient>
      </Animated.View>

      {/* Redesigned Quick Actions Hub */}
      <View style={localStyles.hubContainer}>
        <Animated.View entering={FadeInUp.delay(400).duration(600)} style={localStyles.hubItem}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddFund')}
            style={localStyles.hubPress}
            activeOpacity={0.7}
          >
            <LinearGradient colors={['#e0f2fe', '#f0f9ff']} style={localStyles.hubIconBase}>
              <Vector as="feather" name="plus-circle" size={24} color="#0ea5e9" />
            </LinearGradient>
            <Text style={localStyles.hubTitle}>Add Fund</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500).duration(600)} style={localStyles.hubItem}>
          <TouchableOpacity
            onPress={() => navigation.navigate('withdraw')}
            style={localStyles.hubPress}
            activeOpacity={0.7}
          >
            <LinearGradient colors={['#fef2f2', '#fff1f2']} style={localStyles.hubIconBase}>
              <Vector as="feather" name="arrow-up-right" size={24} color="#f43f5e" />
            </LinearGradient>
            <Text style={localStyles.hubTitle}>Withdraw</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600).duration(600)} style={localStyles.hubItem}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Transactions")}
            style={localStyles.hubPress}
            activeOpacity={0.7}
          >
            <LinearGradient colors={['#f0fdf4', '#f0fdfa']} style={localStyles.hubIconBase}>
              <Vector as="feather" name="list" size={24} color="#10b981" />
            </LinearGradient>
            <Text style={localStyles.hubTitle}>History</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  mainWrapper: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  cardShadow: {
    borderRadius: 30,
    ...Platform.select({
      ios: { shadowColor: '#0369a1', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.3, shadowRadius: 20 },
      android: { elevation: 15 }
    }),
  },
  premiumCard: {
    height: 210,
    borderRadius: 30,
    padding: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  meshOrb1: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
  },
  meshOrb2: {
    position: 'absolute',
    bottom: -20,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
  },
  meshOrb3: {
    position: 'absolute',
    top: '30%',
    left: '40%',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  shimmerLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
    transform: [{ rotate: '25deg' }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipCont: {
    opacity: 0.8,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  networkTxt: {
    color: '#ffffff',
    fontSize: SIZES.p9,
    fontFamily: FONTS.bold,
    letterSpacing: 1,
  },
  balanceDisplay: {
    marginTop: 25,
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: SIZES.p10,
    fontFamily: FONTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  currencyChar: {
    color: '#ffffff',
    fontSize: SIZES.p24,
    fontFamily: FONTS.bold,
    marginRight: 6,
  },
  integerValue: {
    color: '#ffffff',
    fontSize: SIZES.p40,
    fontFamily: FONTS.bold,
    fontWeight: '900',
    letterSpacing: -1,
  },
  decimalValue: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: SIZES.p20,
    fontFamily: FONTS.semibold,
  },
  cardFooter: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  userInfo: {
    gap: 2,
  },
  cardHolderLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: SIZES.p6,
    fontFamily: FONTS.bold,
    letterSpacing: 1,
  },
  cardHolderName: {
    color: '#ffffff',
    fontSize: SIZES.p11,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  logoTiny: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  cardLogoBox: {
    padding: 5,
  },
  hubContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    gap: 12,
  },
  hubItem: {
    flex: 1,
  },
  hubPress: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    ...StyleSheet.create({
      shadow: {
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
      }
    }).shadow,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  hubIconBase: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hubTitle: {
    fontSize: SIZES.p9,
    fontFamily: FONTS.bold,
    color: '#1e293b',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }
});

export default WalletBalanceCard;
