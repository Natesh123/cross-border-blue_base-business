import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  useWindowDimensions,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRecoilValue } from "recoil";
import Spinner from "react-native-loading-spinner-overlay";
import moment from "moment";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";

import styles from "app/styles";
import HomeHeader from "app/components/HomeHeader";
import Container from "app/theme/Container";
import { SIZES, FONTS } from "app/constants/Assets";
import { RFValue } from "react-native-responsive-fontsize";
import { ITransaction } from "types";
import { ProfileState } from "app/atoms";
import TransactionCard from "./components/TransactionCard";
import { GetReferDetails, GetTransactionDetails } from "app/http-services";
import GroupButton from "app/components/controls/GroupButton";
import { theme } from "app/core/theme";
import Vector from "app/assets/vectors";

const Transactions = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const currentToken = useRecoilValue(ProfileState);

  const [currency, setCurrency] = useState("£");
  const [transactionType, setTransactionType] =
    useState<"MONEY_REMITTANCE" | "AIRTOPUP">("MONEY_REMITTANCE");
  const [loading, setLoading] = useState(false);
  const [reward, setReward] = useState("");
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch refer details
  const fetchReferDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await GetReferDetails(currentToken.tokenId);
      if (res?.status === 200) {
        setReward(res?.data?.Refer?.PotentialEarning || "");
      }
    } catch (err: any) {
      console.error("Fetch refer details:", err.response?.data?.message || err);
    } finally {
      setLoading(false);
    }
  }, [currentToken.tokenId]);

  // Fetch transactions
  const fetchTransactionDetails = useCallback(
    async (
      period: "ALL" | "1MONTH" | "6MONTH" | "1YEAR",
      transType: "MONEY_REMITTANCE" | "AIRTOPUP"
    ) => {
      setLoading(true);
      setTransactionType(transType);

      let fromDate = "";
      const toDate = moment().format("YYYY-MM-DD");

      if (period !== "ALL") {
        const periods: Record<string, moment.unitOfTime.DurationConstructor> = {
          "1MONTH": "months",
          "6MONTH": "months",
          "1YEAR": "years",
        };
        const value = period === "6MONTH" ? 6 : period === "1YEAR" ? 1 : 1;
        fromDate = moment().subtract(value, periods[period]).format("YYYY-MM-DD");
      }

      const request = {
        tokenId: currentToken.tokenId,
        remitterId: currentToken.remitterId,
        fromDate,
        toDate,
        numberTranList: "0",
        tranList: "COUNT",
        transId: "",
        transactionType: transType,
        walletMode: "Sendmoney",
      };

      try {
        const res: any = await GetTransactionDetails(request);
        if (res.status === 200) {
          const fixedList = (res?.data?.TransDetails || []).map((t: any) => ({
            ...t,
            TransactionMode:
              !t.TransactionMode || t.TransactionMode.trim() === ""
                ? "E-Wallet Debit"
                : t.TransactionMode,
          }));

          const sorted = fixedList.sort((a: ITransaction, b: ITransaction) =>
            (a.DestinationCountry || "").localeCompare(b.DestinationCountry || "")
          );

          setTransactions(sorted);
        }
      } catch (err: any) {
        console.error("Fetch Transaction details:", err.response?.data?.message || err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentToken.tokenId, currentToken.remitterId]
  );

  useEffect(() => {
    const _currency = (typeof process !== 'undefined' && process.env && process.env.CURRENCY_SYMBOL) || "£";
    setCurrency(_currency);
    fetchReferDetails();
    fetchTransactionDetails("ALL", transactionType);
  }, [isFocused, fetchReferDetails, fetchTransactionDetails, transactionType]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactionDetails("ALL", transactionType);
  };

  const onChangeTransactionType = (selected: string) => {
    const type = selected === "Airtime Topup" ? "AIRTOPUP" : "MONEY_REMITTANCE";
    fetchTransactionDetails("ALL", type);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Elite Hero Header - Matched with Notification Screen */}
      <LinearGradient
        colors={['#0369a1', '#0ea5e9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={localStyles.headerWrapper}
      >
        <SafeAreaView style={localStyles.safeHeader}>
          <View style={localStyles.headerContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={localStyles.backCircle}
                activeOpacity={0.7}
              >
                <Vector as="ionicons" name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
              <View style={localStyles.titleBox}>
                <Text style={localStyles.headerTitle}>Transaction History</Text>
                <Text style={localStyles.headerSub}>Manage and track your activities</Text>
              </View>
            </View>

            <Menu>
              <MenuTrigger>
                <View style={localStyles.headerFilterBtn}>
                  <Vector
                    as="materialcommunityicons"
                    name="filter-variant"
                    size={24}
                    color="#fff"
                  />
                </View>
              </MenuTrigger>

              <MenuOptions
                customStyles={{
                  optionsContainer: localStyles.menuOptions,
                }}
              >
                {[
                  { label: "🔄 Reset", period: "ALL" },
                  { label: "📅 Last month", period: "1MONTH" },
                  { label: "📆 Last 6 months", period: "6MONTH" },
                  { label: "🗓️ Last 1 year", period: "1YEAR" },
                ].map((opt) => (
                  <MenuOption
                    key={opt.period}
                    onSelect={() => fetchTransactionDetails(opt.period as any, transactionType)}
                  >
                    <Text style={menuStyles.option}>{opt.label}</Text>
                  </MenuOption>
                ))}
              </MenuOptions>
            </Menu>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <Container style={{ backgroundColor: '#f9f9f9', flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 70 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View>
            {/* Premium Tab Section */}
            <View style={localStyles.tabWrapper}>
              <GroupButton
                width={width * 0.45 - 20}
                onPress={onChangeTransactionType}
                buttons={["Money Transfer", "Airtime Topup"]}
              />
            </View>

            {/* Transactions List */}
            <TransactionCard item={transactions} />
          </View>
        </ScrollView>

        {/* Loader */}
        {loading && <Spinner visible={true} size="large" animation="slide" />}
      </Container>
    </View>
  );
};

export default Transactions;

const menuStyles = {
  option: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    fontSize: 14,
    color: "#1e293b",
    fontFamily: FONTS.semibold,
  },
};

const localStyles = StyleSheet.create({
  headerWrapper: {
    paddingBottom: 15,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
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
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: '#fff',
  },
  headerSub: {
    fontSize: SIZES.p11,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FONTS.medium,
    marginTop: 1,
  },
  headerFilterBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  tabWrapper: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    margin: 15,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  listHeaderRow: {
    flexDirection: "row",
    marginTop: 15,
    marginHorizontal: 22,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  listTitle: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: "#1e293b",
  },
  listSubtitle: {
    fontSize: SIZES.p11,
    fontFamily: FONTS.medium,
    color: "#94a3b8",
    marginTop: 2,
  },
  filterBtn: {
    padding: 10,
    borderRadius: 14,
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#e0f2fe",
  },
  menuOptions: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    borderRadius: 18,
    width: 190,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
});
