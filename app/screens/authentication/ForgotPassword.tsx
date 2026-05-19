import React, { useState } from "react";
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
  KeyboardAvoidingView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../core/theme";
import Button from "../../components/Button";
import Container from "../../theme/Container";
import Vector from "app/assets/vectors";
import { emailValidator } from "../../core/utils";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { FONTS, SIZES } from "app/constants/Assets";
import AppStatusBar from "../../components/AppStatusBar";
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isShortDevice = SCREEN_HEIGHT < 750;
const vScale = SCREEN_HEIGHT / 812;

const ForgotPassword = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState({ value: "", error: "" });
  const [loading, setLoading] = useState(false);

  const handleSendResetLink = () => {
    const emailError = emailValidator(email.value);
    if (emailError) {
      setEmail({ ...email, error: emailError });
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Toast.show({
        type: "success",
        text1: "Reset Link Sent",
        text2: "If this email is registered, a reset link has been sent!",
      });
    }, 1500);
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
                    onPress={() => navigation.goBack()}
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
                  Forgot Password?
                </Animated.Text>
                <Animated.Text entering={FadeInDown.delay(400).duration(800)} style={localStyles.subWelcomeText}>
                  No worries! Enter your email to receive a reset link.
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
                    <Text style={localStyles.formTitle}>Reset Password</Text>
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
                  </View>
                </View>

                <View style={localStyles.bottomActions}>
                  <TouchableOpacity
                    onPress={handleSendResetLink}
                    activeOpacity={0.85}
                    style={localStyles.resetBtn}
                  >
                    <LinearGradient
                      colors={['#0ea5e9', '#0369a1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={localStyles.btnGradient}
                    >
                      <Text style={localStyles.resetBtnText}>Send Reset Link</Text>
                      <View style={localStyles.btnArrow}>
                        <Vector as="ionicons" name="paper-plane" size={16} color="#fff" />
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={localStyles.loginLinkContainer}>
                    <Text style={localStyles.rememberText}>Remember your password? </Text>
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
    fontSize: isShortDevice ? SIZES.medium : SIZES.h3,
    fontFamily: FONTS.semibold,
    color: '#0369a1',
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: isShortDevice ? 24 : 28,
  },
  subWelcomeText: {
    fontSize: SIZES.small,
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
    marginTop: -35,
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
    paddingTop: isShortDevice ? 25 : 40 * vScale,
    paddingBottom: isShortDevice ? 20 : 30 * vScale,
    flex: 1,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  formHeader: {
    marginBottom: isShortDevice ? 20 : 30 * vScale,
  },
  formTitle: {
    fontSize: SIZES.medium,
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
    fontSize: 12,
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
    fontSize: 12,
    color: '#1e293b',
    fontFamily: FONTS.medium,
    fontWeight: '600',
    // @ts-ignore
    outlineStyle: 'none',
  },
  errorText: {
    fontSize: 10,
    color: '#ef4444',
    marginTop: 8,
    marginLeft: 6,
    fontFamily: FONTS.medium,
  },
  bottomActions: {
    marginTop: 20,
  },
  resetBtn: {
    height: Math.max(58, 66 * vScale),
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
  resetBtnText: {
    color: '#ffffff',
    fontSize: SIZES.font,
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
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isShortDevice ? 15 : (Platform.OS === 'ios' ? 35 * vScale : 20 * vScale),
  },
  rememberText: {
    color: '#64748b',
    fontSize: 12,
    fontFamily: FONTS.regular,
    fontWeight: '500',
  },
  loginText: {
    color: '#0ea5e9',
    fontSize: 12,
    fontFamily: FONTS.bold,
    fontWeight: '900',
  },
  topContentGroup: {
    width: '100%',
  },
  inputContainer: {
    width: '100%',
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

export default ForgotPassword;
