import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import Container from "app/theme/Container";
import { theme } from 'app/core/theme';
import styles from "app/styles";
import Button from "app/components/controls/Button";
import { MobileNumberLookUp } from "app/http-services";
import Toast from "react-native-toast-message";
import ModalHeaderBack from "app/components/ModalHeaderBack";



const AirtimeTopupForm = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [loading, setLoading] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState({ value: "", error: "" });
  const [lastName, setLastName] = useState({ value: "", error: "" });
  const [email, setEmail] = useState({ value: "", error: "" });
  const [mobile, setMobile] = useState({ value: "", error: "" });
  const [confirmMobile, setConfirmMobile] = useState({ value: "", error: "" });

  // AsyncStorage values
  const [selectedOperator, setSelectedOperator] = useState<{
    dataValue: string;
    displayvalue: string;
    flag?: string;
    ISDCode?: string;
  } | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<{
    dataValue: string;
    displayvalue: string;
    flag?: string;
    ISDCode?: string;
  } | null>(null);

  // Load AsyncStorage data
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedOperator = await AsyncStorage.getItem("selectedOperator");
        if (storedOperator) setSelectedOperator(JSON.parse(storedOperator));

        const storedCountry = await AsyncStorage.getItem("selectedCountry");
        if (storedCountry) setSelectedCountry(JSON.parse(storedCountry));
      } catch (error) {
        console.log("Error loading AsyncStorage:", error);
      }
    };
    loadData();
  }, []);

  // Form validation
  const validateForm = () => {
    let isValid = true;

    if (!firstName.value) {
      setFirstName({ ...firstName, error: "First Name is required" });
      isValid = false;
    }
    if (!lastName.value) {
      setLastName({ ...lastName, error: "Last Name is required" });
      isValid = false;
    }
    if (!email.value) {
      setEmail({ ...email, error: "Email is required" });
      isValid = false;
    } else {
      const emailRegex =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email.value)) {
        setEmail({
          ...email,
          error: "Please enter a valid email address",
        });
        isValid = false;
      }
    }

    if (!mobile.value) {
      setMobile({ ...mobile, error: "Mobile number is required" });
      isValid = false;
    } else {
      const mobileRegex = /^[0-9]{10}$/;
      if (!mobileRegex.test(mobile.value)) {
        setMobile({
          ...mobile,
          error: "Please enter a valid 10-digit mobile number",
        });
        isValid = false;
      }
    }

    if (!confirmMobile.value) {
      setConfirmMobile({
        ...confirmMobile,
        error: "Confirm mobile number is required",
      });
      isValid = false;
    } else if (confirmMobile.value !== mobile.value) {
      setConfirmMobile({
        ...confirmMobile,
        error: "Mobile numbers do not match",
      });
      isValid = false;
    }

    return isValid;
  };



  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const requestPayload = {
        CountryCode: selectedCountry?.dataValue || "IN",
        Email: email.value,
        FirstName: firstName.value,
        LastName: lastName.value,
        MobileNumber: mobile.value,
        remitterId: "",
        operator_id: selectedOperator?.dataValue
          ? String(selectedOperator.dataValue)
          : "",
      };

      const selectedRecipient = requestPayload;

      console.log("📤 Payload being sent to MobileNumberLookUp:", requestPayload);

      const response = await MobileNumberLookUp(requestPayload);
      const responseData = response?.data;

      console.log("📥 MobileNumberLookUp API response:", responseData);
      let selectedPackage = null;

      if (responseData?.StatusCode === "ER0000") {
        const storedPackage = await AsyncStorage.getItem("selectedPackage");
        selectedPackage = storedPackage ? JSON.parse(storedPackage) : null;
        await AsyncStorage.setItem(
          "selectedRecipient",
          JSON.stringify({ ...selectedRecipient, selectedPackage })
        );

        // ✅ Show toast popup
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: responseData?.StatusMsg || 'Mobile number lookup successful',
          position: 'top',
        });

        // ✅ Navigate after a short delay so toast is visible
        setTimeout(() => {
          navigation.navigate('AirtimeTopupPay' as never);
        }, 1000);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: responseData?.StatusMsg || 'Mobile number lookup failed',
          position: 'bottom',
        });
      }
    } catch (error) {
      console.log("❌ MobileNumberLookUp error:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong. Please try again.',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView style={[styles.container, { flex: 1, backgroundColor: '#0EA5E9', marginTop: 0 }]}>
      {/* Header */}
      <ModalHeaderBack title="New Beneficiary" />

      <Container style={{ backgroundColor: '#f9f9f9', flex: 1 }}>
        <ScrollView
          style={{ padding: 10 }}
          contentContainerStyle={{ minHeight: "115%" }}
          showsVerticalScrollIndicator={false}
        >
          <View>
            {/* First Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                First name <Text style={{ color: "red" }}>*</Text>
              </Text>
              <View style={styles.inputControls}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={firstName.value}
                  onChangeText={(text) =>
                    setFirstName({
                      value: text.replace(/[^A-Za-z]/g, ""),
                      error: "",
                    })
                  }
                />
              </View>
              {firstName.error && (
                <Text style={styles.error}>{firstName.error}</Text>
              )}
            </View>

            {/* Last Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Last name <Text style={{ color: "red" }}>*</Text>
              </Text>
              <View style={styles.inputControls}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={lastName.value}
                  onChangeText={(text) =>
                    setLastName({
                      value: text.replace(/[^A-Za-z]/g, ""),
                      error: "",
                    })
                  }
                />
              </View>
              {lastName.error && (
                <Text style={styles.error}>{lastName.error}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Email id <Text style={{ color: "red" }}>*</Text>
              </Text>
              <View style={styles.inputControls}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={email.value}
                  onChangeText={(text) => setEmail({ value: text, error: "" })}
                />
              </View>
              {email.error && (
                <Text style={styles.error}>{email.error}</Text>
              )}
            </View>

            {/* Mobile Operator */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mobile Operator</Text>
              <View style={styles.inputControls}>
                <TextInput
                  style={[
                    styles.input,
                    { flex: 1, backgroundColor: "#f1f1f1", color: "#333" },
                  ]}
                  value={selectedOperator?.displayvalue || ""}
                  editable={false}
                  placeholder="Select Mobile Operator"
                />
              </View>
            </View>

            {/* Mobile Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Mobile <Text style={{ color: "red" }}>*</Text>
              </Text>
              <View style={styles.inputControls}>
                <TextInput
                  style={[
                    styles.input,
                    { width: 70, marginRight: 8, backgroundColor: "#f1f1f1" },
                  ]}
                  value={
                    selectedCountry?.ISDCode
                      ? `+${selectedCountry.ISDCode}`
                      : "+91"
                  }
                  editable={false}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={mobile.value}
                  onChangeText={(text) =>
                    setMobile({ value: text.replace(/[^0-9]/g, ""), error: "" })
                  }
                  keyboardType="number-pad"
                />
              </View>
              {mobile.error && (
                <Text style={styles.error}>{mobile.error}</Text>
              )}
            </View>

            {/* Confirm Mobile Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Mobile Number</Text>
              <View style={styles.inputControls}>
                <TextInput
                  style={[
                    styles.input,
                    { width: 70, marginRight: 8, backgroundColor: "#f1f1f1" },
                  ]}
                  value={
                    selectedCountry?.ISDCode
                      ? `+${selectedCountry.ISDCode}`
                      : "+91"
                  }
                  editable={false}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={confirmMobile.value}
                  onChangeText={(text) =>
                    setConfirmMobile({ value: text.replace(/[^0-9]/g, ""), error: "" })
                  }
                  keyboardType="number-pad"
                />
              </View>
              {confirmMobile.error && (
                <Text style={styles.error}>{confirmMobile.error}</Text>
              )}
            </View>

            {/* Buttons */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 20,
              }}
            >
              <View style={{ flex: 1, marginRight: 5 }}>
                <Button outerLine={true} onPress={() => navigation.navigate("Root")}>
                  Cancel
                </Button>
              </View>
              <View style={{ flex: 1, marginLeft: 5 }}>
                <Button onPress={handleSave} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : "Save"}
                </Button>
              </View>
            </View>
          </View>
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
};

export default AirtimeTopupForm;
