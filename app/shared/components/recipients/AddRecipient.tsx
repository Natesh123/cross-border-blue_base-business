import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, useWindowDimensions, View, StatusBar, StyleSheet, Animated, RefreshControl } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Container from "../../../theme/Container";
import styles from "../../../styles";
import { SHADOWS, FONTS, SIZES } from "../../../constants/Assets";


const localStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerWrapper: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: '900',
    color: '#fff',
    fontFamily: FONTS.bold,
  },
  headerSubtitle: {
    fontSize: SIZES.p16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: FONTS.medium,
    marginTop: 1,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 4,
  },
  inputGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  inputField: {
    flex: 1,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: SIZES.p19,
    fontWeight: '700',
    color: '#64748b',
    fontFamily: FONTS.semibold,
    marginBottom: 8,
    marginLeft: 4,
  },
  required: {
    color: '#ef4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  fieldIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: SIZES.h4,
    fontFamily: FONTS.medium,
    color: '#0f172a',
    fontWeight: '500',
    ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any),
  },
  pickerSection: {
    marginBottom: 16,
  },
  pickerWrapper: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  phoneInputGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  isdWrapper: {
    width: 65,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  isdInput: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748b',
    fontFamily: FONTS.bold,
  },
  nextButton: {
    flex: 2,
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  gradientButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    fontSize: SIZES.large,
    fontWeight: '900',
    color: '#fff',
    fontFamily: FONTS.bold,
  },
  errorText: {
    fontSize: SIZES.p15,
    color: '#ef4444',
    fontFamily: FONTS.medium,
    marginTop: 4,
    marginLeft: 4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});

const stylesLocal = StyleSheet.create({
  searchButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#007BFF',
    borderRadius: 6,
    marginLeft: 8
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginBottom: 0,
  },
  modalTitleHeader: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "SF Pro Display",
    color: "#fff",
  },
});
import { SafeAreaView } from "react-native-safe-area-context";
import { authenticate, GetCountryList, GetNationality, GetRemitterProfile, RemitterPostRegistration, AddReceiverInfo, EditBeneficiary, GetAgentDetails } from "app/http-services";
import { useRecoilState } from "recoil";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { ProfileState } from "app/atoms";
import Toast from "react-native-toast-message";
import Spinner from "react-native-loading-spinner-overlay";
import Button from "app/components/controls/Button";
import ModalPicker from "app/components/customComponents/ModalPicker";
import { TDropDown } from "types";
import moment from 'moment';
import ModalHeaderBack from "app/components/ModalHeaderBack";
import { MetaService } from "app/services/meta.service";
import { useSharedValue } from "react-native-reanimated";
import ReceivingMode from "./receivingMode/ReceivingMode";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { theme } from "app/core/theme";
// import SHADOWS, FONTS, SIZES moved to top
import { SendMoneyService } from "app/services/sendMoney.service";
import { ReceivingModeField } from "app/models/receivingModeField.model";
import BankDeposit from "./receivingMode/items/BankDeposit";
import Icon from 'react-native-vector-icons/Ionicons';
import GroupButton from "app/components/controls/GroupButton";
import { getBranchDetail } from "app/http-services";
import { useRecoilValue } from "recoil";
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from "types";
import AsyncStorage from "@react-native-async-storage/async-storage";

// import { RootStackParamList } from '../types/navigation'; // Removed because file does not exist


