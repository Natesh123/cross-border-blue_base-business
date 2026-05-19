import React, { useEffect, useState, RefObject } from "react";
import { View, Text, TextInput, ViewStyle, useWindowDimensions } from "react-native";
import { Picker } from '@react-native-picker/picker'; // Use official picker
import styles from "app/styles";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import Button from "app/components/controls/Button";
import { ReceivingModeField } from "app/models/receivingModeField.model";

type Props = {
  receivingModeField: ReceivingModeField | undefined;
  style?: ViewStyle;
  onChange?: (details: {
    bank: string;
    ifsc: string;
    accountNumber: string;
    accountName: string;
  }) => void;
  bottomSheetRef?: RefObject<any>;
};

const BankDeposit = ({ receivingModeField, style, onChange, bottomSheetRef }: Props) => {
  const { width } = useWindowDimensions();
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  const [bankList, setBankList] = useState<{ dataValue: string; displayvalue: string }[]>([]);
  const [bank, setBank] = useState({ value: '', error: '' });
  const [IFSCCode, setIFSCCode] = useState({ value: '', error: '' });
  const [accountNumber, setAccountNumber] = useState({ value: '', error: '' });
  const [accountName, setAccountName] = useState({ value: '', error: '' });

  const triggerOnChange = () => {
    if (onChange) {
      onChange({
        bank: bank.value,
        ifsc: IFSCCode.value,
        accountNumber: accountNumber.value,
        accountName: accountName.value,
      });
    }
  };

  useEffect(() => {
    if (Array.isArray(receivingModeField)) {
      const firstItem = receivingModeField[0];
      if (firstItem && firstItem.receivingModeOptions) {
        const mappedBankList = firstItem.receivingModeOptions.map((bank: { value: any; label: any }) => ({
          dataValue: bank.value,
          displayvalue: bank.label
        }));
        setBankList(mappedBankList);
        if (mappedBankList.length > 0) {
          setBank({ value: mappedBankList[0].dataValue, error: '' });
        }
      }
    }
  }, [receivingModeField]);

  useEffect(() => {
    setBank({ value: '', error: '' });
    setIFSCCode({ value: '', error: '' });
    setAccountNumber({ value: '', error: '' });
    setAccountName({ value: '', error: '' });
  }, [bankList]);

  useEffect(() => {
    triggerOnChange();
  }, [bank.value, IFSCCode.value, accountNumber.value, accountName.value]);

  const validateFields = () => {
    let valid = true;

    setBank((prev) => ({ ...prev, error: '' }));
    setIFSCCode((prev) => ({ ...prev, error: '' }));
    setAccountNumber((prev) => ({ ...prev, error: '' }));
    setAccountName((prev) => ({ ...prev, error: '' }));

    if (!bank.value.trim()) {
      setBank((prev) => ({ ...prev, error: "Bank is required" }));
      valid = false;
    }
    if (!IFSCCode.value.trim()) {
      setIFSCCode((prev) => ({ ...prev, error: "IFSC Code is required" }));
      valid = false;
    }
    if (!accountNumber.value.trim()) {
      setAccountNumber((prev) => ({ ...prev, error: "Account number is required" }));
      valid = false;
    }
    if (!accountName.value.trim()) {
      setAccountName((prev) => ({ ...prev, error: "Account name is required" }));
      valid = false;
    }

    return valid;
  };

  const handleSave = () => {
    const isValid = validateFields();
    if (isValid) {
      console.log('Bank:', bank.value);
      console.log('IFSC Code:', IFSCCode.value);
      console.log('Account Number:', accountNumber.value);
      console.log('Account Name:', accountName.value);

      bottomSheetRef?.current?.close();
    }
  };

  return (
    <View style={style}>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Select Bank</Text>
        <View style={[styles.input, { paddingHorizontal: 5 }]}>
          <Picker
            selectedValue={bank.value}
            onValueChange={(itemValue) => setBank({ value: String(itemValue), error: '' })}
          >
            {bankList.map((item) => (
              <Picker.Item
                key={item.dataValue}
                label={item.displayvalue}
                value={item.dataValue}
              />
            ))}
          </Picker>
        </View>
        {bank.error ? <Text style={styles.error}>{bank.error}</Text> : null}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>IFSC Code</Text>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Enter IFSC code"
          value={IFSCCode.value}
          onChangeText={(text) => setIFSCCode({ value: text, error: '' })}
        />
        {IFSCCode.error && <Text style={styles.error}>{IFSCCode.error}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Account Number</Text>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Enter Account Number"
          value={accountNumber.value}
          onChangeText={(text) => setAccountNumber({ value: text, error: '' })}
        />
        {accountNumber.error && <Text style={styles.error}>{accountNumber.error}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Account Name</Text>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Enter Account Name"
          value={accountName.value}
          onChangeText={(text) => setAccountName({ value: text, error: '' })}
        />
        {accountName.error && <Text style={styles.error}>{accountName.error}</Text>}
      </View>

      <View style={styles.rightSide}>
        <View style={{ flexDirection: 'row' }}>
          <Button
            style={{ margin: 5, width: width * 0.45 }}
            onPress={handleSave}
          >
            Save
          </Button>
        </View>
      </View>
    </View>
  );
};

export default BankDeposit;
