import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, useWindowDimensions, View, StatusBar, StyleSheet } from "react-native";
import Container from "../../../theme/Container";
import styles from "../../../styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { authenticate, GetCountryList, GetNationality, GetRemitterProfile, RemitterPostRegistration, AddReceiverInfo, EditBeneficiary, GetAgentDetails } from "app/http-services";
import { useRecoilState, useRecoilValue } from "recoil";
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from "types";
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
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { theme } from "app/core/theme";
import { SHADOWS, FONTS } from "app/constants/Assets";
import { SendMoneyService } from "app/services/sendMoney.service";
import { ReceivingModeField } from "app/models/receivingModeField.model";
import BankDeposit from "./receivingMode/items/BankDeposit";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { RFValue } from "react-native-responsive-fontsize";
import COLORS from "app/constants/Colors";
import Vector from "app/assets/vectors";
import GroupButton from "app/components/controls/GroupButton";
import { getBranchDetail } from "app/http-services";


const AddRecipients = () => {
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
  const [selectedMode, setSelectedMode] = useState("Bank deposit");
  const [sheetIndex, setSheetIndex] = useState(-1);
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



  const bottomSheetRef = useRef<BottomSheet>(null);
  const currentToken = useRecoilValue(ProfileState);
  const snapPoints = useMemo(() => ['75%'], []);
  const [NewUser, setNewUser] = useState(false);

  const handleExpandPress = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);


  type AddRecipientsRouteProp = RouteProp<RootStackParamList, 'AddRecipients'>;

  // const AddRecipients = () => {
  // const route = useRoute<AddRecipientsRouteProp>();
  // const editData = route.params?.editData;
  const route = useRoute();
  const editData = (route.params && 'editData' in route.params)
    ? (route.params as { editData: any }).editData
    : null;
  // let NewUser: boolean = false;

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

      setPayoutCity({ value: editData.City || '', error: '' });
      setPayoutPostcode({ value: editData.PostCode || '', error: '' });
      setPayoutSearch({ value: editData.State || '', error: '' });
      setAgentCode({ value: editData.AgentCode ?? '', error: '' });
      // setAgentName({ value: editData.AgentName ?? '', error: '' });
      setAgent({ value: editData.AgentName, error: '' });
      setAgentName({ value: editData.AgentName, error: '' });



      // Wallet
      setMobileWalletNumber({ value: editData.MobileWalletNumber || '', error: '' });



      setPayoutPostcode({ value: editData.PostCode || '', error: '' });
      setPayoutSearch({ value: editData.State || '', error: '' });
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

  const onCountryChange = async (value: any) => {
    setCountry({ value: value, error: '' });

    const selectedCountry = countryList.find((country: TDropDown) => country.dataValue === value);

    setIsdCode({ value: selectedCountry?.ISDCode || '', error: '' });

    // Optionally clear the mobile number or retain it
    setMobile({ value: '', error: '' });

    fetchTransferTypeField(value);
    fetchTransferType(value);
  };

  interface BranchDetail {
    BranchName: string;
    BankName?: string; // Added BankName property as optional, update as per your API response
    BranchCode?: string; // Added code property as optional, update as per your API response
    // Add more fields as per your API response
  }

  // const onbranchChange = (selected: BranchDetail | undefined) => {  
  //   if (selected) {
  //     console.log("selectedBranch.value === BranchCode?", selectedBranch.value);

  //     // setBank({ value: selected.BankName ?? '', error: '' }); // Or bankObject.value
  //     setIFSCCode({ value: selected.BranchCode ?? '', error: '' }); // Reset IFSC code
  //     setSelectedBranch({ value: selected.BranchName ?? '', error: '' }); // Reset selected branch
  //     setBranchCode({ value: selected.BranchCode ?? '', error: '' }); // Reset branch code
  //     // setBankCode({ value: selected.BranchCode ?? '', error: '' });
  //     console.log("Selected Branch:", selected);
  //   } else {
  //     setSelectedBranch({ value: '', error: 'Please select a valid branch' });
  //   }
  // }
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
            flag: country.Alpha_2_Code ? `https://flagcdn.com/w320/${country.Alpha_2_Code.toLowerCase()}.png` : null,
          }));
          setCountryList(countryMetas as any);
          setLoading(false);
        },
        (error: Error) => {
          console.error('Error fetching country list callback:', error);
          setLoading(false);
        },
        () => {
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error in fetchCountries try/catch:', error);
      setLoading(false);
    }
  };

  const fetchTransferType = async (toCountry: any) => {
    try {
      setLoading(true);
      SendMoneyService.getTransferTypes({ FromCountry: 'GBR', ToCountry: toCountry },
        (TransferDetails: any[]) => {
          console.log('TransferDetails', TransferDetails);
          setLoading(false);
        },
        (error: Error) => {
          console.error('Error fetching transfer type callback:', error);
          setLoading(false);
        },
        () => {
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error fetching transfer type:', error);
      setLoading(false);
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
          setLoading(false);
        },
        (error: Error) => {
          console.error('Error fetching transfer type field callback:', error);
          setLoading(false);
        },
        () => {
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error fetching transfer type field:', error);
      setLoading(false);
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
      bankName: bank.value,
      ifscCode: IFSCCode.value,
      accountNumber: accountNumber.value,
      accountName: accountName.value,
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
          Toast.show({
            type: 'success',
            text1: StatusCode === "ER0082" ? 'Updated successfully.' : 'Post registration',
            text2: StatusMsg || 'Operation completed successfully.',
          });
          navigation.navigate('Root');

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

          const formattedAgentList = agents.map((agent: { AgentName: any; AgentCode: any; }) => ({
            label: agent.AgentName,
            value: agent.AgentName || '',

          }));
          setAgentList(formattedAgentList);
          setSearchCompleted(true);
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
    } finally {
      setLoading(false);
    }
  };
  function onRefresh(): void {
    setRefreshing(true);
    fetchCountries().finally(() => setRefreshing(false));
  }

  const renderEliteInput = (
    label: string,
    value: string,
    onChange: (text: string) => void,
    error: string,
    icon: string,
    placeholder: string,
    required: boolean = false,
    keyboardType: any = "default",
    editable: boolean = true,
    rightElement?: React.ReactNode
  ) => (
    <View style={localStyles.inputGroup}>
      <Text style={localStyles.label}>
        {label} {required && <Text style={{ color: COLORS.red || 'red' }}>*</Text>}
      </Text>
      <View style={[localStyles.inputWrapper, !!error && { borderColor: COLORS.red || 'red' }]}>
        <Feather name={icon as any} size={16} color="#94a3b8" style={localStyles.inputIcon} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#cbd5e1"
          keyboardType={keyboardType}
          editable={editable}
          style={localStyles.textInput}
        />
        {rightElement}
      </View>
      {error ? <Text style={localStyles.errorText}>{error}</Text> : null}
    </View>
  );

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
    await commonSaveHandler("Bank deposit");
  };

  const handleCashPickupSave = async () => {
    if (!validateCashPickup()) return;
    await commonSaveHandler("Cash pickup");
  };

  const handleMobileWalletSave = async () => {
    if (!validateMobileWallet()) return;
    await commonSaveHandler("Mobile wallet");
  };

  const commonSaveHandler = async (mode: string) => {
    setLoading(true);

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
      BankName: bank.value || '',
      BankCode: bank.value || '',
    };

    if (mode === "Cash pickup" || mode === "Mobile wallet") {
      savedData.AgentName = agentName.value || '';
      savedData.AgentCode = agentCode.value || '';
    }


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
        Toast.show({
          type: 'success',
          text1: response.data.StatusCode === "ER0082" ? 'Updated successfully.' : 'Registration completed successfully.',
          text2: response.data.StatusMsg,
        });

        // ✅ Clear form after save
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

        navigation.navigate('Root');
      } else {
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={localStyles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <Spinner visible={loading} textStyle={{ color: '#FFF' }} />

        {/* ELITE HERO HEADER */}
        <LinearGradient
          colors={['#0369a1', '#0ea5e9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={localStyles.headerWrapper}
        >
          <SafeAreaView edges={['top']}>
            <View style={localStyles.headerContent}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={localStyles.backCircle}>
                <Vector as="ionicons" name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
              <View style={localStyles.titleBox}>
                <Text style={localStyles.headerTitle}>{NewUser ? "New Beneficiary" : "Edit Beneficiary"}</Text>
                <Text style={localStyles.headerSub}>Provide information for safe transactions</Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={localStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Section: Identity */}
          <View style={localStyles.formSection}>
            <View style={localStyles.sectionTitleRow}>
              <View style={localStyles.accentBar} />
              <Text style={localStyles.sectionTitle}>Personal Details</Text>
            </View>

            <View style={localStyles.row}>
              <View style={{ flex: 1 }}>
                {renderEliteInput("First Name", firstName.value, (v) => setFirstName({ value: v.replace(/[^A-Za-z]/g, ''), error: "" }), firstName.error, "user", "e.g. John", true)}
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                {renderEliteInput("Last Name", lastName.value, (v) => setLastName({ value: v.replace(/[^A-Za-z]/g, ''), error: "" }), lastName.error, "user", "e.g. Doe", true)}
              </View>
            </View>

            {renderEliteInput("Email Address", email.value, (v) => setEmail({ value: v, error: "" }), email.error, "mail", "john@example.com", true, "email-address")}

            <View style={localStyles.inputGroup}>
              <Text style={localStyles.label}>Country</Text>
              <ModalPicker
                dataList={countryList}
                onValueChange={(val) => onCountryChange(val)}
                selectedValue={country.value}
                placeholder="Select Country"
              />
            </View>

            <View style={localStyles.row}>
              <View style={{ width: 85 }}>
                {renderEliteInput("Ext", isdCode.value, () => { }, "", "phone", "+", false, "default", false)}
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                {renderEliteInput("Mobile Number", mobile.value, (v) => setMobile({ value: v.replace(/[^0-9]/g, ''), error: "" }), mobile.error, "smartphone", "771234567", true, "phone-pad")}
              </View>
            </View>
          </View>

          {/* Section: Additional */}
          <View style={[localStyles.formSection, { marginTop: 25 }]}>
            <View style={localStyles.sectionTitleRow}>
              <View style={localStyles.accentBar} />
              <Text style={localStyles.sectionTitle}>Location & Relationship</Text>
            </View>

            <View style={localStyles.row}>
              <View style={{ flex: 1 }}>
                {renderEliteInput("City", city.value, (v) => setCity({ value: v.replace(/[^A-Za-z]/g, ''), error: "" }), city.error, "map", "City Name")}
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                {renderEliteInput("Relationship", relationship.value, (v) => setRelationship({ value: v.replace(/[^A-Za-z]/g, ''), error: "" }), relationship.error, "users", "e.g. Friend")}
              </View>
            </View>
          </View>

          {/* Section: Receiving Mode Trigger */}
          {country.value ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleExpandPress}
              style={localStyles.addModeBtn}
            >
              <LinearGradient
                colors={['#F0F9FF', '#E0F2FE']}
                style={localStyles.addModeGradient}
              >
                <View style={localStyles.addModeIconBox}>
                  <Feather name="plus-circle" size={24} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={localStyles.addModeTitle}>Receiving Mode</Text>
                  <Text style={localStyles.addModeSub}>Tap to configure how they receive money</Text>
                </View>
                <Feather name="chevron-right" size={20} color={COLORS.primary} />
              </LinearGradient>
            </TouchableOpacity>
          ) : null}

          {/* Footer Actions */}
          <View style={localStyles.footerActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.goBack()}
              style={localStyles.cancelBtn}
            >
              <Text style={localStyles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={_onUpdatePressed}
              style={localStyles.saveBtn}
            >
              <LinearGradient colors={[COLORS.primary, '#0369a1']} style={localStyles.saveGradient}>
                <Text style={localStyles.saveText}>{NewUser ? "SAVE BENEFICIARY" : "UPDATE DETAILS"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* BOTTOM SHEET FOR MODES */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={['85%']}
          enablePanDownToClose
          onChange={(index) => setSheetIndex(index)}
          backdropComponent={(props) => (
            <BottomSheetBackdrop
              {...props}
              disappearsOnIndex={-1}
              appearsOnIndex={0}
              opacity={sheetIndex > -1 ? 0.5 : 0}
            />
          )}
          backgroundStyle={{ backgroundColor: '#fff', borderRadius: 32 }}
          handleIndicatorStyle={{ backgroundColor: '#CBD5E1', width: 40 }}
        >
          <View style={localStyles.sheetContent}>
            {/* Elite Header for Sheet */}
            <LinearGradient
              colors={[COLORS.primary, '#0369a1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={localStyles.sheetHeaderGradient}
            >
              <View>
                <Text style={localStyles.sheetHeaderTitle}>Receiving Method</Text>
                <Text style={localStyles.sheetHeaderSub}>Choose how the recipient gets funds</Text>
              </View>
              <TouchableOpacity
                onPress={() => bottomSheetRef.current?.close()}
                style={localStyles.sheetCloseBtn}
              >
                <Feather name="x" size={20} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>

            {/* Custom Tab Switcher */}
            <View style={localStyles.tabWrapper}>
              <View style={localStyles.tabContainer}>
                {['Bank deposit', 'Cash pickup', 'Mobile wallet'].map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => setSelectedMode(mode)}
                    style={[
                      localStyles.tabItem,
                      selectedMode === mode && localStyles.activeTab
                    ]}
                  >
                    <Text style={[
                      localStyles.tabText,
                      selectedMode === mode && localStyles.activeTabText
                    ]}>
                      {mode.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={localStyles.modeCardWrapper}
            >
              {selectedMode === "Bank deposit" && (
                <View style={localStyles.modeCard}>
                  <View style={localStyles.inputOverlay}>
                    <Text style={localStyles.inputOverlayText}>Bank Information</Text>
                  </View>

                  <View style={{ marginTop: 10 }}>
                    <ModalPicker
                      label="Select Bank"
                      dataList={bankList}
                      placeholder="Search Bank"
                      selectedValue={bank.value}
                      onValueChange={(v) => {
                        const selected = bankList.find(b => b.dataValue === v);
                        setBank({ value: selected?.dataValue ?? '', error: '' });
                        onBankChange(selected);
                      }}
                    />
                    {bank.error ? <Text style={localStyles.errorText}>{bank.error}</Text> : null}

                    {renderEliteInput("IFSC Code", IFSCCode.value, (v) => setIFSCCode({ value: v, error: "" }), IFSCCode.error, "hash", "Enter IFSC", false)}
                    {renderEliteInput("Account Number", accountNumber.value, (v) => setAccountNumber({ value: v.replace(/[^0-9]/g, ''), error: "" }), accountNumber.error, "credit-card", "e.g. 1024354676", false)}
                    {renderEliteInput("Account Name", accountName.value, (v) => setAccountName({ value: v.replace(/[^A-Za-z]/g, ''), error: "" }), accountName.error, "user", "Account holder name", false)}

                    {branchList.length > 0 && (
                      <ModalPicker
                        label="Select Branch"
                        dataList={branchList.map(b => ({
                          dataValue: String(b.BranchCode ?? ''),
                          displayvalue: `${b.BranchName} (${b.BranchCode ?? ''})`
                        }))}
                        selectedValue={String(selectedBranch.value)}
                        onValueChange={(v) => {
                          const s = branchList.find(b => String(b.BranchCode) === v);
                          if (s) onbranchChange(s);
                        }}
                      />
                    )}
                  </View>

                  <TouchableOpacity activeOpacity={0.8} style={localStyles.sheetSaveBtnOuter} onPress={handleBankDepositSave}>
                    <LinearGradient colors={[COLORS.primary, '#0369a1']} style={localStyles.sheetSaveBtn}>
                      <Text style={localStyles.sheetSaveText}>Confirm Bank</Text>
                      <Feather name="check" size={18} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {selectedMode === "Cash pickup" && (
                <View style={localStyles.modeCard}>
                  <View style={localStyles.inputOverlay}>
                    <Text style={localStyles.inputOverlayText}>Pickup Location</Text>
                  </View>

                  <View style={{ marginTop: 10 }}>
                    {renderEliteInput("Payout City", PayoutCity.value, (v) => setPayoutCity({ value: v.replace(/[^A-Za-z]/g, ''), error: "" }), PayoutCity.error, "map-pin", "City")}
                    {renderEliteInput("Postal Code", payoutPostcode.value, (v) => setPayoutPostcode({ value: v.replace(/[^0-9]/g, ''), error: "" }), payoutPostcode.error, "package", "Zip Code")}

                    {renderEliteInput(
                      "Search Location (State)",
                      payoutSearch.value,
                      (v) => setPayoutSearch({ value: v, error: "" }),
                      payoutSearch.error,
                      "search",
                      "State/Province",
                      false,
                      "default",
                      true,
                      <TouchableOpacity onPress={handleSearchLocation} style={localStyles.inlineSearchBtn}>
                        <Text style={localStyles.inlineSearchText}>Search</Text>
                      </TouchableOpacity>
                    )}

                    {searchCompleted && (
                      <ModalPicker
                        label="Collection Point"
                        dataList={agentList.map(a => ({ dataValue: a.value, displayvalue: a.label }))}
                        selectedValue={agent.value}
                        onValueChange={(v) => {
                          const s = agentList.find(a => a.value === v);
                          if (s) {
                            setAgent({ value: s.value, error: '' });
                            onAgentChange(s);
                          }
                        }}
                      />
                    )}
                  </View>

                  <TouchableOpacity activeOpacity={0.8} style={localStyles.sheetSaveBtnOuter} onPress={handleCashPickupSave}>
                    <LinearGradient colors={[COLORS.primary, '#0369a1']} style={localStyles.sheetSaveBtn}>
                      <Text style={localStyles.sheetSaveText}>Confirm Pickup</Text>
                      <Feather name="check" size={18} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {selectedMode === "Mobile wallet" && (
                <View style={localStyles.modeCard}>
                  <View style={localStyles.inputOverlay}>
                    <Text style={localStyles.inputOverlayText}>Wallet Details</Text>
                  </View>

                  <View style={{ marginTop: 10 }}>
                    {renderEliteInput("Wallet Number", mobileWalletNumber.value, (v) => setMobileWalletNumber({ value: v.replace(/[^0-9]/g, ''), error: "" }), mobileWalletNumber.error, "phone", "e.g. 9912345678")}
                  </View>

                  <TouchableOpacity activeOpacity={0.8} style={localStyles.sheetSaveBtnOuter} onPress={handleMobileWalletSave}>
                    <LinearGradient colors={[COLORS.primary, '#0369a1']} style={localStyles.sheetSaveBtn}>
                      <Text style={localStyles.sheetSaveText}>Confirm Wallet</Text>
                      <Feather name="shield" size={18} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
};

export default AddRecipients;

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  headerWrapper: {
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 8,
  },
  backCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  titleBox: {
    marginLeft: 20,
    flex: 1,
  },
  headerTitle: {
    fontSize: RFValue(14),
    fontFamily: FONTS.bold,
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: RFValue(10),
    color: 'rgba(255,255,255,0.85)',
    fontFamily: FONTS.medium,
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 80,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 24,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    marginTop: 15,
    zIndex: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  accentBar: {
    width: 4,
    height: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: '#64748b',
    marginBottom: 10,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    height: 60,
    paddingHorizontal: 20,
  },
  inputIcon: {
    marginRight: 15,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: '#1e293b',
    padding: 0,
    ...(Platform.select({ web: { outlineStyle: 'none' } }) as any),
  },
  errorText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.red,
    marginTop: 6,
    marginLeft: 6,
  },
  row: {
    flexDirection: 'row',
  },
  addModeBtn: {
    marginTop: 25,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  addModeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  addModeIconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  addModeTitle: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: '#1e40af',
  },
  addModeSub: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: '#64748b',
    marginTop: 3,
  },
  footerActions: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 15,
    paddingBottom: 20,
  },
  cancelBtn: {
    flex: 1,
    height: 64,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  cancelText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: '#94a3b8',
    letterSpacing: 1,
  },
  saveBtn: {
    flex: 2,
    height: 64,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  saveGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: '#fff',
    letterSpacing: 1,
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  sheetHeaderGradient: {
    paddingHorizontal: 25,
    paddingVertical: 20,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetHeaderTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: '#fff',
  },
  sheetHeaderSub: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  sheetCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabWrapper: {
    paddingHorizontal: 25,
    marginBottom: 25,
  },
  tabContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    padding: 6,
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 14,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: '#64748B',
  },
  activeTabText: {
    color: COLORS.primary,
  },
  modeCardWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  modeCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.05,
    shadowRadius: 25,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sheetSaveBtnOuter: {
    marginTop: 30,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  sheetSaveBtn: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  sheetSaveText: {
    color: '#fff',
    fontFamily: FONTS.black || FONTS.bold,
    fontSize: 15,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  inlineSearchBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
  },
  inlineSearchText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  inputOverlay: {
    position: 'absolute',
    left: 20,
    top: -10,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    zIndex: 1,
  },
  inputOverlayText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});