const AddRecipient = () => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [bankList, setBankList] = useState<{ dataValue: string; displayvalue: string }[]>([]);
  const [bank, setBank] = useState({ value: '', error: '' });
  const [IFSCCode, setIFSCCode] = useState({ value: '', error: '' });
  const [accountNumber, setAccountNumber] = useState({ value: '', error: '' });
  const [mobileWalletNumber, setMobileWalletNumber] = useState({ value: '', error: '' });
  const [ReceiverID, setReceiverID] = useState({ value: '', error: '' });
  const [accountName, setAccountName] = useState({ value: '', error: '' });
  const [PayoutCity, setPayoutCity] = useState<{ value: string, error: string }>({ value: '', error: '' });
  const [payoutPostcode, setPayoutPostcode] = useState<{ value: string, error: string }>({ value: '', error: '' });
  const [payoutSearch, setPayoutSearch] = useState<{ value: string, error: string }>({ value: '', error: '' });
  const [firstName, setFirstName] = useState({ value: '', error: '' });
  const [lastName, setLastName] = useState({ value: '', error: '' });
  const [email, setEmail] = useState({ value: '', error: '' });
  const [country, setCountry] = useState<any>({ value: '', error: '' });
  const [mobile, setMobile] = useState({ value: '', error: '' });
  const [isdCode, setIsdCode] = useState({ value: '', error: '' });

  const [city, setCity] = useState({ value: '', error: '' });
  const [relationship, setRelationship] = useState({ value: '', error: '' });
  const [refreshing, setRefreshing] = useState(false);
  const [countryList, setCountryList] = useState<TDropDown[]>([]);
  const [selectedMode, setSelectedMode] = useState("");
  const [branchList, setBranchList] = useState<BranchDetail[]>([]); // Holds list of branches
  const [selectedBranch, setSelectedBranch] = useState({ value: '', error: '' });
  const [branchCode, setBranchCode] = useState({ value: '', error: '' });


  const [receivingModeField, setReceivingModeField] = useState<ReceivingModeField>();
  const [receivingModeTab, setReceivingModeTab] = useState(0);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [agentList, setAgentList] = useState<{ label: string; value: string }[]>([]);
  const [agent, setAgent] = useState({ value: '', error: '' });;
  const [agentCode, setAgentCode] = useState({ value: '', error: '' });;
  const [agentName, setAgentName] = useState({ value: '', error: '' });;


  const [recipientCurrency, setRecipientCurrency] = useState<string>('');
  const bottomSheetRef = useRef<BottomSheet>(null);
  const currentToken = useRecoilValue(ProfileState);
  const snapPoints = useMemo(() => ['75%'], []);
  const [NewUser, setNewUser] = useState(false);
  const [channelTransferType, setChannelTransferType] = useState('');

  useEffect(() => {
    const getStoredType = async () => {
      try {
        const storedType = await AsyncStorage.getItem("ChannelTransferType");
        if (storedType) {
          setChannelTransferType(storedType);
        }
      } catch (error) {
        console.error("Error fetching stored type:", error);
      }
    };

    getStoredType();
  }, []);
  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const storedCurrency = await AsyncStorage.getItem("selectedRecipientCurrency");
        if (storedCurrency) {
          setRecipientCurrency(storedCurrency);
        }
      } catch (error) {
        console.error("Error fetching stored currency:", error);
      }
    };

    fetchCurrency();
  }, []);




  useEffect(() => {
    console.log("🔄 useEffect triggered with values:");
    console.log("recipientCurrency:", recipientCurrency);
    console.log("countryList:", countryList);


    console.log("🌍 Available Alpha_3_Code values:", countryList.map((c: any) => c.Alpha_3_Code));

    if (recipientCurrency && countryList.length > 0) {
      const matchedCountry = countryList.find(
        (country: any) => country.dataValue === recipientCurrency
      );

      console.log("🔍 Matched Country:", matchedCountry);

      if (matchedCountry) {
        setCountry({ value: matchedCountry.dataValue, error: '', disabled: true });
        setIsdCode({ value: matchedCountry.ISDCode, error: '' });
        onCountryChange(matchedCountry.dataValue);
        console.log("Auto-selected country:", matchedCountry.displayvalue);
      } else {
        console.log("No matching country found for:", recipientCurrency);
      }
    }
  }, [recipientCurrency, countryList]);


  const validateRecipientForm = () => {
    let isValid = true;

    if (!firstName.value.trim()) {
      setFirstName(prev => ({ ...prev, error: "First name is required" }));
      isValid = false;
    }
    if (!lastName.value.trim()) {
      setLastName(prev => ({ ...prev, error: "Last name is required" }));
      isValid = false;
    }
    if (!email.value.trim()) {
      setEmail(prev => ({ ...prev, error: "Email is required" }));
      isValid = false;
    }
    if (!country.value) {
      setCountry((prev: any) => ({ ...prev, error: "Please select a country" }));
      isValid = false;
    }
    if (!mobile.value.trim()) {
      setMobile(prev => ({ ...prev, error: "Mobile number is required" }));
      isValid = false;
    }


    return isValid;
  };

  const handleExpandPress = useCallback(async () => {
    if (!validateRecipientForm()) return;

    try {
      // Store email in AsyncStorage
      await AsyncStorage.setItem('userEmail', email.value);
      console.log("✅ Email stored successfully:", email.value);
    } catch (error) {
      console.error("❌ Error saving email:", error);
    }

    setLoading(true);
    setTimeout(() => {
      bottomSheetRef.current?.expand();
      setLoading(false);
    }, 300);
  }, [firstName, lastName, email, country, mobile, city, relationship]);


  type AddRecipientRouteProp = RouteProp<RootStackParamList, 'AddRecipient'>;

  // const AddRecipients = () => {
  const route = useRoute();
  const editData = (route.params as { editData?: any })?.editData ?? null;
  const isEditing = !!editData;


  useEffect(() => {
    if (channelTransferType === "BANKS") {
      setSelectedMode("Bank deposit");
    } else if (channelTransferType === "CGMONEY") {
      setSelectedMode("Cash pickup");
    }
    else if (channelTransferType === "wallet") {
      setSelectedMode("Mobile wallet")
    }
  }, [channelTransferType]);





  useEffect(() => {
    if (editData) {
      setNewUser(false);
      console.log("editData", editData);
      if (editData.MobileNumber) {
        const parts = editData.MobileNumber.split('-');
        setIsdCode({ value: parts[0] || '', error: '' });
        setMobile({ value: parts[1] || '', error: '' });
      } else {
        setIsdCode({ value: '', error: '' });
        setMobile({ value: '', error: '' });
      }
      if (editData?.BranchCode) {
        setSelectedBranch({ value: String(editData.BranchCode), error: '' });
      }

      setFirstName({ value: editData.FirstName || '', error: '' });
      setLastName({ value: editData.LastName || '', error: '' });
      setEmail({ value: editData.Email || '', error: '' });
      setCity({ value: editData.City || '', error: '' });
      setCountry({ value: editData.CountryCode || '', error: '' });
      setRelationship({ value: editData.Relationship || '', error: '' });
      setReceiverID({ value: editData.ReceiverID || '', error: '' });
      // Bank Deposit 

      setIFSCCode({ value: editData.IFSC_IBAN || '', error: '' });
      setAccountNumber({ value: editData.AccountNumber || '', error: '' });
      setAccountName({ value: editData.AccountName || '', error: '' });
      setBank({ value: editData.BankName || '', error: '' });
      setSelectedBranch({ value: editData.BankCode || '', error: '' });
      setBranchCode({ value: editData.BranchCode ?? '', error: '' });

      // Cash Pickup

      setPayoutCity({ value: editData.PayoutCity || '', error: '' });
      setPayoutPostcode({ value: editData.payoutPostcode || '', error: '' });
      setPayoutSearch({ value: editData.payoutSearch || '', error: '' });
      setAgentCode({ value: editData.AgentCode ?? '', error: '' });
      // setAgentName({ value: editData.AgentName ?? '', error: '' });
      setAgent({ value: editData.AgentName, error: '' });
      setAgentName({ value: editData.AgentName, error: '' });



      // Wallet
      setMobileWalletNumber({ value: editData.MobileWalletNumber || '', error: '' });




      // setAccountNumber({ value: editData.AccountNumber || '', error: '' });
      // setAccountName({ value: editData.AccountName || '', error: '' });



      if (editData.CountryCode) {
        onCountryChangeEdit(editData.CountryCode); // ✅ use CountryCode or dataValue
      }


    } else {
      setNewUser(true);
      console.log("NewUser", NewUser)
      // Clear all fields
      setIsdCode({ value: '', error: '' });
      setMobile({ value: '', error: '' });
      setFirstName({ value: '', error: '' });
      setLastName({ value: '', error: '' });
      setEmail({ value: '', error: '' });
      setCity({ value: '', error: '' });
      setCountry({ value: '', error: '' });
      setPayoutPostcode({ value: '', error: '' });
      setPayoutSearch({ value: '', error: '' });
      setAccountNumber({ value: '', error: '' });
      setAccountName({ value: '', error: '' });
      setRelationship({ value: '', error: '' });
      setPayoutCity({ value: '', error: '' });
      setPayoutPostcode({ value: '', error: '' });
      setPayoutSearch({ value: '', error: '' });

      setIFSCCode({ value: '', error: '' });
      setSelectedBranch({ value: '', error: '' });

      setMobileWalletNumber({ value: '', error: '' });
    }
  }, [editData]);

  const onCountryChangeEdit = async (value: any) => {
    setCountry({ value: value, error: '' });

    const selectedCountry = countryList.find((country: TDropDown) => country.dataValue === value);

    fetchTransferTypeField(value);
    fetchTransferType(value);
  };

  const [bankDetails, setBankDetails] = useState({
    bank: '',
    ifsc: '',
    accountNumber: '',
    accountName: '',
  });

  const handleBankDetailsChange = (details: typeof bankDetails) => {
    setBankDetails(details);
  };

  const onCountryChange = async (value: any, isManual: boolean = false) => {
    setCountry({ value: value, error: '' });

    const selectedCountry = countryList.find((country: TDropDown) => country.dataValue === value);

    setIsdCode({ value: selectedCountry?.ISDCode || '', error: '' });

    // Optionally clear the mobile number or retain it
    if (isManual) {
      setMobile({ value: '', error: '' });
    }

    fetchTransferTypeField(value);
    fetchTransferType(value);
  };

  interface BranchDetail {
    BranchName: string;
    BankName?: string;
    BranchCode?: string;

  }


  const onbranchChange = (selected: BranchDetail | undefined) => {
    if (selected) {
      console.log("selectedBranch.value === BranchCode?", selected.BranchCode);

      setSelectedBranch({ value: selected.BranchCode ?? '', error: '' }); // ✅ Use BranchCode
      setIFSCCode({ value: selected.BranchCode ?? '', error: '' });
      setBranchCode({ value: selected.BranchCode ?? '', error: '' });

      console.log("Selected Branch:", selected);
    } else {
      setSelectedBranch({ value: '', error: 'Please select a valid branch' });
    }
  };


  const onBankChange = async (bankObject: any) => {
    console.log('Selected bank:', bankObject);
    await AsyncStorage.setItem("bankObject", JSON.stringify(bankObject));


    try {
      const response = await getBranchDetail(bankObject);
      if (response && response.data?.Bank?.length > 0) {
        const branchDetails: BranchDetail[] = response.data.Bank;
        console.log('Branch details:', branchDetails);
        setBranchList(branchDetails);
      } else {
        console.error('No branch data found');
        setBranchList([]); // Clear if no data
      }
    } catch (error) {
      console.error('Failed to fetch branch details:', error);
      setBranchList([]); // Clear on error
    }
  };
  const onAgentChange = (selected: any) => {
    console.log("Selected Agent:", selected);
    if (selected) {
      setAgentName({ value: selected.label ?? '', error: '' });
      setAgentCode({ value: selected.value ?? '', error: '' }); // Optional, if exists
    } else {
      setAgent({ value: '', error: 'Please select a valid agent' });
    }
  };






  useEffect(() => {
    fetchCountries();
    const fetchInitialData = async () => {
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : {};


    };
  }, []);


  useEffect(() => {
    if (Array.isArray(receivingModeField)) {
      const firstItem = receivingModeField[0];
      if (firstItem && firstItem.receivingModeOptions) {
        const mappedBankList = firstItem.receivingModeOptions.map((bank: {
          value: any; label: any; CountryCode: any; BankName: any; BankCode: any; SessionCode: any; City: any; State: any;
          SearchText: any; StartFrom: any; EndWith: any
        }) => ({
          dataValue: bank.value,
          displayvalue: bank.label,
          CountryCode: bank?.CountryCode,
          BankName: bank?.BankName,
          BankCode: bank?.BankCode,
          SessionCode: bank?.SessionCode,
          City: bank?.City,
          State: bank?.State,
          SearchText: bank?.SearchText,
          StartFrom: bank?.StartFrom,
          EndWith: bank?.EndWith,
        }));
        setBankList(mappedBankList);
      }
    }
  }, [receivingModeField]);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      MetaService.fetchCountryMetas(false, true, false,
        (countries: any[]) => {
          const countryMetas = countries.map((country: any) => ({
            dataValue: country.Alpha_3_Code,
            displayvalue: country.CountryName,
            ISDCode: country.ISDCode,
            name: country.CountryName,
            Alpha_2_Code: country.Alpha_2_Code,
            price: "",
            description: "",
            flag: ""
          }));
          setCountryList(countryMetas);
        },
        (error: Error) => { },
        () => {
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error fetching country list:', error);
    }
  };

  const fetchTransferType = async (toCountry: any) => {
    try {
      setLoading(true);
      SendMoneyService.getTransferTypes({ FromCountry: 'GBR', ToCountry: toCountry },
        (TransferDetails: any[]) => {
          console.log('TransferDetails', TransferDetails);
        },
        (error: Error) => { },
        () => {
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error fetching transfer type:', error);
    }
  };

  const fetchTransferTypeField = async (toCountry: any) => {
    try {
      setLoading(true);
      SendMoneyService.getTransferTypeField(toCountry, '',
        (responseFields: any, branchRequired: any) => {
          setReceivingModeField(responseFields);
          console.log('responseFields', responseFields);
          console.log('branchRequired', branchRequired);
        },
        (error: Error) => { },
        () => {
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error fetching transfer type field:', error);
    }
  };

  // Form validation for required fields
  const validateForm = () => {
    let isValid = true;

    // First Name Validation
    if (!firstName.value) {
      setFirstName({ ...firstName, error: 'First Name is required' });
      isValid = false;
    }

    // Last Name Validation
    if (!lastName.value) {
      setLastName({ ...lastName, error: 'Last Name is required' });
      isValid = false;
    }

    // Email Validation
    if (!email.value) {
      setEmail({ ...email, error: 'Email is required' });
      isValid = false;
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email.value)) {
        setEmail({ ...email, error: 'Please enter a valid email address' });
        isValid = false;
      }
    }

    // Mobile Number Validation
    if (!mobile.value) {
      setMobile({ ...mobile, error: 'Mobile number is required' });
      isValid = false;
    } else {
      const mobileRegex = /^[0-9]{10}$/; // Assuming a 10-digit mobile number
      if (!mobileRegex.test(mobile.value)) {
        setMobile({ ...mobile, error: 'Please enter a valid 10-digit mobile number' });
        isValid = false;
      }
    }

    // Relationship Validation
    if (!relationship.value) {
      setRelationship({ ...relationship, error: 'Relationship is required' });
      isValid = false;
    }

    return isValid;
  };


  const _onUpdatePressed = async () => {
    // Validate the form before submission
    if (!validateForm()) return;

    setLoading(true);

    // Prepare the postData for submission
    const postData: any = {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      mobile: mobile.value,
      city: city.value,
      country: country.value,
      relationship: relationship.value,
      bankName: bankDetails.bank,
      ifscCode: bankDetails.ifsc,
      accountNumber: bankDetails.accountNumber,
      accountName: bankDetails.accountName,
      ReceiverID: ReceiverID.value || '',
    };
    const savedData: any = {

      IFSC_IBAN: IFSCCode.value || '',
      DialCode: isdCode.value || '',
      FirstName: firstName.value,
      LastName: lastName.value || '',
      MiddleName: '',
      Email: email.value,
      MobileNumber: mobile.value,
      City: city.value || '',
      Country: country.value || '',
      CountryCode: country.value || '',
      Relationship: relationship.value || '',
      AccountNumber: accountNumber.value || '',
      AccountName: accountName.value || '',
      BranchName: selectedBranch.value || '',
      remitterId: currentToken.remitterId || '',
      tokenId: currentToken.tokenId || '',
      payoutPostcode: payoutPostcode.value || '',
      State: payoutSearch.value || '',
      MobileWalletNumber: mobileWalletNumber.value || '',
      ReceiverID: ReceiverID.value || '',
    };

    console.log("postData", postData)
    try {
      const isUpdate = !!editData?.ReceiverID;
      const response = isUpdate
        ? await EditBeneficiary(savedData)
        : await RemitterPostRegistration(postData); // Registration flow

      if (response && response.status === 200 && response.data) {
        const { StatusCode, StatusMsg } = response.data;

        if (StatusCode === "ER0000" || StatusCode === "ER0082") {
          // Toast.show({
          //   type: 'success',
          //   text1: StatusCode === "ER0082" ? 'Updated successfully.' : 'Post registration',
          //   text2: StatusMsg || 'Operation completed successfully.',
          // });
          // navigation.navigate('Root');
          navigation.navigate("FinalStage" as never);

          // You can reset fields or navigate here if needed
        }
        else if (StatusCode === "ER0062") {
          Toast.show({
            type: 'error',
            text1: 'Duplicate beneficiary',
            text2: StatusMsg || 'This beneficiary already exists.',
          });
          // Don't navigate, just stop here

          return;
        }
        else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: StatusMsg || 'Operation failed.',
          });
        }
      } else {
        throw new Error('Invalid response or missing data.');
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message || 'Something went wrong.',
      });
    }


    finally {
      setLoading(false);
    }
  };

  const handleSearchLocation = async () => {
    const city = PayoutCity.value.trim();
    const zipCode = payoutPostcode.value.trim();
    const state = payoutSearch.value.trim();

    let hasError = false;

    if (!city) {
      setPayoutCity((prev) => ({ ...prev, error: "Enter city" }));
      hasError = true;
    }

    if (!zipCode) {
      setPayoutPostcode((prev) => ({ ...prev, error: "Enter postal code" }));
      hasError = true;
    }

    if (!state) {
      setPayoutSearch((prev) => ({ ...prev, error: "Enter state" }));
      hasError = true;
    }

    if (hasError) return;
    try {
      setLoading(true);

      const locationData = {
        City: city.toUpperCase(),
        State: state,
        ZipCode: zipCode,
        remitterId: currentToken.remitterId,
        CountryCode: country.value,
      };

      const response = await GetAgentDetails(locationData);

      if (response && response.status === 200 && response.data) {
        const { StatusCode, StatusMsg, Agent } = response.data;
        console.log("response.data", response.data);

        if (StatusCode === "ER0000") {
          const agents = Agent || [];
          // console.log("agents", agents);

          // setFullAgentList(agents);

          // For dropdown: label = AgentName, value = AgentCode
          const formattedAgentList = agents.map((agent: { AgentName: any; AgentCode: any; }) => ({
            label: agent.AgentName,
            value: agent.AgentName || '',
            // value: agent.AgentCode || '',
          }));
          setAgentList(formattedAgentList); // 👈 Update this in your component state
          setSearchCompleted(true); // To conditionally render dropdown and save button
        } else {
          Toast.show({
            type: 'error',
            text1: 'Search failed',
            text2: StatusMsg || 'Unexpected error occurred',
          });
        }
      } else {
        throw new Error('Invalid response or missing data.');
      }
    } catch (error) {
      console.error("Error while fetching agent details:", error);
      Toast.show({
        type: 'error',
        text1: 'Network error',
        text2: 'Could not fetch agent details.',
      });
    }


    finally {
      setLoading(false);
    }

    // Call API here if needed using locationData
    setSearchCompleted(true); // Control visibility of dropdown/save button
  };
  function onRefresh(): void {
    throw new Error("Function not implemented.");
  }

  const onChange = (selected: string) => {
    if (selected === 'Bank deposit') {
      setReceivingModeTab(0)
    }
    if (selected === 'Cash pickup') {
      setReceivingModeTab(1)
    }
    if (selected === 'Mobile wallet') {
      setReceivingModeTab(2)
    }
  }
  const validateBankDeposit = () => {
    let error = false;

    if (!bank.value) {
      setBank((prev) => ({ ...prev, error: "Please select a bank" }));
      error = true;
    }
    if (!IFSCCode.value) {
      setIFSCCode((prev) => ({ ...prev, error: "Enter IFSC code" }));
      error = true;
    }
    if (!accountNumber.value) {
      setAccountNumber((prev) => ({ ...prev, error: "Enter account number" }));
      error = true;
    }
    if (!accountName.value) {
      setAccountName((prev) => ({ ...prev, error: "Enter account name" }));
      error = true;
    }

    return !error;
  };

  const validateCashPickup = () => {
    let error = false;

    if (!PayoutCity.value) {
      setPayoutCity((prev) => ({ ...prev, error: "Enter payout city" }));
      error = true;
    }
    if (!payoutPostcode.value) {
      setPayoutPostcode((prev) => ({ ...prev, error: "Enter payout postal code" }));
      error = true;
    }
    if (!payoutSearch.value) {
      setPayoutSearch((prev) => ({ ...prev, error: "Enter payout location" }));
      error = true;
    }

    return !error;
  };

  const validateMobileWallet = () => {
    let error = false;

    if (!mobileWalletNumber.value) {
      setMobileWalletNumber((prev) => ({ ...prev, error: "Enter wallet number" }));
      error = true;
    }

    return !error;
  };

  const handleBankDepositSave = async () => {
    if (!validateBankDeposit()) return;
    await AsyncStorage.setItem('Account Name', accountName.value);
    await AsyncStorage.setItem('Account Number', accountNumber.value);
    await AsyncStorage.setItem('IFSC Code', IFSCCode.value);
    await AsyncStorage.setItem('Mobile', mobile.value);
    // await AsyncStorage.setItem('Cash Pickup', agent.value);
    await commonSaveHandler("Bank deposit");
    navigation.navigate("FinalStage");
  };

  const handleCashPickupSave = async () => {
    if (!validateCashPickup()) return;
    await commonSaveHandler("Cash pickup");
    navigation.navigate("FinalStage");
  };

  const handleMobileWalletSave = async () => {
    if (!validateMobileWallet()) return;
    await commonSaveHandler("Mobile wallet");
    navigation.navigate("FinalStage");
  };

  const commonSaveHandler = async (mode: string) => {
    setLoading(true);


    const bankData = await AsyncStorage.getItem("bankObject");
    const bankObject = bankData ? JSON.parse(bankData) : null;


    let savedData: any = {
      mode: mode,
      IFSC_IBAN: IFSCCode.value || '',
      DialCode: isdCode.value || '',
      FirstName: firstName.value,
      LastName: lastName.value || '',
      MiddleName: '',
      Email: email.value,
      MobileNumber: mobile.value,
      City: city.value || '',
      Country: country.value || '',
      CountryCode: country.value || '',
      Relationship: relationship.value || '',
      AccountNumber: accountNumber.value || '',
      AccountName: accountName.value || '',
      BranchName: selectedBranch.value || '',
      remitterId: currentToken.remitterId || '',
      tokenId: currentToken.tokenId || '',
      payoutPostcode: payoutPostcode.value || '',
      State: payoutSearch.value || '',
      MobileWalletNumber: mobileWalletNumber.value || '',
      ReceiverID: ReceiverID.value || '',
      BankName: bankObject?.BankName || "",
      BankCode: bankObject?.BankCode || "",
    };

    if (mode === "Cash pickup" || mode === "Mobile wallet") {
      savedData.AgentName = agentName.value || '';
      savedData.AgentCode = agentCode.value || '';
    }

    // ✅ Check for update (editData should be in scope)
    const isUpdate = !!editData?.ReceiverID;
    if (isUpdate) {
      savedData.ReceiverID = editData.ReceiverID;
    }

    try {
      const response = isUpdate
        ? await EditBeneficiary(savedData)
        : await AddReceiverInfo(savedData);

      console.log("savedData", savedData);

      if (
        response?.status === 200 &&
        (response.data?.StatusCode === "ER0000" || response.data?.StatusCode === "ER0082")
      ) {
        // Toast.show({
        //   type: 'success',
        //   text1: response.data.StatusCode === "ER0082" ? 'Updated successfully.' : 'Registration completed successfully.',
        //   text2: response.data.StatusMsg,
        // });


        setFirstName({ value: '', error: '' });
        setLastName({ value: '', error: '' });
        setEmail({ value: '', error: '' });
        setMobile({ value: '', error: '' });
        setIsdCode({ value: '', error: '' });
        setCity({ value: '', error: '' });
        setCountry({ value: '', error: '' });
        setPayoutPostcode({ value: '', error: '' });
        setPayoutSearch({ value: '', error: '' });
        setAccountNumber({ value: '', error: '' });
        setAccountName({ value: '', error: '' });
        setRelationship({ value: '', error: '' });
        setSelectedBranch({ value: '', error: '' });
        setAgentName({ value: '', error: '' });
        setAgentCode({ value: '', error: '' });
        setMobileWalletNumber({ value: '', error: '' });
        setReceiverID({ value: '', error: '' });

        _onUpdatePressed();

        console.log("RES", response.data.BeneficiaryID)
        await AsyncStorage.setItem("BeneficiaryID", String(response.data.BeneficiaryID));

      }



      else {
        throw new Error(response?.data?.StatusMsg || 'Unknown error');
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message || 'An error occurred during registration.',
      });
    } finally {
      setLoading(false);
    }
  };

  function handleCancel(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={localStyles.safeArea}>
        <StatusBar barStyle="light-content" />

        {/* Elite Header */}
        <LinearGradient
          colors={['#0369a1', '#0ea5e9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={localStyles.headerWrapper}
        >
          <View style={localStyles.headerTop}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={localStyles.backButtonCircle}
            >
              <Icon name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={localStyles.headerTextContent}>
              <Text style={localStyles.headerTitle}>
                {isEditing ? "Edit Recipient" : "Add New Recipient"}
              </Text>
              <Text style={localStyles.headerSubtitle}>Complete the details to continue</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={localStyles.mainContent}>
          <ScrollView
            style={localStyles.scrollView}
            contentContainerStyle={localStyles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Form Card */}
            <View style={localStyles.formCard}>
              {/* First Name & Last Name Group */}
              <View style={localStyles.inputGroup}>
                <View style={localStyles.inputField}>
                  <Text style={localStyles.fieldLabel}>First Name <Text style={localStyles.required}>*</Text></Text>
                  <View style={localStyles.inputWrapper}>
                    <Icon name="person-outline" size={18} color="#94a3b8" style={localStyles.fieldIcon} />
                    <TextInput
                      style={localStyles.textInput}
                      placeholder="e.g. John"
                      placeholderTextColor="#94a3b8"
                      value={firstName.value}
                      onChangeText={(text: any) => {
                        const onlyText = text.replace(/[^A-Za-z]/g, '');
                        setFirstName({ value: onlyText, error: '' })
                      }}
                    />
                  </View>
                  {firstName.error ? <Text style={localStyles.errorText}>{firstName.error}</Text> : null}
                </View>

                <View style={localStyles.inputField}>
                  <Text style={localStyles.fieldLabel}>Last Name <Text style={localStyles.required}>*</Text></Text>
                  <View style={localStyles.inputWrapper}>
                    <Icon name="person-outline" size={18} color="#94a3b8" style={localStyles.fieldIcon} />
                    <TextInput
                      style={localStyles.textInput}
                      placeholder="e.g. Doe"
                      placeholderTextColor="#94a3b8"
                      value={lastName.value}
                      onChangeText={(text: any) => {
                        const onlyText = text.replace(/[^A-Za-z]/g, '');
                        setLastName({ value: onlyText, error: '' })
                      }}
                    />
                  </View>
                  {lastName.error ? <Text style={localStyles.errorText}>{lastName.error}</Text> : null}
                </View>
              </View>

              {/* Email Field */}
              <View style={localStyles.inputField}>
                <Text style={localStyles.fieldLabel}>Email ID <Text style={localStyles.required}>*</Text></Text>
                <View style={localStyles.inputWrapper}>
                  <Icon name="mail-outline" size={18} color="#94a3b8" style={localStyles.fieldIcon} />
                  <TextInput
                    style={localStyles.textInput}
                    placeholder="john.doe@example.com"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email.value}
                    onChangeText={(text: any) => setEmail({ value: text, error: '' })}
                  />
                </View>
                {email.error ? <Text style={localStyles.errorText}>{email.error}</Text> : null}
              </View>

              {/* Country Picker Section */}
              <View style={localStyles.pickerSection}>
                <Text style={localStyles.fieldLabel}>Recipient Country <Text style={localStyles.required}>*</Text></Text>
                <View style={localStyles.pickerWrapper}>
                  <ModalPicker
                    modalTitle="Select Country"
                    placeholder="Select Country"
                    required={true}
                    dataList={countryList}
                    style={{ width: '100%', borderWidth: 0, backgroundColor: 'transparent' }}
                    selectedValue={country.value}
                    enabled={!country.disabled}
                    onValueChange={(itemValue) => onCountryChange(itemValue, true)}
                  />
                </View>
              </View>

              {/* Mobile Field */}
              <View style={localStyles.inputField}>
                <Text style={localStyles.fieldLabel}>Mobile Number <Text style={localStyles.required}>*</Text></Text>
                <View style={localStyles.phoneInputGroup}>
                  <View style={localStyles.isdWrapper}>
                    <TextInput
                      style={localStyles.isdInput}
                      value={isdCode.value}
                      editable={false}
                    />
                  </View>
                  <View style={[localStyles.inputWrapper, { flex: 1 }]}>
                    <Icon name="phone-portrait-outline" size={18} color="#94a3b8" style={localStyles.fieldIcon} />
                    <TextInput
                      style={localStyles.textInput}
                      placeholder="000 000 0000"
                      placeholderTextColor="#94a3b8"
                      keyboardType="number-pad"
                      value={mobile.value}
                      onChangeText={(text: any) => setMobile({ value: text.replace(/[^0-9]/g, ''), error: '' })}
                    />
                  </View>
                </View>
                {mobile.error ? <Text style={localStyles.errorText}>{mobile.error}</Text> : null}
              </View>

              {/* City & Relationship */}
              <View style={localStyles.inputGroup}>
                <View style={localStyles.inputField}>
                  <Text style={localStyles.fieldLabel}>City</Text>
                  <View style={localStyles.inputWrapper}>
                    <Icon name="business-outline" size={18} color="#94a3b8" style={localStyles.fieldIcon} />
                    <TextInput
                      style={localStyles.textInput}
                      placeholder="City"
                      placeholderTextColor="#94a3b8"
                      value={city.value}
                      onChangeText={(text: any) => setCity({ value: text.replace(/[^A-Za-z]/g, ''), error: '' })}
                    />
                  </View>
                </View>

                <View style={localStyles.inputField}>
                  <Text style={localStyles.fieldLabel}>Relationship</Text>
                  <View style={localStyles.inputWrapper}>
                    <Icon name="people-outline" size={18} color="#94a3b8" style={localStyles.fieldIcon} />
                    <TextInput
                      style={localStyles.textInput}
                      placeholder="e.g. Family"
                      placeholderTextColor="#94a3b8"
                      value={relationship.value}
                      onChangeText={(text: any) => setRelationship({ value: text.replace(/[^A-Za-z]/g, ''), error: '' })}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={localStyles.actionRow}>
              <TouchableOpacity
                style={localStyles.cancelButton}
                onPress={() => navigation.navigate('Recipient')}
              >
                <Text style={localStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={localStyles.nextButton}
                onPress={handleExpandPress}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#0ea5e9', '#38bdf8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={localStyles.gradientButton}
                >
                  <Text style={localStyles.nextButtonText}>Next</Text>
                  <Icon name="arrow-forward" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {loading && (
          <View style={localStyles.overlay}>
            <Spinner visible={true} size="large" color="#0EA5E9" animation="fade" />
          </View>
        )}
      </SafeAreaView>


      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={{
          backgroundColor: theme.colors.secondary,
          ...SHADOWS.shadow,
        }}
      >
        <View style={stylesLocal.modalHeader}>
          <Text style={stylesLocal.modalTitleHeader}>
            {isEditing ? "Edit Receiving mode" : "Add Receiving mode"}
          </Text>
          <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <SafeAreaView style={[styles.container]}>
          <Container>
            <ScrollView
              style={{ width: "100%", padding: 10 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              <Animated.View>
                {/* Bank Deposit Content */}
                {channelTransferType === "BANKS" && selectedMode === "Bank deposit" && (
                  <>
                    <View style={styles.inputContainer}>
                      <ModalPicker
                        label="Select Bank"
                        modalTitle="Select Bank"
                        dataList={bankList}
                        style={{ width: '100%' }}
                        selectedValue={bank.value}
                        onValueChange={(itemValue) => {
                          const selectedBank = bankList.find(bank => bank.dataValue === itemValue);
                          setBank({ value: selectedBank?.dataValue ?? '', error: '' });
                          onBankChange(selectedBank);
                        }}
                      />
                      {bank.error && <Text style={styles.error}>{bank.error}</Text>}
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>IFSC Code</Text>
                      <View style={styles.inputControls}>
                        <TextInput
                          style={[styles.input, { flex: 1 }]}
                          placeholder="Enter IFSC code"
                          value={IFSCCode.value}
                          onChangeText={(text) => setIFSCCode({ value: text, error: '' })}
                        />
                      </View>
                      {IFSCCode.error && <Text style={styles.error}>{IFSCCode.error}</Text>}
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Account Number</Text>
                      <View style={styles.inputControls}>
                        <TextInput
                          style={[styles.input, { flex: 1 }]}
                          placeholder="Enter Account Number"
                          value={accountNumber.value}
                          onChangeText={(text) => setAccountNumber({ value: text.replace(/[^0-9]/g, ''), error: '' })}
                        />
                      </View>
                      {accountNumber.error && <Text style={styles.error}>{accountNumber.error}</Text>}
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Account Name</Text>
                      <View style={styles.inputControls}>
                        <TextInput
                          style={[styles.input, { flex: 1 }]}
                          placeholder="Enter Account Name"
                          value={accountName.value}
                          onChangeText={(text) => setAccountName({ value: text.replace(/[^A-Za-z]/g, ''), error: '' })}
                        />
                      </View>
                      {accountName.error && <Text style={styles.error}>{accountName.error}</Text>}
                    </View>
                    {branchList.length > 0 && (
                      <View style={styles.inputContainer}>
                        <ModalPicker
                          label="Select Branch Name or Code"
                          modalTitle="Select Branch"
                          dataList={branchList.map(branch => ({
                            dataValue: String(branch.BranchCode ?? ''),
                            displayvalue: `${branch.BranchName} (${branch.BranchCode ?? ''})`
                          }))}
                          selectedValue={String(selectedBranch.value)}
                          style={{ width: '100%' }}
                          onValueChange={(itemValue) => {
                            const selected = branchList.find(branch => String(branch.BranchCode) === itemValue);
                            if (selected) {
                              onbranchChange(selected);
                            }
                          }}
                        />
                        {selectedBranch.error && <Text style={styles.error}>{selectedBranch.error}</Text>}
                      </View>
                    )}
                  </>
                )}
                {/* Cash Pickup Content */}
                {channelTransferType === "CGMONEY" && selectedMode === "Cash pickup" && (
                  <>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Payout City</Text>
                      <View style={styles.inputControls}>
                        <TextInput
                          style={[styles.input, { flex: 1 }]}
                          placeholder="Enter City"
                          value={PayoutCity.value}
                          onChangeText={(text) => setPayoutCity({ value: text.replace(/[^A-Za-z]/g, ''), error: '' })}
                        />
                      </View>
                      {PayoutCity.error && <Text style={styles.error}>{PayoutCity.error}</Text>}
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Payout Post Code</Text>
                      <View style={styles.inputControls}>
                        <TextInput
                          style={[styles.input, { flex: 1 }]}
                          placeholder="Enter postal code"
                          value={payoutPostcode.value}
                          onChangeText={(text) => setPayoutPostcode({ value: text.replace(/[^0-9]/g, ''), error: '' })}
                        />
                      </View>
                      {payoutPostcode.error && <Text style={styles.error}>{payoutPostcode.error}</Text>}
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Payout Search Location (State)</Text>
                      <View style={[styles.inputControls, { flexDirection: 'row', alignItems: 'center' }]}>
                        <TextInput
                          style={[styles.input, { flex: 1 }]}
                          placeholder="Enter State"
                          value={payoutSearch.value}
                          onChangeText={(text) => setPayoutSearch({ value: text, error: '' })}
                        />
                        <TouchableOpacity
                          style={stylesLocal.searchButton}
                          onPress={handleSearchLocation}
                        >
                          <Text style={stylesLocal.searchButtonText}>Search</Text>
                        </TouchableOpacity>
                      </View>
                      {payoutSearch.error && <Text style={styles.error}>{payoutSearch.error}</Text>}
                    </View>
                    {searchCompleted && (
                      <View style={styles.inputContainer}>
                        <ModalPicker
                          label="Collection Point"
                          modalTitle="Select Collection Point"
                          dataList={agentList.map(agent => ({
                            dataValue: agent.value,
                            displayvalue: agent.label
                          }))}
                          style={{ width: '100%' }}
                          selectedValue={agent.value}
                          onValueChange={async (itemValue) => {
                            const selectedAgent = agentList.find(agent => agent.value === itemValue);
                            if (selectedAgent) {
                              setAgent({ value: selectedAgent.value, error: '' });
                              onAgentChange(selectedAgent);
                              await AsyncStorage.setItem('Cash Pickup', selectedAgent.value);
                            }
                          }}
                        />
                      </View>
                    )}
                  </>
                )}
                {/* Mobile Wallet Content */}
                {channelTransferType === "wallet" && selectedMode === "Mobile wallet" && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Wallet Number</Text>
                    <View style={styles.inputControls}>
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Enter Wallet Number"
                        value={mobileWalletNumber.value}
                        onChangeText={(text) => setMobileWalletNumber({ value: text.replace(/[^0-9]/g, ''), error: '' })}
                      />
                    </View>
                    {mobileWalletNumber.error && <Text style={styles.error}>{mobileWalletNumber.error}</Text>}
                  </View>
                )}
                {/* Action Buttons */}
                <View style={[styles.rightSide, { width: '100%', marginTop: 20 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Button outerLine={true}
                      style={{ margin: 5, width: width * 0.42, backgroundColor: '#ccc' }}
                      onPress={() => navigation.navigate('Recipient')}
                    >
                      Cancel
                    </Button>
                    {selectedMode === "Bank deposit" && (
                      <Button style={{ margin: 5, width: width * 0.42 }} onPress={handleBankDepositSave}>
                        Save & Continue
                      </Button>
                    )}
                    {selectedMode === "Cash pickup" && (
                      <Button style={{ margin: 5, width: width * 0.42 }} onPress={handleCashPickupSave}>
                        Save & Continue
                      </Button>
                    )}
                    {selectedMode === "Mobile wallet" && (
                      <Button style={{ margin: 5, width: width * 0.42 }} onPress={handleMobileWalletSave}>
                        Save & Continue
                      </Button>
                    )}
                  </View>
                </View>
              </Animated.View>
            </ScrollView>
            {loading && <Spinner visible={true} size="large" animation="slide" />}
          </Container>
        </SafeAreaView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

export default AddRecipient;
