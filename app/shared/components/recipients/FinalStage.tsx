import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, StyleSheet, TextInput, TouchableOpacity, useWindowDimensions, Platform, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Container from "app/theme/Container";
import Button from "app/components/controls/Button";
import CircularProgress from "app/components/CircularProgress";
import { GetCardDetails, GetGDPR, GetPromoCode, GetPurposeOfTransaction, GetWalletBalance, InitTransaction, ValidateSendMoney } from "app/http-services";
import { useRecoilValue } from "recoil";
import Toast from 'react-native-toast-message';
import { ProfileState } from "app/atoms";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ToastConfig from "app/components/ToastConfig";
import { useSetRecoilState } from "recoil";
import { ProfileTabState } from "app/atoms";
import { FONTS, SIZES } from "app/constants/Assets";


const FinalStage = () => {
    const navigation = useNavigation();
    const currentToken = useRecoilValue(ProfileState);
    const [loading, setLoading] = useState(false);
    const [purposeList, setPurposeList] = useState<any[]>([]);
    const [selectedPurpose, setSelectedPurpose] = useState("");
    const [accountBalance, setAccountBalance] = useState("0");
    const [checkedTermsRemitSMS, setCheckedTermsRemitSMS] = useState('N');
    const [checkedTermsRemitEMAIL, setCheckedTermsRemitEMAIL] = useState('N');
    const [checkedTermsInsureSMS, setCheckedTermsInsureSMS] = useState('N');
    const [checkedTermsInsureEMAIL, setCheckedTermsInsureEMAIL] = useState('N');
    const [popupVisible, setPopupVisible] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [promoCode, setPromoCode] = useState<string>("");
    const setProfileTab = useSetRecoilState(ProfileTabState);
    const [amount, setAmount] = useState<number>(500);
    const [promoDiscount, setPromoDiscount] = useState<number>(0);


    // ✅ State for AsyncStorage values
    const [transferDetails, setTransferDetails] = useState({
        sendAmount: "0",
        transferFee: "0",
        transferFeeDiscount: "0",
        amountToBePaid: "0",
        conversionRate: "0",
        DebitfromAccountBalance: "0",
        amountConvert: "0",
    });

    const [recipientDetails, setRecipientDetails] = useState({
        userEmail: "",
        Mobile: "",
        AccountName: "0",
        AccountNumber: "0",
        IFSCCode: "0",
        CashPickup: "0",
        ChannelTransferType: "Banks",
    });

    // ✅ Single state for radio buttons
    const [selectedTransferType, setSelectedTransferType] = useState<"accountBalance" | "debitCard">("accountBalance");

    useEffect(() => {
        fetchPurposeOfTransaction(currentToken.tokenId, currentToken.remitterId);
        fetchStoredTransferData();
        fetchStoredRecipientData();
        fetchWalletBalance(currentToken.tokenId, currentToken.remitterId);
        fetchCardDetails(currentToken.tokenId, currentToken.remitterId);
        fetchGDPR(currentToken.tokenId, currentToken.remitterId);
        fetchValidateSendMoney(currentToken.tokenId, currentToken.remitterId);
    }, []);


    const fetchValidateSendMoney = async (tokenId: string, remitterId: string) => {
        try {
            setLoading(true);
            const response = await ValidateSendMoney();
            if (response.status === 200 && response.data) {
                const data = response.data?.data || response.data;

            }
        } catch (err) {
            console.error("Error fetching send money:", err);
        } finally {
            setLoading(false);
        }
    };



    const fetchWalletBalance = async (tokenId: string, remitterId: string) => {
        try {
            setLoading(true);
            const response = GetWalletBalance({});
            console.log("Response :", response)
            response.then((res: any) => {
                if (res.status === 200) {
                    setAccountBalance(res?.data?.BalanceAmount?.toString() ?? "0");
                }
            })
                .catch((err) => {
                    console.error('Fetch dashboard details', err.response?.data?.message)
                })
                .finally(() => setLoading(false));
        } catch (error) {
            console.error('Error fetching dashboard details:', error);
        }
    };


    const fetchGDPR = async (tokenId: string, remitterId: string) => {
        try {
            setLoading(true);
            const response = GetGDPR(tokenId);
            response.then((res: any) => {
                if (res.status === 200) {
                    setCheckedTermsRemitSMS(res?.data?.Option1)
                    setCheckedTermsRemitEMAIL(res?.data?.Consent)
                    setCheckedTermsInsureSMS(res?.data?.Option2)
                    setCheckedTermsInsureEMAIL(res?.data?.Option3)
                }
            })
                .catch((err) => {
                    console.error('Fetch Remitter profile', err.response?.data?.message)
                })
                .finally(() => setLoading(false));
        } catch (error) {
            console.error('Error Remitter profile:', error);
        }
    };

    //     const fetchInitTransaction = async (tokenId: string, remitterId: string) => {
    //   try {
    //     setLoading(true);

    //     // Await the API call
    //     const res: any = await InitTransaction();
    //     console.log("Response :", res);

    //     const statusCode = res?.data?.StatusCode;
    //     const statusMsg = res?.data?.StatusMsg;

    //     if (statusMsg) {
    //       setStatusMessage(statusMsg);
    //       setPopupVisible(true);
    //     }



    //   } catch (error: any) {
    //     console.error('Fetch dashboard details', error.response?.data?.message || error.message);
    //   } finally {
    //     setLoading(false);
    //   }
    // };


    const fetchInitTransaction = async (tokenId: string, remitterId: string) => {
        try {
            setLoading(true);

            const res: any = await InitTransaction();
            console.log("Response :", res);

            const statusCode = res?.data?.StatusCode;
            const statusMsg = res?.data?.StatusMsg;

            if (statusMsg) {
                setStatusMessage(statusMsg);
                setPopupVisible(true);
            }

            if (statusCode === "ER00115") {
                setTimeout(() => {
                    setPopupVisible(false);
                    setProfileTab(1);
                    navigation.navigate("Profile" as never);
                }, 2000);
            }

        } catch (error: any) {
            console.error('Fetch Init Transaction Error:', error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };






    const fetchGetPromocode = async (req: { Amount: number; PromocodeValue: string }) => {
        try {
            setLoading(true);
            const res: any = await GetPromoCode(req);

            if (res?.data?.StatusCode === "ER0000" && res.data.promocode?.Offer_Applicable === "Y") {
                const discount = res.data.promocode.Offer_Amount ?? 0;

                setPromoDiscount(discount);
                setPromoCode(req.PromocodeValue);
                setStatusMessage(res.data.StatusMsg);
                Toast.show({
                    type: "success",
                    text1: "Promo Code",
                    text2: res.data.StatusMsg,
                });
            } else if (res?.data?.StatusCode === "ER0001") {
                setStatusMessage("Promo code not applicable");
                Toast.show({
                    type: "error",
                    text1: "Promo Code",
                    text2: res.data.StatusMsg,
                });

            }
        } catch (error: any) {
            console.error(
                "Fetch GetPromoCode error:",
                error.response?.data?.message || error.message
            );
            setStatusMessage("Promo code failed");
            // setPopupVisible(true);
        } finally {
            setLoading(false);
        }
    };


    const fetchCardDetails = async (tokenId: string, remitterId: string) => {
        try {
            setLoading(true);
            const response = GetCardDetails(tokenId);
            console.log("Response :", response)
            response.then((res: any) => {
                if (res.status === 200) {

                }
            })
                .catch((err) => {
                    console.error('Fetch dashboard details', err.response?.data?.message)
                })
                .finally(() => setLoading(false));
        } catch (error) {
            console.error('Error fetching dashboard details:', error);
        }
    };

    // ✅ Fetch stored values from AsyncStorage
    const fetchStoredTransferData = async () => {
        try {
            const sendAmount = await AsyncStorage.getItem("sendAmount");
            const transferFee = await AsyncStorage.getItem("Transfer Fee");
            const amountToBePaid = await AsyncStorage.getItem("Amount to be paid");
            const amountConvert = await AsyncStorage.getItem("Amount we'll convert");
            const ConversionRate = await AsyncStorage.getItem("ConversionRate");
            setTransferDetails({
                sendAmount: sendAmount ?? "0",
                transferFee: transferFee ?? "0",
                transferFeeDiscount: "0",
                amountToBePaid: amountToBePaid ?? "0",
                conversionRate: ConversionRate ?? "0",
                DebitfromAccountBalance: amountToBePaid ?? "0",
                amountConvert: amountConvert ?? "0",
            });
        } catch (err) {
            console.error("Error fetching transfer data:", err);
        }
    };

    const fetchStoredRecipientData = async () => {
        try {
            const AccountName = await AsyncStorage.getItem("Account Name");
            const AccountNumber = await AsyncStorage.getItem("Account Number");
            const IFSCCode = await AsyncStorage.getItem("IFSC Code");
            const userEmail = await AsyncStorage.getItem("userEmail");
            const Mobile = await AsyncStorage.getItem("Mobile");
            const CashPickup = await AsyncStorage.getItem("Cash Pickup");
            const ChannelTransferType = await AsyncStorage.getItem("ChannelTransferType");

            setRecipientDetails({
                AccountName: AccountName ?? "0",
                AccountNumber: AccountNumber ?? "0",
                IFSCCode: IFSCCode ?? "0",
                userEmail: userEmail ?? "0",
                Mobile: Mobile ?? "",
                CashPickup: CashPickup ?? "0",
                ChannelTransferType: ChannelTransferType ?? "Banks",
            });
        } catch (err) {
            console.error("Error fetching recipient data:", err);
        }
    };

    // ✅ Fetch dropdown list
    const fetchPurposeOfTransaction = async (tokenId: string, remitterId: string) => {
        try {
            setLoading(true);
            const response = await GetPurposeOfTransaction(tokenId);
            console.log("Response :", response);

            if (response.status === 200 && response.data.POT) {
                const formattedList = response.data.POT
                    .filter((item: any) => item.Value_AnnualIncome !== "0")
                    .map((item: any) => ({
                        dataValue: item.Value_POT,
                        displayvalue: item.Text_POT,
                    }));

                setPurposeList(formattedList);
            }
        } catch (err) {
            console.error("Error fetching Purposeoftransaction list:", err);
        } finally {
            setLoading(false);
        }
    };


    const { width } = useWindowDimensions();

    return (
        <View style={localStyles.container}>
            <StatusBar barStyle="light-content" />

            {/* Elite Header */}
            <LinearGradient
                colors={['#0369a1', '#0ea5e9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={localStyles.headerWrapper}
            >
                <SafeAreaView edges={['top']}>
                    <View style={localStyles.headerTop}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={localStyles.backButtonCircle}
                        >
                            <Ionicons name="chevron-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={localStyles.headerTextContent}>
                            <Text style={localStyles.headerTitle}>Review & Pay</Text>
                            <Text style={localStyles.headerSubtitle}>Payment Summary</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                style={localStyles.contentScroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Hero Amount Card */}
                <View style={localStyles.heroCard}>
                    <Text style={localStyles.heroLabel}>PAYMENT AMOUNT</Text>
                    <View style={localStyles.amountRow}>
                        <Text style={localStyles.amountText}>{(Number(transferDetails.amountToBePaid) - promoDiscount).toFixed(2)}</Text>
                        <Text style={localStyles.currencyText}>GBP</Text>
                        <View style={localStyles.flagBox}>
                            <Text style={{ fontSize: 24 }}>🇬🇧</Text>
                        </View>
                    </View>

                    <View style={localStyles.heroDivider} />

                    <View style={localStyles.recipientSummary}>
                        <Feather name="user" size={14} color="#94a3b8" />
                        <Text style={localStyles.recipientSummaryText}>
                            Recipient <Text style={{ color: '#fff' }}>•</Text> {recipientDetails.AccountName}
                        </Text>
                    </View>
                </View>

                {/* Section: Payment Method */}
                <View style={localStyles.sectionWrapper}>
                    <Text style={localStyles.sectionTitle}>SELECT PAYMENT METHOD</Text>

                    {/* Wallet Option */}
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setSelectedTransferType("accountBalance")}
                        style={[
                            localStyles.paymentCard,
                            selectedTransferType === "accountBalance" && localStyles.paymentCardActive
                        ]}
                    >
                        <View style={[localStyles.iconBox, { backgroundColor: '#eff6ff' }]}>
                            <Feather name="pocket" size={20} color={selectedTransferType === "accountBalance" ? "#0EA5E9" : "#64748b"} />
                        </View>
                        <View style={localStyles.cardContent}>
                            <Text style={localStyles.cardLabel}>Wallet Balance</Text>
                            <Text style={localStyles.cardValue}>Current: {accountBalance} GBP</Text>
                        </View>
                        <View style={[localStyles.checkCircle, selectedTransferType === "accountBalance" && localStyles.checkCircleActive]}>
                            {selectedTransferType === "accountBalance" && <View style={localStyles.checkInner} />}
                        </View>
                    </TouchableOpacity>

                    {/* Debit Card Option */}
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setSelectedTransferType("debitCard")}
                        style={[
                            localStyles.paymentCard,
                            selectedTransferType === "debitCard" && localStyles.paymentCardActive
                        ]}
                    >
                        <View style={[localStyles.iconBox, { backgroundColor: '#f0fdf4' }]}>
                            <Feather name="credit-card" size={20} color={selectedTransferType === "debitCard" ? "#10b981" : "#64748b"} />
                        </View>
                        <View style={localStyles.cardContent}>
                            <Text style={localStyles.cardLabel}>Debit / Credit Card</Text>
                            <Text style={localStyles.cardValue}>Add Visa or Mastercard</Text>
                        </View>
                        <View style={[localStyles.checkCircle, selectedTransferType === "debitCard" && localStyles.checkCircleActive]}>
                            {selectedTransferType === "debitCard" && <View style={localStyles.checkInner} />}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Promo Code Section */}
                <View style={localStyles.sectionWrapper}>
                    <Text style={localStyles.sectionTitle}>APPLY PROMO CODE</Text>
                    <View style={localStyles.promoInputWrapper}>
                        <TextInput
                            style={localStyles.promoInput}
                            placeholder="Enter promo code"
                            placeholderTextColor="#94a3b8"
                            value={promoCode}
                            onChangeText={setPromoCode}
                        />
                        <TouchableOpacity
                            style={localStyles.promoApplyBtn}
                            onPress={async () => {
                                const sendAmountValue = await AsyncStorage.getItem("sendAmount");
                                fetchGetPromocode({
                                    Amount: Number(sendAmountValue) || 0,
                                    PromocodeValue: promoCode,
                                });
                            }}
                        >
                            <Text style={localStyles.promoApplyText}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Transaction Details */}
                <View style={localStyles.sectionWrapper}>
                    <Text style={localStyles.sectionTitle}>TRANSACTION DETAILS</Text>
                    <View style={localStyles.detailsTable}>
                        {recipientDetails.ChannelTransferType === "CGMONEY" ? (
                            <>
                                {renderEliteRow("Email", `${recipientDetails.userEmail}`)}
                                {renderEliteRow("Cash pickup point", `${recipientDetails.CashPickup}`)}
                            </>
                        ) : (
                            <>
                                {renderEliteRow("Recipient Name", `${recipientDetails.AccountName}`)}
                                {renderEliteRow("Account Number", `${recipientDetails.AccountNumber}`, false)}
                                {renderEliteRow("IFSC Code", `${recipientDetails.IFSCCode}`, false)}
                                {renderEliteRow("Mobile Number", `${recipientDetails.Mobile || 'N/A'}`, false)}
                                {renderEliteRow("Receive Amount", `${transferDetails.sendAmount}`, true)}
                            </>
                        )}
                    </View>
                </View>

                {/* Payment Breakdown */}
                <View style={localStyles.sectionWrapper}>
                    <Text style={localStyles.sectionTitle}>PAYMENT BREAKDOWN</Text>
                    <View style={localStyles.detailsTable}>
                        {renderEliteRow("Actual Send", `${transferDetails.sendAmount} GBP`)}
                        {renderEliteRow("Transfer Fee", `${transferDetails.transferFee} GBP`)}
                        {promoDiscount > 0 && renderEliteRow("Discount", `-${promoDiscount} GBP`, false, true)}
                        <View style={localStyles.totalRow}>
                            <Text style={localStyles.totalLabel}>Final Amount</Text>
                            <Text style={localStyles.totalValue}>{Number(transferDetails.amountToBePaid) - promoDiscount} GBP</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Fixed Footer with Pay Button */}
            <View style={localStyles.footer}>
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => fetchInitTransaction(currentToken.tokenId, currentToken.remitterId)}
                    style={localStyles.payButton}
                >
                    <LinearGradient
                        colors={['#0ea5e9', '#0369a1']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={localStyles.payGradient}
                    >
                        <Text style={localStyles.payText}>Pay Now</Text>
                        <MaterialIcons name="security" size={20} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <ToastConfig
                visible={popupVisible}
                message={statusMessage}
                onClose={() => {
                    setPopupVisible(false);
                    navigation.navigate("Root" as never);
                }}
            />
        </View>
    );
};

