import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TextInput,
  useWindowDimensions,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  FlatList,
  Image,
  SectionList,
  Alert,
  Modal,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useRecoilValue } from "recoil";
import { ProfileState } from "app/atoms";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { GetReceiverInfoList, GetReferDetails, DeleteBeneficiary } from "app/http-services";
import COLORS from "app/constants/Colors";
import { FONTS, SIZES } from "app/constants/Assets";
import { RFValue } from "react-native-responsive-fontsize";
import Vector from "app/assets/vectors";
import CountryFlag from "react-native-country-flag";
import Toast from "react-native-toast-message";
import { Menu, MenuOption, MenuOptions, MenuTrigger } from "react-native-popup-menu";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getCountryISO2 = require("country-iso-3-to-2");

const Recipients = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();
  const currentToken = useRecoilValue(ProfileState);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [reward, setReward] = useState("");
  const [recipientList, setRecipientList] = useState<any[]>([]);
  const [filteredRecipients, setFilteredRecipients] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [recipientToDelete, setRecipientToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchReceiverList();
    fetchReferDetails();
  }, [isFocused]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReceiverList().finally(() => setRefreshing(false));
  };

  const fetchReceiverList = async () => {
    try {
      setLoading(true);
      const response = await GetReceiverInfoList(currentToken.tokenId || "");
      if (response.status === 200) {
        const _data = response?.data?.ReceiverDetails;
        if (Array.isArray(_data)) {
          const grouped = groupRecipients(_data);
          setRecipientList(_data);
          setFilteredRecipients(grouped);
        }
      }
    } catch (err) {
      console.error("Fetch recipients error:", err);
    } finally {
      setLoading(false);
    }
  };

  const groupRecipients = (data: any[]) => {
    const groupedMap: Record<string, any[]> = data.reduce((acc, curr) => {
      const groupKey = curr.Country || curr.CountryCode || "Others";
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(curr);
      return acc;
    }, {} as Record<string, any[]>);

    return Object.keys(groupedMap)
      .sort((a, b) => a.localeCompare(b))
      .map((country) => ({
        title: country,
        data: groupedMap[country],
        isoCode: groupedMap[country][0]?.CountryCode || ""
      }));
  };

  const fetchReferDetails = async () => {
    try {
      const response = await GetReferDetails(currentToken.tokenId || "");
      if (response.status === 200) {
        setReward(response?.data?.Refer?.PotentialEarning);
      }
    } catch (err) {
      console.error("Error refer details:", err);
    }
  };

  const handleSearch = (text: string) => {
    const safeText = text || "";
    setSearch(safeText);
    if (!safeText.trim()) {
      const grouped = groupRecipients(recipientList);
      setFilteredRecipients(grouped);
      return;
    }
    const lowerSearch = safeText.toLowerCase();
    const filtered = recipientList.filter((r) =>
      `${r.FirstName || ""} ${r.LastName || ""} ${r.ReceiverName || ""} ${r.Country || ""}`.toLowerCase().includes(lowerSearch)
    );
    const grouped = groupRecipients(filtered);
    setFilteredRecipients(grouped);
  };

  const handleDelete = (recipient: any) => {
    setRecipientToDelete(recipient);
    setDeleteModalVisible(true);
  };

  const performDelete = async () => {
    if (!recipientToDelete) return;

    try {
      setIsDeleting(true);
      const res = await DeleteBeneficiary({
        ReceiverID: recipientToDelete.ReceiverID,
        remitterId: currentToken.remitterId,
        tokenId: currentToken.tokenId || "",
      });
      if (res.status === 200) {
        setDeleteModalVisible(false);
        Toast.show({ type: "success", text1: "Recipient Removed" });
        fetchReceiverList();
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Remove Failed" });
    } finally {
      setIsDeleting(false);
      setRecipientToDelete(null);
    }
  };

  const handleSendMoney = async (recipient: any) => {
    await AsyncStorage.setItem('selectedRecipientCurrency', recipient?.CountryCode || '');
    navigation.navigate("SendMoney", { editData: recipient });
  };

  const renderRecipientCard = ({ item }: { item: any }) => {
    const isSelected = selectedRecipientId === item.ReceiverID;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setSelectedRecipientId(item.ReceiverID)}
        style={[styles.recipientCard, isSelected && styles.recipientCardSelected]}
      >
        <View style={styles.cardLeft}>
          <View style={styles.flagWrapper}>
            <CountryFlag
              isoCode={getCountryISO2(item.CountryCode) || ""}
              size={28}
              style={styles.flagIcon}
            />
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.recipientName}>{item.FirstName} {item.LastName}</Text>
            <Text style={styles.recipientMeta}>{item.RecieverMobileNo || "No number"}</Text>
          </View>
        </View>

        <View style={styles.cardRight}>
          <View style={[styles.selectionCircle, isSelected && styles.selectionCircleActive]}>
            {isSelected && <View style={styles.selectionDot} />}
          </View>

          <Menu>
            <MenuTrigger style={styles.menuTrigger}>
              <Feather name="more-vertical" size={20} color="#94a3b8" />
            </MenuTrigger>
            <MenuOptions customStyles={menuStyles}>
              <MenuOption onSelect={() => handleSendMoney(item)}>
                <View style={styles.menuItem}>
                  <Feather name="send" size={16} color={COLORS.primary} />
                  <Text style={styles.menuText}>Send Money</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => navigation.navigate("AddRecipients", { editData: item })}>
                <View style={styles.menuItem}>
                  <Feather name="edit-2" size={16} color="#6366f1" />
                  <Text style={styles.menuText}>Edit Details</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => handleDelete(item)}>
                <View style={styles.menuItem}>
                  <Feather name="trash-2" size={16} color={COLORS.red} />
                  <Text style={styles.menuText}>Remove</Text>
                </View>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>
      </TouchableOpacity>
    );
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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backCircle}>
              <Vector as="ionicons" name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.titleBox}>
              <Text style={styles.headerTitle}>Recipients</Text>
              <Text style={styles.headerSub}>Select or add a money transfer recipient</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.actionRow}>
        <View style={styles.searchWrapper}>
          <Feather name="search" size={18} color="#94a3b8" />
          <TextInput
            placeholder="Search by name or country"
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={handleSearch}
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("AddRecipients")}
          style={styles.addNewBtn}
        >
          <LinearGradient
            colors={[COLORS.primary, '#0369a1']}
            style={styles.addBtnGradient}
          >
            <Feather name="plus" size={18} color="#fff" />
            <Text style={styles.addBtnText}>NEW</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* HORIZONTAL COUNTRY SELECTOR */}
      <View style={{ marginBottom: 15 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
        >
          <TouchableOpacity
            onPress={() => handleSearch("")}
            style={[
              styles.countryFilterChip,
              search === "" && styles.countryFilterChipActive
            ]}
          >
            <Text style={[
              styles.countryFilterText,
              (search?.toLowerCase() || "") === "" && styles.countryFilterTextActive
            ]}>All Countries</Text>
          </TouchableOpacity>
          {(filteredRecipients || []).map((section) => (
            <TouchableOpacity
              key={section?.title || Math.random().toString()}
              onPress={() => handleSearch(section?.title || "")}
              style={[
                styles.countryFilterChip,
                (search?.toLowerCase() || "") === (section?.title?.toLowerCase() || "") && styles.countryFilterChipActive
              ]}
            >
              <CountryFlag
                isoCode={getCountryISO2(section?.isoCode) || ""}
                size={12}
                style={{ borderRadius: 2, marginRight: 6 }}
              />
              <Text style={[
                styles.countryFilterText,
                (search?.toLowerCase() || "") === (section?.title?.toLowerCase() || "") && styles.countryFilterTextActive
              ]}>{section?.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.listSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>NETWORK RECIPIENTS</Text>
          <View style={styles.headerDot} />
        </View>

        <SectionList
          sections={filteredRecipients}
          keyExtractor={(item) => item.ReceiverID}
          renderItem={({ item, index, section }) => {
            const isFirst = index === 0;
            const isLast = index === section.data.length - 1;
            const isSelected = selectedRecipientId === item.ReceiverID;

            return (
              <View style={[
                styles.recipientRowContainer,
                isFirst && styles.recipientRowFirst,
                isLast && styles.recipientRowLast,
                isSelected && styles.recipientRowSelected
              ]}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSelectedRecipientId(item.ReceiverID)}
                  style={styles.recipientRowInner}
                >
                  <View style={styles.cardLeft}>
                    <View style={styles.avatarWrapper}>
                      <LinearGradient
                        colors={['#F8FAFC', '#F1F5F9']}
                        style={styles.avatarGradient}
                      >
                        <Text style={styles.avatarText}>
                          {item.FirstName?.[0]}{item.LastName?.[0]}
                        </Text>
                      </LinearGradient>
                      <View style={styles.miniFlag}>
                        <CountryFlag
                          isoCode={getCountryISO2(item.CountryCode) || ""}
                          size={10}
                          style={{ borderRadius: 1 }}
                        />
                      </View>
                    </View>
                    <View style={styles.infoBox}>
                      <Text style={styles.recipientName}>{item.FirstName} {item.LastName}</Text>
                      <View style={styles.metaRow}>
                        <Feather name="phone" size={10} color="#94A3B8" style={{ marginRight: 4 }} />
                        <Text style={styles.recipientMeta}>{item.RecieverMobileNo || "No number"}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardRight}>
                    <View style={[styles.selectionCircle, isSelected && styles.selectionCircleActive]}>
                      {isSelected && <View style={styles.selectionDot} />}
                    </View>

                    <Menu>
                      <MenuTrigger style={styles.menuTrigger}>
                        <Feather name="more-horizontal" size={18} color="#94a3b8" />
                      </MenuTrigger>
                      <MenuOptions customStyles={menuStyles}>
                        <MenuOption onSelect={() => handleSendMoney(item)}>
                          <View style={styles.menuItem}>
                            <Feather name="send" size={14} color={COLORS.primary} />
                            <Text style={styles.menuText}>Send Money</Text>
                          </View>
                        </MenuOption>
                        <MenuOption onSelect={() => navigation.navigate("AddRecipients", { editData: item })}>
                          <View style={styles.menuItem}>
                            <Feather name="edit-2" size={14} color="#6366f1" />
                            <Text style={styles.menuText}>Edit Details</Text>
                          </View>
                        </MenuOption>
                        <MenuOption onSelect={() => handleDelete(item)}>
                          <View style={styles.menuItem}>
                            <Feather name="trash-2" size={14} color={COLORS.red} />
                            <Text style={styles.menuText}>Remove</Text>
                          </View>
                        </MenuOption>
                      </MenuOptions>
                    </Menu>
                  </View>
                </TouchableOpacity>
                {!isLast && <View style={styles.rowDivider} />}
              </View>
            );
          }}
          renderSectionHeader={({ section: { title, isoCode, data } }) => (
            <View style={styles.structuredSectionHeader}>
              <View style={styles.headerLabelBox}>
                <View style={[styles.headerIconSmall, { backgroundColor: '#E0F2FE' }]}>
                  <CountryFlag
                    isoCode={getCountryISO2(isoCode) || ""}
                    size={12}
                    style={{ borderRadius: 2 }}
                  />
                </View>
                <Text style={styles.structuredHeaderText}>{title}</Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{data.length}</Text>
              </View>
            </View>
          )}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-search-outline" size={60} color="#e2e8f0" />
              <Text style={styles.emptyText}>No recipients found</Text>
            </View>
          }
        />
      </View>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!selectedRecipientId}
          onPress={() => {
            const selected = recipientList.find(r => r.ReceiverID === selectedRecipientId);
            if (selected) handleSendMoney(selected);
          }}
          style={[styles.proceedBtn, !selectedRecipientId && styles.proceedBtnDisabled]}
        >
          <LinearGradient
            colors={selectedRecipientId ? [COLORS.primary, '#0369a1'] : ['#e2e8f0', '#cbd5e1']}
            style={styles.proceedGradient}
          >
            <Text style={styles.proceedText}>PROCEED TO TRANSFER</Text>
            <Feather name="arrow-right" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>

      {/* REFINED DELETE MODAL */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconBox}>
              <View style={styles.iconCircleRed}>
                <Feather name="trash-2" size={32} color={COLORS.red} />
              </View>
            </View>

            <Text style={styles.modalTitle}>Remove Recipient?</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to remove <Text style={{ color: '#1E293B', fontWeight: 'bold' }}>{recipientToDelete?.FirstName} {recipientToDelete?.LastName}</Text> from your network? This action cannot be undone.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { if (!isDeleting) setDeleteModalVisible(false); }}
                disabled={isDeleting}
              >
                <Text style={styles.cancelText}>Keep Recipient</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmDeleteBtn}
                disabled={isDeleting}
                onPress={performDelete}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmText}>Yes, Remove</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flex: 1,
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  searchWrapper: {
    flex: 1,
    height: 52,
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: '#1e293b',
    padding: 0,
    ...(Platform.select({ web: { outlineStyle: 'none' } }) as any),
  },
  addNewBtn: {
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  addBtnGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 6,
  },
  addBtnText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 1,
  },
  listSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionLabel: {
    fontSize: RFValue(10),
    fontFamily: FONTS.bold,
    color: '#94a3b8',
    letterSpacing: 1,
  },
  headerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginLeft: 10,
  },
  listContainer: {
    paddingBottom: 180,
  },
  recipientCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    justifyContent: 'space-between',
  },
  recipientCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0f9ff',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  flagIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  infoBox: {
    marginLeft: 15,
  },
  recipientName: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: '#1e293b',
    marginBottom: 2,
  },
  recipientMeta: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: '#94a3b8',
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionCircleActive: {
    borderColor: COLORS.primary,
  },
  selectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  menuTrigger: {
    padding: 5,
  },
  emptyState: {
    marginTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: '#94a3b8',
    marginTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 105,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  proceedBtn: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  proceedBtnDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  proceedGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  proceedText: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: '#fff',
    letterSpacing: 1.2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
  },
  menuText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: '#475569',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: 5,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginHorizontal: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  headerFlag: {
    marginRight: 8,
    borderRadius: 2,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  structuredSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginTop: 10,
    marginBottom: 8,
  },
  headerLabelBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  structuredHeaderText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: '#334155',
  },
  countBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: '#64748B',
  },
  recipientRowContainer: {
    backgroundColor: '#fff',
    borderColor: '#F1F5F9',
    borderWidth: 1,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
  },
  recipientRowFirst: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  recipientRowLast: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomWidth: 1,
    marginBottom: 5,
  },
  recipientRowSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    zIndex: 1,
  },
  recipientRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 18,
    position: 'relative',
  },
  avatarGradient: {
    flex: 1,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatarText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  miniFlag: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fff',
    padding: 2,
    borderRadius: 4,
    elevation: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
  },
  countryFilterChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  countryFilterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  countryFilterText: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
    color: '#64748B',
  },
  countryFilterTextActive: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 20,
  },
  modalIconBox: {
    marginBottom: 20,
  },
  iconCircleRed: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: '#1E293B',
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  modalActions: {
    width: '100%',
    gap: 12,
  },
  confirmDeleteBtn: {
    height: 60,
    backgroundColor: COLORS.red,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  cancelBtn: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.bold,
    letterSpacing: 0.2,
  },
  cancelText: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: '#94A3B8',
  },
});

const menuStyles = {
  optionsContainer: {
    borderRadius: 15,
    padding: 5,
    marginTop: 35,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
};

export default Recipients;
