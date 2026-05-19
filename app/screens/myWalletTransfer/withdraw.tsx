import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Platform,
    StatusBar,
    Dimensions,
    KeyboardAvoidingView,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { useRecoilValue } from "recoil";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { ProfileState } from "../../atoms";
import { GetWalletBalance, WalletWithdrawal } from "app/http-services";
import { FONTS, SIZES, SHADOWS } from "../../constants/Assets";
import COLORS from "../../constants/Colors";

import ToastConfig from "app/components/ToastConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Vector from "app/assets/vectors";

const { width } = Dimensions.get('window');

const Withdraw = () => {
    const navigation = useNavigation();
    const currentToken = useRecoilValue(ProfileState);
    const isFocused = useIsFocused();

    const [currency, setCurrency] = useState("£");
    const [availableBalance, setAvailableBalance] = useState("0.00");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState("");

    const isConfirmDisabled = !amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(availableBalance);

    useEffect(() => {
        const _currency = (typeof process !== 'undefined' && process.env && process.env.CURRENCY_SYMBOL) || "£";
        setCurrency(_currency);
        fetchWalletBalance(currentToken.tokenId);
    }, [isFocused]);

    const fetchWalletBalance = async (tokenId: string) => {
        try {
            setLoading(true);
            const res = await GetWalletBalance(tokenId);
            if (res?.status === 200) {
                setAvailableBalance(res?.data?.BalanceAmount || "0.00");
            }
        } catch (error) {
            console.error("Error fetching wallet balance:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            setToastMsg("Please enter a valid amount");
            setShowToast(true);
            return;
        }

        if (parseFloat(amount) > parseFloat(availableBalance)) {
            setToastMsg("Insufficient balance");
            setShowToast(true);
            return;
        }

        try {
            setLoading(true);
            const reqPayload = { Amount: amount };
            const response = await WalletWithdrawal(reqPayload);
            const statusCode = response?.data?.statusCode || response?.data?.StatusCode || response?.status;

            if (statusCode === "ER0077" || statusCode === "ER0077".toString()) {
                setToastMsg("Withdrawal submitted successfully");
                setShowToast(true);
                setAmount("");
                fetchWalletBalance(currentToken.tokenId);
            } else {
                setToastMsg(response?.data?.message || "Withdrawal failed");
                setShowToast(true);
            }
        } catch (error) {
            console.error("Withdrawal error:", error);
            setToastMsg("Something went wrong. Please try again.");
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={style.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Cleaner Premium Header */}
            <LinearGradient
                colors={['#0369a1', '#0ea5e9']}
                style={style.headerArea}
            >
                <SafeAreaView>
                    <View style={style.topBar}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={style.backCircle}
                        >
                            <Vector as="ionicons" name="chevron-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={style.pageTitle}>Withdraw Money</Text>
                        <View style={{ width: 42 }} />
                    </View>

                    <View style={style.heroBalance}>
                        <View style={style.iconBadge}>
                            <Vector as="materialcommunityicons" name="bank-outline" size={36} color="#0ea5e9" />
                        </View>
                        <Text style={style.labelSmall}>AVAILABLE BALANCE</Text>
                        <Text style={style.amountBig}>{currency} {availableBalance}</Text>

                        <View style={style.secureTag}>
                            <Vector as="materialicons" name="verified-user" size={14} color="#fff" />
                            <Text style={style.tagTxt}>SECURE TRANSACTION</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView
                    style={style.body}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={style.scrollPad}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View entering={FadeInUp.delay(300)} style={style.card}>
                        <Text style={style.cardTitle}>Transaction Details</Text>
                        <View style={style.blueLine} />

                        <View style={style.inputWrapper}>
                            <Text style={style.fieldLabel}>Withdrawal Amount</Text>
                            <View style={style.amountContainer}>
                                <Text style={style.currTxt}>{currency}</Text>
                                <TextInput
                                    style={style.inputElement}
                                    placeholder="0.00"
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="numeric"
                                    value={amount}
                                    underlineColorAndroid="transparent"
                                    autoCorrect={false}
                                    spellCheck={false}
                                    selectionColor="#0ea5e9"
                                    onChangeText={(text) => {
                                        const cleaned = text.replace(/[^0-9.]/g, "");
                                        setAmount(cleaned);
                                    }}
                                />
                            </View>
                        </View>

                        <View style={style.noteBox}>
                            <Vector as="feather" name="info" size={16} color="#0ea5e9" />
                            <Text style={style.noteTxt}>
                                Funds will be transferred to your linked bank account.
                            </Text>
                        </View>

                        {loading && (
                            <View style={style.loaderRow}>
                                <ActivityIndicator size="small" color="#0ea5e9" />
                                <Text style={style.loaderTxt}>Processing...</Text>
                            </View>
                        )}
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Menu Area */}
            <View style={style.footerArea}>
                <TouchableOpacity
                    style={[style.btnPrimary, isConfirmDisabled && style.btnDisabled]}
                    onPress={handleConfirm}
                    disabled={isConfirmDisabled || loading}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={isConfirmDisabled ? ['#e2e8f0', '#cbd5e1'] : ['#0ea5e9', '#0284c7']}
                        style={style.btnGradient}
                    >
                        <Text style={style.btnTxt}>Confirm Withdrawal</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={style.btnSecondary}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.6}
                >
                    <Text style={style.btnSecondaryTxt}>Return to Wallet</Text>
                </TouchableOpacity>
            </View>

            <ToastConfig
                visible={showToast}
                message={toastMsg}
                onClose={() => setShowToast(false)}
            />
        </View>
    );
};

