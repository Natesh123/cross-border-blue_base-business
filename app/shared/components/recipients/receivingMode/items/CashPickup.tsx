import { View, Text, ViewStyle, TextInput, useWindowDimensions, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import styles from "app/styles";
import { useIsFocused } from "@react-navigation/native";
import Picker from "app/components/customComponents/Picker";
import { TDropDown } from "types";
import Button from "app/components/controls/Button";
 

type Props = { 
    style?: ViewStyle
};

const CashPickup = ({style }: Props) => {
  const { width } = useWindowDimensions();
  const isFocused = useIsFocused();
  const [bankList, setBankList] = useState<TDropDown[]>([]);

  const [bank, setBank] = useState<{ value: string, error: string }>({ value: '', error: '' });
  const [PayoutCity, setPayoutCity] = useState<{ value: string, error: string }>({ value: '', error: '' });
  const [payoutPostcode, setPayoutPostcode] = useState<{ value: string, error: string }>({ value: '', error: '' });
  const [payoutSearch, setPayoutSearch] = useState<{ value: string, error: string }>({ value: '', error: '' });

  useEffect(() => {
    
  }, [isFocused]);

  const validateFields = () => {
    let valid = true;

  

    if (!PayoutCity.value || PayoutCity.value.trim() === "") {
      setPayoutCity(prev => ({ ...prev, error: "Payout City is required" }));
      valid = false;
    }

    // if (!payoutPostcode.value || payoutPostcode.value.trim() === "") {
    //   setPayoutPostcode(prev => ({ ...prev, error: "Payout Post Code is required" }));
    //   valid = false;
    // }

    // if (!payoutSearch.value || payoutSearch.value.trim() === "") {
    //   setPayoutSearch(prev => ({ ...prev, error: "Payout Search Location is required" }));
    //   valid = false;
    // }

    return valid;
  };

  const handleSave = () => {
    const isValid = validateFields();
    if (isValid) {
      Alert.alert("Success", "All fields are valid. Save logic goes here!");
    } else {
      console.log("Validation failed");
    }
  };

  return (
    <View style={style}>
      <View>
        <View>
          

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Payout City</Text>
            <View style={styles.inputControls}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter City"
                value={PayoutCity.value}
                onChangeText={(text) => setPayoutCity({ value: text, error: '' })}
              />
            </View>
            {PayoutCity.error ? <Text style={styles.error}>{PayoutCity.error}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Payout Post Code</Text>
            <View style={styles.inputControls}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter postal code"
                value={payoutPostcode.value}
                onChangeText={(text) => setPayoutPostcode({ value: text, error: '' })}
              />
            </View>
            {payoutPostcode.error ? <Text style={styles.error}>{payoutPostcode.error}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Payout Search location</Text>
            <View style={styles.inputControls}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter Location"
                value={payoutSearch.value}
                onChangeText={(text) => setPayoutSearch({ value: text, error: '' })}
              />
            </View>
            {payoutSearch.error ? <Text style={styles.error}>{payoutSearch.error}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Collection point dropdown</Text>
            <Picker
                          dataList={bankList}
                          errorText={bank.error}
                          
                          selectedValue={bank.value} label={""}            //   onValueChange={(itemValue) => setBank({ value: itemValue, error: '' })}
            />
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
      </View>
    </View>
  );
};

export default CashPickup;
