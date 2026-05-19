import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { useRecoilValue } from "recoil";
import { useIsFocused, useNavigation } from "@react-navigation/native";

import { ProfileState } from "../../atoms";
import { GetWalletBalance, WalletTransfer } from "app/http-services";
import { FONTS, SIZES } from "../../constants/Assets";
import { theme } from "../../core/theme";

import HomeHeader from "app/components/HomeHeader";
import Button from "app/components/controls/Button";
import Container from "app/theme/Container";
import Vector from "app/assets/vectors";
import ToastConfig from "app/components/ToastConfig";
import styles from "app/styles";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const MyWalletTransfer = () => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const currentToken = useRecoilValue(ProfileState);

  const isFocused = useIsFocused();

  const [currency, setCurrency] = useState("£");
  const [reward, setReward] = useState("");
  const [accountBalance, setAccountBalance] = useState("0.00");
  const [withdrawAccountBalance, setWithdrawAccountBalance] = useState("");

  const [receiverId, setReceiverId] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [showTransferForm, setShowTransferForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    const _currency = (typeof process !== 'undefined' && process.env && process.env.CURRENCY_SYMBOL) || "£";
    setCurrency(_currency);
    fetchWalletBalance(currentToken.tokenId, currentToken.remitterId);
  }, [isFocused]);

  const fetchWalletBalance = async (tokenId: string, remitterId: string) => {
    try {
      setLoading(true);
      const res = await GetWalletBalance(tokenId);
      if (res?.status === 200) {
        setAccountBalance(res?.data?.BalanceAmount || "0.00");
        setWithdrawAccountBalance(res?.data?.WD_BalanceAmount || "0.00");
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTransfer = async () => {
    if (!receiverId || !amount || !email) {
      setToastMsg("Please fill all fields");
      setShowToast(true);
      return;
    }

    try {
      setSubmitting(true);

      const reqBody = {
        ToRemitterID: receiverId,
        Amount: amount,
        RemitterEmail: email,
        OTP: otp,
      };

      const res = await WalletTransfer(reqBody);
      console.log("RES", res)

      if (res?.data?.StatusCode === "ER0073") {
        setToastMsg(res.data.StatusMsg);
        fetchWalletBalance(currentToken.tokenId, currentToken.remitterId);
      } else {
        setToastMsg(res?.data?.StatusMsg || "Transaction failed. Please try again.");
      }

      // 🔥 Common reset code — runs for both IF & ELSE
      setReceiverId("");
      setReceiverName("");
      setAmount("");
      setEmail("");
      setOtp("");
      setShowTransferForm(false);

      setTimeout(() => {
        navigation.navigate("HomeDrawer");
      }, 500);

    } catch (error) {
      console.error("Wallet Transfer Error: ", error);
      setToastMsg("Something went wrong. Please try again.");
    } finally {
      setShowToast(true);
      setSubmitting(false);
    }
  };

  const [integerPart, decimalPart = "00"] = accountBalance.toString().split(".");

  return (
    <SafeAreaView style={localStyles.container}>
      <HomeHeader name={currentToken.firstName} currency={currency} reward={reward} />
      <Container>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Premium Wallet Hero Card */}
          <Animated.View entering={FadeInDown.delay(200)}>
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={localStyles.heroCard}
            >
              <View style={localStyles.heroTopRow}>
                <View style={localStyles.walletIconBox}>
                  <Vector as="ionicons" name="wallet" size={24} color="#0ea5e9" />
                </View>
                <TouchableOpacity style={localStyles.balanceTitleRow} activeOpacity={0.7}>
                  <Text style={localStyles.heroBalanceTitle}>Personal Wallet</Text>
                  <Vector as="ionicons" name="chevron-forward" size={16} color="#0ea5e9" />
                </TouchableOpacity>
              </View>

              <View style={localStyles.balanceMainArea}>
                <Text style={localStyles.balanceCurrency}>{currency}</Text>
                <Text style={localStyles.balanceValue}>
                  {integerPart}<Text style={localStyles.balanceDecimal}>.{decimalPart}</Text>
                </Text>
              </View>
              <Text style={localStyles.balanceLabel}>Account Balance Available</Text>

              <View style={localStyles.heroActionRow}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("withdraw")}
                  style={[localStyles.heroBtn, localStyles.heroBtnSecondary]}
                >
                  <Vector as="feather" name="arrow-up-right" size={18} color="#0ea5e9" style={{ marginRight: 8 }} />
                  <Text style={localStyles.heroBtnTextSecondary}>Withdraw</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate("AddFund")}
                  style={[localStyles.heroBtn, localStyles.heroBtnPrimary]}
                >
                  <Vector as="feather" name="plus" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={localStyles.heroBtnTextPrimary}>Add Fund</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Transfer Section */}
          {!showTransferForm ? (
            <Animated.View entering={FadeInDown.delay(400)} style={localStyles.stepsCard}>
              <View style={localStyles.stepsHeader}>
                <View style={localStyles.blueIndicator} />
                <Text style={localStyles.stepsTitle}>Instant Transfer</Text>
              </View>

              <Text style={localStyles.stepsDesc}>
                Send money seamlessly to another wallet in real-time.
              </Text>

              <View style={localStyles.timelineWrapper}>
                {[
                  { title: "Remitter ID", desc: "Target receiver's unique ID" },
                  { title: "Amount", desc: "Value you wish to send" },
                  { title: "Verification", desc: "Confirm with registered email" }
                ].map((step, index) => (
                  <View key={index} style={localStyles.timelineItem}>
                    <View style={localStyles.timelineIconCol}>
                      <View style={localStyles.timelineDotOuter}>
                        <View style={localStyles.timelineDotInner} />
                      </View>
                      {index < 2 && <View style={localStyles.timelineLine} />}
                    </View>
                    <View style={localStyles.timelineContent}>
                      <Text style={localStyles.stepName}>{step.title}</Text>
                      <Text style={localStyles.stepDesc}>{step.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={localStyles.startBtn}
                activeOpacity={0.8}
                onPress={() => setShowTransferForm(true)}
              >
                <LinearGradient
                  colors={['#0ea5e9', '#0369a1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={localStyles.startBtnGradient}
                >
                  <Text style={localStyles.startBtnText}>Start New Transfer</Text>
                  <Vector as="feather" name="arrow-right" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInUp} style={localStyles.formCard}>
              <View style={localStyles.formHeaderRow}>
                <TouchableOpacity onPress={() => setShowTransferForm(false)} style={localStyles.formBackBtn}>
                  <Vector as="feather" name="chevron-left" size={24} color="#0369a1" />
                </TouchableOpacity>
                <Text style={localStyles.formTitle}>Wallet Transfer</Text>
                <View style={{ width: 40 }} />
              </View>

              <View style={localStyles.inputGroup}>
                <Text style={localStyles.inputLabel}>Receiver ID</Text>
                <View style={localStyles.inputWrapper}>
                  <Vector as="feather" name="user" size={18} color="#94a3b8" style={{ marginRight: 12 }} />
                  <TextInput
                    style={localStyles.textInput}
                    placeholder="KM00000001"
                    placeholderTextColor="#94a3b8"
                    value={receiverId}
                    onChangeText={(val) => setReceiverId(val.replace(/[^a-zA-Z0-9]/g, ""))}
                  />
                </View>
                {receiverId ? <Text style={localStyles.receiverHint}>Receiver: {receiverName || 'Verifying...'}</Text> : null}
              </View>

              <View style={localStyles.inputGroup}>
                <Text style={localStyles.inputLabel}>Amount To Send</Text>
                <View style={localStyles.inputWrapper}>
                  <Text style={localStyles.inputCurrency}>{currency}</Text>
                  <TextInput
                    style={[localStyles.textInput, { fontWeight: '700' }]}
                    placeholder="0.00"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={(val) => {
                      const onlyNums = val.replace(/[^0-9.]/g, "");
                      setAmount(onlyNums);
                    }}
                  />
                </View>
              </View>

              <View style={localStyles.inputGroup}>
                <Text style={localStyles.inputLabel}>Verification Email</Text>
                <View style={localStyles.inputWrapper}>
                  <Vector as="feather" name="mail" size={18} color="#94a3b8" style={{ marginRight: 12 }} />
                  <TextInput
                    style={localStyles.textInput}
                    placeholder="name@email.com"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              <View style={localStyles.warningBox}>
                <Vector as="feather" name="info" size={14} color="#64748b" />
                <Text style={localStyles.warningText}>Only withdrawal-enabled balance can be transferred.</Text>
              </View>

              <View style={localStyles.footerActions}>
                <TouchableOpacity
                  style={[localStyles.mainActionBtn]}
                  disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || submitting}
                  onPress={handleConfirmTransfer}
                >
                  <LinearGradient
                    colors={['#0ea5e9', '#0369a1']}
                    style={localStyles.mainBtnGradient}
                  >
                    {submitting ? <ActivityIndicator color="#fff" /> : <Text style={localStyles.mainBtnText}>Confirm Transfer</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </Container>
      <ToastConfig visible={showToast} message={toastMsg} onClose={() => setShowToast(false)} />
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  heroCard: {
    margin: 20,
    borderRadius: 24,
    padding: 24,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: { shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15 },
      android: { elevation: 8 },
    }),
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  walletIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  heroBalanceTitle: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.bold,
    color: '#64748b',
    marginRight: 6,
    textTransform: 'uppercase',
  },
  balanceMainArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  balanceCurrency: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: '#0ea5e9',
    marginRight: 8,
  },
  balanceValue: {
    fontSize: RFValue(28),
    fontFamily: FONTS.bold,
    color: '#1e293b',
  },
  balanceDecimal: {
    color: '#94a3b8',
    fontSize: RFValue(18),
  },
  balanceLabel: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.medium,
    color: '#94a3b8',
    marginBottom: 24,
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  heroBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBtnPrimary: {
    backgroundColor: '#0ea5e9',
  },
  heroBtnSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  heroBtnTextPrimary: {
    color: '#fff',
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
  },
  heroBtnTextSecondary: {
    color: '#0ea5e9',
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
  },
  stepsCard: {
    margin: 20,
    marginTop: 0,
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  stepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  blueIndicator: {
    width: 4,
    height: 16,
    backgroundColor: '#0ea5e9',
    borderRadius: 2,
    marginRight: 10,
  },
  stepsTitle: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: '#1e293b',
  },
  stepsDesc: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.medium,
    color: '#64748b',
    marginBottom: 24,
    lineHeight: 18,
  },
  timelineWrapper: {
    marginBottom: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineIconCol: {
    alignItems: 'center',
    marginRight: 16,
    width: 20,
  },
  timelineDotOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0ea5e9',
  },
  timelineDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0ea5e9',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  stepName: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: '#1e293b',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.medium,
    color: '#94a3b8',
  },
  startBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  startBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  startBtnText: {
    color: '#fff',
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
  },
  formCard: {
    margin: 20,
    marginTop: 0,
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 24,
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  formBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formTitle: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: '#1e293b',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.bold,
    color: '#64748b',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
  },
  textInput: {
    flex: 1,
    fontSize: SIZES.h3,
    fontFamily: FONTS.medium,
    color: '#1e293b',
    ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any),
  },
  inputCurrency: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: '#0ea5e9',
    marginRight: 8,
  },
  receiverHint: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.medium,
    color: '#22c55e',
    marginTop: 6,
    marginLeft: 4,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
  },
  warningText: {
    fontSize: RFValue(8.5),
    fontFamily: FONTS.medium,
    color: '#92400e',
    flex: 1,
  },
  footerActions: {
    marginTop: 32,
  },
  mainActionBtn: {
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
  },
  mainBtnGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBtnText: {
    color: '#fff',
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
  },
});

export default MyWalletTransfer;
