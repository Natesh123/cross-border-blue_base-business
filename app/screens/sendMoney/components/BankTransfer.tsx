import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MetaService } from "app/services/meta.service";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { ProfileState, SelectedRecipientCurrencyState, SelectedSenderCountryDataState, SelectedSenderCurrencyState, SendMoneyTabState } from "app/atoms";
import { TransferTypeListState } from "app/atoms/TransferTypeListState";
import { FONTS, SIZES } from "app/constants/Assets";
import {
  CheckRate,
  SendMoneyCalculate,
  TransferType,
  GetTransactionLimit,
  GetCountryLists
} from "app/http-services";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

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
}) => {
  const isTotal = label.toLowerCase().includes("total");

  return (
    <View style={styles.feeStep}>
      <View style={styles.timelineContainer}>
        <View style={[styles.dot, isTotal && styles.dotTotal]} />
        {!isLast && <View style={styles.verticalLine} />}
      </View>
      <View style={styles.feeTextContainer}>
        <Text style={[styles.feeLabelText, isTotal && styles.feeTextBold]}>
          {label}
        </Text>
        <Text style={[styles.feeValueText, isTotal && styles.feeTextBold]}>
          {value ? `${value} ${currency}` : "--"}
        </Text>
      </View>
    </View>
  );
};

