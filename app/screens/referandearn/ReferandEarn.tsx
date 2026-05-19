import { View, Text, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, TextInput, Image, Alert, Linking, Dimensions, Platform, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { ProfileState } from "../../atoms";
import Container from "app/theme/Container";
import { Ionicons, FontAwesome, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { GetReferDetails, GetReferralCode } from "app/http-services";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import Clipboard from '@react-native-clipboard/clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from "app/constants/Colors";
import { FONTS, SIZES } from "app/constants/Assets";
import { RFValue } from "react-native-responsive-fontsize";
import Vector from "app/assets/vectors";

const { width } = Dimensions.get('window');

const ReferandEarn = () => {
  const currentToken = useRecoilValue(ProfileState);
  const [reward, setReward] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentToken.tokenId && currentToken.remitterId) {
      fetchReferDetails(currentToken.tokenId, currentToken.remitterId);
      fetchReferalCode(currentToken.tokenId, currentToken.remitterId);
    }
  }, [isFocused, currentToken]);

  const fetchReferDetails = async (tokenId: string, remitterId: string) => {
    try {
      setLoading(true);
      const response = await GetReferDetails(tokenId);
      if (response.status === 200) {
        setReward(response?.data?.Refer?.PotentialEarning);
      }
    } catch (error) {
      console.error("Error refer details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferalCode = async (tokenId: string, remitterId: string) => {
    try {
      setLoading(true);
      const response = await GetReferralCode(tokenId);
      if (response.status === 200) {
        setReferralCode(response?.data?.Code);
      }
    } catch (error) {
      console.error("Error referral code:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    const text = `Join by using my referral code "${referralCode}" and earn rewards!`;
    await Clipboard.setString(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (platform: string) => {
    const message = `Join using my referral code "${referralCode}" and earn rewards!`;
    let url = "";

    switch (platform) {
      case 'whatsapp':
        url = `whatsapp://send?text=${encodeURIComponent(message)}`;
        break;
      case 'instagram':
        url = "instagram://direct";
        Clipboard.setString(message);
        break;
      case 'facebook':
        url = `fb-messenger://share?text=${encodeURIComponent(message)}`;
        break;
      case 'mail':
        const subject = `Join Cross Border and Earn Rewards!`;
        url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        break;
    }

    try {
      if (platform === 'mail') {
        const gmailURL = `googlegmail://co?subject=${encodeURIComponent("Join Cross Border and Earn Rewards!")}&body=${encodeURIComponent(message)}`;
        const canOpenGmail = await Linking.canOpenURL(gmailURL);
        if (canOpenGmail) {
          await Linking.openURL(gmailURL);
          return;
        }
      }

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        if (platform === 'whatsapp') Alert.alert("Error", "WhatsApp is not installed.");
        else if (platform === 'instagram') await Linking.openURL("https://www.instagram.com/direct/inbox/");
        else if (platform === 'facebook') await Linking.openURL("https://www.facebook.com/messages/t/");
        else Alert.alert("Error", "Unable to open application.");
      }
    } catch (error) {
      Alert.alert("Error", `Unable to share via ${platform}.`);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ELITE HERO HEADER - MATCHED WITH NOTIFICATION SCREEN */}
      <LinearGradient
        colors={['#0369a1', '#0ea5e9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerWrapper}
      >
        <SafeAreaView style={styles.safeHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backCircle}
              activeOpacity={0.7}
            >
              <Vector as="ionicons" name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.titleBox}>
              <Text style={styles.headerTitle}>Refer & Multiply</Text>
              <Text style={styles.headerSub}>Turn your network into rewards</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>

        {/* Step-by-Step Guide */}
        <View style={styles.stepContainer}>
          <View style={styles.stepItem}>
            <View style={[styles.stepIconBox, { backgroundColor: '#E0F2FE' }]}>
              <Feather name="share-2" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.stepText}>Share Code</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepItem}>
            <View style={[styles.stepIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Feather name="user-check" size={18} color="#D97706" />
            </View>
            <Text style={styles.stepText}>Friend Joins</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepItem}>
            <View style={[styles.stepIconBox, { backgroundColor: '#DCFCE7' }]}>
              <MaterialCommunityIcons name="piggy-bank-outline" size={20} color="#16A34A" />
            </View>
            <Text style={styles.stepText}>Get £10</Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.eliteStatCard}>
            <LinearGradient colors={['#F0F9FF', '#fff']} style={styles.statGradient}>
              <View style={[styles.statIconWrapper, { backgroundColor: COLORS.primary }]}>
                <MaterialCommunityIcons name="rocket-launch-outline" size={20} color="#fff" />
              </View>
              <View style={styles.statValueCol}>
                <Text style={styles.statMiniLabel}>POTENTIAL</Text>
                <Text style={styles.statBigValue}>£{reward || "0"}</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={[styles.eliteStatCard, { marginLeft: 12 }]}>
            <LinearGradient colors={['#ECFDF5', '#fff']} style={styles.statGradient}>
              <View style={[styles.statIconWrapper, { backgroundColor: '#10B981' }]}>
                <MaterialCommunityIcons name="check-decagram-outline" size={20} color="#fff" />
              </View>
              <View style={styles.statValueCol}>
                <Text style={styles.statMiniLabel}>ACTUAL</Text>
                <Text style={styles.statBigValue}>£30</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.mainCard}>
          <Text style={styles.cardPromoTitle}>Earn £10 for every successfully referred friend!</Text>

          <View style={styles.referralVoucher}>
            <View style={styles.voucherLeft}>
              <Text style={styles.voucherLabel}>YOUR UNIQUE CODE</Text>
              <Text style={styles.voucherCode}>{referralCode || "------"}</Text>
            </View>
            <TouchableOpacity style={styles.copyVoucherBtn} onPress={copyToClipboard}>
              <LinearGradient
                colors={[COLORS.primary, '#0369a1']}
                style={styles.copyGradient}
              >
                <Ionicons name={copied ? "checkmark-sharp" : "copy-outline"} size={16} color="#fff" />
                <Text style={styles.copyBtnText}>{copied ? "DONE" : "COPY"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.shareDivider}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>SPREAD THE WORD</Text>
            <View style={styles.divLine} />
          </View>

          <View style={styles.socialRow}>
            {[
              { id: 'whatsapp', icon: 'logo-whatsapp', color: '#25D366' },
              { id: 'instagram', icon: 'logo-instagram', color: '#E1306C' },
              { id: 'facebook', icon: 'logo-facebook', color: '#1877F2' },
              { id: 'mail', icon: 'mail', color: '#EA4335' }
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.socialBtn}
                onPress={() => handleShare(item.id)}
              >
                <Ionicons name={item.icon as any} size={26} color={item.color} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footerIllu}>
          <Image
            source={require("../../../assets/refer.png")}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  headerWrapper: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 15,
    ...Platform.select({
      ios: { shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  safeHeader: {
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 5,
  },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  titleBox: {
    marginLeft: 18,
  },
  headerTitle: {
    fontSize: SIZES.h1,
    fontFamily: FONTS.bold,
    color: '#fff',
  },
  headerSub: {
    fontSize: SIZES.p11,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FONTS.medium,
    marginTop: 1,
  },
  scrollContainer: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepText: {
    fontSize: SIZES.p10,
    fontFamily: FONTS.bold,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
    marginTop: -20,
    marginHorizontal: 10,
  },
  statsSection: {
    flexDirection: 'row',
    marginTop: 25,
  },
  eliteStatCard: {
    flex: 1,
    height: 70,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 2 }
    })
  },
  statGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  statIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValueCol: {
    marginLeft: 12,
  },
  statMiniLabel: {
    fontSize: SIZES.p10,
    fontFamily: FONTS.bold,
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  statBigValue: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: '#1E293B',
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 30,
    marginTop: 25,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  cardPromoTitle: {
    fontSize: SIZES.p16,
    fontFamily: FONTS.bold,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  referralVoucher: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    padding: 10,
    alignItems: 'center',
  },
  voucherLeft: {
    flex: 1,
    paddingLeft: 10,
  },
  voucherLabel: {
    fontSize: SIZES.p10,
    fontFamily: FONTS.semibold,
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 4,
  },
  voucherCode: {
    fontSize: SIZES.h1,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    letterSpacing: 2,
  },
  copyVoucherBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  copyGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  copyBtnText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: SIZES.p12,
  },
  shareDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  divLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  divText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: '#CBD5E1',
    marginHorizontal: 15,
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  footerIllu: {
    marginTop: 30,
    alignItems: 'center',
  },
  illustration: {
    width: width * 0.8,
    height: 160,
  },
});

export default ReferandEarn;
