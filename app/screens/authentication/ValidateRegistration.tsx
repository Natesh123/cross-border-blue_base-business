import React, { useState } from "react";
import { Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";

import { theme } from '../../core/theme';
import Button from "../../components/Button";
import Container from "../../theme/Container";
import styles from "../../styles";
import Vector from "app/assets/vectors";
import { emailValidator, passwordValidator } from "../../core/utils";
import { SafeAreaView } from "react-native-safe-area-context";
import { Authenticate } from "app/http-services/models/request/authenticate";
import { authenticate, RemitterPreRegistration, ValidateOTP } from "app/http-services";
import { useRecoilState } from "recoil";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { ProfileState } from "app/atoms";
import Toast from "react-native-toast-message";
import Spinner from "react-native-loading-spinner-overlay";
import { ValidateRegistrationParamList } from "types";
import { FONTS, SIZES } from "app/constants/Assets";
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from "@react-native-async-storage/async-storage";

const ValidateRegistration = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<{ params: ValidateRegistrationParamList }, 'params'>>()
    const [email, setEmail] = useState(route.params?.email);
    const [mobile, setMobile] = useState(route.params?.mobile);
    const [password, setPassword] = useState(route.params?.password);
    const [referralId, setReferralId] = useState(route.params?.referralId);

    const { width } = useWindowDimensions();
    const [ProfileItems, setProfileItems] = useRecoilState(ProfileState);

    const [loading, setLoading] = useState(false);

    const [emailOTP, setEmailOTP] = useState({ value: '', error: '' });
    const [mobileOTP, setMobileOTP] = useState({ value: '', error: '' });



    const keyboardVerticalOffset = Platform.OS === 'ios' ? 80 : 0;

    const _onLoginPressed = async () => {
        setLoading(true)


        const postData: any = {
            email: email,
            emailOTP: "",
            mobile: mobile,
            type: 'R',
            mobileOTP: mobileOTP.value
        };

        const response = ValidateOTP(postData);
        const accountType = await AsyncStorage.getItem("accountType");
        const isPerBusType = accountType === "Business" ? "Y" : "N";
        response.then((res: any) => {
            if (res.status === 200) {
                if (res.data.StatusCode === "ER0000") {
                    const preRegistrationData: any = {
                        email: email,
                        mobileNumber: mobile,
                        password: password,
                        referralId: referralId,
                        IsPerBusType: isPerBusType

                    };
                    const response = RemitterPreRegistration(preRegistrationData);
                    response.then((res: any) => {
                        if (res.status === 200) {
                            if (res.data.StatusCode === "ER0000") {
                                Toast.show({
                                    type: 'success',
                                    text1: 'Registration',
                                    text2: res.data.StatusMsg
                                });

                                navigation.navigate('Login');
                            } else {
                                Toast.show({
                                    type: 'error',
                                    text1: 'Registration',
                                    text2: res.data.StatusMsg
                                });
                            }
                        }
                    })
                        .catch((err: any) => {
                            Toast.show({
                                type: 'error',
                                text1: 'Registration',
                                text2: err
                            });
                        })
                        .finally(() => setLoading(false));

                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Registration',
                        text2: res.data.StatusMsg
                    });
                }
            }
        })
            .catch((err: any) => {
                Toast.show({
                    type: 'error',
                    text1: 'Validate',
                    text2: err
                });
            })
            .finally(() => setLoading(false));
    }


    return (
        <SafeAreaView style={[styles.container]}>
            <Container>
                <View style={{ width: "100%", backgroundColor: '#fff', padding: 20, paddingBottom: 0 }}>
                    <LinearGradient colors={[theme.colors.buttonPrimary, theme.colors.buttonSecondary]} start={{ x: -0.1, y: 0.0 }} end={{ x: 1.1, y: 0.4 }} style={{ backgroundColor: theme.colors.primary, width: 36, height: 36, borderRadius: 50, alignItems: "center", justifyContent: "center" }}>
                        <TouchableOpacity onPress={() => navigation.navigate('Onboarding')}>
                            <Vector
                                as="ionicons"
                                name="arrow-back"
                                style={{ color: theme.colors.inSideColor }}
                                size={22}
                            />
                        </TouchableOpacity>
                    </LinearGradient>
                    <View>
                        <Text style={[{ fontSize: SIZES.h1, fontFamily: FONTS.bold, marginVertical: 10 }]}>Enter OTP</Text>
                    </View>
                </View>
                <ScrollView style={{ width: "100%", backgroundColor: '#fff', padding: 20, paddingTop: 0 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}>
                    <View>
                        <Text style={[styles.headerDescription, { fontSize: SIZES.p16, fontFamily: FONTS.bold, marginVertical: 10 }]}>Kindly enter the OTP sent to your mobile</Text>
                    </View>
                    <View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>
                                Mobile OTP
                            </Text>
                            <View style={styles.inputControls}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    value={mobileOTP.value}
                                    onChangeText={(text: any) => setMobileOTP({ value: text, error: '' })}
                                    autoCapitalize="none"
                                    placeholder="Mobile OTP"
                                    textContentType="none"
                                    keyboardType="numeric"
                                />
                            </View>
                            {mobileOTP.error ? <Text style={styles.error}>{mobileOTP.error}</Text> : null}
                        </View>
                        <View style={styles.forgotPassword}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Signup')}
                            >
                                <Text style={styles.link}>Resend OTP</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>
                                Email OTP
                            </Text>
                            <View style={styles.inputControls}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    value={emailOTP.value}
                                    onChangeText={(text: any) => setEmailOTP({ value: text, error: '' })}
                                    autoCapitalize="none"
                                    placeholder="Email OTP"
                                    textContentType="none"
                                    keyboardType="numeric"
                                />
                            </View>
                            {emailOTP.error ? <Text style={styles.error}>{emailOTP.error}</Text> : null}
                        </View>
                        <View style={styles.forgotPassword}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Signup')}
                            >
                                <Text style={styles.link}>Resend OTP</Text>
                            </TouchableOpacity>
                        </View>

                        <Button style={{ marginBottom: 10 }} onPress={_onLoginPressed}>
                            Confirm
                        </Button>

                        <View style={styles.row}>
                            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                <Text style={[styles.link, { marginLeft: 5, fontSize: SIZES.p18 }]}>Back to Register</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
                {loading && <Spinner
                    visible={true}
                    size='large'
                    animation='slide'
                />}
            </Container>
        </SafeAreaView>
    );
};

export default ValidateRegistration;
