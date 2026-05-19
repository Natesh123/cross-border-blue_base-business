import React, { useState, useEffect } from "react";
import {
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../core/theme";
import Button from "../../components/Button";
import Container from "../../theme/Container";
import Vector from "app/assets/vectors";
import { emailValidator, passwordValidator } from "../../core/utils";
import { SafeAreaView } from "react-native-safe-area-context";
import { ValidatePreRegistration } from "app/http-services";
import { useRecoilState } from "recoil";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { ProfileState } from "app/atoms";
import Toast from "react-native-toast-message";
import Spinner from "react-native-loading-spinner-overlay";
import Checkbox from "app/components/Checkbox";
import { FONTS, SIZES } from "app/constants/Assets";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppStatusBar from "../../components/AppStatusBar";
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isShortDevice = SCREEN_HEIGHT < 750;
const vScale = SCREEN_HEIGHT / 812;

const Signup = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [ProfileItems, setProfileItems] = useRecoilState(ProfileState);
  const [loading, setLoading] = useState(false);

  // ✅ Account Type (default = personal)
  const [accountType, setAccountType] = useState("personal");

  // ✅ Form states
  const [email, setEmail] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const [mobileNo, setMobileNo] = useState({ value: "", error: "" });
  const [countryCode, setCountryCode] = useState({ value: "91", error: "" });

  const [checkedTerms, setCheckedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword(!showPassword);

  // ✅ Save selected account type
  const handleAccountTypeChange = async (type: string) => {
    setAccountType(type);
    try {
      const value = type === "personal" ? "Personal" : "Business";
      await AsyncStorage.setItem("accountType", value);
    } catch (error) {
      console.log("Error saving account type:", error);
    }
  };

  // ✅ Load stored account type
  useEffect(() => {
    const loadAccountType = async () => {
      try {
        const savedType = await AsyncStorage.getItem("accountType");
        if (savedType) {
          setAccountType(savedType.toLowerCase());
        } else {
          await AsyncStorage.setItem("accountType", "Personal");
          setAccountType("personal");
        }
      } catch (error) {
        console.log("Error loading account type:", error);
      }
    };
    loadAccountType();
  }, [isFocused]);

  const _onSignUpPressed = async () => {
    setLoading(true);

    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);
    const mobileError = mobileNo.value.length < 10 ? "Enter a valid mobile number" : "";

    setEmail({ ...email, error: emailError });
    setPassword({ ...password, error: passwordError });
    setMobileNo({ ...mobileNo, error: mobileError });

    if (emailError || passwordError || mobileError) {
      Toast.show({
        type: "error",
        text1: "Sign up Required",
        text2: "Please enter valid details.",
      });
      setLoading(false);
      return;
    }

    if (!checkedTerms) {
      Toast.show({
        type: "error",
        text1: "Agreement Required",
        text2: "Please agree to the Terms & Conditions.",
      });
      setLoading(false);
      return;
    }

    const postData = {
      email: email.value,
      mobileNumber: countryCode.value + "-" + mobileNo.value,
      password: password.value,
      accountType: accountType === "personal" ? "Personal" : "Business",
    };

    try {
      const res = await ValidatePreRegistration(postData);
      if (res.status === 200) {
        if (res.data.StatusCode === "ER0000") {
          Toast.show({
            type: "success",
            text1: "Registration",
            text2: "OTP has been sent to your registered mobile number",
          });

          let param = {
            email: email.value,
            mobile: countryCode.value + "-" + mobileNo.value,
            password: password.value,
          };

          navigation.navigate("ValidateRegistration", param);
        } else {
          Toast.show({
            type: "error",
            text1: "Registration",
            text2: res.data.StatusMsg,
          });
        }
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Registration",
        text2: err.toString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const toastConfig = {
    success: ({ text1, text2 }: any) => (
      <View style={localStyles.toastContainerSuccess}>
        <LinearGradient
          colors={['#f0fdf4', '#ffffff']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={localStyles.toastGradient}
        >
          <View style={localStyles.toastIconBoxSuccess}>
            <Vector as="feather" name="check-circle" size={20} color="#10b981" />
          </View>
          <View style={localStyles.toastContent}>
            <Text style={localStyles.toastTitleSuccess}>{text1}</Text>
            {text2 && <Text style={localStyles.toastMessageSuccess}>{text2}</Text>}
          </View>
        </LinearGradient>
      </View>
    ),
    error: ({ text1, text2 }: any) => (
      <View style={localStyles.toastContainerError}>
        <LinearGradient
          colors={['#fef2f2', '#ffffff']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={localStyles.toastGradient}
        >
          <View style={localStyles.toastIconBoxError}>
            <Vector as="feather" name="alert-circle" size={20} color="#ef4444" />
          </View>
          <View style={localStyles.toastContent}>
            <Text style={localStyles.toastTitleError}>{text1}</Text>
            {text2 && <Text style={localStyles.toastMessageError}>{text2}</Text>}
          </View>
        </LinearGradient>
      </View>
    ),
  };

  return (
    <View style={[localStyles.mainContainer, { overflow: 'hidden' }]}>
      <AppStatusBar style="dark" translucent />
      <Toast config={toastConfig} />

      {/* Background with Decorative Glows */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['#f0f9ff', '#e0f2fe', '#bae6fd']}
          style={StyleSheet.absoluteFill}
        />
        <View style={localStyles.bgCircle1} />
        <View style={localStyles.bgCircle2} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={{ flex: 1 }}>
            {/* Top Header Section */}
            <View style={[localStyles.headerSection, { height: SCREEN_HEIGHT * (isShortDevice ? 0.24 : 0.30) }]}>
              <View style={localStyles.headerTop}>
                <Animated.View entering={FadeInDown.duration(800)}>
                  <TouchableOpacity
                    style={localStyles.backButton}
                    onPress={() => navigation.navigate("Onboarding")}
                  >
                    <Vector as="ionicons" name="arrow-back" size={24} color="#0369a1" />
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(100).duration(800)} style={localStyles.logoContainer}>
                  <Image
                    source={require('../../assets/logos/kashremit_logo.png')}
                    style={localStyles.appLogo}
                    resizeMode="contain"
                  />
                </Animated.View>
              </View>

              <View style={localStyles.headerTextContainer}>
                <Animated.Text entering={FadeInDown.delay(200).duration(800)} style={localStyles.welcomeText}>
                  Create Account
                </Animated.Text>
                <Animated.Text entering={FadeInDown.delay(400).duration(800)} style={localStyles.subWelcomeText}>
                  Join us and start your journey today.
                </Animated.Text>
              </View>
            </View>

            {/* Form Content Card */}
            <Animated.View
              entering={FadeInUp.delay(600).duration(800)}
              style={localStyles.contentCard}
            >
              <LinearGradient
                colors={['#ffffff', '#fcfdfe']}
                style={localStyles.cardGradient}
              >
                <View style={localStyles.topContentGroup}>
                  <View style={localStyles.formHeader}>
                    <Text style={localStyles.formTitle}>Sign up</Text>
                    <LinearGradient
                      colors={['#0ea5e9', '#0284c7']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={localStyles.accentBar}
                    />
                  </View>

                  {/* Account Type Toggle inside Card */}
                  <View style={localStyles.toggleBg}>
                    <TouchableOpacity
                      onPress={() => handleAccountTypeChange('personal')}
                      style={[localStyles.toggleBtn, accountType === 'personal' && localStyles.activeToggle]}
                    >
                      <Text style={[localStyles.toggleText, accountType === 'personal' && localStyles.activeToggleText]}>
                        Personal
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleAccountTypeChange('business')}
                      style={[localStyles.toggleBtn, accountType === 'business' && localStyles.activeToggle]}
                    >
                      <Text style={[localStyles.toggleText, accountType === 'business' && localStyles.activeToggleText]}>
                        Business
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Input Fields */}
                  <View style={localStyles.inputContainer}>
                    {/* Email */}
                    <View style={localStyles.inputGroup}>
                      <Text style={localStyles.fieldLabel}>Email Address</Text>
                      <View style={[localStyles.inputWrapper, email.error ? localStyles.inputError : null]}>
                        <View style={localStyles.iconBox}>
                          <Vector as="feather" name="mail" size={18} color="#0ea5e9" />
                        </View>
                        <TextInput
                          style={localStyles.textInput}
                          value={email.value}
                          onChangeText={(text) => setEmail({ value: text, error: "" })}
                          autoCapitalize="none"
                          placeholder="example@email.com"
                          placeholderTextColor="#94a3b8"
                          keyboardType="email-address"
                        />
                      </View>
                      {email.error ? <Text style={localStyles.errorText}>{email.error}</Text> : null}
                    </View>

                    {/* Mobile */}
                    <View style={localStyles.inputGroup}>
                      <Text style={localStyles.fieldLabel}>Mobile Number</Text>
                      <View style={[localStyles.inputWrapper, mobileNo.error ? localStyles.inputError : null]}>
                        <View style={localStyles.iconBox}>
                          <Vector as="feather" name="phone" size={18} color="#0ea5e9" />
                        </View>
                        <View style={localStyles.countryCodeBox}>
                          <Text style={localStyles.countryCodeText}>+{countryCode.value}</Text>
                        </View>
                        <TextInput
                          style={localStyles.textInput}
                          value={mobileNo.value}
                          onChangeText={(text) => setMobileNo({ value: text.replace(/[^0-9]/g, ''), error: "" })}
                          placeholder="1234567890"
                          placeholderTextColor="#94a3b8"
                          keyboardType="numeric"
                        />
                      </View>
                      {mobileNo.error ? <Text style={localStyles.errorText}>{mobileNo.error}</Text> : null}
                    </View>

                    {/* Password */}
                    <View style={localStyles.inputGroup}>
                      <Text style={localStyles.fieldLabel}>Password</Text>
                      <View style={[localStyles.inputWrapper, password.error ? localStyles.inputError : null]}>
                        <View style={localStyles.iconBox}>
                          <Vector as="feather" name="lock" size={18} color="#0ea5e9" />
                        </View>
                        <TextInput
                          style={localStyles.textInput}
                          placeholder="••••••••"
                          placeholderTextColor="#94a3b8"
                          value={password.value}
                          onChangeText={(text) => setPassword({ value: text, error: "" })}
                          secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity style={localStyles.eyeIcon} onPress={toggleShowPassword}>
                          <Vector
                            as="feather"
                            name={showPassword ? "eye" : "eye-off"}
                            size={18}
                            color="#94a3b8"
                          />
                        </TouchableOpacity>
                      </View>
                      {password.error ? <Text style={localStyles.errorText}>{password.error}</Text> : null}
                    </View>


                  </View>

                  {/* Terms Checkbox */}
                  <View style={localStyles.termsRow}>
                    <Checkbox
                      status={checkedTerms ? "checked" : "unchecked"}
                      onPress={() => setCheckedTerms(!checkedTerms)}
                    />
                    <Text style={localStyles.termsLabel}>I have agreed to the </Text>
                    <TouchableOpacity>
                      <Text style={localStyles.termsLink}>Terms & Condition</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Bottom Actions */}
                <View style={localStyles.bottomActions}>
                  <TouchableOpacity
                    onPress={_onSignUpPressed}
                    activeOpacity={0.85}
                    style={localStyles.signUpBtn}
                  >
                    <LinearGradient
                      colors={['#0ea5e9', '#0369a1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={localStyles.btnGradient}
                    >
                      <Text style={localStyles.signUpBtnText}>Sign up</Text>
                      <View style={localStyles.btnArrow}>
                        <Vector as="ionicons" name="chevron-forward" size={16} color="#fff" />
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={localStyles.loginLinkContainer}>
                    <Text style={localStyles.alreadyAccountText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                      <Text style={localStyles.loginText}>Login</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {loading && (
        <Spinner visible={true} size="large" animation="fade" />
      )}
    </View>
  );
};

const localStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  bgCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
  },
  bgCircle2: {
    position: 'absolute',
    top: 150,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(186, 230, 253, 0.3)',
  },
  headerSection: {
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingHorizontal: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0ea5e9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      }
    }),
  },
  appLogo: {
    width: 45,
    height: 45,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0ea5e9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      }
    }),
    marginBottom: 0,
  },
  headerTextContainer: {
    marginTop: 15,
  },
  welcomeText: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.semibold,
    color: '#0369a1',
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: isShortDevice ? 24 : 28,
  },
  subWelcomeText: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.medium,
    color: '#0ea5e9',
    marginTop: 4,
    fontWeight: '600',
    opacity: 0.8,
  },
  contentCard: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: '#f1f5f9',
    marginTop: -35,
    flex: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -15 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 25,
      }
    }),
  },
  cardGradient: {
    paddingHorizontal: 28,
    paddingTop: isShortDevice ? 15 : 25 * vScale,
    paddingBottom: isShortDevice ? 30 : 40 * vScale,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    flex: 1,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingBottom: 60,
    flexGrow: 1,
  },
  topContentGroup: {
    width: '100%',
  },
  formHeader: {
    marginBottom: isShortDevice ? 10 : 15 * vScale,
  },
  formTitle: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: '#1e293b',
    fontWeight: '700',
  },
  accentBar: {
    width: 45,
    height: 5,
    borderRadius: 3,
    marginTop: 6,
  },
  toggleBg: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 15,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeToggle: {
    backgroundColor: '#ffffff',
    ...Platform.select({
      ios: {
        shadowColor: '#0ea5e9',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      }
    }),
  },
  toggleText: {
    fontSize: SIZES.p16,
    fontFamily: FONTS.bold,
    color: '#64748b',
    fontWeight: '700',
  },
  activeToggleText: {
    color: '#0ea5e9',
  },
  inputContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: isShortDevice ? 12 : 18 * vScale,
  },
  fieldLabel: {
    fontSize: SIZES.p18,
    fontFamily: FONTS.semibold,
    color: '#475569',
    marginBottom: 8,
    fontWeight: '700',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 18,
    paddingHorizontal: 14,
    height: Math.max(50, 56 * vScale),
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
  },
  inputError: {
    borderColor: '#fca5a5',
    backgroundColor: '#fff1f2',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#0ea5e9',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      }
    }),
  },
  countryCodeBox: {
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#cbd5e1',
    marginRight: 10,
  },
  countryCodeText: {
    fontSize: SIZES.p16,
    fontFamily: FONTS.bold,
    color: '#1e293b',
    fontWeight: '700',
  },
  textInput: {
    flex: 1,
    fontSize: SIZES.p20,
    color: '#1e293b',
    fontFamily: FONTS.medium,
    fontWeight: '600',
    // @ts-ignore
    outlineStyle: 'none',
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    fontSize: SIZES.p11,
    color: '#ef4444',
    marginTop: 4,
    marginLeft: 6,
    fontFamily: FONTS.medium,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    paddingLeft: 4,
  },
  termsLabel: {
    fontSize: SIZES.p11,
    color: '#64748b',
    fontFamily: FONTS.medium,
    marginLeft: 8,
  },
  termsLink: {
    fontSize: SIZES.p11,
    color: '#0ea5e9',
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  bottomActions: {
    marginTop: isShortDevice ? 15 : 25 * vScale,
  },
  signUpBtn: {
    height: Math.max(54, 60 * vScale),
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0ea5e9',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
      },
      android: {
        elevation: 10,
      }
    }),
    marginBottom: isShortDevice ? 10 : 15 * vScale,
  },
  btnGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  signUpBtnText: {
    color: '#ffffff',
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  btnArrow: {
    position: 'absolute',
    right: 20,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  alreadyAccountText: {
    color: '#64748b',
    fontSize: SIZES.p16,
    fontFamily: FONTS.regular,
  },
  loginText: {
    color: '#0ea5e9',
    fontSize: SIZES.p16,
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
  // Toast Styles
  toastContainerSuccess: {
    height: 70,
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderLeftWidth: 6,
    borderLeftColor: '#10b981',
    marginTop: Platform.OS === 'ios' ? 20 : 50,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  toastContainerError: {
    height: 70,
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderLeftWidth: 6,
    borderLeftColor: '#ef4444',
    marginTop: Platform.OS === 'ios' ? 20 : 50,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  toastGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  toastIconBoxSuccess: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastIconBoxError: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastContent: {
    marginLeft: 12,
    flex: 1,
  },
  toastTitleSuccess: {
    fontSize: 16,
    fontWeight: '900',
    color: '#064e3b',
    fontFamily: FONTS.bold,
  },
  toastTitleError: {
    fontSize: 16,
    fontWeight: '900',
    color: '#7f1d1d',
    fontFamily: FONTS.bold,
  },
  toastMessageSuccess: {
    fontSize: 13,
    color: '#047857',
    fontFamily: FONTS.regular,
    marginTop: 1,
  },
  toastMessageError: {
    fontSize: 13,
    color: '#b91c1c',
    fontFamily: FONTS.regular,
    marginTop: 1,
  },
});

export default Signup;
