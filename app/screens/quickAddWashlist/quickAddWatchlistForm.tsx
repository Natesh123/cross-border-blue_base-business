import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Switch,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Platform,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { GetQuickWatchList, AddWatchList, UpdateWatchList } from "app/http-services";
import { MetaService } from "app/services/meta.service";
import { LinearGradient } from "expo-linear-gradient";
import COLORS from "app/constants/Colors";
import { FONTS, SIZES } from "app/constants/Assets";

const QuickAddWatchlistForm = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editItem = route.params?.editItem;

  const [searchText, setSearchText] = useState("");
  const [rateAlertEnabled, setRateAlertEnabled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("1 GBP goes Above");
  const [alertAmount, setAlertAmount] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countryList, setCountryList] = useState<any[]>([]);
  const [countryLists, setCountryLists] = useState<any[]>([]);
  const [topRates, setTopRates] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const dropdownOptions = ["1 GBP goes Above", "1 GBP goes Below"];

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const quickResponse = await GetQuickWatchList({});
        const quickData = quickResponse?.data?.Quickwatchdetail || [];
        setTopRates(quickData.length ? quickData.slice(0, 4) : [
          { CountryFlag: "https://service.kashremit.com/CountryFlags/IND.png", ToCountryName: "India", ToCurrency: "INR", ExchangeCheckRate: 99.87 }
        ]);

        MetaService.fetchCountryMetas(
          false,
          true,
          false,
          (countries: any[]) => {
            let list = countries.map((c: any) => ({
              CountryFlag: `https://flagcdn.com/w40/${c.Alpha_2_Code.toLowerCase()}.png`,
              ToCountryName: c.CountryName,
              ToCurrency: c.CurrencyCode,
              ToCountryCode: c.Alpha_3_Code,
              ExchangeCheckRate: 0,
              ISDCode: c.ISDCode,
            }));

            let filteredList = list.filter(
              (c) => !quickData.some((top: { ToCountryCode: any; }) => top.ToCountryCode === c.ToCountryCode)
            );

            if (editItem) {
              const match = list.find(c => c.ToCountryCode === editItem.ToCountryCode);
              if (match && !filteredList.some(c => c.ToCountryCode === match.ToCountryCode)) {
                filteredList = [match, ...filteredList];
                setSelectedCountry(match);
              }
            }

            setCountryList(list);
            setCountryLists(filteredList);

            if (editItem) {
              setRateAlertEnabled(editItem.AlertFlag === "1");
              if (editItem.ExchangeCheckRate && Number(editItem.AmountAbove) > 0) {
                setSelectedOption("1 GBP goes Above");
                setAlertAmount(editItem.AmountAbove.toString());
              } else if (editItem.ExchangeCheckRate && Number(editItem.AmountBelow) > 0) {
                setSelectedOption("1 GBP goes Below");
                setAlertAmount(editItem.AmountBelow.toString());
              } else {
                setAlertAmount(editItem.ExchangeCheckRate?.toString() || "");
              }
              setSearchText(editItem.ToCountryName || "");
            }

            setLoading(false);
          },
          () => { },
          () => setLoading(false)
        );
      } catch (error) {
        console.error("Error fetching QuickWatchlist or countries:", error);
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleAddWatchlist = async () => {
    if (!selectedCountry) {
      Alert.alert("Select Country", "Please select a country first.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        AlertFlag: rateAlertEnabled ? "1" : "0",
        AmountAbove: selectedOption === "1 GBP goes Above" ? alertAmount : "0",
        AmountBelow: selectedOption === "1 GBP goes Below" ? alertAmount : "0",
        ToCountryCode: selectedCountry.ToCountryCode,
        ToCountryName: selectedCountry.ToCountryName,
        ToCurrency: selectedCountry.ToCurrency,
        RemitterID: editItem?.RemitterID || "",
        QuickWatchID: editItem?.QuickWatchID || "",
      };

      let response;
      if (editItem) {
        response = await UpdateWatchList(payload);
      } else {
        response = await AddWatchList(payload);
      }

      if (response?.data?.StatusMsg === "Success") {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response?.data?.StatusMsg,
          position: 'top',
        });
        navigation.goBack();
      } else {
        Alert.alert("Failed", response?.data?.StatusDesc || "Something went wrong.");
      }
    } catch (error) {
      console.log("Watchlist API Error:", error);
      Alert.alert("Error", "Unable to add/update Quick Watchlist.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = countryLists.filter(item =>
    item.ToCountryName.toLowerCase().includes(searchText.toLowerCase()) ||
    item.ToCurrency.toLowerCase().includes(searchText.toLowerCase())
  ).slice(0, 5);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* 🚀 ELITE HEADER */}
      <View style={{ overflow: 'hidden', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <LinearGradient
          colors={['#0369a1', '#0ea5e9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 20, paddingVertical: 24, paddingTop: Platform.OS === 'ios' ? 10 : 20 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.22)', justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}
            >
              <Feather name="arrow-left" size={22} color="#fff" />
            </TouchableOpacity>

            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: SIZES.h2, fontFamily: FONTS.bold, color: "#fff", letterSpacing: 0.5 }}>
                {editItem ? "Edit Watchlist" : "Quick Add Watchlist"}
              </Text>
              <Text style={{ fontSize: 11, fontFamily: FONTS.medium, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>Manage your global currency pairs</Text>
            </View>

            <TouchableOpacity
              onPress={() => setCountryDropdownOpen(true)}
              style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}
            >
              <Text style={{ fontSize: 13 }}>🇬🇧</Text>
              <Text style={{ marginLeft: 8, fontFamily: FONTS.bold, color: "#fff", fontSize: 12 }}>GBP</Text>
              <Feather name="chevron-down" size={14} color="#fff" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>

          {/* 📊 MARKET INSIGHTS TICKER */}
          <View style={{ marginBottom: 28 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <View style={{ width: 3, height: 14, backgroundColor: COLORS.primary, borderRadius: 2, marginRight: 8 }} />
              <Text style={{ fontSize: 12, fontFamily: FONTS.bold, color: "#64748b", textTransform: 'uppercase', letterSpacing: 1 }}>Live Market Pulse</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {loading && topRates.length === 0 ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                topRates.map((item, index) => (
                  <View key={index} style={{
                    backgroundColor: "#fff",
                    borderRadius: 20,
                    padding: 14,
                    marginRight: 14,
                    borderWidth: 1,
                    borderColor: "#f1f5f9",
                    flexDirection: "row",
                    alignItems: "center",
                    minWidth: 120,
                    ...Platform.select({ ios: { shadowColor: "#0f172a", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8 }, android: { elevation: 2 } })
                  }}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' }}>
                      <Image source={{ uri: item.CountryFlag }} style={{ width: '100%', height: '100%' }} />
                    </View>
                    <View style={{ marginLeft: 10 }}>
                      <Text style={{ fontSize: 10, fontFamily: FONTS.bold, color: "#94a3b8" }}>{item.ToCurrency}</Text>
                      <Text style={{ fontSize: 14, fontFamily: FONTS.bold, color: "#1e293b" }}>{item.ExchangeCheckRate}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>

          {/* 🎯 SELECTION SECTION */}
          <View style={{ marginBottom: 28 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <View style={{ width: 3, height: 14, backgroundColor: COLORS.primary, borderRadius: 2, marginRight: 8 }} />
              <Text style={{ fontSize: 12, fontFamily: FONTS.bold, color: "#64748b", textTransform: 'uppercase', letterSpacing: 1 }}>Target Currency</Text>
            </View>

            {/* Search Input Enhanced */}
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff",
              borderRadius: 20,
              paddingHorizontal: 18,
              height: 58,
              borderWidth: 1.5,
              borderColor: isSearchFocused ? COLORS.primary : "#f1f5f9",
              ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.03, shadowRadius: 15 }, android: { elevation: 2 } })
            }}>
              <Feather name="search" size={20} color={isSearchFocused ? COLORS.primary : "#94a3b8"} />
              <TextInput
                style={{
                  flex: 1,
                  marginLeft: 14,
                  fontSize: SIZES.font,
                  fontFamily: FONTS.medium,
                  color: "#1e293b",
                  height: '100%',
                  borderWidth: 0,
                  ...(Platform.select({ web: { outlineStyle: "none" } }) || {}),
                }}
                placeholder="Search country or currency code..."
                placeholderTextColor="#cbd5e1"
                value={searchText}
                onChangeText={setSearchText}
                editable={!editItem}
                onFocus={() => setIsSearchFocused(true)}
              />
              {searchText.length > 0 && !editItem && (
                <TouchableOpacity onPress={() => setSearchText("")}>
                  <Ionicons name="close-circle" size={18} color="#cbd5e1" />
                </TouchableOpacity>
              )}
            </View>

            {/* Results Popover-style */}
            {!editItem && isSearchFocused && filteredCountries.length > 0 && (
              <View style={{
                marginTop: 8,
                backgroundColor: '#fff',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#f1f5f9',
                padding: 8,
                ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 20 }, android: { elevation: 6 } })
              }}>
                {filteredCountries.map((item, index) => {
                  const isSelected = selectedCountry?.ToCountryCode === item.ToCountryCode;
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setSelectedCountry(item);
                        setIsSearchFocused(false);
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 14,
                        borderRadius: 14,
                        backgroundColor: isSelected ? "#f0f9ff" : "transparent",
                        marginBottom: index === filteredCountries.length - 1 ? 0 : 4,
                      }}
                    >
                      <Image source={{ uri: item.CountryFlag }} style={{ width: 34, height: 34, borderRadius: 17, marginRight: 14 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: SIZES.font, fontFamily: FONTS.bold, color: "#1e293b" }}>{item.ToCountryName}</Text>
                        <Text style={{ fontSize: 11, fontFamily: FONTS.medium, color: "#94a3b8" }}>{item.ToCurrency}</Text>
                      </View>
                      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: isSelected ? COLORS.primary : "#f1f5f9", justifyContent: "center", alignItems: "center" }}>
                        <Feather name={isSelected ? "check" : "plus"} size={14} color={isSelected ? "#fff" : "#94a3b8"} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* 💎 SELECTED PREVIEW CARD */}
          {selectedCountry && (
            <View style={{ marginBottom: 28 }}>
              <LinearGradient
                colors={['#fff', '#f0f9ff']}
                style={{
                  borderRadius: 24,
                  padding: 20,
                  borderWidth: 1.5,
                  borderColor: COLORS.primary + '20',
                  ...Platform.select({ ios: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 16 }, android: { elevation: 4 } })
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={{ fontSize: 13, fontFamily: FONTS.bold, color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Conversion Preview</Text>
                  <View style={{ backgroundColor: COLORS.primary + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ fontSize: 10, fontFamily: FONTS.bold, color: COLORS.primary }}>ACTIVE</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18 }}>
                  <View style={{ alignItems: 'center' }}>
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' }}>
                      <Text style={{ fontSize: 18 }}>🇬🇧</Text>
                    </View>
                    <Text style={{ fontSize: 12, fontFamily: FONTS.bold, color: "#1e293b", marginTop: 6 }}>GBP</Text>
                  </View>

                  <View style={{ flex: 1, height: 1.5, backgroundColor: COLORS.primary + '20', marginHorizontal: 15, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' }}>
                      <Feather name="refresh-cw" size={14} color="#fff" />
                    </View>
                  </View>

                  <View style={{ alignItems: 'center' }}>
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden' }}>
                      <Image source={{ uri: selectedCountry.CountryFlag }} style={{ width: '100%', height: '100%' }} />
                    </View>
                    <Text style={{ fontSize: 12, fontFamily: FONTS.bold, color: "#1e293b", marginTop: 6 }}>{selectedCountry.ToCurrency}</Text>
                  </View>
                </View>

                <View style={{ marginTop: 20, padding: 12, backgroundColor: '#fff', borderRadius: 16, borderLeftWidth: 4, borderLeftColor: COLORS.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontFamily: FONTS.medium, color: "#64748b" }}>Live Exchange Rate</Text>
                  <Text style={{ fontSize: 18, fontFamily: FONTS.bold, color: "#1e293b" }}>1 : {selectedCountry.ExchangeCheckRate || "---"}</Text>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* 🔔 NOTIFICATIONS CARD */}
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <View style={{ width: 3, height: 14, backgroundColor: COLORS.primary, borderRadius: 2, marginRight: 8 }} />
              <Text style={{ fontSize: 12, fontFamily: FONTS.bold, color: "#64748b", textTransform: 'uppercase', letterSpacing: 1 }}>Rate Notifications</Text>
            </View>

            <View style={{
              backgroundColor: "#fff",
              borderRadius: 24,
              padding: 24,
              borderWidth: 1,
              borderColor: "#f1f5f9",
              ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 12 }, android: { elevation: 3 } })
            }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <View style={{ flex: 1, marginRight: 20 }}>
                  <Text style={{ fontSize: SIZES.font, fontFamily: FONTS.bold, color: "#1e293b" }}>Automated Alerts</Text>
                  <Text style={{ fontSize: 11, fontFamily: FONTS.medium, color: "#94a3b8", marginTop: 4 }}>Notify me when the rate crosses a threshold</Text>
                </View>
                <Switch
                  value={rateAlertEnabled}
                  onValueChange={setRateAlertEnabled}
                  thumbColor={rateAlertEnabled ? "#fff" : "#f4f4f5"}
                  trackColor={{ false: "#e2e8f0", true: COLORS.primary }}
                  ios_backgroundColor="#e2e8f0"
                />
              </View>

              <View style={{ opacity: rateAlertEnabled ? 1 : 0.4 }}>
                <View style={{ flexDirection: "row", gap: 15 }}>
                  <View style={{ flex: 1.4 }}>
                    <Text style={{ fontSize: 10, fontFamily: FONTS.bold, color: "#94a3b8", marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Condition</Text>
                    <View style={{
                      flexDirection: 'row',
                      backgroundColor: "#f1f5f9",
                      borderRadius: 14,
                      padding: 4,
                      height: 52
                    }}>
                      {["Above", "Below"].map((opt) => {
                        const isSelected = (opt === "Above" && selectedOption.includes("Above")) ||
                          (opt === "Below" && selectedOption.includes("Below"));
                        return (
                          <TouchableOpacity
                            key={opt}
                            disabled={!rateAlertEnabled}
                            onPress={() => setSelectedOption(`1 GBP goes ${opt}`)}
                            style={{
                              flex: 1,
                              backgroundColor: isSelected ? "#fff" : "transparent",
                              borderRadius: 10,
                              justifyContent: 'center',
                              alignItems: 'center',
                              flexDirection: 'row',
                              ...Platform.select({
                                ios: isSelected ? {
                                  shadowColor: "#000",
                                  shadowOffset: { width: 0, height: 2 },
                                  shadowOpacity: 0.1,
                                  shadowRadius: 4
                                } : {},
                                android: isSelected ? { elevation: 2 } : {}
                              })
                            }}
                          >
                            <Feather
                              name={opt === "Above" ? "trending-up" : "trending-down"}
                              size={14}
                              color={isSelected ? COLORS.primary : "#94a3b8"}
                              style={{ marginRight: 6 }}
                            />
                            <Text style={{
                              fontSize: 13,
                              fontFamily: isSelected ? FONTS.bold : FONTS.medium,
                              color: isSelected ? "#1e293b" : "#64748b"
                            }}>
                              {opt}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, fontFamily: FONTS.bold, color: "#94a3b8", marginBottom: 8, textTransform: 'uppercase' }}>Target Rate</Text>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: 1.5,
                      borderColor: "#f1f5f9",
                      borderRadius: 16,
                      paddingHorizontal: 16,
                      height: 52,
                      backgroundColor: "#f8fafc"
                    }}>
                      <TextInput
                        value={alertAmount}
                        onChangeText={setAlertAmount}
                        editable={rateAlertEnabled}
                        placeholder={selectedCountry?.ExchangeCheckRate?.toString() || "0.00"}
                        style={{
                          flex: 1,
                          fontSize: 15,
                          fontFamily: FONTS.bold,
                          color: COLORS.primary,
                          ...(Platform.select({ web: { outlineStyle: "none" } }) || {}),
                        }}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 🏁 FLOATING ACTION FOOTER */}
      <View style={{
        padding: 20,
        backgroundColor: "rgba(255,255,255,0.9)",
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20
      }}>
        <TouchableOpacity
          onPress={handleAddWatchlist}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#0ea5e9', '#0284c7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              height: 60,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: 'row',
              ...Platform.select({ ios: { shadowColor: "#0284c7", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15 }, android: { elevation: 6 } })
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  <Feather name={editItem ? "edit-3" : "plus"} size={18} color="#fff" />
                </View>
                <Text style={{ color: "#fff", fontFamily: FONTS.bold, fontSize: SIZES.h1, letterSpacing: 0.5 }}>
                  {editItem ? "Update Watchlist" : "Add to Watchlist"}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* SRC Country Switch Modal (Shared with main screen) */}
      <Modal
        visible={countryDropdownOpen}
        transparent
        animationType="slide"
      >
        <View style={{ flex: 1, backgroundColor: "rgba(15, 23, 42, 0.4)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: "80%", paddingBottom: 40 }}>
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <View style={{ width: 40, height: 5, backgroundColor: '#e2e8f0', borderRadius: 2.5 }} />
            </View>

            <View style={{ paddingHorizontal: 24, paddingBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontFamily: FONTS.bold, color: "#1e293b" }}>Source Currency</Text>
              <TouchableOpacity onPress={() => setCountryDropdownOpen(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={countryList}
              keyExtractor={(item) => item.ToCountryCode}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              renderItem={({ item }) => {
                const isSelected = item.ToCountryCode === "GBR"; // Mock for now
                return (
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 16,
                      borderRadius: 18,
                      marginBottom: 8,
                      backgroundColor: isSelected ? "#f0f9ff" : "#f8fafc",
                      borderWidth: 1,
                      borderColor: isSelected ? COLORS.primary + '30' : 'transparent'
                    }}
                    onPress={() => {
                      setSelectedCountry(item);
                      setCountryDropdownOpen(false);
                    }}
                  >
                    <View style={{ width: 44, height: 44, borderRadius: 22, overflow: 'hidden', borderWidth: 2, borderColor: '#fff' }}>
                      <Image source={{ uri: item.CountryFlag }} style={{ width: '100%', height: '100%' }} />
                    </View>
                    <View style={{ marginLeft: 16, flex: 1 }}>
                      <Text style={{ fontSize: 15, fontFamily: FONTS.bold, color: "#1e293b" }}>{item.ToCountryName}</Text>
                      <Text style={{ fontSize: 13, fontFamily: FONTS.medium, color: "#94a3b8" }}>{item.ToCurrency}</Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default QuickAddWatchlistForm;


