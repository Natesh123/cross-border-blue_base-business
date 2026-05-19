import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  StatusBar,
  Dimensions,
  Platform,
  SafeAreaView,
} from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useRecoilValue } from "recoil";
import { ProfileState } from "app/atoms";
import { GetReceiverInfoLists } from "app/http-services";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS, SIZES } from "app/constants/Assets";
import COLORS from "app/constants/Colors";
import Vector from "app/assets/vectors";
import { RFValue } from "react-native-responsive-fontsize";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get('window');

const AirtimeTopupList: React.FC = () => {
  const currentToken = useRecoilValue(ProfileState);
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(false);
  const [recipientList, setRecipientList] = useState<any[]>([]);
  const [filteredRecipientList, setFilteredRecipientList] = useState<any[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  const fetchReceiverList = async (tokenId: string) => {
    try {
      setLoading(true);
      const response = await GetReceiverInfoLists(tokenId);

      if (response.status === 200) {
        const _data = response?.data?.ReceiverDetails;

        if (Array.isArray(_data) && _data.length > 0) {
          const grouped: Record<string, any[]> = _data.reduce((acc, curr) => {
            const groupKey = curr.Country || curr.CountryCode || "Others";
            if (!acc[groupKey]) acc[groupKey] = [];
            acc[groupKey].push(curr);
            return acc;
          }, {} as Record<string, any[]>);

          Object.keys(grouped).forEach((key) => {
            grouped[key].sort((a, b) => {
              const nameA = `${a.FirstName || ""} ${a.LastName || ""}`.toLowerCase();
              const nameB = `${b.FirstName || ""} ${b.LastName || ""}`.toLowerCase();
              return nameA.localeCompare(nameB);
            });
          });

          const sortedList = Object.keys(grouped)
            .sort((a, b) => a.localeCompare(b))
            .map((country) => ({
              country,
              recipients: grouped[country],
            }));

          setRecipientList(sortedList);
          setFilteredRecipientList(sortedList);
        } else {
          setRecipientList([]);
          setFilteredRecipientList([]);
        }
      }
    } catch (err) {
      console.error("Fetch recipients error:", err);
      setRecipientList([]);
      setFilteredRecipientList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceiverList(currentToken.tokenId);
  }, [isFocused]);

  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredRecipientList(recipientList);
      return;
    }

    const lower = searchText.toLowerCase();
    const filtered = recipientList
      .map((group) => {
        const filteredRecipients = group.recipients.filter((item: any) => {
          const fullName = `${item.FirstName || ""} ${item.LastName || ""}`.toLowerCase();
          const mobile = (item.MobileNumber || "").toLowerCase();
          const country = (group.country || "").toLowerCase();
          return (
            fullName.includes(lower) ||
            mobile.includes(lower) ||
            country.includes(lower)
          );
        });

        return {
          ...group,
          recipients: filteredRecipients,
        };
      })
      .filter((group) => group.recipients.length > 0);

    setFilteredRecipientList(filtered);
  }, [searchText, recipientList]);

  const handleProceed = async () => {
    if (!selectedRecipientId) return;

    let selectedRecipient: any = null;

    for (const group of recipientList) {
      const match = group.recipients.find(
        (r: { ReceiverID: string }) => r.ReceiverID === selectedRecipientId
      );
      if (match) {
        selectedRecipient = match;
        break;
      }
    }

    if (!selectedRecipient) return;

    let selectedPackage = null;
    try {
      const storedPackage = await AsyncStorage.getItem("selectedPackage");
      selectedPackage = storedPackage ? JSON.parse(storedPackage) : null;
    } catch (err) {
      console.error("Error fetching selectedPackage:", err);
    }

    try {
      await AsyncStorage.setItem(
        "selectedRecipient",
        JSON.stringify({ ...selectedRecipient, selectedPackage })
      );
    } catch (err) {
      console.error("Error saving recipient:", err);
    }

    navigation.navigate("AirtimeTopupPay");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ELITE HERO HEADER */}
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
              <Text style={styles.headerTitle}>Select Recipient</Text>
              <Text style={styles.headerSub}>Airtime Top-up</Text>
            </View>
            <TouchableOpacity
              style={styles.headerAddBtn}
              onPress={() => navigation.navigate("AirtimeTopupForm")}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.headerAddGradient}
              >
                <Feather name="user-plus" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </LinearGradient>

      {/* Search Bar - Simplified to remove all possible borders */}
      <View style={styles.searchContainerBelow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={18} color="#94A3B8" />
          <TextInput
            style={{
              flex: 1,
              marginLeft: 12,
              fontFamily: FONTS.medium,
              fontSize: 14,

            }}
            placeholder="Search by name, mobile or country"
            placeholderTextColor="#94A3B8"
            value={searchText}
            onChangeText={setSearchText}
            underlineColorAndroid="transparent"
            {...(Platform.OS === 'web' && { outlineWidth: 0, outlineStyle: 'none' } as any)}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Fetching recipients...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.listTitle}>MY RECIPIENTS LIST</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {filteredRecipientList.reduce((acc, g) => acc + g.recipients.length, 0)}
                </Text>
              </View>
            </View>

            {filteredRecipientList.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="account-search-outline" size={64} color="#CBD5E1" />
                <Text style={styles.emptyText}>No recipients found</Text>
                <TouchableOpacity
                  style={styles.addNewBtn}
                  onPress={() => navigation.navigate("AirtimeTopupForm")}
                >
                  <Text style={styles.addNewBtnText}>Add New Recipient</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredRecipientList.map((group) => (
                <View key={group.country} style={styles.countryGroup}>
                  {group.recipients.map((item: any) => {
                    const fullName = `${item.FirstName || ""} ${item.LastName || ""}`.trim();
                    const isSelected = selectedRecipientId === item.ReceiverID;
                    return (
                      <TouchableOpacity
                        key={item.ReceiverID}
                        style={[
                          styles.recipientCard,
                          isSelected && styles.recipientCardSelected,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => setSelectedRecipientId(item.ReceiverID)}
                      >
                        <View style={styles.cardMain}>
                          <View style={styles.flagContainer}>
                            <Image
                              source={{ uri: item.CountryFlag }}
                              style={styles.flag}
                              resizeMode="cover"
                            />
                          </View>

                          <View style={styles.nameBox}>
                            <Text style={[styles.nameText, isSelected && { color: COLORS.primary }]}>{fullName}</Text>
                            <View style={styles.mobileRow}>
                              <Feather name="phone" size={10} color="#94A3B8" />
                              <Text style={styles.mobileText}>{item.MobileNumber || "No mobile"}</Text>
                            </View>
                          </View>

                          <View style={[styles.radioBox, isSelected && styles.radioBoxSelected]}>
                            {isSelected && (
                              <View style={styles.radioInner} />
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))
            )}
          </ScrollView>

          {/* Proceed Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.proceedButton,
                !selectedRecipientId && styles.proceedButtonDisabled,
              ]}
              disabled={!selectedRecipientId}
              onPress={handleProceed}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={selectedRecipientId ? ['#0369a1', '#0ea5e9'] : ['#E2E8F0', '#E2E8F0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.proceedGradient}
              >
                <Text style={[styles.proceedText, !selectedRecipientId && { color: '#94A3B8' }]}>Proceed</Text>
                {selectedRecipientId && (
                  <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAF8",
  },
  headerWrapper: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 12,
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
    marginBottom: 5,
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
    flex: 1,
  },
  headerTitle: {
    fontSize: RFValue(14),
    fontFamily: FONTS.bold,
    color: '#fff',
  },
  headerSub: {
    fontSize: RFValue(10),
    color: 'rgba(255,255,255,0.8)',
    fontFamily: FONTS.medium,
    marginTop: 1,
  },
  headerAddBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  headerAddGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  searchContainerBelow: {
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    zIndex: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 0,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: FONTS.medium,
    fontSize: 14,

    padding: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  listTitle: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: '#94A3B8',
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: '#0EA5E9',
  },
  countryGroup: {
    marginBottom: 10,
  },
  recipientCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  recipientCardSelected: {
    borderColor: '#BAE6FD',
    backgroundColor: '#F0F9FF',
  },
  cardMain: {
    flexDirection: "row",
    alignItems: "center",
  },
  flagContainer: {
    width: 44,
    height: 32,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  flag: {
    width: '100%',
    height: '100%',
  },
  nameBox: {
    flex: 1,
    marginLeft: 14,
  },
  nameText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: "#1E293B",
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  mobileText: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: FONTS.medium,
  },
  radioBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioBoxSelected: {
    borderColor: '#0EA5E9',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0EA5E9',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(248, 250, 248, 0.95)',
  },
  proceedButton: {
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  proceedButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  proceedGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontFamily: FONTS.medium,
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    padding: 20,
  },
  emptyText: {
    marginTop: 15,
    fontFamily: FONTS.bold,
    color: '#64748B',
    fontSize: 16,
  },
  addNewBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0EA5E9',
  },
  addNewBtnText: {
    fontFamily: FONTS.bold,
    color: '#fff',
    fontSize: 14,
  },
});

export default AirtimeTopupList;

