import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import { useRecoilValue } from "recoil";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp, Layout, FadeInRight } from "react-native-reanimated";

import { ProfileState } from "../../atoms";
import { GetNotificationListInfo, UpdateNotification, GetTransactionDetails } from "app/http-services";
import { FONTS, SIZES, SHADOWS } from "app/constants/Assets";
import { RFValue } from "react-native-responsive-fontsize";
import Vector from "app/assets/vectors";
import moment from "moment";
import CountryFlag from "react-native-country-flag";

const getCountryISO2 = require("country-iso-3-to-2");

const { width } = Dimensions.get("window");

const Notification = () => {
  const currentToken = useRecoilValue(ProfileState);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  useEffect(() => {
    fetchNotifications();
  }, [isFocused]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      // 1. Fetch Transactions first
      let recentTransactions: any[] = [];
      try {
        const txnReq = {
          tokenId: currentToken.tokenId,
          remitterId: currentToken.remitterId,
          fromDate: "",
          toDate: moment().format("YYYY-MM-DD"),
          numberTranList: "0",
          tranList: "COUNT",
          transId: "",
          transactionType: "MONEY_REMITTANCE",
          walletMode: "Sendmoney",
        };
        const txnRes: any = await GetTransactionDetails(txnReq);
        if (txnRes?.status === 200) {
          recentTransactions = txnRes.data?.TransDetails || [];
        }
      } catch (err) {
        console.error("Error fetching transactions for notifications:", err);
      }

      // 2. Fetch Notifications
      const response = await GetNotificationListInfo({});
      const data = response?.data?.Notifications || [];

      const notificationTypes: Record<number, string> = {
        1: "Registration",
        2: "Wallet Update",
        4: "Transaction",
      };

      const keys = await AsyncStorage.getAllKeys();
      const storedValues = await AsyncStorage.multiGet(keys);
      const localStatus: Record<string, any> = {};
      storedValues.forEach(([key, value]) => {
        if (key.startsWith("notification_") && value) {
          localStatus[key] = JSON.parse(value);
        }
      });

      const mappedNotifications = data.map((item: any) => {
        const storageKey = `notification_${item.NotificationLogId}`;
        const localItem = localStatus[storageKey];
        const isTxn = item.NotificationMasterId === 4 || item.NotificationMasterId === "4";

        let matchedTxn = null;
        if (isTxn && recentTransactions.length > 0) {
          // Sort transactions by date descending to find the closest match
          const txnsByDate = [...recentTransactions].sort((a, b) =>
            moment(b.TransactionDate).diff(moment(a.TransactionDate))
          );

          // Try direct mapping first
          matchedTxn = txnsByDate.find((t: any) =>
            (item.TransID && t.TransID === item.TransID) ||
            (item.TransactionId && t.TransID === item.TransactionId) ||
            (item.ReferenceId && t.TransID === item.ReferenceId) ||
            (item.NotificationMessage && t.TransID && item.NotificationMessage.includes(t.TransID))
          );

          // If no direct mapping exists (e.g., message is just "Transaction done Successfully"),
          // fallback to matching by closest time
          if (!matchedTxn && item.NotificationCreatedDate) {
            matchedTxn = txnsByDate.find((t: any) => {
              if (!t.TransactionDate) return false;
              const tDate = moment(t.TransactionDate, ["YYYY-MM-DD hh:mm:ss A", "M/D/YYYY h:mm:ss A", moment.ISO_8601], true);
              const nDate = moment(item.NotificationCreatedDate, ["YYYY-MM-DD hh:mm:ss A", "M/D/YYYY h:mm:ss A", moment.ISO_8601], true);

              const validT = tDate.isValid() ? tDate : moment(t.TransactionDate);
              const validN = nDate.isValid() ? nDate : moment(item.NotificationCreatedDate);

              if (validT.isValid() && validN.isValid()) {
                // Match within 12 hours instead of 5 minutes just to be safe
                return Math.abs(validT.diff(validN, 'hours')) <= 12;
              }
              return false;
            });
          }

          // Ultimate Fallback: Just pop the first transaction from the list if it's still null!
          if (!matchedTxn && txnsByDate.length > 0) {
            matchedTxn = txnsByDate[0];
          }
        }

        // Ensure we remove the matched transaction from the list so it doesn't get mapped twice
        if (matchedTxn) {
          recentTransactions = recentTransactions.filter((t: any) => t.TransID !== matchedTxn.TransID);
        }

        return {
          id: item.NotificationLogId,
          masterId: item.NotificationMasterId,
          type: notificationTypes[item.NotificationMasterId] || "Alert",
          description: item.NotificationMessage,
          time: item.NotificationCreatedDate || "",
          unread:
            localItem?.unread !== undefined
              ? localItem.unread
              : item.NotificationIsread === "False",
          transactionData: matchedTxn || null
        };
      });

      setNotifications(mappedNotifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = async (item: any) => {
    if (!item.unread) return;
    try {
      await UpdateNotification({
        NotificationlogId: item.id,
        NotificationMasterId: item.masterId,
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === item.id ? { ...n, unread: false } : n
        )
      );

      await AsyncStorage.setItem(
        `notification_${item.id}`,
        JSON.stringify({ ...item, unread: false })
      );
    } catch (err) {
      console.error("Failed to update notification status:", err);
    }
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case "Transaction":
        return { icon: "repeat", color: "#3b82f6", as: "ionicons" };
      case "Wallet Update":
        return { icon: "account-balance-wallet", color: "#8b5cf6", as: "materialicons" };
      case "Registration":
        return { icon: "person-add", color: "#10b981", as: "materialicons" };
      default:
        return { icon: "notifications", color: "#f59e0b", as: "ionicons" };
    }
  };

  const renderItem = (item: any, index: number) => {
    const { icon, color, as } = getNotificationStyles(item.type);
    const dateParts = item.time.split(" ");
    const dateStr = dateParts[0];
    const timeStr = dateParts.slice(1).join(" ");

    // Render Rich Transaction Card
    if (item.type === "Transaction" && item.transactionData) {
      const txn = item.transactionData;
      const isSuccess = txn.TranStatus === "Success";
      const isFailed = txn.TranStatus === "Failed" || txn.TranStatus === "Rejected";

      return (
        <Animated.View
          key={item.id}
          entering={FadeInRight.delay(index * 100).duration(500)}
          layout={Layout.springify()}
        >
          <TouchableOpacity
            onPress={() => handleNotificationPress(item)}
            activeOpacity={0.8}
            style={[styles.richCardContainer, item.unread && styles.richCardUnread]}
          >
            {/* Status Header */}
            <View style={[
              styles.richCardHeader,
              { backgroundColor: isSuccess ? "#f0fdf4" : isFailed ? "#fef2f2" : "#fffbeb" }
            ]}>
              <Vector
                as="materialcommunityicons"
                name={isSuccess ? "check-circle" : "alert-circle"}
                size={18}
                color={isSuccess ? "#16a34a" : isFailed ? "#dc2626" : "#d97706"}
              />
              <Text style={[
                styles.richCardStatusText,
                { color: isSuccess ? "#16a34a" : isFailed ? "#dc2626" : "#d97706" }
              ]}>{txn.TranStatus.toUpperCase()}</Text>

              {item.unread && (
                <View style={styles.richUnreadBadge}>
                  <Text style={styles.richUnreadText}>NEW</Text>
                </View>
              )}
            </View>

            {/* Sender / Receiver Info */}
            <View style={styles.richPartyRow}>
              <View style={styles.richPartyItem}>
                <Text style={styles.richPartyLabel}>Sender:</Text>
                <Text style={styles.richPartyName} numberOfLines={1}>
                  {txn.SenderFirstName || "User"} (GBR)
                </Text>
                {getCountryISO2("GBR") && (
                  <CountryFlag isoCode={getCountryISO2("GBR")} size={14} style={styles.richFlag} />
                )}
              </View>

              <Vector as="feather" name="arrow-right" size={16} color="#94a3b8" style={{ marginHorizontal: 8 }} />

              <View style={styles.richPartyItem}>
                <Text style={styles.richPartyLabel}>Receiver:</Text>
                <Text style={styles.richPartyName} numberOfLines={1}>
                  {txn.ReceiverFirstName || "Recipient"} ({txn.DestinationCountry})
                </Text>
                {getCountryISO2(txn.DestinationCountry) && (
                  <CountryFlag isoCode={getCountryISO2(txn.DestinationCountry)} size={14} style={styles.richFlag} />
                )}
              </View>
            </View>

            {/* Amount / Mode Info */}
            <View style={styles.richFinanceRow}>
              <View style={styles.richFinanceItem}>
                <Text style={styles.richFinanceLabel}>Amount Sent:</Text>
                <Text style={styles.richFinanceValue}>{txn.Currency} {txn.Amount}</Text>
              </View>
              <View style={[styles.richFinanceItem, { alignItems: 'flex-end' }]}>
                <Text style={styles.richFinanceLabel}>Receiving Mode:</Text>
                <Text style={styles.richFinanceValueSub}>{txn.TransactionMode || "DEBIT"}</Text>
              </View>
            </View>

            <View style={styles.dashedLine} />

            {/* Footer */}
            <View style={styles.richFooterRow}>
              <View style={styles.richFooterLeft}>
                <Vector as="feather" name="send" size={12} color="#64748b" />
                <Text style={styles.richFooterTransferType}>{txn.TransferType || "MOBILE WALLET"}</Text>
              </View>
              <View style={styles.richFooterRight}>
                <Text style={styles.richFooterDate}>{item.time}</Text>
                <View style={styles.richTxnIdBox}>
                  <Text style={styles.richTxnIdText}>{txn.TransID}</Text>
                </View>
              </View>
            </View>

          </TouchableOpacity>
        </Animated.View>
      );
    }

    return (
      <Animated.View
        key={item.id}
        entering={FadeInRight.delay(index * 100).duration(500)}
        layout={Layout.springify()}
      >
        <TouchableOpacity
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.8}
          style={[
            styles.methodRow,
            item.unread
              ? styles.selectedMethodRow
              : styles.readMethodRow
          ]}
        >
          <View style={[
            styles.iconBox,
            item.unread ? styles.selectedIconBox : styles.readIconBox,
            item.unread && { backgroundColor: color }
          ]}>
            <Vector as={as as any} name={icon} size={22} color="#fff" />
          </View>

          <View style={styles.methodInfo}>
            <View style={styles.cardHeader}>
              <Text style={[
                styles.methodTitle,
                item.unread ? styles.selectedMethodTitle : styles.readMethodTitle
              ]}>
                {item.type}
              </Text>
              <Text style={styles.cardTime}>{dateStr}</Text>
            </View>
            <Text style={[
              styles.methodSub,
              !item.unread && styles.readMethodSub
            ]} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardTimeSub}>{timeStr}</Text>
              {item.unread ? (
                <View style={styles.unreadStatus}>
                  <View style={styles.unreadPulse} />
                  <Text style={styles.newText}>NEW</Text>
                </View>
              ) : (
                <View style={styles.viewedBadge}>
                  <View style={styles.viewedDot} />
                  <Text style={styles.viewedTxt}>VIEWED</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const unreadItems = notifications.filter((n) => n.unread);
  const readItems = notifications.filter((n) => !n.unread);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Elite Hero Header - Matched with Withdraw Screen */}
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
              <Text style={styles.headerTitle}>Notifications</Text>
              <Text style={styles.headerSub}>Stay updated with your latest activities</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.body}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#0ea5e9" />
            <Text style={styles.loaderTxt}>Loading updates...</Text>
          </View>
        ) : error ? (
          <View style={styles.loader}>
            <Vector as="ionicons" name="alert-circle" size={50} color="#ef4444" />
            <Text style={styles.errorTxt}>{error}</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.empty}>
            <Vector as="ionicons" name="notifications-off-outline" size={80} color="#e2e8f0" />
            <Text style={styles.emptyTxt}>No notifications yet</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {unreadItems.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionLabel}>RECENTLY RECEIVED</Text>
                  <View style={styles.pulseDot} />
                </View>
                {unreadItems.map((item, idx) => renderItem(item, idx))}
              </View>
            )}

            {readItems.length > 0 && (
              <View style={[styles.section, { marginTop: unreadItems.length > 0 ? 35 : 0 }]}>
                <Text style={[styles.sectionLabel, { marginBottom: 18 }]}>PREVIOUSLY VIEWED</Text>
                {readItems.map((item, idx) => renderItem(item, idx + unreadItems.length))}
              </View>
            )}
          </ScrollView>
        )}
      </View>
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
    fontSize: SIZES.h1,
    fontFamily: FONTS.bold,
    color: '#fff',
  },
  headerSub: {
    fontSize: SIZES.p11,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FONTS.medium,
    marginTop: 1,
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: SIZES.p14,
    fontFamily: FONTS.bold,
    color: "#64748b",
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0ea5e9",
    marginLeft: 10,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...SHADOWS.shadow,
  },
  selectedMethodRow: {
    borderColor: '#0ea5e9',
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
    ...SHADOWS.shadow8,
  },
  readMethodRow: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    opacity: 0.8,
  },
  readIconBox: {
    backgroundColor: '#94a3b8',
    borderRadius: 14,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unselectedIconBox: {
    backgroundColor: '#f1f5f9',
  },
  selectedIconBox: {
    backgroundColor: '#0ea5e9',
  },
  methodInfo: {
    flex: 1,
    marginLeft: 15,
  },
  methodTitle: {
    fontSize: SIZES.p16,
    fontFamily: FONTS.bold,
    color: '#334155',
  },
  selectedMethodTitle: {
    color: '#0ea5e9',
  },
  readMethodTitle: {
    color: '#64748b',
    fontFamily: FONTS.medium,
  },
  methodSub: {
    fontSize: SIZES.p13,
    fontFamily: FONTS.medium,
    color: '#334155',
    marginTop: 3,
    lineHeight: 18,
  },
  readMethodSub: {
    color: '#94a3b8',
    fontFamily: FONTS.regular,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  statBigValue: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: '#1E293B',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  cardTime: {
    fontSize: SIZES.p10,
    fontFamily: FONTS.bold,
    color: "#64748b",
  },
  cardTimeSub: {
    fontSize: SIZES.p10,
    fontFamily: FONTS.bold,
    color: "#94a3b8",
  },
  unreadStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  unreadPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0ea5e9",
  },
  stepText: {
    fontSize: SIZES.p10,
    fontFamily: FONTS.bold,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  newText: {
    fontSize: SIZES.p9,
    fontFamily: FONTS.bold,
    color: "#0ea5e9",
    marginLeft: 5,
  },
  viewedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#c7d2fe',
  },
  viewedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#6366f1",
  },
  viewedTxt: {
    fontSize: 9,
    fontFamily: FONTS.bold,
    color: "#4338ca",
    marginLeft: 6,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loaderTxt: {
    marginTop: 15,
    fontFamily: FONTS.medium,
    color: "#64748b",
  },
  errorTxt: {
    marginTop: 10,
    fontFamily: FONTS.semibold,
    color: "#ef4444",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 150,
  },
  emptyTxt: {
    marginTop: 15,
    fontSize: SIZES.h3,
    fontFamily: FONTS.medium,
    color: "#cbd5e1",
  },

  // Rich Transaction Card Styles
  richCardContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    ...SHADOWS.shadow,
  },
  richCardUnread: {
    borderColor: '#0ea5e9',
    borderLeftWidth: 4,
    ...SHADOWS.shadow8,
  },
  richCardHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#f0fdf4', // success by default
    position: 'relative',
  },
  richCardStatusText: {
    fontSize: SIZES.p12,
    fontFamily: FONTS.bold,
    color: '#16a34a',
    marginLeft: 6,
    letterSpacing: 1,
  },
  richUnreadBadge: {
    position: 'absolute',
    right: 12,
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  richUnreadText: {
    fontSize: 9,
    fontFamily: FONTS.bold,
    color: '#fff',
  },
  richPartyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  richPartyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  richPartyLabel: {
    fontSize: SIZES.p12,
    fontFamily: FONTS.semibold,
    color: '#94a3b8',
    marginRight: 4,
  },
  richPartyName: {
    fontSize: SIZES.p13,
    fontFamily: FONTS.bold,
    color: '#1e293b',
    flexShrink: 1,
  },
  richFlag: {
    marginLeft: 4,
    borderRadius: 2,
  },
  richFinanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    marginHorizontal: 12,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  richFinanceItem: {
    flex: 1,
  },
  richFinanceLabel: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    color: '#94a3b8',
    marginBottom: 2,
  },
  richFinanceValue: {
    fontSize: SIZES.p14,
    fontFamily: FONTS.bold,
    color: '#334155',
  },
  richFinanceValueSub: {
    fontSize: SIZES.p12,
    fontFamily: FONTS.bold,
    color: '#334155',
  },
  dashedLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    borderStyle: 'dashed',
    marginHorizontal: 16,
  },
  richFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  richFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  richFooterTransferType: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: '#64748b',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  richFooterRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  richFooterDate: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    color: '#64748b',
    marginRight: 10,
  },
  richTxnIdBox: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  richTxnIdText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: '#475569',
  },
});

export default Notification;