const BankTransfer = () => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<any>();
  const currentToken = useRecoilValue(ProfileState);
  const setTransferTypeList = useSetRecoilState(TransferTypeListState);

  const [loading, setLoading] = useState(false);

  /* YOU SEND */
  const [sendCountryList, setSendCountryList] = useState<any[]>([]);
  const [selectedSendCountry, setSelectedSendCountry] = useRecoilState(SelectedSenderCountryDataState);
  const [sendCurrency, setSendCurrency] = useRecoilState(SelectedSenderCurrencyState);

  /* RECIPIENT */
  const [receiveCountryList, setReceiveCountryList] = useState<any[]>([]);
  const [recipientCurrency, setRecipientCurrency] = useRecoilState(SelectedRecipientCurrencyState);

  /* AMOUNTS */
  const [sendAmount, setSendAmount] = useState("1");
  const [recipientAmount, setRecipientAmount] = useState("");
  const [commissionAmount, setCommissionAmount] = useState("");
  const [chargedAmount, setChargedAmount] = useState("");
  const [creditedAmount, setCreditedAmount] = useState("");

  /* OTHERS */
  const [checkrateList, setCheckrateList] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [warningMsg, setWarningMsg] = useState("");
  const [isSwapped, setIsSwapped] = useState(false);
  const [hasTransactionError, setHasTransactionError] = useState(false);
  const modalShownRef = React.useRef(false);

  const tabIndex = useRecoilValue(SendMoneyTabState);

  // Reset amount whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const resetAmount = async () => {
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
    if (tabIndex === 1) {
      setSendAmount("1");
      setRecipientAmount("");
      setCommissionAmount("");
      setChargedAmount("");
      setHasTransactionError(false);
      modalShownRef.current = false;

      const initData = async () => {
        await AsyncStorage.removeItem("sendAmount");
        fetchSendCountries();
        fetchReceiveCountries();
        fetchTransfertype();
        fetchCheckRate();

        const storedRecipient = await AsyncStorage.getItem("selectedRecipientCurrency");
        if (storedRecipient) {
          setRecipientCurrency(storedRecipient);
          await fetchSendMoney("1", storedRecipient);
        } else {
          setRecipientCurrency("IND");
          await AsyncStorage.setItem("selectedRecipientCurrency", "IND");
          await fetchSendMoney("1", "IND");
        }
      };
      initData();
    }
  }, [tabIndex]);

  useEffect(() => {
    if (sendAmount && !isNaN(Number(sendAmount))) {
      fetchSendMoney(sendAmount, recipientCurrency || "IND", selectedSendCountry?.dataValue);
    }
  }, [sendAmount, recipientCurrency, selectedSendCountry?.dataValue]);

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

        let initialCountry = list[0];
        let initialCurrency = list[0]?.displayvalue || "GBP";

        setSelectedSendCountry(initialCountry);
        setSendCurrency(initialCurrency);

        if (initialCountry?.displayvalue) {
          AsyncStorage.setItem("selectedSendCurrency", initialCountry.displayvalue);
        }

        if (initialCountry?.dataValue) {
          AsyncStorage.setItem("selectedCountryDisplayValue", initialCountry.dataValue);
        }
      },
      () => { },
      () => setLoading(false)
    );
  };

  const fetchCheckRate = async (toCountryCode?: string, fromCountryCode?: string) => {
    try {
      const finalTo = toCountryCode || await AsyncStorage.getItem("selectedRecipientCurrency") || recipientCurrency || "IND";
      const finalFrom = fromCountryCode || await AsyncStorage.getItem("selectedCountryDisplayValue") || selectedSendCountry?.dataValue || "GBR";

      const response = await CheckRate(finalTo, finalFrom);
      if (response.status === 200 && response.data?.TransferDetails?.TDFields) {
        setCheckrateList(response.data.TransferDetails.TDFields);
      }
    } catch (err) {
      console.error("fetchCheckRate error:", err);
    }
  };

  const fetchSendMoney = async (amount: any, toCountry?: string, fromCountry?: string, reverse?: string) => {
    if (!amount) return;
    try {
      setLoading(true);
      const finalTo = toCountry || await AsyncStorage.getItem("selectedRecipientCurrency") || recipientCurrency || "IND";
      const finalFrom = fromCountry || await AsyncStorage.getItem("selectedCountryDisplayValue") || selectedSendCountry?.dataValue || "GBR";

      const finalCurrency = await AsyncStorage.getItem("selectedSendCurrency") || sendCurrency || "GBP";
      const actualReverse = reverse !== undefined ? reverse : (isSwapped ? finalCurrency : "");
      const isReverseActive = actualReverse !== "";

      const res: any = await SendMoneyCalculate(
        Number(amount),
        finalTo,
        finalFrom,
        actualReverse
      );

      if (res.status === 200 && res.data) {
        if (res.data.StatusCode === "ER1111") {
          setHasTransactionError(true);
          if (!modalShownRef.current && !modalVisible && tabIndex === 1) {
            setWarningMsg(res.data.StatusMsg || "Transaction limit exceeded");
            modalShownRef.current = true;
            setModalVisible(true);
          }
          return;
        }

        setHasTransactionError(false);
        const data = res.data?.data || res.data;
        AsyncStorage.setItem("SessionCode", res.data.SessionCode);

        const comm = data?.SenderPayerProposal?.CommisionAmount?.Amount?.toString() || "0";
        const total = data?.SenderPayerProposal?.ChargedAmount?.Amount?.toString() || "0";
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
      console.error("fetchSendMoney error:", err);
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

      if (response?.status === 200 && Array.isArray(tdFields)) {
        const transferTypes = tdFields.map((item: any) => item.TransferType);
        setTransferTypeList(transferTypes);
      }
    } catch (err) {
      console.error("fetchTransfertype error:", err);
    }
  };

  const fetchReceiveCountries = async () => {
    setLoading(true);
    MetaService.fetchCountryMetas(
      false,
      true,
      false,
      async (countries: any[]) => {
        const list = countries.map((c) => ({
          dataValue: c.Alpha_3_Code,
          displayvalue: c.Alpha_3_Code,
          flag: c.Alpha_2_Code
            ? `https://flagcdn.com/w40/${c.Alpha_2_Code.toLowerCase()}.png`
            : null,
        }));
        setReceiveCountryList(list);
      },
      () => setLoading(false),
      () => setLoading(false)
    );
  };

  const onSendMoney = async () => {
    try {
      setLoading(true);
      const sessionCode = await AsyncStorage.getItem("SessionCode");

      await AsyncStorage.setItem("Transfer Fee", String(commissionAmount ?? '0'));
      const amountToBePaid = isSwapped
        ? (Number(creditedAmount || 0) + Number(commissionAmount || 0)).toString()
        : String(chargedAmount ?? '0');
      await AsyncStorage.setItem("Amount to be paid", amountToBePaid);
      await AsyncStorage.setItem("Amount we'll convert", recipientAmount);
      await AsyncStorage.setItem("sendAmount", sendAmount);
      await AsyncStorage.setItem("ConversionRate", recipientAmount);
      await AsyncStorage.setItem("selectedRecipientCurrency", recipientCurrency || "IND");
      await AsyncStorage.setItem("ChannelTransferType", "BANKS");

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
      console.error("onSendMoney error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = sendAmount && !isNaN(Number(sendAmount)) && !hasTransactionError;

  const handleSwap = () => {
    const nextSwapped = !isSwapped;
    setIsSwapped(nextSwapped);
    fetchSendMoney(sendAmount, undefined, undefined, nextSwapped ? (sendCurrency || "") : "");
  };

  return (
    <ScrollView
      style={{ backgroundColor: '#f8fafc' }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.mainWrapper}>
        {/* Loader Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0EA5E9" />
          </View>
        )}

        {/* --- SENDER CARD --- */}
        <View style={[styles.card, { paddingBottom: 12 }]}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}>
              <View style={styles.iconCircle}>
                <Ionicons name="paper-plane" size={16} color="#0EA5E9" />
              </View>
              <Text style={styles.label}>You Send</Text>
            </View>

            <View style={styles.headerPickerWrapper}>
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
                dataList={isSwapped ? receiveCountryList : sendCountryList}
                placeholder="Select"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#cbd5e1"
              value={sendAmount}
              onChangeText={(t) => setSendAmount(t.replace(/[^0-9]/g, ""))}
            />
          </View>
        </View>

        {/* --- INTEGRATED FEE & SWAP SECTION --- */}
        <View style={styles.middleSection}>
          <View style={styles.timelineWrapper} />
          <View style={styles.feeContent}>
            {isExpanded && (
              <>
                <FeeStep currency={sendCurrency || "GBP"} label="Our fee" value={commissionAmount} />
                <FeeStep currency={sendCurrency || "GBP"} label="Total Amount" value={chargedAmount} />
                <FeeStep
                  currency={sendCurrency || "GBP"}
                  label="1 GBP ="
                  value={recipientAmount}
                  isLast
                />
              </>
            )}
          </View>

          <TouchableOpacity
            style={styles.swapFloatingButton}
            onPress={handleSwap}
            activeOpacity={0.8}
          >
            <View style={styles.swapInner}>
              <Ionicons name="swap-vertical" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* --- RECIPIENT CARD --- */}
        <View style={[styles.card, { paddingBottom: 12 }]}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}>
              <View style={[styles.iconCircle, { backgroundColor: '#f0fdf4' }]}>
                <Ionicons name="wallet" size={16} color="#10b981" />
              </View>
              <Text style={styles.label}>Recipient Gets</Text>
            </View>

            <View style={styles.headerPickerWrapper}>
              <ModalPicker
                selectedValue={isSwapped ? selectedSendCountry?.dataValue : recipientCurrency}
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
                    setRecipientCurrency(val);
                    AsyncStorage.setItem("selectedRecipientCurrency", val);
                    fetchSendMoney(sendAmount, val, selectedSendCountry?.dataValue, "");
                    fetchTransfertype(val, selectedSendCountry?.dataValue);
                    fetchCheckRate(val, selectedSendCountry?.dataValue);
                  }
                }}
                dataList={isSwapped ? sendCountryList : receiveCountryList}
                placeholder="Select"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { color: '#0f172a' }]}
              keyboardType="numeric"
              value={recipientAmount}
              editable={false}
              placeholder="0.00"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        {/* --- ACTION BUTTON --- */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.mainButtonWrapper, !isFormValid && styles.disabledButton]}
            onPress={onSendMoney}
            disabled={!isFormValid}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={isFormValid ? ["#0EA5E9", "#2563EB"] : ["#cbd5e1", "#94a3b8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Send Money Now</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.secureText}>
            <Ionicons name="lock-closed" size={12} color="#64748b" /> Secure SSL Encryption
          </Text>
        </View>
      </View>

      {/* Warning Modal */}
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
              <Text style={styles.modalTitle}>Notice</Text>
              <Text style={styles.modalMessage}>{warningMsg}</Text>

              <View style={styles.modalActionWrapper}>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    modalShownRef.current = false;
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#0EA5E9', '#0ea5e9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.modalOkButton}
                  >
                    <Text style={styles.modalOkText}>I Understand</Text>
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

export default BankTransfer;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  mainWrapper: {
    paddingHorizontal: 20,
    paddingTop: 16,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 32,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: SIZES.p13,
    fontFamily: FONTS.bold,
    color: "#64748b",
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerPickerWrapper: {
    width: 135, // Slightly smaller
    height: 50,
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  input: {
    flex: 1,
    fontSize: SIZES.p26,
    fontFamily: FONTS.bold,
    color: "#0f172a",
    fontWeight: '800',
    paddingVertical: 8,
    borderWidth: 0,
    borderBottomWidth: 1.5,
    borderBottomColor: '#f1f5f9',
    marginRight: 12,
    // @ts-ignore
    outlineStyle: 'none',
  },
  pickerWrapper: {
    width: 140,
    height: 60,
    justifyContent: 'center',
  },
  middleSection: {
    paddingHorizontal: 24,
    position: 'relative',
    marginVertical: -6,
    zIndex: 10,
    paddingVertical: 10,
  },
  timelineWrapper: {
    position: 'absolute',
    left: 45,
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: '#f1f5f9',
  },
  feeContent: {
    marginLeft: 45,
    gap: 10,
  },
  swapFloatingButton: {
    position: 'absolute',
    right: 24,
    top: '50%',
    marginTop: -24,
    zIndex: 30,
  },
  swapInner: {
    width: 48, // Reduced from 52
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  feeStep: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
  },
  timelineContainer: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: -20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f1f5f9',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
  },
  dotTotal: {
    borderColor: '#0EA5E9',
    backgroundColor: '#fff',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2.5,
  },
  verticalLine: {
    // Handled by timelineWrapper
  },
  feeTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 55,
  },
  feeLabelText: {
    fontSize: SIZES.p12,
    color: '#94a3b8',
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
  feeValueText: {
    fontSize: SIZES.p12,
    color: '#64748b',
    fontFamily: FONTS.bold,
    fontWeight: '700',
    marginLeft: 'auto',
  },
  feeTextBold: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '800',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  mainButtonWrapper: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.5,
    elevation: 0,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    gap: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: SIZES.p24,
    fontWeight: "900",
    fontFamily: FONTS.bold,
  },
  secureText: {
    marginTop: 20,
    fontSize: SIZES.p13,
    color: "#94a3b8",
    fontFamily: FONTS.semibold,
    marginBottom: 40,
    fontWeight: '600',
  },
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
    fontSize: SIZES.p22,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 12,
    fontFamily: FONTS.bold,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: SIZES.p16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
    fontFamily: FONTS.medium,
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
});
