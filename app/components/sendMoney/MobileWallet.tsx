import React, { useEffect, useState, useCallback, useMemo } from "react";
import { apiClient, GetTransactionDetails, GetTransactionLimit, GetTransactionLimits } from 'app/http-services'; // if it's exported there
import { Image, Modal } from "react-native";
import Toast from "react-native-toast-message";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Switch,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import CountryFlag from "react-native-country-flag";
import { MetaService } from "app/services/meta.service";
import { CheckRate, getRequest, SendMoneyCalculatess, TransferType } from "app/http-services";
import { ProfileState, SelectedRecipientCurrencyState, SelectedSenderCountryDataState, SelectedSenderCurrencyState, SendMoneyTabState } from "app/atoms";
import { FONTS, SIZES } from "app/constants/Assets";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { TransferTypeListState } from "app/atoms/TransferTypeListState";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
import { useNavigation, useFocusEffect } from '@react-navigation/native';


import { GetCountryLists } from "app/http-services";

import ModalPicker from "app/components/customComponents/ModalPicker";

const FeeStep = ({
  label,
  value,
  currency = "GBP",
  isLast,
}: {
  label: string;
  value?: string;
  currency?: string;
  isLast?: boolean;
}) => (
  <View style={styles.feeStep}>
    <View style={styles.timelineContainer}>
      <View style={styles.dot} />
      {!isLast && <View style={styles.verticalLine} />}
    </View>
    <View style={styles.feeTextContainer}>
      <Text
        style={[
          styles.feeValueText,
          label.toLowerCase().includes("total") && styles.feeTextBold,
        ]}
      >
        {value ? `${value} ${currency}` : "--"}
      </Text>
      <Text
        style={[
          styles.feeLabelText,
          label.toLowerCase().includes("total") && styles.feeTextBold,
        ]}
      >
        {label}
      </Text>
    </View>
  </View>
);