const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    headerArea: {
        paddingBottom: 60,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
    },
    backCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    pageTitle: {
        fontSize: SIZES.h3,
        fontFamily: FONTS.bold,
        color: "#fff",
    },
    heroBalance: {
        alignItems: "center",
        marginTop: 30,
    },
    iconBadge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        ...SHADOWS.shadow,
        marginBottom: 20,
    },
    labelSmall: {
        fontSize: SIZES.h4,
        fontFamily: FONTS.bold,
        color: "rgba(255, 255, 255, 0.8)",
        letterSpacing: 1,
    },
    amountBig: {
        fontSize: SIZES.p30,
        fontFamily: FONTS.bold,
        color: "#fff",
        marginTop: 5,
    },
    secureTag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 20,
    },
    tagTxt: {
        fontSize: SIZES.p11,
        fontFamily: FONTS.bold,
        fontWeight: '700',
        color: "#fff",
        marginLeft: 8,
    },
    body: {
        flex: 1,
        marginTop: -40,
    },
    scrollPad: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 25,
        padding: 24,
        ...SHADOWS.shadow,
    },
    cardTitle: {
        fontSize: SIZES.p13,
        fontFamily: FONTS.bold,
        fontWeight: '700',
        color: "#0f172a",
    },
    blueLine: {
        width: 35,
        height: 4,
        backgroundColor: "#0ea5e9",
        borderRadius: 2,
        marginTop: 8,
        marginBottom: 25,
    },
    inputWrapper: {
        marginBottom: 20,
    },
    fieldLabel: {
        fontSize: SIZES.h3,
        fontFamily: FONTS.semibold,
        color: "#64748b",
        marginBottom: 10,
    },
    amountContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
        paddingBottom: 10,
    },
    currTxt: {
        fontSize: SIZES.p20,
        fontFamily: FONTS.bold,
        color: "#0ea5e9",
        marginRight: 10,
    },
    inputElement: {
        flex: 1,
        fontSize: SIZES.p20,
        fontFamily: FONTS.bold,
        color: "#1e293b",
        padding: 0,
        margin: 0,
        borderWidth: 0,
        backgroundColor: "transparent",
        // Platform specific resets for that black box
        ...Platform.select({
            android: {
                textAlignVertical: 'center',
            },
            web: {
                outlineStyle: 'none',
            }
        })
    },
    noteBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f0f9ff",
        padding: 15,
        borderRadius: 15,
    },
    noteTxt: {
        flex: 1,
        fontSize: SIZES.p12,
        fontFamily: FONTS.medium,
        fontWeight: '500',
        color: "#0369a1",
        marginLeft: 12,
        lineHeight: 18,
    },
    loaderRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        gap: 10,
    },
    loaderTxt: {
        fontSize: SIZES.p12,
        fontFamily: FONTS.medium,
        fontWeight: '500',
        color: "#0ea5e9",
    },
    footerArea: {
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        ...SHADOWS.shadow,
    },
    btnPrimary: {
        borderRadius: 15,
        overflow: "hidden",
    },
    btnDisabled: {
        opacity: 0.6,
    },
    btnGradient: {
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    btnTxt: {
        fontSize: SIZES.h4,
        fontFamily: FONTS.bold,
        color: "#fff",
    },
    btnSecondary: {
        alignItems: "center",
        marginTop: 15,
    },
    btnSecondaryTxt: {
        fontSize: SIZES.h4,
        fontFamily: FONTS.semibold,
        color: "#64748b",
    },
});

export default Withdraw;
