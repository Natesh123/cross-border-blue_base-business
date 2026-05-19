import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useRecoilValue } from "recoil";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ProfileState } from "app/atoms";
import Container from "app/theme/Container";
import { TDropDown } from "types";
import { MetaService } from "app/services/meta.service";
import { GetOperators, GetProducts } from "app/http-services";
import { Ionicons, Feather, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import COLORS from "app/constants/Colors";
import { FONTS, SIZES } from "app/constants/Assets";
import { RFValue } from "react-native-responsive-fontsize";
import Vector from "app/assets/vectors";

const { width } = Dimensions.get("window");

const AirtimeTopup: React.FC = () => {
  const currentToken = useRecoilValue(ProfileState);
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();

  // Country states
  const [countryList, setCountryList] = useState<TDropDown[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<TDropDown[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<TDropDown | null>(null);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearchText, setCountrySearchText] = useState("");

  // Operator states
  const [operatorList, setOperatorList] = useState<TDropDown[]>([]);
  const [filteredOperators, setFilteredOperators] = useState<TDropDown[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<TDropDown | null>(null);
  const [operatorDropdownOpen, setOperatorDropdownOpen] = useState(false);
  const [operatorSearchText, setOperatorSearchText] = useState("");

  // Package states
  const [packages, setPackages] = useState<TDropDown[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<TDropDown[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<TDropDown | null>(null);
  const [packageDropdownOpen, setPackageDropdownOpen] = useState(false);
  const [packageSearchText, setPackageSearchText] = useState("");

  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const valid = selectedCountry !== null && selectedOperator !== null && selectedPackage !== null;
    setIsFormValid(valid);
  }, [selectedCountry, selectedOperator, selectedPackage]);

  const saveToLocalStorage = async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("AsyncStorage error:", error);
    }
  };

  useEffect(() => {
    if (countrySearchText.trim() === "") setFilteredCountries(countryList);
    else
      setFilteredCountries(
        countryList.filter((c) =>
          c.displayvalue.toLowerCase().includes(countrySearchText.toLowerCase())
        )
      );
  }, [countrySearchText, countryList]);

  useEffect(() => {
    if (operatorSearchText.trim() === "") setFilteredOperators(operatorList);
    else
      setFilteredOperators(
        operatorList.filter((o) =>
          o.displayvalue.toLowerCase().includes(operatorSearchText.toLowerCase())
        )
      );
  }, [operatorSearchText, operatorList]);

  useEffect(() => {
    if (packageSearchText.trim() === "") setFilteredPackages(packages);
    else
      setFilteredPackages(
        packages.filter((p) =>
          p.displayvalue.toLowerCase().includes(packageSearchText.toLowerCase())
        )
      );
  }, [packageSearchText, packages]);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      MetaService.fetchCountryMetas(
        false,
        true,
        false,
        async (countries: any[]) => {
          const list: TDropDown[] = countries.map((c: any) => ({
            dataValue: c.Alpha_3_Code,
            displayvalue: c.CountryName,
            flag: `https://flagcdn.com/w40/${c.Alpha_2_Code.toLowerCase()}.png`,
            ISDCode: c.ISDCode,
            name: c.CountryName,
            Alpha_2_Code: c.Alpha_2_Code,
            price: "",
            description: "",
          }));
          setCountryList(list);
          setFilteredCountries(list);
        },
        () => { },
        () => setLoading(false)
      );
    } catch (error) {
      console.error("fetchCountries error:", error);
      setLoading(false);
    }
  };

  const fetchOperators = async (countryCode: string) => {
    try {
      setLoading(true);
      const response: any = await GetOperators({ country_iso_code: countryCode });
      const list: TDropDown[] = (response?.data?.Operators || []).map((op: any) => ({
        dataValue: op.id,
        displayvalue: op.name,
        flag: "",
        ISDCode: "",
      }));
      setOperatorList(list);
      setFilteredOperators(list);
    } catch (error) {
      console.error("fetchOperators error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (countryCode: string, operatorId: string) => {
    try {
      setLoading(true);
      const response: any = await GetProducts({
        country_iso_code: countryCode,
        operator_id: operatorId,
      });

      const list: TDropDown[] = (response?.data?.Products || []).map((p: any) => {
        let price = "";
        if (p.prices?.retail?.amount) {
          price = `${p.prices.retail.amount} ${p.prices.retail.unit}`;
        } else if (p.topupamount?.amount) {
          price = `${p.topupamount.amount} ${p.topupamount.currency}`;
        } else if (p.destination?.amount) {
          price = `${p.destination.amount} ${p.destination.unit}`;
        }

        return {
          dataValue: p.id,
          displayvalue: p.name,
          description: p.description || "",
          price: price,
          flag: "",
          ISDCode: "",
        };
      });

      setPackages(list);
      setFilteredPackages(list);
    } catch (error) {
      console.error("fetchProducts error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, [isFocused]);

  const renderDropdownTile = (
    label: string,
    placeholder: string,
    selectedValue: string | null,
    isOpen: boolean,
    onToggle: () => void,
    icon: string,
    iconType: 'feather' | 'material' | 'font-awesome' = 'feather',
    flag?: string
  ) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onToggle}
      style={[styles.tileBox, isOpen && styles.tileBoxActive]}
    >
      <View style={styles.tileIconContainer}>
        {flag ? (
          <Image source={{ uri: flag }} style={styles.tileFlag} />
        ) : (
          <View style={styles.tileIconCircle}>
            {iconType === 'feather' && <Feather name={icon as any} size={18} color={COLORS.primary} />}
            {iconType === 'material' && <MaterialCommunityIcons name={icon as any} size={20} color={COLORS.primary} />}
            {iconType === 'font-awesome' && <FontAwesome5 name={icon as any} size={16} color={COLORS.primary} />}
          </View>
        )}
      </View>
      <View style={styles.tileContent}>
        <Text style={styles.tileLabel}>{label}</Text>
        <Text style={[styles.tileValue, !selectedValue && styles.tilePlaceholder]}>
          {selectedValue || placeholder}
        </Text>
      </View>
      <Feather name={isOpen ? "chevron-up" : "chevron-right"} size={18} color="#94a3b8" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ELITE HERO HEADER - MATCHED WITH NOTIFICATION SCREEN */}
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
              <Text style={styles.headerTitle}>Airtime Topup</Text>
              <Text style={styles.headerSub}>Recharge mobile credit instantly</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <Container style={styles.body}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <View style={styles.headerInfo}>
            <Text style={styles.mainTitle}>Airtime Topup</Text>
            <View style={styles.accentBar} />
            <Text style={styles.mainSubtitle}>Recharge mobile credit instantly across borders</Text>
          </View>

          <View style={styles.glassContainer}>
            {/* Country Selector */}
            {renderDropdownTile(
              "Destination Country",
              "Select Country",
              selectedCountry?.displayvalue || null,
              countryDropdownOpen,
              () => setCountryDropdownOpen(!countryDropdownOpen),
              "globe",
              'feather',
              selectedCountry?.flag
            )}

            {countryDropdownOpen && (
              <View style={styles.innerDropdown}>
                <View style={styles.searchBar}>
                  <Feather name="search" size={16} color="#94a3b8" />
                  <TextInput
                    placeholder="Search country..."
                    value={countrySearchText}
                    onChangeText={setCountrySearchText}
                    style={styles.searchInput}
                  />
                </View>
                <FlatList
                  data={filteredCountries}
                  keyExtractor={(item) => item.dataValue}
                  style={{ maxHeight: 200 }}
                  nestedScrollEnabled={true}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.listOption}
                      onPress={() => {
                        setSelectedCountry(item);
                        saveToLocalStorage("selectedCountry", item);
                        setCountryDropdownOpen(false);
                        setCountrySearchText("");
                        fetchOperators(item.dataValue);
                        setSelectedOperator(null);
                        setSelectedPackage(null);
                      }}
                    >
                      <Image source={{ uri: item.flag }} style={styles.listFlag} />
                      <Text style={styles.listText}>{item.displayvalue}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* Operator Selector */}
            {renderDropdownTile(
              "Mobile Operator",
              "Select Operator",
              selectedOperator?.displayvalue || null,
              operatorDropdownOpen,
              () => setOperatorDropdownOpen(!operatorDropdownOpen),
              "wifi",
              'feather'
            )}

            {operatorDropdownOpen && (
              <View style={styles.innerDropdown}>
                <View style={styles.searchBar}>
                  <Feather name="search" size={16} color="#94a3b8" />
                  <TextInput
                    placeholder="Search operator..."
                    value={operatorSearchText}
                    onChangeText={setOperatorSearchText}
                    style={styles.searchInput}
                  />
                </View>
                <FlatList
                  data={filteredOperators}
                  keyExtractor={(item) => item.dataValue.toString()}
                  style={{ maxHeight: 200 }}
                  nestedScrollEnabled={true}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.listOption}
                      onPress={() => {
                        setSelectedOperator(item);
                        saveToLocalStorage("selectedOperator", item);
                        setOperatorDropdownOpen(false);
                        setOperatorSearchText("");
                        fetchProducts(selectedCountry?.dataValue || "", item.dataValue);
                        setSelectedPackage(null);
                      }}
                    >
                      <View style={styles.operatorBullet} />
                      <Text style={styles.listText}>{item.displayvalue}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* Package Selector */}
            {renderDropdownTile(
              "Available Packages",
              "Select Plan",
              selectedPackage?.displayvalue || null,
              packageDropdownOpen,
              () => setPackageDropdownOpen(!packageDropdownOpen),
              "layers",
              'feather'
            )}

            {packageDropdownOpen && (
              <View style={styles.innerDropdown}>
                <View style={styles.searchBar}>
                  <Feather name="search" size={16} color="#94a3b8" />
                  <TextInput
                    placeholder="Search plans..."
                    value={packageSearchText}
                    onChangeText={setPackageSearchText}
                    style={styles.searchInput}
                  />
                </View>
                <FlatList
                  data={filteredPackages}
                  keyExtractor={(item) => item.dataValue.toString()}
                  style={{ maxHeight: 250 }}
                  nestedScrollEnabled={true}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.planTile}
                      onPress={() => {
                        setSelectedPackage(item);
                        saveToLocalStorage("selectedPackage", item);
                        setPackageDropdownOpen(false);
                        setPackageSearchText("");
                      }}
                    >
                      <View style={styles.planTileHeader}>
                        <Text style={styles.planTitleText}>{item.displayvalue}</Text>
                        <View style={styles.priceTag}>
                          <Text style={styles.priceText}>{item.price}</Text>
                        </View>
                      </View>
                      {item.description ? <Text style={styles.planDescText}>{item.description}</Text> : null}
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* Dynamic Result Summary */}
            {selectedPackage && (
              <LinearGradient
                colors={['#172554', '#0F172A']}
                style={styles.summaryCard}
              >
                <View style={styles.summaryTop}>
                  <View style={styles.summaryIcon}>
                    <MaterialCommunityIcons name="text-box-check-outline" size={20} color="#38bdf8" />
                  </View>
                  <Text style={styles.summaryTitle}>Transaction Summary</Text>
                </View>
                <View style={styles.summaryContent}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.sumLabel}>Network</Text>
                    <Text style={styles.sumValue}>{selectedOperator?.displayvalue}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.sumLabel}>Package</Text>
                    <Text style={styles.sumValue}>{selectedPackage.displayvalue}</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.sumLabel}>Payable Total</Text>
                    <Text style={styles.sumTotal}>{selectedPackage.price}</Text>
                  </View>
                </View>
              </LinearGradient>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={!isFormValid || loading}
              onPress={() => navigation.navigate("AirtimeTopupList")}
              style={[styles.payButton, !isFormValid && styles.payButtonDisabled]}
            >
              <Text style={styles.payButtonText}>Next Step</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

        </ScrollView>
      </Container>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
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
  },
  headerTitle: {
    fontSize: RFValue(13),
    fontFamily: FONTS.bold,
    color: '#fff',
  },
  headerSub: {
    fontSize: RFValue(10),
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FONTS.medium,
    marginTop: 1,
  },
  body: {
    backgroundColor: "#F8FAFC",
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerInfo: {
    paddingHorizontal: 25,
    marginTop: 25,
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: RFValue(16),
    fontFamily: FONTS.bold,
    color: '#0f172a',
  },
  accentBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginTop: 6,
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: RFValue(12),
    fontFamily: FONTS.regular,
    color: '#64748b',
    lineHeight: 18,
  },
  glassContainer: {
    paddingHorizontal: 20,
  },
  tileBox: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  tileBoxActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#fff',
  },
  tileIconContainer: {
    marginRight: 15,
  },
  tileIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileFlag: {
    width: 42,
    height: 30,
    borderRadius: 6,
  },
  tileContent: {
    flex: 1,
  },
  tileLabel: {
    fontSize: RFValue(9),
    fontFamily: FONTS.bold,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  tileValue: {
    fontSize: RFValue(13),
    fontFamily: FONTS.bold,
    color: '#1e293b',
  },
  tilePlaceholder: {
    color: '#cbd5e1',
    fontFamily: FONTS.medium,
  },
  innerDropdown: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginTop: -5,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: RFValue(13),
    fontFamily: FONTS.medium,
    color: '#1e293b',
    borderWidth: 0,
    padding: 0,
    ...(Platform.select({
      web: { outlineStyle: 'none' }
    }) as any),
  },
  listOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  listFlag: {
    width: 34,
    height: 24,
    borderRadius: 4,
    marginRight: 15,
  },
  operatorBullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginRight: 15,
  },
  listText: {
    fontSize: RFValue(13),
    fontFamily: FONTS.medium,
    color: '#475569',
  },
  planTile: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  planTileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  planTitleText: {
    fontSize: RFValue(13),
    fontFamily: FONTS.bold,
    color: '#1e293b',
    flex: 1,
  },
  priceTag: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  priceText: {
    fontSize: RFValue(12),
    fontFamily: FONTS.bold,
    color: '#16a34a',
  },
  planDescText: {
    fontSize: RFValue(11),
    fontFamily: FONTS.regular,
    color: '#64748b',
    lineHeight: 16,
  },
  summaryCard: {
    borderRadius: 24,
    padding: 22,
    marginTop: 10,
    marginBottom: 25,
    ...Platform.select({
      ios: { shadowColor: '#38bdf8', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
      android: { elevation: 8 }
    })
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryTitle: {
    fontSize: RFValue(13),
    fontFamily: FONTS.bold,
    color: '#f8fafc',
    letterSpacing: 0.3,
  },
  summaryContent: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sumLabel: {
    fontSize: RFValue(11),
    fontFamily: FONTS.medium,
    color: '#94a3b8',
  },
  sumValue: {
    fontSize: RFValue(11),
    fontFamily: FONTS.bold,
    color: '#fff',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 4,
  },
  sumTotal: {
    fontSize: RFValue(15),
    fontFamily: FONTS.bold,
    color: '#22d3ee', // Luminous Cyan
    letterSpacing: 0.5,
  },
  payButton: {
    height: 60,
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 10,
  },
  payButtonDisabled: {
    backgroundColor: '#e2e8f0',
    shadowOpacity: 0,
    elevation: 0,
  },
  payButtonText: {
    fontSize: RFValue(15),
    fontFamily: FONTS.bold,
    color: '#fff',
  },
});

export default AirtimeTopup;
