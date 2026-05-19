import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ViewStyle,
  TextInput,
  useWindowDimensions,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useIsFocused } from "@react-navigation/native";
import { useRecoilValue } from "recoil";
import Toast from "react-native-toast-message";
import { SIZES, FONTS } from "../../../constants/Assets";

import { ProfileState } from "app/atoms";
import { MetaService } from "app/services/meta.service";
import ModalPicker from "app/components/customComponents/ModalPicker";
import TransactionalPreferences from "./TransactionalPreferences";
import {
  GetOccupation,
  ViewPreferCountry,
  GetIndustry,
  GetAnnualIncome,
  GetPurposeOfTransaction,
  AddPreferCountry,
  EditPreferCountry,
  UpdateRemitterProfile
} from "app/http-services";

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

const AdditionalDetails = ({ profile }: any) => {
  const { width: screenWidth } = useWindowDimensions();
  const isFocused = useIsFocused();
  const currentToken = useRecoilValue(ProfileState);

  const [loading, setLoading] = useState(false);
  const [isEditingPreferCountry, setIsEditingPreferCountry] = useState(false);
  const [companyName, setCompanyName] = useState(profile?.CompanyName || '');
  const [occupation, setOccupation] = useState({ value: profile?.Occupation || '' });
  const [industry, setIndustry] = useState({ value: profile?.OrgType || '' });
  const [annualincome, setAnnualincome] = useState({ value: profile?.AnnualIncome || '' });
  const [purposeoftransaction, setPurposeoftransaction] = useState({ value: '' });
  const [country, setCountry] = useState({ value: '' });
  const [amountPerTransaction, setAmountPerTransaction] = useState({ value: '' });
  const [numberOfTransactionsPerMonth, setNumberOfTransactionsPerMonth] = useState({ value: '' });

  const [countryList, setCountryList] = useState<any[]>([]);
  const [occupationList, setOccupationList] = useState<any[]>([]);
  const [industryList, setIndustryList] = useState<any[]>([]);
  const [annualincomeList, setAnnualincomeList] = useState<any[]>([]);
  const [purposeoftransactionList, setPurposeoftransactionList] = useState<any[]>([]);
  const [preferCountryList, setPreferCountryList] = useState<any[]>([]);

  useEffect(() => {
    fetchCountries();
    fetchLists();
  }, []);

  useEffect(() => {
    if (isFocused) fetchViewPreferCountry();
  }, [isFocused]);

  const fetchCountries = () => {
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

  const fetchLists = async () => {
    try {
      setLoading(true);
      const [occ, ind, ann, pur] = await Promise.all([
        GetOccupation(currentToken.tokenId),
        GetIndustry(currentToken.tokenId),
        GetAnnualIncome(currentToken.tokenId),
        GetPurposeOfTransaction(currentToken.tokenId)
      ]);

      if (occ.data.OccpationDetail) setOccupationList(occ.data.OccpationDetail.filter((i: any) => i.Value_occupation !== "0").map((i: any) => ({ dataValue: i.Value_occupation, displayvalue: i.Text_occupation })));
      if (ind.data.Industry) setIndustryList(ind.data.Industry.filter((i: any) => i.Value_Industry !== "0").map((i: any) => ({ dataValue: i.Value_Industry, displayvalue: i.Text_Industry })));
      if (ann.data.AnnualIncome) setAnnualincomeList(ann.data.AnnualIncome.filter((i: any) => i.Value_AnnualIncome !== "0").map((i: any) => ({ dataValue: i.Value_AnnualIncome, displayvalue: i.Annual_Income })));
      if (pur.data.POT) setPurposeoftransactionList(pur.data.POT.filter((i: any) => i.Value_POT !== "0").map((i: any) => ({ dataValue: i.Value_POT, displayvalue: i.Text_POT })));
    } finally {
      setLoading(false);
    }
  };

  const fetchViewPreferCountry = async () => {
    const res = await ViewPreferCountry(currentToken.tokenId);
    if (res.status === 200 && res.data.StatusCode === "ER0000") setPreferCountryList(res.data.prefercountry);
  };

  const handleUpdateProfile = async () => {
    if (!companyName || !occupation.value) {
      Toast.show({ type: 'error', text2: 'Please fill all mandatory fields' });
      return;
    }
    setLoading(true);
    try {
      const res = await UpdateRemitterProfile({
        remitterId: currentToken.remitterId,
        tokenId: currentToken.tokenId,
        CompanyName: companyName,
        Occupation: occupation.value,
        OrgType: industry.value,
        AnnualIncome: annualincome.value,
      });
      if (res?.data?.StatusCode === 'ER0000') Toast.show({ type: 'success', text2: 'Profile updated successfully' });
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
        {/* PROFESSIONAL INFO CARD */}
        <View style={[localStyles.card, { width: cardWidth }]}>
          <SectionHeader title="PROFESSIONAL STATUS" icon="briefcase-outline" />

          <FieldRow label="EMPLOYER NAME" value={companyName} onChange={(text: string) => setCompanyName(text.replace(/[^a-zA-Z\s]/g, ""))} placeholder="Enter Employer" icon="office-building-outline" />

          <ModalPicker label="ROLE / OCCUPATION" dataList={occupationList} selectedValue={occupation.value} onValueChange={(v) => setOccupation({ value: v })} />
          <View style={{ marginTop: 15 }}>
            <ModalPicker label="INDUSTRY TYPE" dataList={industryList} selectedValue={industry.value} onValueChange={(v) => setIndustry({ value: v })} />
          </View>
          <View style={{ marginTop: 15 }}>
            <ModalPicker label="ANNUAL GROSS INCOME" dataList={annualincomeList} selectedValue={annualincome.value} onValueChange={(v) => setAnnualincome({ value: v })} />
          </View>

          <TouchableOpacity onPress={handleUpdateProfile} style={localStyles.actionBtn}>
            <LinearGradient colors={["#0EA5E9", "#0284C7"]} style={localStyles.gradient}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={localStyles.actionText}>UPDATE PROFILE</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* TRANSACTION PREFERENCES CARD */}
        <View style={[localStyles.card, { width: cardWidth, marginTop: 24 }]}>
          <SectionHeader title="TRANSACTIONAL LIMITS" icon="options-outline" />
          <TransactionalPreferences preferCountry={preferCountryList} onPress={() => { }} />

          <View style={localStyles.divider} />

          <Text style={localStyles.miniHeader}>ADD NEW PREFERENCE</Text>

          <ModalPicker label="TARGET COUNTRY" dataList={countryList} selectedValue={country.value} onValueChange={(v) => setCountry({ value: v })} />
          <View style={{ marginTop: 15 }}>
            <ModalPicker label="PRIMARY PURPOSE" dataList={purposeoftransactionList} selectedValue={purposeoftransaction.value} onValueChange={(v) => setPurposeoftransaction({ value: v })} />
          </View>

          <View style={localStyles.row}>
            <FieldRow label="APPROX. AMOUNT" value={amountPerTransaction.value} onChange={(v: any) => setAmountPerTransaction({ value: v.replace(/[^0-9.]/g, "") })} placeholder="0.00" icon="cash-multiple" />
            <FieldRow label="COUNT / MONTH" value={numberOfTransactionsPerMonth.value} onChange={(v: any) => setNumberOfTransactionsPerMonth({ value: v.replace(/[^0-9]/g, "") })} placeholder="0" icon="numeric-pos-1" />
          </View>

          <TouchableOpacity style={[localStyles.actionBtn, { backgroundColor: '#F0F9FF', marginTop: 10 }]}>
            <Text style={[localStyles.actionText, { color: '#0EA5E9' }]}>ADD PREFERENCE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const localStyles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 30, padding: 24, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 },
  sectionHeaderBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconHalo: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  sectionTitleText: { fontSize: SIZES.p16, fontWeight: '900', color: '#0F172A', letterSpacing: 1.5, fontFamily: FONTS.bold },
  fieldGroup: { marginBottom: 20, flex: 1, paddingHorizontal: 4 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  fieldLabel: { fontSize: SIZES.p13, fontWeight: '800', color: '#64748B', letterSpacing: 1, fontFamily: FONTS.bold },
  inputField: { height: 52, backgroundColor: '#F8FAFC', borderRadius: 15, paddingHorizontal: 16, justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  textValue: { fontSize: SIZES.p16, fontWeight: '700', color: '#1E293B', fontFamily: FONTS.medium, ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any) },
  actionBtn: { marginTop: 20, height: 56, borderRadius: 18, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  gradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: '900', fontSize: SIZES.p16, letterSpacing: 1, fontFamily: FONTS.bold },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
  miniHeader: { fontSize: SIZES.p11, fontWeight: '900', color: '#64748B', letterSpacing: 1.5, marginBottom: 15, textTransform: 'uppercase', fontFamily: FONTS.bold },
  row: { flexDirection: 'row', width: '100%', marginTop: 15 },
});

export default AdditionalDetails;
