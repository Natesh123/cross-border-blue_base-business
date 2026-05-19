import React, { useEffect, useState } from "react";
import { Image, Platform, ScrollView, RefreshControl, Text, TextInput, useWindowDimensions, TouchableOpacity, View, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "app/styles";
import HomeHeader from "app/components/HomeHeader";
import Container from "app/theme/Container";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useRecoilValue } from "recoil";
import { ProfileState } from "app/atoms";
import Vector from "app/assets/vectors";
import { theme } from "app/core/theme";
import Button from "app/components/controls/Button";
import { FONTS, SIZES } from "app/constants/Assets";
import { GetPurposeOfTransaction, GetReceiverInfoList, GetReferDetails } from "app/http-services";
import RecipientItem from "app/screens/recipients/components/items/RecipientItem";
import SendMoneyHeader from "app/components/SendMoneyHeader";
import RecipientHeader from "app/components/RecipientHeader";
import { Ionicons } from "@expo/vector-icons";
import ModalPicker from "app/components/customComponents/ModalPicker";
import { LinearGradient } from "expo-linear-gradient";

const Recipients = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();
  const currentToken = useRecoilValue(ProfileState);

  const [currency, setCurrency] = useState("£");
  const [search, setSearch] = useState({ value: "", error: "" });
  const [loading, setLoading] = useState(false);
  const [reward, setReward] = useState("");
  const [recipientList, setRecipientList] = useState<any>({});
  const [filteredRecipients, setFilteredRecipients] = useState<any>({});
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [purposeList, setPurposeList] = useState<any[]>([]);

  useEffect(() => {
    const _currency = (typeof process !== 'undefined' && process.env && process.env.CURRENCY_SYMBOL) || "£";
    setCurrency(_currency);
    fetchPurposeOfTransaction(currentToken.tokenId, currentToken.remitterId);
    fetchReceiverList(currentToken.tokenId, currentToken.remitterId);
    fetchReferDetails(currentToken.tokenId, currentToken.remitterId);
  }, [isFocused]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReceiverList(currentToken.tokenId, currentToken.remitterId).finally(() =>
      setRefreshing(false)
    );
  };

  const fetchPurposeOfTransaction = async (tokenId: string, remitterId: string) => {
    try {
      setLoading(true);
      const response = await GetPurposeOfTransaction(tokenId);
      console.log("Response :", response);

      if (response.status === 200 && response.data.POT) {
        const formattedList = response.data.POT
          .filter((item: any) => item.Value_POT !== "0")
          .map((item: any) => ({
            dataValue: item.Value_POT,
            displayvalue: item.Text_POT,
          }));

        setPurposeList(formattedList);
      }
    } catch (err) {
      console.error("Error fetching Purposeoftransaction list:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReceiverList = async (tokenId: string, remitterId: string) => {
    try {
      setLoading(true);
      const response = await GetReceiverInfoList(tokenId);
      if (response.status === 200) {
        const _data = response?.data?.ReceiverDetails;

        // ✅ Ensure _data is an array
        if (Array.isArray(_data) && _data.length > 0) {
          const _recipients = _data.reduce((acc: any, curr: any) => {
            if (curr.Country) {
              const { Country } = curr;
              const currentItems = acc[Country];
              return {
                ...acc,
                [Country]: currentItems ? [...currentItems, curr] : [curr],
              };
            }
            return acc;
          }, {});

          setRecipientList(_recipients);
          setFilteredRecipients(_recipients);
        } else {
          // No data or invalid data
          setRecipientList({});
          setFilteredRecipients({});
        }
      }
    } catch (err) {
      console.error("Fetch recipients details:", err);
      setRecipientList({});
      setFilteredRecipients({});
    } finally {
      setLoading(false);
    }
  };


  const fetchReferDetails = async (tokenId: string, remitterId: string) => {
    try {
      setLoading(true);
      const response = await GetReferDetails(tokenId);
      if (response.status === 200) {
        setReward(response?.data?.Refer?.PotentialEarning);
      }
    } catch (err) {
      console.error("Error refer details:", err);
    } finally {
      setLoading(false);
    }
  };

  const flattenRecipients = (list: any) => {
    return Object.values(list).flat();
  };

  const onSearchRecipients = (text: string) => {
    setSearch({ value: text, error: "" });
    if (!text.trim()) {
      setFilteredRecipients(recipientList);
      return;
    }
    const searchTerm = text.toLowerCase();
    const filtered = Object.keys(recipientList).reduce((acc: any, country) => {
      const filteredCountryRecipients = recipientList[country]?.filter((recipient: any) =>
        `${recipient.FirstName || ""} ${recipient.LastName || ""} ${recipient.ReceiverName || ""}`.toLowerCase().includes(searchTerm)
      );
      if (filteredCountryRecipients.length > 0) {
        acc[country] = filteredCountryRecipients;
      }
      return acc;
    }, {});
    setFilteredRecipients(filtered);
  };

  const onAddRecipient = () => {
    navigation.navigate("AddRecipient");
  };

  const dropdownStyles = {
    label: {
      fontSize: 12,
      color: "#6b6b6b",
      marginBottom: 6,
      marginLeft: 4,
      flex: 0.4
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: "#e2e6eb",
      borderRadius: 10,
      backgroundColor: "#fff",
      paddingHorizontal: 10,
      height: 50,
      justifyContent: "center",
      marginHorizontal: 20,
      marginTop: 10,
    },
    picker: {
      width: "100%",
      color: "#000",
    },
  };



  return (
    <SafeAreaView style={styles.container}>
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
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={localStyles.headerTextContent}>
            <Text style={localStyles.headerTitle}>Select Recipient</Text>
            <Text style={localStyles.headerSubtitle}>Transfer funds securely worldwide</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={localStyles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={localStyles.mainWrapper}>
          {/* Hero Section */}
          <View style={localStyles.heroSection}>
            <Text style={localStyles.heroTitle}>Who are you sending money to?</Text>
            <Text style={localStyles.heroSubtitle}>
              Select an existing recipient from your list below or add a new one to get started.
            </Text>
          </View>

          {/* Transfer Purpose Card */}
          <View style={localStyles.purposeCard}>
            <View style={localStyles.cardHeader}>
              <View style={localStyles.iconCircle}>
                <Ionicons name="document-text" size={16} color="#0EA5E9" />
              </View>
              <Text style={localStyles.cardLabel}>Purpose of Transaction</Text>
            </View>
            <View style={localStyles.pickerSurface}>
              <ModalPicker
                required={true}
                dataList={purposeList}
                selectedValue={selectedPurpose}
                onValueChange={(value) => setSelectedPurpose(value)}
                placeholder="Select Purpose"
              />
            </View>
          </View>

          {/* Search & Add Row */}
          <View style={localStyles.actionRow}>
            <View style={localStyles.searchBar}>
              <Ionicons name="search" size={18} color="#94a3b8" style={{ marginRight: 8 }} />
              <TextInput
                style={localStyles.searchInput}
                placeholder="Search Recipients..."
                placeholderTextColor="#94a3b8"
                value={search.value}
                onChangeText={(text) => onSearchRecipients(text)}
              />
            </View>

            <TouchableOpacity
              style={localStyles.addButton}
              onPress={onAddRecipient}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#0f172a', '#1e293b']}
                style={localStyles.addButtonInner}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={localStyles.addButtonText}>New</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Recipients List Component */}
          <View style={localStyles.listSection}>
            <RecipientItem
              title="India"
              items={flattenRecipients(filteredRecipients)}
              selectedPurpose={selectedPurpose}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
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
    fontSize: SIZES.p20,
    fontWeight: '900',
    color: '#fff',
    fontFamily: FONTS.bold,
  },
  headerSubtitle: {
    fontSize: SIZES.p12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: FONTS.regular,
    marginTop: 1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  mainWrapper: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  heroSection: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: SIZES.p18,
    fontWeight: '900',
    color: '#0f172a',
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: SIZES.p12,
    color: '#64748b',
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  purposeCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: SIZES.p13,
    fontWeight: '700',
    color: '#64748b',
    fontFamily: FONTS.bold,
  },
  pickerSurface: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.p14,
    fontFamily: FONTS.regular,
    color: '#0f172a',
    fontWeight: '500',
  },
  addButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    gap: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: SIZES.p14,
    fontWeight: '700',
    fontFamily: FONTS.bold,
  },
  listSection: {
    flex: 1,
  },
});

export default Recipients;

