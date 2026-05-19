import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
  Image,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRecoilValue } from "recoil";
import { LinearGradient } from "expo-linear-gradient";
import { RFValue } from "react-native-responsive-fontsize";

import { ProfileState } from "app/atoms";
import { InitTransactions, GetWalletBalance } from "app/http-services";
import COLORS from "app/constants/Colors";
import { FONTS } from "app/constants/Assets";
import Vector from "app/assets/vectors";
import ToastConfig from "app/components/ToastConfig";

const { width } = Dimensions.get("window");

type SelectedPackageType = {
  name?: string;
  price?: number;   // Price in GBP
  amount?: number;  // Airtime value in INR
  description?: string;
  validity?: string;
  displayvalue?: string;
  product_id?: number;
  operator_id?: number;
};

type RecipientDetailsType = {
  displayvalue: string;
  operator_id: any;
  userEmail: string;
  AccountName: string;
  AccountNumber: string;
  IFSCCode: string;
  CashPickup: string;
  ChannelTransferType: string;
  selectedPackage?: SelectedPackageType;
  CountryCode?: string;
  CountryFlag?: string;
};

const AirtimeTopupPay = () => {
  const navigation = useNavigation<any>();
  const currentToken = useRecoilValue(ProfileState);

  const [loading, setLoading] = useState(false);
  const [accountBalance, setAccountBalance] = useState("0");
  const [popupVisible, setPopupVisible] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const [recipientDetails, setRecipientDetails] = useState<RecipientDetailsType>({
    displayvalue: "",
    operator_id: "",
    userEmail: "",
    AccountName: "0",
    AccountNumber: "0",
    IFSCCode: "0",
    CashPickup: "0",
    ChannelTransferType: "Banks",
  });

  const [selectedTransferType, setSelectedTransferType] =
    useState<"accountBalance" | "debitCard">("accountBalance");

  useEffect(() => {
    fetchStoredRecipientData();
    fetchWalletBalance(currentToken.tokenId, currentToken.remitterId);
  }, []);

  const fetchStoredRecipientData = async () => {
    try {
      const storedRecipient = await AsyncStorage.getItem("selectedRecipient");
      if (storedRecipient) {
        const data: RecipientDetailsType = JSON.parse(storedRecipient);
        setRecipientDetails(data);
      }
    } catch (err) {
      console.error("Error fetching recipient:", err);
    }
  };

  const fetchWalletBalance = async (tokenId: string, remitterId: string) => {
    try {
      setLoading(true);
      const res: any = await GetWalletBalance({});
      if (res.status === 200) {
        setAccountBalance(res?.data?.BalanceAmount?.toString() ?? "0");
      }
    } catch (err) {
      console.error("Error fetching wallet balance:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    try {
      setLoading(true);

      const storedRecipient = await AsyncStorage.getItem("selectedRecipient");
      const storedOperator = await AsyncStorage.getItem("selectedOperator");

      if (!storedRecipient || !storedOperator) {
        Alert.alert("Error", "Please select recipient and operator.");
        return;
      }

      const recipient: RecipientDetailsType = JSON.parse(storedRecipient);
      const operator: RecipientDetailsType = JSON.parse(storedOperator);

      if (!recipient.selectedPackage) {
        Alert.alert("Error", "Please select a top-up package.");
        return;
      }

      const pkg = recipient.selectedPackage;
      const airtimeValue = pkg.displayvalue
        ? parseInt(pkg.displayvalue.replace(/\D/g, ""), 10)
        : 0;

      const priceValue = pkg.price
        ? parseFloat(pkg.price.toString().replace(/[^\d.]/g, ""))
        : 0;

      const requestPayload = {
        operator_id: recipient.operator_id,
        operator_name: "Service One",
        product_id: pkg.product_id?.toString() ?? "8141",
        product_name: pkg.displayvalue ?? operator.displayvalue ?? "",
        price: priceValue,
        displayvalue: airtimeValue,
        unit: "INR",
        toCountry: recipient.CountryCode ?? "IND",
        Mobile: recipient.AccountNumber ?? recipient.userEmail,
      };

      const response = await InitTransactions(requestPayload);
      const statusCode = response?.data?.StatusCode;
      const statusMsg = response?.data?.StatusMsg || "Failed to initialize transaction";

      if (statusCode === "ER0000") {
        setStatusMessage("Transaction initialized successfully!");
        setPopupVisible(true);
      } else {
        setStatusMessage(statusMsg);
        setPopupVisible(true);
      }
    } catch (err) {
      console.error("InitTransaction error:", err);
      Alert.alert("Error", "Something went wrong while processing your payment.");
    } finally {
      setLoading(false);
    }
  };

  const renderDetailRow = (label: string, value: string, isLast = false) => (
    <View style={[styles.detailRow, isLast && { borderBottomWidth: 0 }]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, { flex: 1, textAlign: 'right' }]}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ELITE HERO HEADER */}
      <LinearGradient
        colors={['#0369a1', '#0ea5e9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerWrapper}
      >
        <SafeAreaView style={styles.safeHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backCircle}
              activeOpacity={0.7}
            >
              <Vector as="ionicons" name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.titleBox}>
              <Text style={styles.headerTitle}>Review & Pay</Text>
              <Text style={styles.headerSub}>Airtime Top-up Summary</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HERO SUMMARY CARD */}
        <LinearGradient
          colors={['#1e293b', '#0f172a']}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>PAYMENT AMOUNT</Text>
              <Text style={styles.heroAmount}>
                {recipientDetails.selectedPackage?.price ?? 0} <Text style={styles.currency}>GBP</Text>
              </Text>
            </View>
            {recipientDetails.CountryFlag && (
              <View style={styles.heroFlagBox}>
                <Image
                  source={{ uri: recipientDetails.CountryFlag }}
                  style={styles.heroFlag}
                  resizeMode="contain"
                />
              </View>
            )}
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroBottom}>
            <Feather name="user" size={14} color="#94a3b8" />
            <Text style={styles.heroRecipientName}>
              {recipientDetails.AccountName || "Recipient"}
            </Text>
            <View style={styles.dot} />
            <Text style={styles.heroMobile}>
              {recipientDetails.AccountNumber || "No mobile"}
            </Text>
          </View>
        </LinearGradient>

        {/* PAYMENT METHODS */}
        <Text style={styles.sectionTitle}>SELECT PAYMENT METHOD</Text>

        {/* Wallet Option */}
        <TouchableOpacity
          style={[styles.payMethodCard, selectedTransferType === "accountBalance" && styles.payMethodCardActive]}
          onPress={() => setSelectedTransferType("accountBalance")}
          activeOpacity={0.8}
        >
          <View style={styles.pmIconCircle}>
            <MaterialCommunityIcons name="wallet-outline" size={22} color={COLORS.primary} />
          </View>
          <View style={styles.pmContent}>
            <Text style={styles.pmTitle}>Wallet Balance</Text>
            <Text style={styles.pmSubtitle}>Current: {accountBalance} GBP</Text>
          </View>
          <View style={[styles.radio, selectedTransferType === "accountBalance" && styles.radioActive]}>
            {selectedTransferType === "accountBalance" && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        {/* Card Option */}
        <TouchableOpacity
          style={[styles.payMethodCard, selectedTransferType === "debitCard" && styles.payMethodCardActive]}
          onPress={() => setSelectedTransferType("debitCard")}
          activeOpacity={0.8}
        >
          <View style={[styles.pmIconCircle, { backgroundColor: '#F0FDF4' }]}>
            <MaterialCommunityIcons name="credit-card-outline" size={22} color="#16a34a" />
          </View>
          <View style={styles.pmContent}>
            <Text style={styles.pmTitle}>Debit / Credit Card</Text>
            <Text style={styles.pmSubtitle}>Add Visa or Mastercard</Text>
          </View>
          <View style={[styles.radio, selectedTransferType === "debitCard" && styles.radioActive]}>
            {selectedTransferType === "debitCard" && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        {/* DETAILS SECTION */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>TRANSACTION DETAILS</Text>
          <View style={styles.detailsCard}>
            {renderDetailRow("Plan Name", recipientDetails.selectedPackage?.displayvalue ?? "N/A")}
            {renderDetailRow("Airtime Credit", recipientDetails.selectedPackage?.displayvalue?.toString().match(/\d+/)?.[0] ?? "0")}
            {renderDetailRow("Validity", recipientDetails.selectedPackage?.validity ?? "-1 DAY")}
            {renderDetailRow("Operator", "Service One", true)}
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>PAYMENT BREAKDOWN</Text>
          <View style={styles.detailsCard}>
            {renderDetailRow("Top-up Amount", `${recipientDetails.selectedPackage?.price ?? 0} GBP`)}
            {renderDetailRow("Service Fee", "0.00 GBP")}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalValue}>{recipientDetails.selectedPackage?.price ?? 0} GBP</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* FOOTER BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          disabled={loading}
          onPress={handlePayNow}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#0369a1', '#0ea5e9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.payGradient}
          >
            {loading ? (
              <Text style={styles.payText}>Processing...</Text>
            ) : (
              <>
                <Text style={styles.payText}>Pay Now</Text>
                <Ionicons name="shield-checkmark" size={18} color="#fff" style={{ marginLeft: 10 }} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ToastConfig
        visible={popupVisible}
        message={statusMessage}
        onClose={() => {
          setPopupVisible(false);
          navigation.reset({
            index: 0,
            routes: [{ name: "Root" }],
          });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAF8",
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
    marginBottom: 5,
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
    flex: 1,
  },
  headerTitle: {
    fontSize: RFValue(15),
    fontFamily: FONTS.bold,
    color: '#fff',
  },
  headerSub: {
    fontSize: RFValue(10),
    color: 'rgba(255,255,255,0.8)',
    fontFamily: FONTS.medium,
    marginTop: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: FONTS.bold,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  heroAmount: {
    color: '#fff',
    fontSize: RFValue(28),
    fontFamily: FONTS.bold,
  },
  currency: {
    fontSize: RFValue(14),
    color: '#38bdf8',
  },
  heroFlagBox: {
    width: 56,
    height: 38,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: '#fff', // Pure white background to make flag colors pop
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroFlag: {
    width: '100%',
    height: '100%',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 20,
  },
  heroBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroRecipientName: {
    color: '#f8fafc',
    fontSize: 14,
    fontFamily: FONTS.bold,
    marginLeft: 8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#475569',
    marginHorizontal: 10,
  },
  heroMobile: {
    color: '#94a3b8',
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  payMethodCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  payMethodCardActive: {
    borderColor: '#0ea5e9',
    backgroundColor: '#f0f9ff',
  },
  pmIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pmContent: {
    flex: 1,
    marginLeft: 15,
  },
  pmTitle: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: '#1e293b',
  },
  pmSubtitle: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: FONTS.medium,
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: '#0ea5e9',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0ea5e9',
  },
  detailsContainer: {
    marginTop: 15,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: FONTS.medium,
  },
  detailValue: {
    fontSize: 13,
    color: '#1e293b',
    fontFamily: FONTS.bold,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#f1f5f9',
    borderStyle: 'dashed',
  },
  totalLabel: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: '#1e293b',
  },
  totalValue: {
    fontSize: RFValue(18),
    fontFamily: FONTS.bold,
    color: '#0ea5e9',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(248, 250, 248, 0.95)',
  },
  payButton: {
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
});

export default AirtimeTopupPay;
