import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Platform,
    StatusBar,
    Dimensions,
    KeyboardAvoidingView,
} from "react-native";
import { useRecoilValue } from "recoil";
import { ProfileState } from "../../atoms";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { FONTS, SIZES } from "app/constants/Assets";
import Vector from "app/assets/vectors";

const { width } = Dimensions.get("window");

const AddFund = () => {
    const [amount, setAmount] = useState("");
    const navigation = useNavigation();
    const [selectedPayment, setSelectedPayment] = useState("debit"); // Default to debit
    const currentToken = useRecoilValue(ProfileState);
    const accountBalance = "0.00";
    const currency = "£";

    const handlePayNow = () => {
        console.log("Pay Now clicked", amount, selectedPayment);
    };

    const paymentMethods = [
        { id: "debit", title: "Debit Card", sub: "Visa, Mastercard, Maestro", icon: "credit-card-outline", type: "materialcommunityicons" },
        { id: "credit", title: "Credit Card", sub: "Visa, Mastercard, AMEX", icon: "credit-card-settings-outline", type: "materialcommunityicons" },
        { id: "netbanking", title: "Net Banking", sub: "Direct bank transfer", icon: "bank-outline", type: "materialcommunityicons" },
    ];

    return (
        <View style={localStyles.mainContainer}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Premium Header */}
            <LinearGradient
                colors={['#0369a1', '#0ea5e9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={localStyles.headerWrapper}
            >
                <SafeAreaView style={localStyles.safeHeader}>
                    <View style={localStyles.headerContent}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={localStyles.backCircle}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="chevron-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={localStyles.titleBox}>
                            <Text style={localStyles.headerTitle}>Add Funds</Text>
                            <Text style={localStyles.headerSub}>Recharge your wallet instantly</Text>
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
                    contentContainerStyle={localStyles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Amount Entry Card */}
                    <Animated.View
                        entering={FadeInDown.duration(600)}
                        style={localStyles.amountCard}
                    >
                        <Text style={localStyles.amountLabel}>Enter Amount to Add</Text>
                        <View style={localStyles.inputContainer}>
                            <View style={localStyles.currencyBadge}>
                                <Text style={localStyles.currencyText}>GBP</Text>
                            </View>
                            <TextInput
                                placeholder="0.00"
                                placeholderTextColor="#cbd5e1"
                                style={localStyles.amountInput}
                                keyboardType="decimal-pad"
                                value={amount}
                                onChangeText={setAmount}
                            />
                        </View>
                        <View style={localStyles.balanceFooter}>
                            <Ionicons name="wallet-outline" size={14} color="#64748b" />
                            <Text style={localStyles.balanceText}>
                                Current Balance: <Text style={localStyles.balanceVal}>{currency}{accountBalance}</Text>
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Vertical Payment Methods */}
                    <Text style={localStyles.sectionTitle}>Cards & Bank</Text>
                    {paymentMethods.map((method, index) => (
                        <Animated.View
                            key={method.id}
                            entering={FadeInRight.delay(index * 100).duration(500)}
                        >
                            <TouchableOpacity
                                style={[
                                    localStyles.methodRow,
                                    selectedPayment === method.id && localStyles.selectedMethodRow
                                ]}
                                onPress={() => setSelectedPayment(method.id)}
                                activeOpacity={0.8}
                            >
                                <View style={[
                                    localStyles.iconBox,
                                    selectedPayment === method.id ? localStyles.selectedIconBox : localStyles.unselectedIconBox
                                ]}>
                                    <MaterialCommunityIcons
                                        name={method.id === "netbanking" ? "bank" : "credit-card"}
                                        size={24}
                                        color={selectedPayment === method.id ? "#fff" : "#0ea5e9"}
                                    />
                                </View>

                                <View style={localStyles.methodInfo}>
                                    <Text style={[
                                        localStyles.methodTitle,
                                        selectedPayment === method.id && localStyles.selectedMethodTitle
                                    ]}>
                                        {method.title}
                                    </Text>
                                    <Text style={localStyles.methodSub}>{method.sub}</Text>
                                </View>

                                <View style={localStyles.radioOuter}>
                                    <View style={[
                                        localStyles.radioInner,
                                        selectedPayment === method.id && localStyles.radioActive
                                    ]} />
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}

                    {/* Digital Wallets Grid */}
                    <Text style={localStyles.sectionTitle}>Digital Wallets</Text>
                    <View style={localStyles.walletsGrid}>
                        <TouchableOpacity style={localStyles.walletGridItem} activeOpacity={0.8}>
                            <Image source={require('../../assets/images/gpay.png')} style={localStyles.walletLogo} />
                        </TouchableOpacity>
                        <TouchableOpacity style={localStyles.walletGridItem} activeOpacity={0.8}>
                            <Image source={require('../../assets/images/applepay.png')} style={localStyles.walletLogo} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={localStyles.paypalButton} activeOpacity={0.8}>
                        <Image source={require('../../assets/images/paypal.png')} style={localStyles.paypalLogo} />
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Action Area */}
            <View style={localStyles.footerActions}>
                <TouchableOpacity
                    style={localStyles.secondaryBtn}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={localStyles.secondaryBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handlePayNow}
                    activeOpacity={0.9}
                    style={localStyles.primaryBtnWrapper}
                >
                    <LinearGradient
                        colors={['#0ea5e9', '#0369a1']}
                        style={localStyles.primaryBtn}
                    >
                        <Text style={localStyles.primaryBtnText}>Recharge Now</Text>
                        <View style={localStyles.btnIconCircle}>
                            <Ionicons name="arrow-forward" size={18} color="#0ea5e9" />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const localStyles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
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
        fontSize: SIZES.h3,
        fontFamily: FONTS.bold,
        color: '#fff',
    },
    headerSub: {
        fontSize: SIZES.p13,
        color: 'rgba(255,255,255,0.7)',
        fontFamily: FONTS.medium,
        marginTop: 1,
    },
    scrollContent: {
        paddingTop: 24,
        paddingHorizontal: 20,
        paddingBottom: 150,
    },
    amountCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        ...Platform.select({
            ios: { shadowColor: '#64748b', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 12 },
            android: { elevation: 4 },
        }),
    },
    amountLabel: {
        fontSize: SIZES.p13,
        fontFamily: FONTS.semibold,
        color: '#64748b',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 55,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    currencyBadge: {
        backgroundColor: '#0ea5e9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        marginRight: 12,
    },
    currencyText: {
        fontSize: SIZES.p15,
        fontFamily: FONTS.bold,
        color: '#fff',
    },
    amountInput: {
        flex: 1,
        fontSize: SIZES.h3,
        fontFamily: FONTS.bold,
        color: '#0f172a',
    },
    balanceFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 18,
        gap: 6,
    },
    balanceText: {
        fontSize: SIZES.p13,
        fontFamily: FONTS.medium,
        color: '#64748b',
    },
    balanceVal: {
        color: '#0ea5e9',
        fontFamily: FONTS.bold,
    },
    sectionTitle: {
        fontSize: SIZES.medium,
        fontFamily: FONTS.bold,
        color: '#1e293b',
        marginTop: 20,
        marginBottom: 8,
    },
    methodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    selectedMethodRow: {
        borderColor: '#0ea5e9',
        backgroundColor: '#f0f9ff',
    },
    iconBox: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unselectedIconBox: {
        backgroundColor: '#f1f5f9',
    },
    selectedIconBox: {
        backgroundColor: '#0ea5e9',
    },
    methodInfo: {
        flex: 1,
        marginLeft: 15,
    },
    methodTitle: {
        fontSize: SIZES.font,
        fontFamily: FONTS.bold,
        color: '#334155',
    },
    selectedMethodTitle: {
        color: '#0ea5e9',
    },
    methodSub: {
        fontSize: SIZES.p13,
        fontFamily: FONTS.medium,
        color: '#94a3b8',
        marginTop: 1,
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'transparent',
    },
    radioActive: {
        backgroundColor: '#0ea5e9',
    },
    walletsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    walletGridItem: {
        flex: 1,
        backgroundColor: '#fff',
        height: 55,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6 },
            android: { elevation: 2 },
        }),
    },
    paypalButton: {
        backgroundColor: '#fff',
        height: 55,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6 },
            android: { elevation: 2 },
        }),
    },
    walletLogo: {
        width: 80,
        height: 40,
        resizeMode: 'contain',
    },
    paypalLogo: {
        width: 100,
        height: 30,
        resizeMode: 'contain',
    },
    footerActions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: Platform.OS === 'ios' ? 40 : 25,
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        alignItems: 'center',
        gap: 12,
    },
    secondaryBtn: {
        paddingHorizontal: 24,
        paddingVertical: 18,
    },
    secondaryBtnText: {
        fontSize: SIZES.font,
        fontFamily: FONTS.bold,
        color: '#94a3b8',
    },
    primaryBtnWrapper: {
        flex: 1,
        borderRadius: 18,
        overflow: 'hidden',
    },
    primaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 12,
    },
    primaryBtnText: {
        fontSize: SIZES.font,
        fontFamily: FONTS.bold,
        color: '#fff',
    },
    btnIconCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default AddFund;
