import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, Text, View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ModalHeaderBack from "app/components/ModalHeaderBack";
import Container from "app/theme/Container";
import Picker from "app/components/customComponents/Picker";
import Button from "app/components/controls/Button";
import CircularProgress from "app/components/CircularProgress";
import { GetPurposeOfTransaction, GetSOI, ValidateSendMoney } from "app/http-services";
import { useRecoilValue } from "recoil";
import { ProfileState } from "app/atoms";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Review = () => {
    const navigation = useNavigation();
    const currentToken = useRecoilValue(ProfileState);
    const [loading, setLoading] = useState(false);
    const [purposeList, setPurposeList] = useState<any[]>([]);
    const [selectedPurpose, setSelectedPurpose] = useState("");

    // ✅ State for AsyncStorage values
    const [transferDetails, setTransferDetails] = useState({
        sendAmount: "0",
        transferFee: "0",
        amountToBePaid: "0",
        conversionRate: "0",
        amountConvert: "0",
    });

    const [recipientDetails, setRecipientDetails] = useState({
        userEmail: "",
        AccountName: "0",
        AccountNumber: "0",
        IFSCCode: "0",
        CashPickup: "0",
        ChannelTransferType: "Banks", // default value
    });

    useEffect(() => {
        fetchPurposeOfTransaction(currentToken.tokenId, currentToken.remitterId);
        fetchStoredTransferData();
        fetchStoredRecipientData();
        fetchValidateSendMoney(currentToken.tokenId, currentToken.remitterId);
        fetchGetSOI(currentToken.tokenId, currentToken.remitterId);
    }, []);



    const fetchGetSOI = async (tokenId: string, remitterId: string) => {
        try {
            setLoading(true);
            const response = GetSOI(tokenId);
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
    }

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
                amountToBePaid: amountToBePaid ?? "0",
                conversionRate: ConversionRate ?? "0",
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
            const CashPickup = await AsyncStorage.getItem("Cash Pickup");
            const ChannelTransferType = await AsyncStorage.getItem("ChannelTransferType");

            setRecipientDetails({
                AccountName: AccountName ?? "0",
                AccountNumber: AccountNumber ?? "0",
                IFSCCode: IFSCCode ?? "0",
                userEmail: userEmail ?? "0",
                CashPickup: CashPickup ?? "0",
                ChannelTransferType: ChannelTransferType ?? "Banks"
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

    const renderRow = (label: string, value: string) => (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value} numberOfLines={2} ellipsizeMode="tail">
                {value}
            </Text>
        </View>
    );


    const _onUpdatePressed = async () => {

        navigation.navigate("FinalStage" as never);




    }


    return (
        <SafeAreaView style={[styles.container, { flex: 1, backgroundColor: '#0EA5E9', marginTop: 0 }]}>
            {/* Header */}
            <ModalHeaderBack title="Review" />

            {/* Content */}
            <Container style={{ backgroundColor: '#f9f9f9', flex: 1 }}>
                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    <View style={{ marginBottom: 15 }}>
                        <Text style={styles.header}>Review Details Of Your Transfer</Text>
                        <Text style={styles.subHeader}>
                            Lorem ipsum is the dummy text content for testing purposes.
                        </Text>
                    </View>

                    {/* Transfer Reason Dropdown */}
                    <View style={{ marginBottom: 20 }}>
                        <Picker
                            label="Transfer Reason"
                            selectedValue={selectedPurpose}
                            style={{
                                borderWidth: 0,
                                height: 50,
                                padding: 12,
                                fontSize: 16,
                                width: '100%',
                                backgroundColor: '#fff',
                                outlineStyle: 'none',
                            } as any}
                            dataList={purposeList}
                            onValueChange={(itemValue: unknown) => {
                                const value = String(itemValue);
                                console.log("Selected Value:", value);
                                setSelectedPurpose(value);
                            }}
                        > </Picker>

                    </View>

                    {/* Transfer Details */}
                    <Text style={styles.detailsHeader}>Transfer Details</Text>
                    <View style={styles.detailsBox}>
                        {renderRow("You Send", `${transferDetails.sendAmount} GBP`)}
                        {renderRow("Transfer Fee", `${transferDetails.transferFee} GBP`)}
                        {renderRow("Amount to be paid", `${transferDetails.amountToBePaid} GBP`)}
                        {renderRow("Conversion Rate", `${transferDetails.conversionRate} `)}
                        {renderRow("Amount We'll Convert", transferDetails.amountConvert)}
                    </View>

                    {/* Recipient Details */}
                    <Text style={styles.detailsHeader}>Recipient Details</Text>

                    {recipientDetails.ChannelTransferType === "CGMONEY" ? (
                        <View style={styles.detailsBox}>
                            {renderRow("Email", `${recipientDetails.userEmail}`)}
                            {renderRow("Cash pickup point", `${recipientDetails.CashPickup}`)}
                        </View>
                    ) : (
                        <View style={styles.detailsBox}>
                            {renderRow("Account Name", `${recipientDetails.AccountName}`)}
                            {renderRow("Account Number", `${recipientDetails.AccountNumber}`)}
                            {renderRow("Email", `${recipientDetails.userEmail}`)}
                            {renderRow("IFSC Code", `${recipientDetails.IFSCCode}`)}
                        </View>
                    )}
                </ScrollView>
            </Container>

            {/* Bottom Button */}
            <View style={styles.bottomButton}>
                <Button
                    style={[
                        styles.largeButton,
                        { backgroundColor: selectedPurpose ? "#007BFF" : "#ccc" } // Gray if disabled
                    ]}
                    onPress={_onUpdatePressed}
                    disabled={!selectedPurpose}  // ✅ Disable when no selection
                >
                    Confirm & Continue
                </Button>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f7f9",
    },
    scrollContainer: {
        paddingHorizontal: 15,
        marginTop: 20,
        marginBottom: 80,
    },
    header: {
        fontSize: 14,
        fontWeight: "600",
        color: "#000",
    },
    subHeader: {
        fontSize: 12,
        color: "#666",
        marginTop: 5,
    },
    detailsBox: {
        borderWidth: 1,
        borderColor: "#757875",
        borderRadius: 12,
        paddingHorizontal: 17,
        paddingTop: 12,
        paddingBottom: 5,
        fontSize: 12,
        marginTop: 15,
        borderStyle: "dotted",
    },
    detailsHeader: {
        fontSize: 14,
        fontWeight: "600",
        marginTop: 10,
        color: "#000",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: "#E0E0E0",
        borderStyle: "dashed",
        gap: 5
    },
    label: {
        fontSize: 12,
        color: "#555",
        flex: 0.4,  // 40% width for label
        textAlign: "left",
    },
    value: {
        fontSize: 12,
        fontWeight: "600",
        color: "#000",
        flex: 0.6,  // 60% width for value
        textAlign: "right",
        flexWrap: "wrap",
    },

    largeButton: {
        width: "100%",
        height: 55,
        paddingVertical: 8,
        borderRadius: 10,
    },
    bottomButton: {
        width: "100%",
        padding: 10,
        position: "absolute",
        bottom: 0,
        left: 0,
    },
});


export default Review;
