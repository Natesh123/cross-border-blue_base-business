import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
  useWindowDimensions,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";
import { SIZES, FONTS } from "../../../constants/Assets";

import ModalPicker from "app/components/customComponents/ModalPicker";
import { MetaService } from "app/services/meta.service";
import { TDropDown } from "types";
import { AddBusinesspersonalDetails, GetBusinesspersonalDetails } from "app/http-services";

const SectionHeader = ({ title, icon }: { title: string; icon: string }) => (
  <View style={localStyles.sectionHeaderBox}>
    <View style={localStyles.iconHalo}>
      <Ionicons name={icon as any} size={18} color="#0EA5E9" />
    </View>
    <Text style={localStyles.sectionTitleText}>{title}</Text>
  </View>
);

const FieldRow = ({ label, value, icon, onChange, placeholder, editable = true }: any) => (
  <View style={localStyles.fieldGroup}>
    <View style={localStyles.labelRow}>
      <MaterialCommunityIcons name={icon} size={14} color="#64748B" style={{ marginRight: 6 }} />
      <Text style={localStyles.fieldLabel}>{label}</Text>
    </View>
    <View style={[localStyles.inputField, !editable && { backgroundColor: '#F1F5F9' }]}>
      <TextInput
        style={localStyles.textValue}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        editable={editable}
      />
    </View>
  </View>
);

export default function BusinessDetails() {
  const { width: screenWidth } = useWindowDimensions();
  const [companyNumber, setCompanyNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [companyType, setCompanyType] = useState("Finance");
  const [countryCode, setCountryCode] = useState("IN");
  const [countryName, setCountryName] = useState("India");
  const [countryList, setCountryList] = useState<TDropDown[]>([]);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const companyTypeList = [
    { dataValue: "Banking", displayvalue: "Banking" },
    { dataValue: "Network", displayvalue: "Network" },
    { dataValue: "Finance", displayvalue: "Finance" },
  ];

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (countryList.length > 0) fetchBusinessDetails();
  }, [countryList]);

  const fetchCountries = async () => {
    MetaService.fetchCountryMetas(false, true, false, (countries: any[]) => {
      setCountryList(countries.map(c => ({
        dataValue: c.Alpha_2_Code,
        displayvalue: c.CountryName,
        name: c.CountryName,
        Alpha_2_Code: c.Alpha_2_Code,
        price: '0',
        description: '',
        id: c.CountryId || 0,
        image: ''
      } as any)));
    }, () => { }, () => { });
  };

  const fetchBusinessDetails = async () => {
    try {
      setLoading(true);
      const res = await GetBusinesspersonalDetails({});
      if (res?.data?.StatusCode === "ER0000") {
        const details = res.data?.BusinessDetail?.[0] || {};
        setCompanyName(details.CompanyName || "");
        setRegNumber(details.RegistrationNumber || "");
        setBusinessName(details.RegisteredBusinessName || "");
        setCompanyType(details.CompanyType || "Finance");
        setCountryName(details.Country || "India");
        const found = countryList.find(c => c.displayvalue === details.Country);
        if (found) setCountryCode(found.dataValue);
        if (details.IncorporateDate) {
          const formatted = new Date(details.IncorporateDate.replace(/\\\//g, "/"));
          if (!isNaN(formatted.getTime())) setDate(formatted);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!companyName || !regNumber || !businessName) {
      Toast.show({ type: "error", text2: "Please fill all required fields." });
      return;
    }
    try {
      setLoading(true);
      const res = await AddBusinesspersonalDetails({
        CompanyName: companyName,
        CompanyType: companyType,
        Country: countryName,
        IncorporateDate: date.toISOString().split("T")[0],
        RegisteredBusinessName: businessName,
        RegistrationNumber: regNumber,
      });
      if (res?.data?.StatusCode === "ER0000") {
        Toast.show({ type: "success", text2: "Business Profile updated successfully" });
        fetchBusinessDetails();
      }
    } finally {
      setLoading(false);
    }
  };

  const cardWidth = Math.min(screenWidth - 40, 600);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: '#fff' }}
        contentContainerStyle={{ paddingVertical: 20, alignItems: 'center', paddingBottom: 100 }}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[localStyles.card, { width: cardWidth }]}>
          <SectionHeader title="BUSINESS ENTITY" icon="business-outline" />

          <FieldRow label="REGISTERED COMPANY NAME" value={companyName} onChange={(text: string) => setCompanyName(text.replace(/[^a-zA-Z\s]/g, ""))} placeholder="Enter Name" icon="office-building-outline" />
          <FieldRow label="REGISTRATION NUMBER" value={regNumber} onChange={setRegNumber} placeholder="Enter Reg #" icon="card-bulleted-outline" />
          <FieldRow label="TRADING/BUSINESS NAME" value={businessName} onChange={(text: string) => setBusinessName(text.replace(/[^a-zA-Z\s]/g, ""))} placeholder="Enter Business Name" icon="briefcase-outline" />

          <View style={localStyles.row}>
            <View style={{ flex: 1 }}>
              <ModalPicker
                label="COMPANY TYPE"
                dataList={companyTypeList}
                selectedValue={companyType}
                onValueChange={setCompanyType}
                placeholder="Select Type"
              />
            </View>
          </View>

          <View style={{ marginTop: 20 }}>
            <ModalPicker
              label="COUNTRY OF REGISTRATION"
              dataList={countryList}
              selectedValue={countryCode}
              onValueChange={(val) => {
                setCountryCode(val);
                const selected = countryList.find(c => c.dataValue === val);
                if (selected) setCountryName(selected.displayvalue);
              }}
            />
          </View>

          <View style={localStyles.fieldGroup}>
            <View style={localStyles.labelRow}>
              <MaterialCommunityIcons name="calendar-clock" size={14} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={localStyles.fieldLabel}>INCORPORATION DATE</Text>
            </View>
            <TouchableOpacity onPress={() => setShowPicker(true)} style={localStyles.inputField}>
              <Text style={localStyles.textValue}>{date.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </View>

          {showPicker && (
            <DateTimePicker value={date} mode="date" display="default" onChange={(e, d) => { setShowPicker(false); if (d) setDate(d); }} />
          )}

          <TouchableOpacity onPress={handleSave} disabled={loading} style={localStyles.saveBtn}>
            <LinearGradient colors={["#0EA5E9", "#0284C7"]} style={localStyles.gradient}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={localStyles.actionText}>UPDATE BUSINESS PROFILE</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const localStyles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 30, padding: 24, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 },
  sectionHeaderBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconHalo: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  sectionTitleText: { fontSize: SIZES.p16, fontWeight: '900', color: '#0F172A', letterSpacing: 1.5, fontFamily: FONTS.bold },
  fieldGroup: { marginBottom: 20, width: '100%' },
  row: { flexDirection: 'row', width: '100%' },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  fieldLabel: { fontSize: SIZES.p13, fontWeight: '800', color: '#64748B', letterSpacing: 1, fontFamily: FONTS.bold },
  inputField: { height: 52, backgroundColor: '#F8FAFC', borderRadius: 15, paddingHorizontal: 16, justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  textValue: { fontSize: SIZES.p16, fontWeight: '700', color: '#1E293B', fontFamily: FONTS.medium, ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any) },
  saveBtn: { marginTop: 20, height: 56, borderRadius: 18, overflow: 'hidden' },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: '900', fontSize: SIZES.p16, letterSpacing: 1, fontFamily: FONTS.bold },
});
