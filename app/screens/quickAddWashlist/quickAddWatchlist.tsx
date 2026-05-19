import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  FlatList,
  Modal,
  Platform,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useRecoilValue } from "recoil";
import { ProfileState } from "app/atoms";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { GetQuickWatchList, DeleteWatchList } from "app/http-services";
import { LinearGradient } from "expo-linear-gradient";
import COLORS from "app/constants/Colors";
import { FONTS, SIZES, SHADOWS } from "app/constants/Assets";
import { RFValue } from "react-native-responsive-fontsize";
import Vector from "app/assets/vectors";

const { width } = Dimensions.get("window");

const QuickAddWatchlist: React.FC = () => {
  const currentToken = useRecoilValue(ProfileState);
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [watchList, setWatchList] = useState<any[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    if (isFocused) fetchQuickWatchList();
  }, [isFocused]);

  const fetchQuickWatchList = async () => {
    try {
      setLoading(true);
      const req = { RemitterID: currentToken?.remitterId };
      const response = await GetQuickWatchList(req);
      if (
        response.data.StatusCode === "ER0000" &&
        Array.isArray(response.data.Quickwatchdetail)
      ) {
        setWatchList(response.data.Quickwatchdetail);
      } else {
        setWatchList([]);
      }
    } catch (error) {
      console.error("GetQuickWatchList error:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    try {
      setLoading(true);
      const req = {
        RemitterID: currentToken?.remitterId,
        ToCountryCode: selectedItem.ToCountryCode,
      };
      const res = await DeleteWatchList(req);
      if (res.data.StatusCode === "ER0000") {
        setWatchList((prev) =>
          prev.filter((w) => w.ToCountryCode !== selectedItem.ToCountryCode)
        );
        Toast.show({
          type: "success",
          text1: "Success",
          text2: res?.data?.StatusMsg || "Deleted Success",
          position: "top",
        });
      }
    } catch (error) {
      console.error("DeleteWatchList error:", error);
    } finally {
      setLoading(false);
      setShowConfirm(false);
      setSelectedItem(null);
    }
  };

  const filteredData = watchList.filter(
    (item) =>
      item.ToCountryName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.ToCurrency?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.ToCountryCode?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleEdit = (item: any) => {
    navigation.navigate("QuickAddWatchlistForm", { editItem: item });
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.notificationCard}>
      <View style={styles.cardMainRow}>
        <View style={styles.iconBox}>
          {item.CountryFlag ? (
            <Image source={{ uri: item.CountryFlag }} style={styles.flagIcon} />
          ) : (
            <MaterialCommunityIcons name="currency-eur" size={24} color="#fff" />
          )}
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            <Text style={styles.itemTitle}>{item.ToCountryName}</Text>
            <View style={styles.actionGroup}>
              <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconAction}>
                <Feather name="edit-2" size={14} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectedItem(item);
                  setShowConfirm(true);
                }}
                style={[styles.iconAction, { backgroundColor: '#FEF2F2' }]}
              >
                <Feather name="trash-2" size={14} color={COLORS.red} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.itemSubtitle}>1 GBP → {item.ToCurrency}</Text>

          <View style={styles.cardFooter}>
            <Text style={styles.rateValue}>{item.ExchangeCheckRate}</Text>
            <View style={styles.statusBadge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>LIVE</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
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
              <Text style={styles.headerTitle}>Watchlist</Text>
              <Text style={styles.headerSub}>Monitor your favorite currency pairs</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.mainBody}>
        <View style={styles.listHeaderSection}>
          <Text style={styles.listSectionTitle}>RECENTLY TRACKED</Text>
          <View style={styles.headerDot} />
          {watchList.length < 5 && (
            <TouchableOpacity
              onPress={() => navigation.navigate("QuickAddWatchlistForm")}
              style={styles.quickAddBtn}
            >
              <Feather name="plus" size={16} color={COLORS.primary} />
              <Text style={styles.quickAddText}>Add Pair</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search country or currency..."
            placeholderTextColor="#94a3b8"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {loading && watchList.length === 0 ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : filteredData.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="magnify-close" size={60} color="#e2e8f0" />
            <Text style={styles.emptyStateText}>No currency pairs found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={(item) => item.ToCountryCode}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Delete Confirmation */}
      <Modal transparent visible={showConfirm} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconBox}>
              <Feather name="alert-circle" size={30} color={COLORS.red} />
            </View>
            <Text style={styles.modalTitle}>Remove Pair?</Text>
            <Text style={styles.modalDesc}>
              Stop tracking exchange rates for {selectedItem?.ToCountryName}?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setShowConfirm(false);
                  setSelectedItem(null);
                }}
              >
                <Text style={styles.cancelBtnText}>Keep it</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirmDelete}>
                <Text style={styles.confirmBtnText}>Remove</Text>
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
    backgroundColor: "#f8fafc",
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
  mainBody: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listHeaderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 15,
  },
  listSectionTitle: {
    fontSize: RFValue(12),
    fontFamily: FONTS.bold,
    color: '#94a3b8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  quickAddBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  quickAddText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginLeft: 4,
  },
  searchContainer: {
    height: 52,
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8 },
      android: { elevation: 2 }
    })
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: '#1E293B',
    borderWidth: 0,
    padding: 0,
    ...(Platform.select({
      web: { outlineStyle: "none" }
    }) as any),
  },
  listContainer: {
    paddingBottom: 30,
  },
  notificationCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: COLORS.primary + '20',
    ...Platform.select({
      ios: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 3 }
    })
  },
  cardMainRow: {
    flexDirection: 'row',
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  flagIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  cardContent: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  iconAction: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: '#1E293B',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  rateValue: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: '#64748B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: '#94A3B8',
    marginTop: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 25,
    width: '100%',
    alignItems: 'center',
  },
  modalIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#1E293B',
    marginBottom: 10,
  },
  modalDesc: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  cancelBtnText: {
    color: '#64748B',
    fontFamily: FONTS.bold,
  },
  confirmBtn: {
    flex: 1,
    height: 50,
    backgroundColor: COLORS.red,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  confirmBtnText: {
    color: '#fff',
    fontFamily: FONTS.bold,
  },
});

export default QuickAddWatchlist;