const renderEliteRow = (label: string, value: string, isLast: boolean = false, isDiscount: boolean = false) => (
    <View style={[localStyles.eliteRow, isLast && { borderBottomWidth: 0 }]}>
        <Text style={localStyles.eliteLabel}>{label}</Text>
        <Text style={[localStyles.eliteValue, isDiscount && { color: '#ef4444' }]}>{value}</Text>
    </View>
);

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    headerWrapper: {
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backButtonCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    headerTextContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: SIZES.h1,
        fontFamily: FONTS.bold,
        fontWeight: '800',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: SIZES.p12,
        fontFamily: FONTS.medium,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    contentScroll: {
        flex: 1,
    },
    heroCard: {
        margin: 20,
        backgroundColor: '#0f172a',
        borderRadius: 28,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    heroLabel: {
        fontSize: SIZES.p11,
        fontFamily: FONTS.bold,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.5)',
        letterSpacing: 1.2,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 10,
    },
    amountText: {
        fontSize: SIZES.p50,
        fontFamily: FONTS.bold,
        fontWeight: '900',
        color: '#fff',
        marginRight: 8,
    },
    currencyText: {
        fontSize: SIZES.h2,
        fontFamily: FONTS.semibold,
        fontWeight: '600',
        color: '#38bdf8',
    },
    flagBox: {
        marginLeft: 'auto',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 8,
        borderRadius: 8,
        height: 48,
        width: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        marginVertical: 20,
    },
    recipientSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    recipientSummaryText: {
        fontSize: SIZES.p13,
        fontFamily: FONTS.medium,
        color: '#94a3b8',
    },
    sectionWrapper: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: SIZES.p11,
        fontFamily: FONTS.bold,
        fontWeight: '800',
        color: '#64748b',
        letterSpacing: 1,
        marginBottom: 15,
        marginLeft: 4,
    },
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 22,
        padding: 18,
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: '#f1f5f9',
    },
    paymentCardActive: {
        borderColor: '#0EA5E9',
        backgroundColor: '#f0f9ff',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    cardContent: {
        flex: 1,
    },
    cardLabel: {
        fontSize: SIZES.h2,
        fontFamily: FONTS.bold,
        fontWeight: '700',
        color: '#1e293b',
    },
    cardValue: {
        fontSize: SIZES.p12,
        fontFamily: FONTS.medium,
        color: '#64748b',
        marginTop: 2,
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkCircleActive: {
        borderColor: '#0EA5E9',
    },
    checkInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#0EA5E9',
    },
    promoInputWrapper: {
        flexDirection: 'row',
        gap: 10,
    },
    promoInput: {
        flex: 1,
        height: 56,
        backgroundColor: '#fff',
        borderRadius: 18,
        paddingHorizontal: 20,
        fontSize: SIZES.h2,
        fontFamily: FONTS.medium,
        color: '#0f172a',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    promoApplyBtn: {
        backgroundColor: '#0EA5E9',
        paddingHorizontal: 25,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    promoApplyText: {
        color: '#fff',
        fontSize: SIZES.p14,
        fontFamily: FONTS.bold,
        fontWeight: '700',
    },
    detailsTable: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    eliteRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: '#f8fafc',
    },
    eliteLabel: {
        fontSize: SIZES.p13,
        fontFamily: FONTS.medium,
        color: '#64748b',
    },
    eliteValue: {
        fontSize: SIZES.h2,
        fontFamily: FONTS.bold,
        fontWeight: '700',
        color: '#1e293b',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 15,
        borderTopWidth: 1,
        borderColor: '#f1f5f9',
        borderStyle: 'dashed',
    },
    totalLabel: {
        fontSize: SIZES.p15,
        fontFamily: FONTS.bold,
        fontWeight: '800',
        color: '#0f172a',
    },
    totalValue: {
        fontSize: SIZES.h2,
        fontFamily: FONTS.bold,
        fontWeight: '900',
        color: '#0ea5e9',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    payButton: {
        height: 64,
        borderRadius: 22,
        overflow: 'hidden',
    },
    payGradient: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    payText: {
        color: '#fff',
        fontSize: SIZES.p18,
        fontFamily: FONTS.bold,
        fontWeight: '800',
    },
});

export default FinalStage;
function setWithdrawAccountBalance(WD_BalanceAmount: any) {
    throw new Error("Function not implemented.");
}

function setAccountBalance(BalanceAmount: any) {
    throw new Error("Function not implemented.");
}


