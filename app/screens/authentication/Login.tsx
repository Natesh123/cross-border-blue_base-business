import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  LogBox,
  StyleSheet,
  KeyboardAvoidingView,
  Dimensions,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../core/theme";
import Button from "../../components/Button";
import Container from "../../theme/Container";
import Vector from "app/assets/vectors";
import { emailValidator, passwordValidator } from "../../core/utils";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRecoilState } from "recoil";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { ProfileState } from "app/atoms";
import Toast from "react-native-toast-message";
import Spinner from "react-native-loading-spinner-overlay";
import { loginService } from "app/services/auth.service";
import { FONTS, SIZES } from "app/constants/Assets";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppStatusBar from "../../components/AppStatusBar";
import Animated, { FadeInDown, FadeInUp, FadeInRight, FadeIn } from 'react-native-reanimated';

// Ignore warning in development if needed
LogBox.ignoreLogs(["[DOM] Password field is not contained in a form"]);

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isShortDevice = SCREEN_HEIGHT < 750;
const vScale = SCREEN_HEIGHT / 812;

const Login = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { width, height } = useWindowDimensions();
  const [ProfileItems, setProfileItems] = useRecoilState(ProfileState);

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setEmail({ value: "", error: "" });
    setPassword({ value: "", error: "" });
    setShowPassword(false);
  }, [isFocused]);

  useEffect(() => {
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);

    if (!emailError && !passwordError) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [email.value, password.value]);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const _onLoginPressed = async () => {
    setLoading(true);
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);

    if (emailError || passwordError) {
      setEmail({ ...email, error: emailError });
      setPassword({ ...password, error: passwordError });
      setLoading(false);

      let errorMsg = "Please fill in all required fields";
      if (!email.value && !password.value) {
        errorMsg = "Email and Password are required";
      } else if (!email.value) {
        errorMsg = "Please enter your email address";
      } else if (!password.value) {
        errorMsg = "Please enter your password";
      } else {
        errorMsg = "Please enter a valid email and password";
      }

      Toast.show({
        type: "error",
        text1: "Login Required",
        text2: errorMsg,
      });
      return;
    }

    const postData = {
      Email: email.value,
      Password: password.value,
    };

    console.log("LOGIN PRESSED - Calling Service with:", JSON.stringify(postData));

    loginService(
      postData,
      async (user: any) => {
        console.log("LOGIN SUCCESS CALLBACK IN COMPONENT:", JSON.stringify(user));

        setProfileItems({
          remitterId: user.RemitterID,
          firstName: user.FirstName,
          lastName: user.LastName,
          email: user.Email,
          mobileNo: user.MobileNumber,
          tokenId: user.TokenID,
        });

        if (user.Is_Doc_Upload === "Y") {
          Toast.show({
            type: "error",
            text1: "Login",
            text2: "Your KYC document has been rejected. Please re-upload.",
          });
        }

        if (user.StatusCode === "ER0000") {
          console.log("NAVIGATING TO App...");
          await AsyncStorage.setItem("isLoggedIn", "true");
          navigation.navigate("App" as never);
        } else if (user.StatusCode === "ER0053") {
          console.log("NAVIGATING TO PostRegistration...");
          navigation.navigate("PostRegistration" as never);
        } else {
          console.log("UNEXPECTED STATUS CODE IN COMPONENT SUCCESS:", user.StatusCode);
          Toast.show({
            type: "error",
            text1: "Login Result",
            text2: `Unexpected response: ${user.StatusMsg || "Unknown"} (Code: ${user.StatusCode})`,
          });
        }
      },
      (error: any) => {
        console.log("LOGIN ERROR CALLBACK IN COMPONENT:", JSON.stringify(error));
        if (error && (error.statusMsg || error.StatusMsg)) {
          Toast.show({
            type: "error",
            text1: "Login",
            text2: error.statusMsg || error.StatusMsg,
          });
        }
      },
      () => {
        console.log("LOGIN FINISHED");
        setLoading(false);
      }
    );
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
            <View style={[localStyles.headerSection, { height: SCREEN_HEIGHT * (isShortDevice ? 0.28 : 0.35) }]}>
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
                  Welcome Back!
                </Animated.Text>
                <Animated.Text entering={FadeInDown.delay(400).duration(800)} style={localStyles.subWelcomeText}>
                  Sign in to continue your journey.
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
                    <Text style={localStyles.loginTitle}>Login</Text>
                    <LinearGradient
                      colors={['#0ea5e9', '#0284c7']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={localStyles.accentBar}
                    />
                  </View>

                  {/* Input Fields */}
                  <View style={localStyles.inputContainer}>
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
                </View>

                <View style={localStyles.bottomActions}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("ForgotPassword")}
                    style={localStyles.forgotContainer}
                  >
                    <Text style={localStyles.forgotText}>Forgot Password?</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={_onLoginPressed}
                    activeOpacity={0.85}
                    style={localStyles.loginBtn}
                  >
                    <LinearGradient
                      colors={['#0ea5e9', '#0369a1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={localStyles.btnGradient}
                    >
                      <Text style={localStyles.loginBtnText}>Login</Text>
                      <View style={localStyles.btnArrow}>
                        <Vector as="ionicons" name="chevron-forward" size={16} color="#fff" />
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={localStyles.signupLinkContainer}>
                    <Text style={localStyles.noAccountText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                      <Text style={localStyles.signupText}>Sign up now</Text>
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
    marginBottom: 25,
  },
  headerTextContainer: {
    marginTop: 5,
  },
  welcomeText: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.semibold,
    color: '#0369a1',
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  subWelcomeText: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.medium,
    color: '#0ea5e9',
    marginTop: 6,
    fontWeight: '600',
    opacity: 0.8,
  },
  contentCard: {
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: '#ffffff',
    marginTop: -20,
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
    paddingTop: isShortDevice ? 25 : 40 * vScale,
    paddingBottom: isShortDevice ? 15 : 30 * vScale,
    flex: 1,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  formHeader: {
    marginBottom: isShortDevice ? 15 : 25 * vScale,
    marginTop: 0,
  },
  loginTitle: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: '#1e293b',
    fontWeight: '700',
  },
  accentBar: {
    width: 45,
    height: 5,
    borderRadius: 3,
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: isShortDevice ? 15 : 25 * vScale,
  },
  fieldLabel: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.semibold,
    color: '#475569',
    marginBottom: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: Math.max(54, 62 * vScale),
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
  },
  inputError: {
    borderColor: '#fca5a5',
    backgroundColor: '#fff1f2',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
  textInput: {
    flex: 1,
    fontSize: SIZES.h3,
    color: '#1e293b',
    fontFamily: FONTS.medium,
    fontWeight: '600',
    // @ts-ignore - remove web focus outline
    outlineStyle: 'none',
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    fontSize: SIZES.small,
    color: '#ef4444',
    marginTop: 8,
    marginLeft: 6,
    fontFamily: FONTS.medium,
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: isShortDevice ? 20 : 35 * vScale,
  },
  forgotText: {
    fontSize: SIZES.small,
    color: '#0ea5e9',
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
  loginBtn: {
    height: isShortDevice ? 56 : Math.max(58, 66 * vScale),
    borderRadius: 22,
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
    marginBottom: isShortDevice ? 15 : 25 * vScale,
  },
  btnGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  btnArrow: {
    position: 'absolute',
    right: 20,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isShortDevice ? 15 : (Platform.OS === 'ios' ? 35 * vScale : 20 * vScale),
  },
  topContentGroup: {
    width: '100%',
  },
  inputContainer: {
    width: '100%',
  },
  bottomActions: {
    marginTop: 20,
  },
  noAccountText: {
    color: '#64748b',
    fontSize: SIZES.small,
    fontFamily: FONTS.regular,
    fontWeight: '500',
  },
  signupText: {
    color: '#0ea5e9',
    fontSize: SIZES.small,
    fontFamily: FONTS.bold,
    fontWeight: '900',
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      }
    }),
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      }
    }),
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
    fontSize: SIZES.medium,
    fontWeight: '900',
    color: '#064e3b',
    fontFamily: FONTS.bold,
  },
  toastTitleError: {
    fontSize: SIZES.medium,
    fontWeight: '900',
    color: '#7f1d1d',
    fontFamily: FONTS.bold,
  },
  toastMessageSuccess: {
    fontSize: SIZES.p13,
    color: '#047857',
    fontFamily: FONTS.regular,
    marginTop: 1,
  },
  toastMessageError: {
    fontSize: SIZES.p13,
    color: '#b91c1c',
    fontFamily: FONTS.regular,
    marginTop: 1,
  },
});

export default Login;