const MobileWallet = () => {
  const { width } = useWindowDimensions();

  const [isCoupon, setIsCoupon] = useState(false);
  const [coupon, setCoupon] = useState("");
  const currentToken = useRecoilValue(ProfileState);
  const [loading, setLoading] = useState(false);
  const [countryList, setCountryList] = useState<any[]>([]);
  const [recipientCurrency, setRecipientCurrency] = useRecoilState(SelectedRecipientCurrencyState);
  const [searchText, setSearchText] = useState("");
  const [showCurrencyList, setShowCurrencyList] = useState(false);

  /* YOU SEND */
  const [sendCountryList, setSendCountryList] = useState<any[]>([]);
  const [selectedSendCountry, setSelectedSendCountry] = useRecoilState(SelectedSenderCountryDataState);
  const [sendCurrency, setSendCurrency] = useRecoilState(SelectedSenderCurrencyState);

  const [sendAmount, setSendAmount] = useState("1");
  const [recipientAmount, setRecipientAmount] = useState("");
  const [commissionAmount, setCommissionAmount] = useState("");
  const [chargedAmount, setChargedAmount] = useState("");
  const [creditedAmount, setCreditedAmount] = useState("");
  const [checkrateList, setCheckrateList] = useState<any[]>([]);
  const navigation = useNavigation<any>();
  const [isSwapped, setIsSwapped] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [warningMsg, setWarningMsg] = useState("");
  const [hasTransactionError, setHasTransactionError] = useState(false);
  const modalShownRef = React.useRef(false);

  const banksRate = checkrateList?.find((item: { TransferType: string; }) => item.TransferType === "Banks");

  // --- Combined List for Pickers ---
  const combinedCountryList = useMemo(() => {
    const map = new Map();
    sendCountryList.forEach(item => map.set(item.dataValue, item));
    countryList.forEach(item => {
      if (!map.has(item.dataValue)) map.set(item.dataValue, item);
    });
    return Array.from(map.values());
  }, [sendCountryList, countryList]);

  const setTransferTypeList = useSetRecoilState(TransferTypeListState);
  const tabIndex = useRecoilValue(SendMoneyTabState);

  // Reset amount whenever screen comes into focus (handles navigation back)
  useFocusEffect(
    useCallback(() => {
      const resetAmount = async () => {
        // Clear persisted sendAmount from previous transaction
        await AsyncStorage.removeItem("sendAmount");
        setSendAmount("1");
        setRecipientAmount("");
        setCommissionAmount("");
        setChargedAmount("");
        setHasTransactionError(false);
        setIsSwapped(false);
        modalShownRef.current = false;
      };
      resetAmount();
    }, [])
  );

  useEffect(() => {
    if (tabIndex === 2) { // Index for MobileWallet
      console.log("MobileWallet Tab Active - Fetching Data");
      // Reset 'You Send' on every tab focus
      setSendAmount("1");
      setRecipientAmount("");
      setCommissionAmount("");
      setChargedAmount("");
      setHasTransactionError(false); // Reset error state
      modalShownRef.current = false; // Reset modal shown flag

      const initData = async () => {
        // Clear persisted sendAmount from previous transaction
        await AsyncStorage.removeItem("sendAmount");

        // Initial fetching
        fetchSendCountries();
        fetchCountries();
        fetchTransfertype();
        fetchCheckRate();

        // Re-load 'Recipient Gets' from persistence
        const stored = await AsyncStorage.getItem("selectedRecipientCurrency");
        if (stored) {
          setRecipientCurrency(stored);
          // Explicitly call fetchSendMoney for the default amount of 1
          await fetchSendMoney("1", stored);
        } else {
          // Explicitly call fetchSendMoney for the default amount of 1 if no stored currency
          await fetchSendMoney("1", recipientCurrency || "IND");
        }
      };
      initData();
    }
  }, [tabIndex]);

  // Removed standard useEffect mount as tabIndex effect handles it
  /*
  useEffect(() => {
    fetchSendCountries();
    fetchCountries();
    fetchSendMoney(sendAmount);
    fetchTransfertype();
    fetchCheckRate();
  }, []);
  */

  // ✅ Fetch dynamically when amount changes
  // useEffect(() => {
  //    if (sendAmount && !isNaN(Number(sendAmount))) {
  //     fetchSendMoney(sendAmount);
  //    }
  //  }, [sendAmount]);

  useEffect(() => {
    const fetchCurrencyAndSendMoney = async () => {
      if (sendAmount && !isNaN(Number(sendAmount))) {
        try {
          const storedCountryCode = await AsyncStorage.getItem("selectedRecipientCurrency");
          console.log("Stored Country Code:", storedCountryCode);

          if (storedCountryCode) {
            await fetchSendMoney(sendAmount, storedCountryCode);
          } else {
            console.warn("No selectedRecipientCurrency found in AsyncStorage");
          }
        } catch (err) {
          console.error("Error reading selectedRecipientCurrency:", err);
        }
      }
    };

    fetchCurrencyAndSendMoney();
  }, [sendAmount]);

  /* ---------------- YOU SEND ---------------- */
  const fetchSendCountries = () => {
    setLoading(true);
    MetaService.fetchCountryMeta(
      true,
      false,
      false,
      async (countries: any[]) => {
        const list = countries.map((c) => ({
          dataValue: c.Alpha_3_Code,
          displayvalue: c.CurrencyCode ?? c.Alpha_3_Code,
          flag: c.Alpha_2_Code
            ? `https://flagcdn.com/w40/${c.Alpha_2_Code.toLowerCase()}.png`
            : null,
        }));
        setSendCountryList(list);

        // Set initial country and currency (amount is already set to "1" in useFocusEffect/tab focus)
        let initialCountry = list[0];
        let initialCurrency = list[0]?.displayvalue || "GBP";

        setSelectedSendCountry(initialCountry);
        setSendCurrency(initialCurrency);

        if (initialCountry?.displayvalue) {
          AsyncStorage.setItem("selectedSendCurrency", initialCountry.displayvalue);
        }

        if (initialCountry?.dataValue) {
          AsyncStorage.setItem("selectedCountryDisplayValue", initialCountry.dataValue);
          // Don't call fetchSendMoney here, it will be triggered by the useEffect watching sendAmount
        }
      },
      () => { },
      () => setLoading(false)
    );
  };

  const fetchCountries = async () => {
    try {
      setLoading(true);
      MetaService.fetchCountryMetas(
        false,
        true,
        false,
        async (countries: any[]) => {
          const list = countries.map((c: any) => ({
            dataValue: c.Alpha_3_Code,
            displayvalue: c.Alpha_3_Code,
            flag: `https://flagcdn.com/w40/${c.Alpha_2_Code.toLowerCase()}.png`
          }));
          setCountryList(list);

          // ✅ Check AsyncStorage first
          const storedCurrency = await AsyncStorage.getItem("selectedRecipientCurrency");

          if (storedCurrency) {
            if (!recipientCurrency) setRecipientCurrency(storedCurrency || "");
          } else {
            // ✅ Default recipient = IND if available, else first country
            const defaultReceive = list.find(c => c.dataValue === "IND") || list[0];
            if (defaultReceive) {
              if (!recipientCurrency) setRecipientCurrency(defaultReceive.displayvalue);
              await AsyncStorage.setItem("selectedRecipientCurrency", defaultReceive.displayvalue);
            }
          }
        },
        () => { },
        () => setLoading(false)
      );
    } catch (error) {
      console.error("fetchCountries error:", error);
      setLoading(false);
    }
  };


  // ✅ Modified fetchSendMoney to accept amount dynamically
  // const fetchSendMoney = async (amount: string, toCountryCode?: string) => {
  //   try {
  //     setLoading(true);

  //     const countryCode = toCountryCode || recipientCurrency;

  //     const response = await SendMoneyCalculatess(Number(amount), countryCode);
  //     if (response.status === 200 && response.data) {
  //       const data = response.data?.data || response.data;

  //       setCommissionAmount(data?.SenderPayerProposal?.CommisionAmount?.Amount?.toString() || '');
  //       setChargedAmount(data?.SenderPayerProposal?.ChargedAmount?.Amount?.toString() || '');
  //       setRecipientAmount(data?.SenderPayerProposal?.CreditedAmount?.Amount?.toString() || '0');
  //     }
  //   } catch (err) {
  //     console.error("Error fetching send money:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchSendMoney = async (
    amount: string,
    toCountryCode?: string,
    fromCountryCode?: string,
    reverse?: string
  ) => {
    try {
      setLoading(true);

      const finalTo = toCountryCode || await AsyncStorage.getItem("selectedRecipientCurrency") || recipientCurrency || "IND";
      const finalFrom = fromCountryCode || await AsyncStorage.getItem("selectedCountryDisplayValue") || selectedSendCountry?.dataValue || "GBR";

      const finalCurrency = await AsyncStorage.getItem("selectedSendCurrency") || sendCurrency || "GBP";
      const actualReverse = reverse !== undefined ? reverse : (isSwapped ? finalCurrency : "");
      const isReverseActive = actualReverse !== "";

      const response = await SendMoneyCalculatess(
        Number(amount),
        finalTo,
        finalFrom,
        actualReverse
      );
      if (response.status === 200 && response.data) {
        // Check for error status code ER1111
        if (response.data.StatusCode === "ER1111") {
          setHasTransactionError(true); // Always set error state

          // Only show modal if: 1) hasn't been shown yet, 2) modal not visible, 3) THIS tab is active
          if (!modalShownRef.current && !modalVisible && tabIndex === 2) {
            setWarningMsg(response.data.StatusMsg || "Transaction limit exceeded");
            modalShownRef.current = true; // Mark modal as shown
            setModalVisible(true);
          }
          return;
        }

        // Reset error state on successful response
        setHasTransactionError(false);

        const data = response.data?.data || response.data;
        AsyncStorage.setItem("SessionCode", response.data.SessionCode);

        const comm = data?.SenderPayerProposal?.CommisionAmount?.Amount?.toString() || "";
        const total = data?.SenderPayerProposal?.ChargedAmount?.Amount?.toString() || "";
        const cred = data?.SenderPayerProposal?.CreditedAmount?.Amount?.toString() || "0";

        const recv = isReverseActive
          ? data?.SenderPayerProposal?.InitialAmount?.Amount?.toString() || "0"
          : data?.SenderPayerProposal?.CreditedAmount?.Amount?.toString() || "0";

        setCommissionAmount(comm);
        setChargedAmount(total);
        setCreditedAmount(cred);
        setRecipientAmount(recv);
      }
    } catch (err) {
      console.error("Error fetching send money:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransfertype = async (toCountryCode?: string, fromCountryCode?: string) => {
    try {
      const finalTo = toCountryCode || await AsyncStorage.getItem('selectedRecipientCurrency') || recipientCurrency || "IND";
      const finalFrom = fromCountryCode || await AsyncStorage.getItem('selectedCountryDisplayValue') || selectedSendCountry?.dataValue || "GBR";

      const response = await TransferType(finalTo, finalFrom);

      const tdFields = response?.data?.TransferDetails?.TDFields;

      if (
        response?.data?.StatusCode === "ER0000" &&
        Array.isArray(tdFields) &&
        tdFields.length > 0
      ) {
        const transferTypes = tdFields.map(item => item.TransferType);

        setTransferTypeList(transferTypes); // 🔥 Update Recoil state

        await AsyncStorage.setItem(
          "TransferTypeList",
          JSON.stringify(transferTypes)
        );

        console.log("Saved TransferType List:", transferTypes);
      }

    } catch (err) {
      console.error("fetchTransfertype error:", err);
    }
  };

  const fetchCheckRate = async (toCountryCode?: string, fromCountryCode?: string) => {
    try {
      const finalTo = toCountryCode || await AsyncStorage.getItem("selectedRecipientCurrency") || recipientCurrency || "IND";
      const finalFrom = fromCountryCode || await AsyncStorage.getItem("selectedCountryDisplayValue") || selectedSendCountry?.dataValue || "GBR";

      const response = await CheckRate(finalTo, finalFrom);

      if (response.status === 200 && response.data?.TransferDetails?.TDFields) {
        setCheckrateList(response.data.TransferDetails.TDFields);
      } else {
        setCheckrateList([]);
      }
    } catch (err) {
      console.error("fetchCheckRate error:", err);
      setCheckrateList([]);
    }
  };



  const onSendMoney = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem('selectedRecipientCurrency');
      await AsyncStorage.setItem("Transfer Fee", String(commissionAmount ?? '0'));
      const amountToBePaid = isSwapped
        ? (Number(creditedAmount || 0) + Number(commissionAmount || 0)).toString()
        : String(chargedAmount ?? '0');
      await AsyncStorage.setItem("Amount to be paid", amountToBePaid);
      await AsyncStorage.setItem("Amount we'll convert", recipientAmount);
      await AsyncStorage.setItem("sendAmount", sendAmount);
      await AsyncStorage.setItem("ConversionRate", recipientAmount);
      await AsyncStorage.setItem("selectedRecipientCurrency", recipientCurrency || "");
      await AsyncStorage.setItem("ChannelTransferType", "M-Pesa");

      const sessionCode = await AsyncStorage.getItem("SessionCode");
      const req = {
        SendAmount: Number(sendAmount),
        fromcountry: selectedSendCountry?.dataValue || "GBR",
        currency: sendCurrency || "GBP",
        sessionCode: sessionCode,
        tocountry: recipientCurrency || "IND",
        tokenId: currentToken.tokenId,
        remitterId: currentToken.remitterId,
      };

      const response = await GetTransactionLimit(req);
      if (response?.data?.StatusCode === "ER00119") {
        setWarningMsg(response.data.StatusMsg);
        setModalVisible(true);
        return;
      }
      navigation.navigate('Recipient', { data: response.data });
    } catch (error) {
      console.error("GetTransactionLimit error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    const nextSwapped = !isSwapped;
    setIsSwapped(nextSwapped);
    fetchSendMoney(sendAmount, undefined, undefined, nextSwapped ? (sendCurrency || "") : "");
  };

  const isFormValid = !!(sendAmount && !isNaN(Number(sendAmount)) && recipientCurrency !== "Select" && !hasTransactionError);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* You Send */}
      <View style={[styles.card, { width: width - 32 }]}>
        <Text style={styles.label}>You Send</Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={sendAmount}
            onChangeText={(t) => setSendAmount(t.replace(/[^0-9]/g, ""))}
          />

          {/* SELECTED COUNTRY */}
          <View style={{ width: 100, marginRight: 24 }}>
            <ModalPicker
              selectedValue={isSwapped ? recipientCurrency : selectedSendCountry?.dataValue}
              onValueChange={(val: any) => {
                if (isSwapped) {
                  setRecipientCurrency(val);
                  AsyncStorage.setItem("selectedRecipientCurrency", val);
                  fetchSendMoney(sendAmount, val, selectedSendCountry?.dataValue, sendCurrency || "");
                  fetchTransfertype(val, selectedSendCountry?.dataValue);
                  fetchCheckRate(val, selectedSendCountry?.dataValue);
                } else {
                  const c = sendCountryList.find(item => item.dataValue === val);
                  if (c) {
                    setSelectedSendCountry(c);
                    setSendCurrency(c.displayvalue);
                    AsyncStorage.setItem("selectedSendCurrency", c.displayvalue);
                    AsyncStorage.setItem("selectedCountryDisplayValue", c.dataValue);
                    fetchTransfertype(recipientCurrency || "IND", c.dataValue);
                    fetchCheckRate(recipientCurrency || "IND", c.dataValue);
                    fetchSendMoney(sendAmount, recipientCurrency || "IND", c.dataValue, "");
                  }
                }
              }}
              dataList={isSwapped ? countryList : sendCountryList}
              placeholder="Select"
            />
          </View>
        </View>
      </View>

      {/* REFINED SWAP UI */}
      <View style={[styles.refinedSwapContainer, { width: width - 32 }]}>
        <View style={styles.dividerLine} />
        <TouchableOpacity style={styles.refinedSwapButton} onPress={handleSwap}>
          <Ionicons name="swap-vertical" size={24} color="#316b83" />
        </TouchableOpacity>
      </View>

      {/* Fee Details Card */}
      <View style={{ width: width - 30, marginBottom: 20 }}>
        <View style={styles.feeBox}>
          <FeeStep
            currency={sendCurrency || "GBP"}
            label="Our fee"
            value={commissionAmount || ""}
          />
          <FeeStep
            currency={sendCurrency || "GBP"}
            label="Total Amount"
            value={chargedAmount || ""}
          />
          <FeeStep
            currency={sendCurrency || "GBP"}
            label="Conversion Rate"
            value={recipientAmount || ""}
            isLast
          />
        </View>
      </View>

      {/* Recipient Gets */}
      <View style={[styles.card, { width: width - 32 }]}>
        <Text style={styles.label}>Recipient Gets</Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={recipientAmount}
            editable={false}
          />

          {/* SELECTED RECIPIENT */}
          <View style={{ width: 100, marginRight: 24 }}>
            <ModalPicker
              selectedValue={isSwapped ? selectedSendCountry?.dataValue : recipientCurrency || "IND"}
              onValueChange={(val: any) => {
                if (isSwapped) {
                  const c = sendCountryList.find(item => item.dataValue === val);
                  if (c) {
                    setSelectedSendCountry(c);
                    setSendCurrency(c.displayvalue);
                    AsyncStorage.setItem("selectedSendCurrency", c.displayvalue);
                    AsyncStorage.setItem("selectedCountryDisplayValue", c.dataValue);
                    fetchTransfertype(recipientCurrency || "IND", c.dataValue);
                    fetchCheckRate(recipientCurrency || "IND", c.dataValue);
                    fetchSendMoney(sendAmount, recipientCurrency || "IND", c.dataValue, c.displayvalue || "");
                  }
                } else {
                  setRecipientCurrency(val || "");
                  AsyncStorage.setItem("selectedRecipientCurrency", val || "");
                  fetchSendMoney(sendAmount, val || "", selectedSendCountry?.dataValue, "");
                  fetchTransfertype(val || "", selectedSendCountry?.dataValue);
                  fetchCheckRate(val || "", selectedSendCountry?.dataValue);
                }
              }}
              dataList={isSwapped ? sendCountryList : countryList}
              placeholder="Select"
            />
          </View>
        </View>
      </View>

      {/* Send Button */}
      <TouchableOpacity
        style={[
          { width: width - 32, borderRadius: 12, opacity: isFormValid ? 1 : 0.5 },
        ]}
        onPress={onSendMoney}
        disabled={!isFormValid}
      >
        <LinearGradient
          colors={["#316b83", "#8bacb9"]}
          start={[0, 0]}
          end={[1, 0]}
          style={styles.sendButton}
        >
          <Text style={styles.sendText}>Send money</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* ⚠️ Warning Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          modalShownRef.current = false;
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconInner}>
                <Ionicons name="alert-circle" size={32} color="#f59e0b" />
              </View>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>Rate Update</Text>
              <Text style={styles.modalMessage}>{warningMsg}</Text>

              <View style={styles.modalActionWrapper}>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    modalShownRef.current = false;
                  }}
                  activeOpacity={0.8}
                  style={{ width: '100%' }}
                >
                  <LinearGradient
                    colors={["#0EA5E9", "#0ea5e9"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.modalOkButton}
                  >
                    <Text style={styles.modalOkText}>OK</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default MobileWallet;

const styles = StyleSheet.create({
  container: { paddingVertical: 16, alignItems: "center", backgroundColor: "#fff" },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 24, marginBottom: 16, elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 10 },
  label: { fontSize: SIZES.p13, fontFamily: FONTS.bold, color: "black", marginBottom: 12 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  input: {
    flex: 1,
    borderWidth: 0,
    borderBottomWidth: 1.5,
    borderBottomColor: "#f1f5f9",
    borderRadius: 0,
    paddingHorizontal: 0,
    height: 56,
    fontSize: SIZES.p24,
    fontFamily: FONTS.bold,
    color: "#0f172a",
    backgroundColor: "transparent",
    fontWeight: '800',
    // @ts-ignore
    outlineStyle: 'none',
  },
  dropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#eef0f2', borderRadius: 12, width: 100, marginRight: 24 },
  dropdownText: { fontWeight: "bold" },
  flagIcon: {
    marginLeft: 10,
    width: 24,
    height: 18,
    marginRight: 8,
  },
  dropdownItemText: {
    fontSize: 14,
  },

  feeBox: { backgroundColor: "#fff", borderRadius: 24, padding: 24, elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 10 },
  feeStep: { flexDirection: "row", alignItems: "flex-start", marginBottom: 20 },
  feeTextContainer: { flexDirection: "row", alignItems: "center", marginLeft: 16 },
  feeValueText: { fontSize: 15, fontFamily: "SF Pro Display", color: "#333", marginRight: 6 },
  feeLabelText: { fontSize: 15, fontFamily: "SF Pro Display", color: "#333" },
  feeTextBold: { fontWeight: "700", color: "#1a1a1a" },
  timelineContainer: { position: "relative", width: 12, alignItems: "center", marginTop: 4 },
  dot: { width: 10, height: 10, backgroundColor: "#e2e4e7", borderRadius: 5, zIndex: 1 },
  verticalLine: { width: 2, height: 40, backgroundColor: "#e2e4e7", position: "absolute", top: 10 },

  sendButton: { paddingVertical: 18, alignItems: "center", borderRadius: 12, marginTop: 40 },
  sendText: { color: "#fff", fontWeight: "700", fontSize: SIZES.p16, fontFamily: FONTS.bold },
  refinedSwapContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    height: 44,
    marginVertical: -22,
    zIndex: 10,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#fff",
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  modalHeader: {
    height: 120,
    width: '100%',
    backgroundColor: '#fff9eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#fef3c7',
  },
  modalIconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 32,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 12,
    fontFamily: "SF Pro Display",
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
    fontFamily: "SF Pro Display",
    fontWeight: '500',
  },
  modalActionWrapper: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalOkButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOkText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  dividerLine: {
    position: "absolute",
    left: 0,
    right: 22,
    height: 1,
    backgroundColor: "#eef0f2",
  },
  refinedSwapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
});