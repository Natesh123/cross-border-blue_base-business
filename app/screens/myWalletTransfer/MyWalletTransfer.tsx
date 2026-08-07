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
  Modal,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { useRecoilValue } from "recoil";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ProfileState } from "../../atoms";
import { GetWalletBalance, WalletTransfer, GenerateOTP, ValidateOTP, CheckTPINStatus, CreateTPIN, VerifyTPIN, ResetTPIN, ChangeTPIN } from "app/http-services";
import { FONTS, SIZES } from "../../constants/Assets";

import Container from "app/theme/Container";
import Vector from "app/assets/vectors";
import ToastConfig from "app/components/ToastConfig";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  withSpring,
  Easing
} from "react-native-reanimated";

const MyWalletTransfer = () => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const currentToken = useRecoilValue(ProfileState);

  const isFocused = useIsFocused();

  const [currency, setCurrency] = useState("£");
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

  // TPIN state variables
  const [openVerifyTpin, setOpenVerifyTpin] = useState(false);
  const [openSetTpin, setOpenSetTpin] = useState(false);
  const [tpinValues, setTpinValues] = useState<any>(null);
  const [hasTpinApiState, setHasTpinApiState] = useState<boolean>(false);
  const [checkTpinLoading, setCheckTpinLoading] = useState(false);

  // TPIN Setup Form states
  const [setupPin, setSetupPin] = useState("");
  const [setupConfirmPin, setSetupConfirmPin] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);
  const [showSetupPin, setShowSetupPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  // TPIN OTP states
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [otpChannel, setOtpChannel] = useState<string>("MOBILE");
  const [otpValue, setOtpValue] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);

  // TPIN Verification Form states
  const [enteredPin, setEnteredPin] = useState("");
  const [showEnteredPin, setShowEnteredPin] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // TPIN Reset Form states
  const [openResetTpin, setOpenResetTpin] = useState(false);
  const [resetPin, setResetPin] = useState("");
  const [resetConfirmPin, setResetConfirmPin] = useState("");
  const [showResetPin, setShowResetPin] = useState(false);
  const [showResetConfirmPin, setShowResetConfirmPin] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // TPIN Change Form states
  const [openChangeTpin, setOpenChangeTpin] = useState(false);
  const [oldTpin, setOldTpin] = useState("");
  const [newTpin, setNewTpin] = useState("");
  const [confirmNewTpin, setConfirmNewTpin] = useState("");
  const [showOldTpin, setShowOldTpin] = useState(false);
  const [showNewTpin, setShowNewTpin] = useState(false);
  const [showConfirmNewTpin, setShowConfirmNewTpin] = useState(false);
  const [changeLoading, setChangeLoading] = useState(false);

  // Animations
  const shimmer = useSharedValue(0);
  const orb1Pos = useSharedValue(0);
  const orb2Pos = useSharedValue(0);
  const buttonGlow = useSharedValue(0.8);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 3500, easing: Easing.linear }), -1, false);
    orb1Pos.value = withRepeat(withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }), -1, true);
    orb2Pos.value = withRepeat(withTiming(1, { duration: 10000, easing: Easing.inOut(Easing.ease) }), -1, true);
    buttonGlow.value = withRepeat(withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);

  const animatedShine = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-width, width * 1.5]) }],
  }));

  const orb1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(orb1Pos.value, [0, 1], [-20, 50]) },
      { translateY: interpolate(orb1Pos.value, [0, 1], [-20, 30]) },
      { scale: interpolate(orb1Pos.value, [0, 1], [1, 1.1]) },
    ],
  }));

  const orb2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(orb2Pos.value, [0, 1], [40, -40]) },
      { translateY: interpolate(orb2Pos.value, [0, 1], [30, -30]) },
      { scale: interpolate(orb2Pos.value, [0, 1], [1.1, 0.9]) },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonGlow.value }],
    opacity: interpolate(buttonGlow.value, [0.8, 1.2], [0.5, 0]),
  }));

  useEffect(() => {
    const _currency = process.env.CURRENCY_SYMBOL || "£";
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          setCurrentUser(JSON.parse(userStr));
        }
      } catch (error) {
        console.error("Error fetching user data from storage", error);
      }
    };
    fetchUser();
  }, [isFocused]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const maskEmail = (emailStr: string) => {
    if (!emailStr) return "";
    const [name, domain] = emailStr.split("@");
    if (name.length <= 3) return `***@${domain}`;
    return `${name.substring(0, 3)}***@${domain}`;
  };

  const maskMobile = (mobileStr: string) => {
    if (!mobileStr) return "";
    const clean = mobileStr.replace(/[^0-9]/g, "");
    if (clean.length <= 4) return clean;
    return `*******${clean.substring(clean.length - 4)}`;
  };

  const handleSendOtp = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) {
        setToastMsg("User session not found.");
        setShowToast(true);
        return;
      }

      setOtpTimer(60);
      setIsOtpVerified(false);
      setOtpValue("");

      const otpReq = {
        Email: user.Email || user.email,
        MobileNumber: user.MobileNumber || user.mobileNo,
        OTPType: "TP",
      };

      const res = await GenerateOTP(otpReq);
      if (res?.data?.StatusCode === "ER0000") {
        setIsOtpSent(true);
        setToastMsg(`OTP successfully sent to your ${otpChannel === "EMAIL" ? "email address" : "mobile number"}.`);
      } else {
        setOtpTimer(0);
        setToastMsg(res?.data?.StatusMsg || "Failed to generate OTP");
      }
    } catch (error) {
      console.error("Generate OTP Error: ", error);
      setOtpTimer(0);
      setToastMsg("Something went wrong. Please try again.");
    } finally {
      setShowToast(true);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpValue || otpValue.length < 6) {
      setToastMsg("Please enter a valid 6-digit OTP");
      setShowToast(true);
      return;
    }

    try {
      setVerifyOtpLoading(true);
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) {
        setToastMsg("User session not found.");
        setShowToast(true);
        setVerifyOtpLoading(false);
        return;
      }

      const otpPayload = {
        email: user.Email || user.email,
        mobile: user.MobileNumber || user.mobileNo,
        type: "TP",
        emailOTP: otpChannel === "EMAIL" ? otpValue : "",
        mobileOTP: otpChannel === "MOBILE" ? otpValue : ""
      };

      const otpRes = await ValidateOTP(otpPayload);
      if (otpRes?.data?.StatusCode === "ER0000") {
        setIsOtpVerified(true);
        setToastMsg("OTP verified successfully");
        setShowToast(true);
      } else {
        setToastMsg(otpRes?.data?.StatusMsg || "OTP verification failed");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Verify OTP Error: ", error);
      setToastMsg("Something went wrong. Please try again.");
      setShowToast(true);
    } finally {
      setVerifyOtpLoading(false);
    }
  };

  const handleSetTpinSubmit = async () => {
    if (!isOtpVerified) {
      setToastMsg("Please verify OTP first");
      setShowToast(true);
      return;
    }
    if (setupPin.length !== 4 || setupConfirmPin.length !== 4) {
      setToastMsg("TPIN must be exactly 4 digits");
      setShowToast(true);
      return;
    }
    if (setupPin !== setupConfirmPin) {
      setToastMsg("TPIN and Confirm TPIN do not match");
      setShowToast(true);
      return;
    }

    try {
      setSetupLoading(true);
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) {
        setToastMsg("User session not found.");
        setShowToast(true);
        setSetupLoading(false);
        return;
      }

      const mpinRes = await CreateTPIN({ TPIN: setupPin });
      if (mpinRes?.data?.StatusCode === "ER0000" || mpinRes?.data?.StatusCode === "0") {
        user.isMPinGenerated = "Y";
        await AsyncStorage.setItem("user", JSON.stringify(user));

        setSetupLoading(false);
        setOpenSetTpin(false);
        setSetupPin("");
        setSetupConfirmPin("");
        setOtpValue("");
        setIsOtpSent(false);
        setOtpTimer(0);
        setIsOtpVerified(false);
        setShowSetupPin(false);
        setShowConfirmPin(false);
        setHasTpinApiState(true);
        setToastMsg("TPIN created successfully");
        setShowToast(true);

        setOpenVerifyTpin(true);
      } else {
        setSetupLoading(false);
        setToastMsg(mpinRes?.data?.StatusMsg || "Failed to set TPIN");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Set TPIN Error: ", error);
      setSetupLoading(false);
      setToastMsg("Something went wrong. Please try again.");
      setShowToast(true);
    }
  };

  const handleVerifyTpinSubmit = async () => {
    if (enteredPin.length !== 4) {
      setToastMsg("Please enter a 4-digit TPIN");
      setShowToast(true);
      return;
    }

    try {
      setVerifyLoading(true);

      // Verify TPIN first
      const verifyRes = await VerifyTPIN({ TPIN: enteredPin });
      if (verifyRes?.data?.StatusCode === "ER0000" || verifyRes?.data?.StatusCode === "0") {
        const reqBody = {
          ToRemitterID: tpinValues.ToRemitterID,
          Amount: tpinValues.Amount,
          RemitterEmail: tpinValues.RemitterEmail,
          TPIN: enteredPin,
        };

        const res = await WalletTransfer(reqBody);

        const statusCode = res?.data?.StatusCode;
        if (statusCode !== "ER0098") {
          setToastMsg(res?.data?.StatusMsg || "Transfer successful");
          fetchWalletBalance(currentToken.tokenId, currentToken.remitterId);

          setOpenVerifyTpin(false);
          setEnteredPin("");
          setShowEnteredPin(false);
          setReceiverId("");
          setReceiverName("");
          setAmount("");
          setEmail("");
          setShowTransferForm(false);

          setTimeout(() => {
            navigation.navigate("HomeDrawer");
          }, 1500);
        } else {
          setOpenVerifyTpin(false);
          setEnteredPin("");
          setShowEnteredPin(false);
          setToastMsg(res?.data?.StatusMsg || "TPIN Blocked. Please reset your TPIN.");
        }
      } else {
        if (verifyRes?.data?.StatusCode === "ER0098" || verifyRes?.data?.StatusCode === "ER0014") {
          setOpenVerifyTpin(false);
          setEnteredPin("");
          setShowEnteredPin(false);
          setToastMsg(verifyRes?.data?.StatusMsg || "TPIN Blocked. Please reset your TPIN.");
        } else {
          setToastMsg(verifyRes?.data?.StatusMsg || "Invalid TPIN. Please try again.");
        }
      }
    } catch (error) {
      console.error("Wallet Transfer Error: ", error);
      setToastMsg("Something went wrong. Please try again.");
    } finally {
      setShowToast(true);
      setVerifyLoading(false);
    }
  };

  const handleResetTpinSubmit = async () => {
    if (!isOtpVerified) {
      setToastMsg("Please verify OTP first");
      setShowToast(true);
      return;
    }
    if (resetPin.length !== 4 || resetConfirmPin.length !== 4) {
      setToastMsg("TPIN must be exactly 4 digits");
      setShowToast(true);
      return;
    }
    if (resetPin !== resetConfirmPin) {
      setToastMsg("TPIN and Confirm TPIN do not match");
      setShowToast(true);
      return;
    }

    try {
      setResetLoading(true);
      const res = await ResetTPIN({ TPIN: resetPin });
      if (res?.data?.StatusCode === "ER0000" || res?.data?.StatusCode === "0") {
        setResetLoading(false);
        setOpenResetTpin(false);
        setResetPin("");
        setResetConfirmPin("");
        setOtpValue("");
        setIsOtpSent(false);
        setOtpTimer(0);
        setIsOtpVerified(false);
        setShowResetPin(false);
        setShowResetConfirmPin(false);
        setToastMsg("TPIN reset successfully");
        setShowToast(true);
        setOpenVerifyTpin(true);
      } else {
        setResetLoading(false);
        setToastMsg(res?.data?.StatusMsg || "Failed to reset TPIN");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Reset TPIN Error: ", error);
      setResetLoading(false);
      setToastMsg("Something went wrong. Please try again.");
      setShowToast(true);
    }
  };

  const handleChangeTpinSubmit = async () => {
    if (oldTpin.length !== 4) {
      setToastMsg("Old TPIN must be exactly 4 digits");
      setShowToast(true);
      return;
    }
    if (newTpin.length !== 4 || confirmNewTpin.length !== 4) {
      setToastMsg("New TPIN must be exactly 4 digits");
      setShowToast(true);
      return;
    }
    if (newTpin !== confirmNewTpin) {
      setToastMsg("New TPIN and Confirm TPIN do not match");
      setShowToast(true);
      return;
    }
    if (oldTpin === newTpin) {
      setToastMsg("New TPIN cannot be the same as Old TPIN");
      setShowToast(true);
      return;
    }

    try {
      setChangeLoading(true);
      const res = await ChangeTPIN({ OldTPIN: oldTpin, TPIN: newTpin });
      if (res?.data?.StatusCode === "ER0000" || res?.data?.StatusCode === "0") {
        setChangeLoading(false);
        setOpenChangeTpin(false);
        setOldTpin("");
        setNewTpin("");
        setConfirmNewTpin("");
        setShowOldTpin(false);
        setShowNewTpin(false);
        setShowConfirmNewTpin(false);
        setToastMsg("TPIN changed successfully");
        setShowToast(true);
        setOpenVerifyTpin(true);
      } else {
        setChangeLoading(false);
        setToastMsg(res?.data?.StatusMsg || "Failed to change TPIN");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Change TPIN Error: ", error);
      setChangeLoading(false);
      setToastMsg("Something went wrong. Please try again.");
      setShowToast(true);
    }
  };

  const handleConfirmTransfer = async () => {
    if (!receiverId || !amount || !email) {
      setToastMsg("Please fill all fields");
      setShowToast(true);
      return;
    }

    try {
      setTpinValues({
        ToRemitterID: receiverId,
        Amount: amount,
        RemitterEmail: email,
      });

      setCheckTpinLoading(true);
      try {
        const checkRes = await CheckTPINStatus({});
        setCheckTpinLoading(false);
        const hasTpin = checkRes?.data?.HasTPIN === true;
        setHasTpinApiState(hasTpin);
        
        if (hasTpin) {
          setOpenVerifyTpin(true);
        } else {
          setOpenSetTpin(true);
        }
      } catch (err) {
        setCheckTpinLoading(false);
        // Fallback to local storage
        const userStr = await AsyncStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        const hasPin = user?.isMPinGenerated === "Y" || user?.IsmPINgenerated === "Y";
        setHasTpinApiState(hasPin);

        if (hasPin) {
          setOpenVerifyTpin(true);
        } else {
          setOpenSetTpin(true);
        }
      }
    } catch (error) {
      console.error("Error reading user data", error);
      setToastMsg("Error checking TPIN status");
      setShowToast(true);
    }
  };

  const [integerPart, decimalPart = "00"] = accountBalance.toString().split(".");

  return (
    <SafeAreaView style={localStyles.container}>
      {/* Solid Blue Corporate Header */}
      <LinearGradient colors={['#0ea5e9', '#0284c7']} style={localStyles.blueHeaderBlock}>
        <View style={localStyles.headerDecor1} />
        <View style={localStyles.headerDecor2} />
        <View style={localStyles.header}>
          <TouchableOpacity style={localStyles.backButton} onPress={() => navigation.goBack()}>
            <Vector as="feather" name="chevron-left" size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={localStyles.headerTitle}>Transfer Funds</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={localStyles.headerBalanceContent}>
          <Text style={localStyles.balanceLabel}>AVAILABLE BALANCE</Text>
          <View style={localStyles.amountContainer}>
            <Text style={localStyles.currencySymbol}>{currency}</Text>
            <Text style={localStyles.mainAmount}>{integerPart || "0"}</Text>
            <Text style={localStyles.decimalAmount}>.{decimalPart}</Text>
          </View>
          <View style={localStyles.eliteBadgePill}>
            <Vector as="materialicons" name="verified-user" size={14} color="#FFF" />
            <Text style={localStyles.eliteBadgeTxt}>SECURE ACCOUNT</Text>
          </View>
        </View>
      </LinearGradient>

      <Container>
        <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingTop: 10, marginTop: 30 }} showsVerticalScrollIndicator={false}>
          {!showTransferForm ? (
            <Animated.View entering={FadeInUp.delay(200).duration(600)} style={localStyles.overlappingCard}>
              <View style={localStyles.iconBox}>
                <Vector as="feather" name="send" size={28} color="#0ea5e9" />
              </View>
              <Text style={localStyles.infoTitle}>Instant Transfer</Text>
              <Text style={localStyles.infoDesc}>
                Send money securely and instantly to registered beneficiaries.
              </Text>
              
              <View style={localStyles.timelineWrapper}>
                {[
                  { icon: "user", title: "Beneficiary ID", desc: "Enter receiver's ID" },
                  { icon: "dollar-sign", title: "Transfer Amount", desc: "Specify value" },
                  { icon: "shield", title: "Authenticate", desc: "Secure confirmation" }
                ].map((step, index) => (
                  <View key={index} style={localStyles.timelineNode}>
                    <View style={localStyles.nodeIconCol}>
                      <View style={localStyles.nodeIconBox}>
                        <Vector as="feather" name={step.icon} size={14} color="#0ea5e9" />
                      </View>
                      {index < 2 && <View style={localStyles.nodeConnector} />}
                    </View>
                    <View style={localStyles.nodeContent}>
                      <Text style={localStyles.nodeTitle}>{step.title}</Text>
                      <Text style={localStyles.nodeDesc}>{step.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={localStyles.primaryBtnWrapper} onPress={() => setShowTransferForm(true)} activeOpacity={0.9}>
                <LinearGradient colors={['#0ea5e9', '#0284c7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={localStyles.primaryBtn}>
                  <Text style={localStyles.primaryBtnText}>Start New Transfer</Text>
                  <Vector as="feather" name="arrow-right" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInUp.delay(200).duration(600)} style={localStyles.formContainer}>
              <View style={localStyles.formHeader}>
                <Text style={localStyles.formTitle}>Transfer Details</Text>
                <TouchableOpacity onPress={() => setShowTransferForm(false)} style={localStyles.cancelBtn}>
                  <Vector as="feather" name="x" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Hero Amount Block */}
              <View style={localStyles.heroAmountCard}>
                <Text style={localStyles.heroAmountLabel}>AMOUNT TO SEND</Text>
                <View style={localStyles.heroAmountInputWrapper}>
                  <Text style={localStyles.heroAmountCurrency}>{currency}</Text>
                  <TextInput
                    style={localStyles.heroAmountInput}
                    placeholder="0.00"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={(val) => setAmount(val.replace(/[^0-9.]/g, ""))}
                  />
                </View>
              </View>

              {/* Unified Recipient Details Card */}
              <View style={localStyles.unifiedCard}>
                <View style={localStyles.unifiedInputRow}>
                  <Vector as="feather" name="user" size={18} color="#0ea5e9" style={localStyles.unifiedIcon} />
                  <View style={{ flex: 1 }}>
                    <Text style={localStyles.unifiedInputLabel}>RECEIVER ID</Text>
                    <TextInput
                      style={localStyles.unifiedTextInput}
                      placeholder="e.g. KM00000001"
                      placeholderTextColor="#94a3b8"
                      value={receiverId}
                      onChangeText={(val) => setReceiverId(val.replace(/[^a-zA-Z0-9]/g, ""))}
                    />
                  </View>
                  {receiverId ? (
                    <Animated.View entering={FadeInLeft}>
                      <Vector as="feather" name="check-circle" size={16} color="#10B981" />
                    </Animated.View>
                  ) : null}
                </View>

                <View style={localStyles.unifiedDivider} />

                <View style={localStyles.unifiedInputRow}>
                  <Vector as="feather" name="mail" size={18} color="#0ea5e9" style={localStyles.unifiedIcon} />
                  <View style={{ flex: 1 }}>
                    <Text style={localStyles.unifiedInputLabel}>VERIFICATION EMAIL</Text>
                    <TextInput
                      style={localStyles.unifiedTextInput}
                      placeholder="name@email.com"
                      placeholderTextColor="#94a3b8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>
              </View>

              <View style={localStyles.unifiedFootnote}>
                <Vector as="feather" name="shield" size={12} color="#0ea5e9" />
                <Text style={localStyles.unifiedFootnoteText}>End-to-end encrypted transfer</Text>
              </View>

              <TouchableOpacity
                style={[localStyles.primaryBtnWrapper, (!receiverId || !amount || !email || submitting) && localStyles.primaryBtnDisabled]}
                disabled={!receiverId || !amount || !email || submitting}
                onPress={handleConfirmTransfer}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['#0ea5e9', '#0284c7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={localStyles.primaryBtn}>
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={localStyles.primaryBtnText}>Confirm Transfer</Text>
                      <Vector as="feather" name="chevron-right" size={20} color="#fff" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>
      </Container>
      {/* Set TPIN Modal */}
      <Modal
        visible={openSetTpin}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setOpenSetTpin(false);
          setSetupPin("");
          setSetupConfirmPin("");
          setOtpValue("");
          setIsOtpSent(false);
          setOtpTimer(0);
          setIsOtpVerified(false);
          setShowSetupPin(false);
          setShowConfirmPin(false);
        }}
      >
        <View style={tpinModalStyles.modalContainer}>
          <View style={[tpinModalStyles.modalContent, { paddingTop: 40 }]}>
            {/* Secure Vault Header Icon (Shield style) */}
            <View style={tpinModalStyles.secureVaultIconWrapper}>
              <View style={tpinModalStyles.secureVaultIconInner}>
                <Vector as="feather" name="shield" size={20} color="#0ea5e9" />
              </View>
            </View>

            <TouchableOpacity
              style={tpinModalStyles.closeButton}
              onPress={() => {
                setOpenSetTpin(false);
                setSetupPin("");
                setSetupConfirmPin("");
                setOtpValue("");
                setIsOtpSent(false);
                setOtpTimer(0);
                setIsOtpVerified(false);
                setShowSetupPin(false);
                setShowConfirmPin(false);
              }}
            >
              <Vector as="feather" name="x" size={16} color="#64748B" />
            </TouchableOpacity>

            <Text style={tpinModalStyles.modalTitle}>Set up Transaction PIN</Text>
            <Text style={tpinModalStyles.modalDescription}>
              You need to set up a 4-digit TPIN to secure your transactions.
            </Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={tpinModalStyles.changeModalLabel}>VERIFY IDENTITY VIA</Text>
              <View style={tpinModalStyles.channelContainer}>
                <TouchableOpacity
                  onPress={() => {
                    setOtpChannel("EMAIL");
                    setOtpValue("");
                    setIsOtpSent(false);
                    setOtpTimer(0);
                  }}
                  style={[
                    tpinModalStyles.blueChannelCard,
                    otpChannel === "EMAIL" && tpinModalStyles.blueChannelCardSelected,
                    { display: 'none' }
                  ]}
                >
                  <Vector
                    as="feather"
                    name="mail"
                    size={20}
                    color={otpChannel === "EMAIL" ? "#0ea5e9" : "#94a3b8"}
                    style={{ marginBottom: 6 }}
                  />
                  <Text style={tpinModalStyles.channelTitle}>Email OTP</Text>
                  <Text style={tpinModalStyles.channelValue}>
                    {currentUser?.Email || currentUser?.email ? maskEmail(currentUser.Email || currentUser.email) : "N/A"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setOtpChannel("MOBILE");
                    setOtpValue("");
                    setIsOtpSent(false);
                    setOtpTimer(0);
                  }}
                  style={[
                    tpinModalStyles.blueChannelCard,
                    otpChannel === "MOBILE" && tpinModalStyles.blueChannelCardSelected,
                  ]}
                >
                  <Vector
                    as="feather"
                    name="smartphone"
                    size={20}
                    color={otpChannel === "MOBILE" ? "#0ea5e9" : "#94a3b8"}
                    style={{ marginBottom: 6 }}
                  />
                  <Text style={tpinModalStyles.channelTitle}>SMS OTP</Text>
                  <Text style={tpinModalStyles.channelValue}>
                    {currentUser?.MobileNumber || currentUser?.mobileNo ? maskMobile(currentUser.MobileNumber || currentUser.mobileNo) : "N/A"}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                onPress={handleSendOtp}
                disabled={otpTimer > 0}
                style={[
                  { marginTop: 15, borderRadius: 12, height: 48, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
                  otpTimer > 0 && { opacity: 0.5 }
                ]}
              >
                <LinearGradient colors={['#0ea5e9', '#0284c7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, fontFamily: FONTS.bold, color: '#FFF' }}>
                    {otpTimer > 0 ? "Resend OTP in " + otpTimer + "s" : isOtpSent ? "Resend OTP Code" : "Send OTP Verification"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {isOtpSent && (
              <View style={tpinModalStyles.successAlert}>
                <Text style={tpinModalStyles.successAlertText}>
                  ✓ OTP successfully sent to your registered {otpChannel === "EMAIL" ? "email address" : "mobile number"}.
                </Text>
              </View>
            )}

            {isOtpSent && (
              <View style={{ marginBottom: 20 }}>
                <Text style={tpinModalStyles.changeModalLabel}>ENTER OTP CODE</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={[tpinModalStyles.changeModalInputWrapper, { flex: 1 }]}>
                    <TextInput
                      placeholder="Enter 6-digit OTP"
                      placeholderTextColor="#94a3b8"
                      keyboardType="numeric"
                      maxLength={6}
                      editable={!isOtpVerified}
                      value={otpValue}
                      onChangeText={(val) => setOtpValue(val.replace(/[^0-9]/g, ''))}
                      style={[tpinModalStyles.changeModalInput, { letterSpacing: 6 }]}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={handleVerifyOtp}
                    disabled={otpValue.length < 6 || verifyOtpLoading || isOtpVerified}
                    style={[
                      { width: 100, borderRadius: 12, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
                      (otpValue.length < 6 && !isOtpVerified) && { opacity: 0.5 },
                      isOtpVerified && { backgroundColor: "#10B981" }
                    ]}
                  >
                    {!isOtpVerified ? (
                      <LinearGradient colors={['#0ea5e9', '#0284c7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        {verifyOtpLoading ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={{ fontSize: 14, fontFamily: FONTS.bold, color: '#FFF' }}>Verify</Text>
                        )}
                      </LinearGradient>
                    ) : (
                      <Text style={{ fontSize: 14, fontFamily: FONTS.bold, color: '#FFF' }}>Verified</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* New PIN Grouped Block */}
            <View style={tpinModalStyles.changeModalGroupCard}>
              <View style={tpinModalStyles.changeModalGroupRow}>
                <View style={{ flex: 1 }}>
                  <Text style={tpinModalStyles.changeModalLabel}>NEW 4-DIGIT TPIN</Text>
                  <TextInput
                    placeholder="••••"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry={!showSetupPin}
                    value={setupPin}
                    onChangeText={(val) => setSetupPin(val.replace(/[^0-9]/g, ''))}
                    style={tpinModalStyles.changeModalInputGrouped}
                  />
                </View>
                <TouchableOpacity onPress={() => setShowSetupPin(!showSetupPin)} style={{ padding: 5 }}>
                  <Vector as="feather" name={showSetupPin ? "eye" : "eye-off"} size={20} color="#0ea5e9" />
                </TouchableOpacity>
              </View>
              
              <View style={tpinModalStyles.changeModalDivider} />
              
              <View style={tpinModalStyles.changeModalGroupRow}>
                <View style={{ flex: 1 }}>
                  <Text style={tpinModalStyles.changeModalLabel}>CONFIRM 4-DIGIT TPIN</Text>
                  <TextInput
                    placeholder="••••"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry={!showConfirmPin}
                    value={setupConfirmPin}
                    onChangeText={(val) => setSetupConfirmPin(val.replace(/[^0-9]/g, ''))}
                    style={tpinModalStyles.changeModalInputGrouped}
                  />
                </View>
                <TouchableOpacity onPress={() => setShowConfirmPin(!showConfirmPin)} style={{ padding: 5 }}>
                  <Vector as="feather" name={showConfirmPin ? "eye" : "eye-off"} size={20} color="#0ea5e9" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={tpinModalStyles.modalButtonRow}>
              <TouchableOpacity
                onPress={() => {
                  setOpenSetTpin(false);
                  setSetupPin("");
                  setSetupConfirmPin("");
                  setOtpValue("");
                  setIsOtpSent(false);
                  setOtpTimer(0);
                  setIsOtpVerified(false);
                  setShowSetupPin(false);
                  setShowConfirmPin(false);
                }}
                disabled={setupLoading}
                style={[tpinModalStyles.modalCancelButton, { flex: 0.4 }]}
              >
                <Text style={tpinModalStyles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSetTpinSubmit}
                disabled={setupPin.length !== 4 || setupConfirmPin.length !== 4 || setupLoading}
                style={[
                  { flex: 1, marginLeft: 10 },
                  (setupPin.length !== 4 || setupConfirmPin.length !== 4) && { opacity: 0.5 }
                ]}
              >
                <LinearGradient colors={['#0ea5e9', '#0284c7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={tpinModalStyles.blueConfirmBtn}>
                  {setupLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={tpinModalStyles.blueConfirmBtnText}>Set TPIN</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
\n      {/* Verify TPIN Modal */}
      <Modal
        visible={openVerifyTpin}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setOpenVerifyTpin(false);
          setEnteredPin("");
          setShowEnteredPin(false);
        }}
      >
        <View style={tpinModalStyles.modalContainer}>
          <View style={[tpinModalStyles.modalContent, { paddingTop: 40 }]}>
            {/* Secure Vault Header Icon */}
            <View style={tpinModalStyles.secureVaultIconWrapper}>
              <View style={tpinModalStyles.secureVaultIconInner}>
                <Vector as="feather" name="lock" size={20} color="#0ea5e9" />
              </View>
            </View>

            <TouchableOpacity
              style={tpinModalStyles.closeButton}
              onPress={() => {
                setOpenVerifyTpin(false);
                setEnteredPin("");
                setShowEnteredPin(false);
              }}
            >
              <Vector as="feather" name="x" size={16} color="#64748B" />
            </TouchableOpacity>

            <Text style={tpinModalStyles.modalTitle}>Authenticate Transfer</Text>

            {tpinValues && (
              <LinearGradient colors={['#0ea5e9', '#0284c7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={tpinModalStyles.blueSummaryCard}>
                <View style={tpinModalStyles.summaryRow}>
                  <Text style={tpinModalStyles.blueSummaryLabel}>Transfer To</Text>
                  <Text style={tpinModalStyles.blueSummaryValue}>{tpinValues.ToRemitterID}</Text>
                </View>
                <View style={[tpinModalStyles.summaryRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={tpinModalStyles.blueSummaryLabel}>Amount</Text>
                  <Text style={tpinModalStyles.blueSummaryAmount}>{currency} {tpinValues.Amount}</Text>
                </View>
              </LinearGradient>
            )}

            <Text style={tpinModalStyles.modalDescription}>
              Enter your secure 4-digit TPIN to authorize this transaction.
            </Text>

            <View style={{ width: "80%", alignSelf: "center", position: "relative", marginBottom: 15 }}>
              <View style={tpinModalStyles.secureInputWrapper}>
                <TextInput
                  placeholder="••••"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry={!showEnteredPin}
                  value={enteredPin}
                  onChangeText={(val) => setEnteredPin(val.replace(/[^0-9]/g, ''))}
                  style={tpinModalStyles.securePinInput}
                />
                <TouchableOpacity
                  onPress={() => setShowEnteredPin(!showEnteredPin)}
                  style={tpinModalStyles.secureEyeIcon}
                >
                  <Vector
                    as="feather"
                    name={showEnteredPin ? "eye" : "eye-off"}
                    size={20}
                    color="#0ea5e9"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                setOpenVerifyTpin(false);
                setEnteredPin("");
                setShowEnteredPin(false);
                setOpenChangeTpin(true);
              }}
              style={{ alignSelf: 'center', marginBottom: 25 }}
            >
              <Text style={{ fontSize: 13, color: "#64748B", fontFamily: FONTS.bold, textDecorationLine: 'underline' }}>Forgot or Change TPIN?</Text>
            </TouchableOpacity>

            <View style={tpinModalStyles.modalButtonRow}>
              <TouchableOpacity
                onPress={() => {
                  setOpenVerifyTpin(false);
                  setEnteredPin("");
                  setShowEnteredPin(false);
                }}
                disabled={verifyLoading}
                style={[tpinModalStyles.modalCancelButton, { flex: 0.4 }]}
              >
                <Text style={tpinModalStyles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleVerifyTpinSubmit}
                disabled={enteredPin.length !== 4 || verifyLoading}
                style={[
                  { flex: 1, marginLeft: 10 },
                  (enteredPin.length !== 4) && { opacity: 0.5 }
                ]}
              >
                <LinearGradient colors={['#0ea5e9', '#0284c7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={tpinModalStyles.blueConfirmBtn}>
                  {verifyLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={tpinModalStyles.blueConfirmBtnText}>Verify & Transfer</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reset TPIN Modal */}
      <Modal
        visible={openResetTpin}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setOpenResetTpin(false);
          setResetPin("");
          setResetConfirmPin("");
          setOtpValue("");
          setIsOtpSent(false);
          setOtpTimer(0);
          setIsOtpVerified(false);
          setShowResetPin(false);
          setShowResetConfirmPin(false);
        }}
      >
        <View style={tpinModalStyles.modalContainer}>
          <View style={tpinModalStyles.modalContent}>
            <TouchableOpacity
              style={tpinModalStyles.closeButton}
              onPress={() => {
                setOpenResetTpin(false);
                setResetPin("");
                setResetConfirmPin("");
                setOtpValue("");
                setIsOtpSent(false);
                setOtpTimer(0);
                setIsOtpVerified(false);
                setShowResetPin(false);
                setShowResetConfirmPin(false);
              }}
            >
              <Vector as="feather" name="x" size={16} color="#1E293B" />
            </TouchableOpacity>

            <Text style={tpinModalStyles.modalTitle}>Reset Transaction PIN</Text>
            <Text style={tpinModalStyles.modalDescription}>
              Verify your identity to reset your TPIN.
            </Text>

            <Text style={tpinModalStyles.sectionLabel}>Verify Identity Via</Text>
            
            <View style={tpinModalStyles.channelContainer}>
              <TouchableOpacity
                onPress={() => {
                  setOtpChannel("MOBILE");
                  setOtpValue("");
                  setIsOtpSent(false);
                  setOtpTimer(0);
                }}
                style={[
                  tpinModalStyles.channelCard,
                  otpChannel === "MOBILE" && tpinModalStyles.channelCardSelected,
                ]}
              >
                <Vector
                  as="feather"
                  name="smartphone"
                  size={20}
                  color={otpChannel === "MOBILE" ? "#E94057" : "#94a3b8"}
                  style={{ marginBottom: 6 }}
                />
                <Text style={tpinModalStyles.channelTitle}>SMS OTP</Text>
                <Text style={tpinModalStyles.channelValue}>
                  {currentUser?.MobileNumber || currentUser?.mobileNo ? maskMobile(currentUser.MobileNumber || currentUser.mobileNo) : "N/A"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleSendOtp}
              disabled={otpTimer > 0}
              style={[
                tpinModalStyles.otpButton,
                otpTimer > 0 && { borderColor: "rgba(30, 41, 59, 0.1)" }
              ]}
            >
              <Text style={[tpinModalStyles.otpButtonText, otpTimer > 0 && { color: "#64748B" }]}>
                {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : isOtpSent ? "Resend OTP Code" : "Send OTP Verification"}
              </Text>
            </TouchableOpacity>

            {isOtpSent && (
              <View style={tpinModalStyles.successAlert}>
                <Text style={tpinModalStyles.successAlertText}>
                  ✓ OTP successfully sent to your registered {otpChannel === "EMAIL" ? "email address" : "mobile number"}.
                </Text>
              </View>
            )}

            {isOtpSent && (
              <View style={tpinModalStyles.inputWrapper}>
                <Text style={tpinModalStyles.inputLabel}>ENTER OTP CODE</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TextInput
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    maxLength={6}
                    editable={!isOtpVerified}
                    value={otpValue}
                    onChangeText={(val) => setOtpValue(val.replace(/[^0-9]/g, ''))}
                    style={[tpinModalStyles.textInput, { flex: 1 }]}
                  />
                  <TouchableOpacity
                    onPress={handleVerifyOtp}
                    disabled={otpValue.length < 6 || verifyOtpLoading || isOtpVerified}
                    style={[
                      tpinModalStyles.otpVerifyBtn,
                      isOtpVerified && { backgroundColor: "#10b981" },
                      (otpValue.length < 6 && !isOtpVerified) && { opacity: 0.5 }
                    ]}
                  >
                    {verifyOtpLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={tpinModalStyles.otpVerifyBtnText}>
                        {isOtpVerified ? "Verified" : "Verify"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={tpinModalStyles.inputWrapper}>
              <Text style={tpinModalStyles.inputLabel}>NEW 4-DIGIT TPIN</Text>
              <View style={tpinModalStyles.inputWithIconRow}>
                <TextInput
                  placeholder="Enter 4-digit TPIN"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry={!showResetPin}
                  value={resetPin}
                  onChangeText={(val) => setResetPin(val.replace(/[^0-9]/g, ''))}
                  style={tpinModalStyles.textInputClean}
                />
                <TouchableOpacity onPress={() => setShowResetPin(!showResetPin)}>
                  <Vector
                    as="feather"
                    name={showResetPin ? "eye" : "eye-off"}
                    size={20}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={tpinModalStyles.inputWrapper}>
              <Text style={tpinModalStyles.inputLabel}>CONFIRM 4-DIGIT TPIN</Text>
              <View style={tpinModalStyles.inputWithIconRow}>
                <TextInput
                  placeholder="Confirm 4-digit TPIN"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry={!showResetConfirmPin}
                  value={resetConfirmPin}
                  onChangeText={(val) => setResetConfirmPin(val.replace(/[^0-9]/g, ''))}
                  style={tpinModalStyles.textInputClean}
                />
                <TouchableOpacity onPress={() => setShowResetConfirmPin(!showResetConfirmPin)}>
                  <Vector
                    as="feather"
                    name={showResetConfirmPin ? "eye" : "eye-off"}
                    size={20}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={tpinModalStyles.modalButtonRow}>
              <TouchableOpacity
                onPress={() => {
                  setOpenResetTpin(false);
                  setResetPin("");
                  setResetConfirmPin("");
                  setOtpValue("");
                  setIsOtpSent(false);
                  setOtpTimer(0);
                  setIsOtpVerified(false);
                  setShowResetPin(false);
                  setShowResetConfirmPin(false);
                }}
                disabled={resetLoading}
                style={tpinModalStyles.modalCancelButton}
              >
                <Text style={tpinModalStyles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleResetTpinSubmit}
                disabled={resetPin.length !== 4 || resetConfirmPin.length !== 4 || resetLoading}
                style={[
                  tpinModalStyles.modalConfirmButton,
                  (resetPin.length !== 4 || resetConfirmPin.length !== 4) && { opacity: 0.5 }
                ]}
              >
                {resetLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={tpinModalStyles.modalConfirmButtonText}>Reset TPIN</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change TPIN Modal */}
      <Modal
        visible={openChangeTpin}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setOpenChangeTpin(false);
          setOldTpin("");
          setNewTpin("");
          setConfirmNewTpin("");
          setShowOldTpin(false);
          setShowNewTpin(false);
          setShowConfirmNewTpin(false);
        }}
      >
        <View style={tpinModalStyles.modalContainer}>
          <View style={[tpinModalStyles.modalContent, { paddingTop: 40 }]}>
            {/* Secure Vault Header Icon (Refresh style) */}
            <View style={tpinModalStyles.secureVaultIconWrapper}>
              <View style={tpinModalStyles.secureVaultIconInner}>
                <Vector as="feather" name="refresh-cw" size={20} color="#0ea5e9" />
              </View>
            </View>

            <TouchableOpacity
              style={tpinModalStyles.closeButton}
              onPress={() => {
                setOpenChangeTpin(false);
                setOldTpin("");
                setNewTpin("");
                setConfirmNewTpin("");
                setShowOldTpin(false);
                setShowNewTpin(false);
                setShowConfirmNewTpin(false);
              }}
            >
              <Vector as="feather" name="x" size={16} color="#64748B" />
            </TouchableOpacity>

            <Text style={tpinModalStyles.modalTitle}>Update TPIN</Text>
            <Text style={tpinModalStyles.modalDescription}>
              Enter your current TPIN and set a new one.
            </Text>

            {/* Current PIN Block */}
            <View style={{ marginBottom: 20 }}>
              <Text style={tpinModalStyles.changeModalLabel}>CURRENT TPIN</Text>
              <View style={tpinModalStyles.changeModalInputWrapper}>
                <TextInput
                  placeholder="••••"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry={!showOldTpin}
                  value={oldTpin}
                  onChangeText={(val) => setOldTpin(val.replace(/[^0-9]/g, ''))}
                  style={tpinModalStyles.changeModalInput}
                />
                <TouchableOpacity onPress={() => setShowOldTpin(!showOldTpin)} style={{ padding: 5 }}>
                  <Vector as="feather" name={showOldTpin ? "eye" : "eye-off"} size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            {/* New PIN Grouped Block */}
            <View style={tpinModalStyles.changeModalGroupCard}>
              <View style={tpinModalStyles.changeModalGroupRow}>
                <View style={{ flex: 1 }}>
                  <Text style={tpinModalStyles.changeModalLabel}>NEW TPIN</Text>
                  <TextInput
                    placeholder="••••"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry={!showNewTpin}
                    value={newTpin}
                    onChangeText={(val) => setNewTpin(val.replace(/[^0-9]/g, ''))}
                    style={tpinModalStyles.changeModalInputGrouped}
                  />
                </View>
                <TouchableOpacity onPress={() => setShowNewTpin(!showNewTpin)} style={{ padding: 5 }}>
                  <Vector as="feather" name={showNewTpin ? "eye" : "eye-off"} size={20} color="#0ea5e9" />
                </TouchableOpacity>
              </View>
              
              <View style={tpinModalStyles.changeModalDivider} />
              
              <View style={tpinModalStyles.changeModalGroupRow}>
                <View style={{ flex: 1 }}>
                  <Text style={tpinModalStyles.changeModalLabel}>CONFIRM NEW TPIN</Text>
                  <TextInput
                    placeholder="••••"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry={!showConfirmNewTpin}
                    value={confirmNewTpin}
                    onChangeText={(val) => setConfirmNewTpin(val.replace(/[^0-9]/g, ''))}
                    style={tpinModalStyles.changeModalInputGrouped}
                  />
                </View>
                <TouchableOpacity onPress={() => setShowConfirmNewTpin(!showConfirmNewTpin)} style={{ padding: 5 }}>
                  <Vector as="feather" name={showConfirmNewTpin ? "eye" : "eye-off"} size={20} color="#0ea5e9" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={tpinModalStyles.modalButtonRow}>
              <TouchableOpacity
                onPress={() => {
                  setOpenChangeTpin(false);
                  setOldTpin("");
                  setNewTpin("");
                  setConfirmNewTpin("");
                  setShowOldTpin(false);
                  setShowNewTpin(false);
                  setShowConfirmNewTpin(false);
                }}
                disabled={changeLoading}
                style={[tpinModalStyles.modalCancelButton, { flex: 0.4 }]}
              >
                <Text style={tpinModalStyles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleChangeTpinSubmit}
                disabled={oldTpin.length !== 4 || newTpin.length !== 4 || confirmNewTpin.length !== 4 || changeLoading}
                style={[
                  { flex: 1, marginLeft: 10 },
                  (oldTpin.length !== 4 || newTpin.length !== 4 || confirmNewTpin.length !== 4) && { opacity: 0.5 }
                ]}
              >
                <LinearGradient colors={['#0ea5e9', '#0284c7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={tpinModalStyles.blueConfirmBtn}>
                  {changeLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={tpinModalStyles.blueConfirmBtnText}>Update TPIN</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ToastConfig visible={showToast} message={toastMsg} onClose={() => setShowToast(false)} />
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Clean light blue-gray background
  },
  blueHeaderBlock: {
    
    paddingBottom: 70, // Extra padding for overlapping card
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: Platform.OS === 'ios' ? 40 : 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: RFValue(16),
    fontFamily: FONTS.bold,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  headerBalanceContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: RFValue(10),
    fontFamily: FONTS.bold,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  currencySymbol: {
    color: '#FFF',
    fontSize: RFValue(20),
    fontFamily: FONTS.bold,
    marginRight: 6,
  },
  mainAmount: {
    color: '#FFF',
    fontSize: RFValue(36),
    fontFamily: FONTS.bold,
    letterSpacing: -1,
  },
  decimalAmount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: RFValue(16),
    fontFamily: FONTS.medium,
  },
  eliteBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  eliteBadgeTxt: {
    color: '#FFF',
    fontSize: RFValue(9),
    fontFamily: FONTS.bold,
    letterSpacing: 1,
  },
  overlappingCard: {
    marginHorizontal: 15,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 25,
    ...Platform.select({
      ios: { shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0, shadowRadius: 25 },
      android: { elevation: 5 }
    }),
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: -45,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  infoTitle: {
    fontSize: RFValue(16),
    fontFamily: FONTS.bold,
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  infoDesc: {
    fontSize: RFValue(10),
    fontFamily: FONTS.regular,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: RFValue(16),
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  timelineWrapper: {
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  timelineNode: {
    flexDirection: 'row',
    minHeight: 65,
  },
  nodeIconCol: {
    alignItems: 'center',
    width: 32,
    marginRight: 15,
  },
  nodeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeConnector: {
    flex: 1,
    width: 2,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  nodeContent: {
    flex: 1,
    paddingBottom: 20,
    paddingTop: 4,
  },
  nodeTitle: {
    fontSize: RFValue(11),
    fontFamily: FONTS.semibold,
    color: '#1E293B',
    marginBottom: 2,
  },
  nodeDesc: {
    fontSize: RFValue(9),
    fontFamily: FONTS.regular,
    color: '#64748B',
  },
  headerDecor1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerDecor2: {
    position: 'absolute',
    bottom: -80,
    left: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  primaryBtnWrapper: {
    borderRadius: 16,
    ...Platform.select({
      ios: { shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12 },
      android: { elevation: 8 }
    }),
  },
  primaryBtn: {
    borderRadius: 16,
    backgroundColor: "transparent",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
    ...Platform.select({
      ios: { shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0, shadowRadius: 10 },
      android: { elevation: 4 }
    }),
  },
  primaryBtnDisabled: {
    opacity: 0.5,
    backgroundColor: '#93C5FD',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: RFValue(14),
    fontFamily: FONTS.bold,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  formTitle: {
    fontSize: RFValue(16),
    fontFamily: FONTS.semibold,
    color: '#1E293B',
  },
  
  formContainer: {
    marginHorizontal: 15,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    ...Platform.select({
      ios: { shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.2, shadowRadius: 25 },
      android: { elevation: 5 }
    }),
  },
  heroAmountCard: {
    backgroundColor: '#0ea5e9',
    borderRadius: 20,
    paddingVertical: 30,
    alignItems: 'center',
    marginBottom: 25,
    ...Platform.select({
      ios: { shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12 },
      android: { elevation: 6 }
    }),
  },
  heroAmountLabel: {
    fontSize: RFValue(9),
    fontFamily: FONTS.bold,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  heroAmountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAmountCurrency: {
    fontSize: RFValue(20),
    fontFamily: FONTS.semibold,
    color: '#FFF',
    marginRight: 6,
    marginTop: -4,
  },
  heroAmountInput: {
    fontSize: RFValue(32),
    fontFamily: FONTS.semibold,
    color: '#FFF',
    minWidth: 100,
    textAlign: 'center',
    letterSpacing: -1,
    outlineStyle: 'none',
  },
  unifiedCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unifiedInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  unifiedDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginLeft: 32,
  },
  unifiedIcon: {
    marginRight: 15,
  },
  unifiedInputLabel: {
    fontSize: RFValue(8),
    fontFamily: FONTS.bold,
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 4,
  },
  unifiedTextInput: {
    fontSize: RFValue(14),
    fontFamily: FONTS.semibold,
    color: '#1E293B',
    outlineStyle: 'none',
    padding: 0,
  },
  unifiedFootnote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 25,
  },
  unifiedFootnoteText: {
    fontSize: RFValue(9),
    fontFamily: FONTS.regular,
    color: '#64748B',
  },

  cancelBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountInputArea: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 15,
  },
  amountHeroLabel: {
    fontSize: RFValue(9),
    fontFamily: FONTS.bold,
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 10,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountHeroCurrency: {
    fontSize: RFValue(20),
    fontFamily: FONTS.bold,
    color: '#0F172A',
    marginRight: 6,
    marginTop: -4,
  },
  amountHeroInput: {
    fontSize: RFValue(42),
    fontFamily: FONTS.bold,
    color: '#0F172A',
    minWidth: 100,
    textAlign: 'center',
    letterSpacing: -2,
    outlineStyle: 'none',
  },
  amountUnderline: {
    width: 60,
    height: 3,
    backgroundColor: '#0ea5e9',
    borderRadius: 2,
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: RFValue(9),
    fontFamily: FONTS.bold,
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  inputWrapperActive: {
    borderColor: '#0ea5e9',
    backgroundColor: '#F0F9FF',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: '#0F172A',
    outlineStyle: 'none',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 4,
    gap: 4,
  },
  receiverHint: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: '#10B981',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 16,
    gap: 10,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  warningText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: '#0ea5e9',
    flex: 1,
  },
});
const tpinModalStyles = StyleSheet.create({

  changeModalLabel: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 6,
  },
  changeModalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 15,
  },
  changeModalInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#0F172A',
    letterSpacing: 4,
    outlineStyle: 'none',
  },
  changeModalGroupCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  changeModalGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  changeModalInputGrouped: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#0F172A',
    letterSpacing: 4,
    outlineStyle: 'none',
    padding: 0,
  },
  changeModalDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  blueChannelCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  blueChannelCardSelected: {
    borderColor: '#0ea5e9',
    backgroundColor: '#F0F9FF',
  },


  secureVaultIconWrapper: {
    position: 'absolute',
    top: -24,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 8 }
    }),
  },
  secureVaultIconInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blueSummaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    width: '100%',
  },
  blueSummaryLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  blueSummaryValue: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: '#FFF',
  },
  blueSummaryAmount: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#FFF',
  },
  secureInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 15,
  },
  securePinInput: {
    flex: 1,
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: '#0F172A',
    letterSpacing: 8,
    textAlign: 'center',
    outlineStyle: 'none',
  },
  secureEyeIcon: {
    position: 'absolute',
    right: 15,
    padding: 5,
  },
  blueConfirmBtn: {
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blueConfirmBtnText: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: '#FFF',
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    position: "relative",
    shadowColor: "#E94057",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(233, 64, 87, 0.1)',
  },
  closeButton: {
    position: "absolute",
    right: 18,
    top: 18,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 8,
    marginTop: 10,
  },
  modalDescription: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 10,
    lineHeight: 18,
    fontFamily: FONTS.medium,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: "#1E293B",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  channelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  channelCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(30, 41, 59, 0.05)",
    backgroundColor: "#fafafa",
    alignItems: "center",
    justifyContent: "center",
  },
  channelCardSelected: {
    borderColor: "#E94057",
    backgroundColor: "rgba(233, 64, 87, 0.05)",
  },
  channelTitle: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: "#1E293B",
    marginBottom: 4,
    marginTop: 8,
  },
  channelValue: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
    fontFamily: FONTS.medium,
  },
  otpButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "#E94057",
    backgroundColor: "transparent",
  },
  otpButtonText: {
    color: "#E94057",
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  otpVerifyBtn: {
    backgroundColor: "#E94057",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  otpVerifyBtnText: {
    color: "#fff",
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  successAlert: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "rgba(16, 185, 129, 0.2)",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  successAlertText: {
    color: "#059669",
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  inputWrapper: {
    marginBottom: 16,
    marginTop: -45,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: "#64748B",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: "rgba(30, 41, 59, 0.05)",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#1E293B",
    backgroundColor: "#fafafa",
    fontFamily: FONTS.medium,
  },
  textInputClean: {
    padding: 12,
    fontSize: 15,
    color: "#1E293B",
    flex: 1,
    fontFamily: FONTS.medium,
    height: "100%",
  },
  inputWithIconRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(30, 41, 59, 0.05)",
    borderRadius: 12,
    backgroundColor: "#fafafa",
    height: 50,
    paddingRight: 12,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 20,
  },
  modalCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(30, 41, 59, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelButtonText: {
    color: "#1E293B",
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  modalConfirmButton: {
    backgroundColor: "#E94057",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 120,
    shadowColor: "#E94057",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalConfirmButtonText: {
    color: "#fff",
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  summaryCard: {
    backgroundColor: "rgba(30, 41, 59, 0.02)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.05)",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#64748B",
    fontFamily: FONTS.medium,
  },
  summaryValue: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: "#1E293B",
  },
  summaryAmount: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: "#E94057",
  },
  pinCodeInput: {
    borderWidth: 1.5,
    borderColor: "rgba(30, 41, 59, 0.1)",
    borderRadius: 16,
    paddingVertical: 14,
    fontSize: 28,
    textAlign: "center",
    letterSpacing: 12,
    fontFamily: FONTS.bold,
    color: "#1E293B",
    backgroundColor: "#fafafa",
    width: "65%",
    alignSelf: "center",
    marginBottom: 24,
  },
});

export default MyWalletTransfer;
