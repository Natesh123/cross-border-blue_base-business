import { RefreshControl, ScrollView, View, BackHandler, StyleSheet, Platform, StatusBar, Alert } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import moment from "moment";
import Container from "../../theme/Container";
import WalletBalanceCard from "./components/WalletBalanceCard";
import HomeHeader from "../../components/HomeHeader";
import styles from "../../styles";
import { SafeAreaView } from "react-native-safe-area-context";
import SummaryCard from "./components/SummaryCard";
import TransactionCard from "./components/TransactionCard";
import { ITransaction } from "types";
import { useIsFocused, useFocusEffect } from "@react-navigation/native";
import { ProfileState } from "app/atoms";
import { useRecoilValue } from "recoil";
import RateCard from "./components/RateCard";

import { GetDashboardDetails, GetReferDetails, GetRemitterProfile, GetTransactionDetails, GetWalletBalance } from "app/http-services";
import Spinner from "react-native-loading-spinner-overlay";

const Home = () => {
  const isFocused = useIsFocused();
  const currentToken = useRecoilValue(ProfileState);

  // 100% ORIGINAL LOGIC: Handle hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  const [currency, setCurrency] = useState('£');
  const [loading, setLoading] = useState(false);
  const [reward, setReward] = useState('');
  const [accountBalance, setAccountBalance] = useState('');
  const [withdrawAccountBalance, setWithdrawAccountBalance] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [checkRate, setCheckRate] = useState<any[]>([]);
  const [totalBeneficiaries, setTotalBeneficiaries] = useState('');
  const [transactionCount, setTransactionCount] = useState('');
  const [LastMonthSummary, setLastMonthSummary] = useState([]);
  const [RecentTransaction, setRecentTransaction] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // 100% ORIGINAL LOGIC: Fetch Refer Details
  const fetchReferDetails = async (tokenId: string, remitterId: string) => {
    try {
      if (!tokenId || !remitterId) return;
      setLoading(true);
      const response = GetReferDetails(tokenId);
      response.then((res: any) => {
        if (res.status === 200) {
          setReward(res?.data?.Refer?.PotentialEarning);
        }
      })
        .catch((err) => {
          console.error('Fetch refer details error:', err.response?.data || err.message)
        })
        .finally(() => setLoading(false));
    } catch (error) {
      console.error('Error refer details:', error);
    }
  };

  // 100% ORIGINAL LOGIC: Fetch Dashboard Details
  const fetchDashboardDetails = async (tokenId: string, remitterId: string) => {
    try {
      if (!tokenId || !remitterId) return;
      setLoading(true);
      const response = GetDashboardDetails(tokenId);
      response.then((res: any) => {
        if (res.status === 200) {
          const dashboardData = res?.data?.Dashboard || res?.data?.Dasboard;
          setTotalAmount(dashboardData?.TotalAmount || "0.00");
          setTotalBeneficiaries(dashboardData?.TotalBeneficiaries || "0");
          setTransactionCount(dashboardData?.TransactionCount || "0");
        }
      })
        .catch((err) => {
          console.error('Fetch dashboard details error:', err.response?.data || err.message);
          const status = err.response?.status || "Unknown";
          // Silent failure for dashboard fetch as per user request to hide popups
        })
        .finally(() => setLoading(false));
    } catch (error) {
      console.error('Error fetching dashboard details:', error);
    }
  };

  // 100% ORIGINAL LOGIC: Fetch Wallet Balance
  const fetchWalletBalance = async (tokenId: string, remitterId: string) => {
    try {
      if (!tokenId || !remitterId) return;
      setLoading(true);
      const response = GetWalletBalance(tokenId);
      response.then((res: any) => {
        if (res.status === 200) {
          setAccountBalance(res?.data?.BalanceAmount);
          setWithdrawAccountBalance(res?.data?.WD_BalanceAmount);
        }
      })
        .catch((err) => {
          console.error('Fetch wallet balance error:', err.response?.data || err.message)
        })
        .finally(() => setLoading(false));
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  // 100% ORIGINAL LOGIC: Fetch Transaction Details
  const fetchTransactionDetails = async (tokenId: string, remitterId: string) => {
    try {
      if (!tokenId || !remitterId) return;
      setLoading(true);

      const reqMoney = GetTransactionDetails({
        tokenId, remitterId, fromDate: '', numberTranList: '0', toDate: '', tranList: 'COUNT', transId: '', transactionType: 'MONEY_REMITTANCE', walletMode: 'Sendmoney'
      });

      const reqWallet = GetTransactionDetails({
        tokenId, remitterId, fromDate: '', numberTranList: '0', toDate: '', tranList: 'COUNT', transId: '', transactionType: 'WALLET', walletMode: 'Wallet Transfer'
      });

      const reqAirtime = GetTransactionDetails({
        tokenId, remitterId, fromDate: '', numberTranList: '0', toDate: '', tranList: 'COUNT', transId: '', transactionType: 'AIRTOPUP', walletMode: 'Sendmoney'
      });

      Promise.allSettled([reqMoney, reqWallet, reqAirtime]).then((results) => {
        let allTxns: any[] = [];
        const res1: any = results[0].status === 'fulfilled' ? results[0].value : null;
        const res2: any = results[1].status === 'fulfilled' ? results[1].value : null;
        const res3: any = results[2].status === 'fulfilled' ? results[2].value : null;

        if (res1?.status === 200 && res1?.data?.TransDetails) {
          allTxns = [...allTxns, ...res1.data.TransDetails];
        }
        if (res2?.status === 200 && res2?.data?.TransDetails) {
          const walletTxns = res2.data.TransDetails.map((t: any) => ({ ...t, TransactionType: 'WALLET' }));
          allTxns = [...allTxns, ...walletTxns];
        }
        if (res3?.status === 200 && res3?.data?.TransDetails) {
          allTxns = [...allTxns, ...res3.data.TransDetails];
        }

        allTxns = allTxns.map((t: any) => ({
          ...t,
          TransactionMode: !t.TransactionMode || t.TransactionMode.trim() === "" ? "E-Wallet Debit" : t.TransactionMode,
        }));

        // Sort by date descending reliably using London offset logic
        const getLondonOffset = (date: Date): number => {
          try {
            const dtf = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/London', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false });
            const parts = dtf.formatToParts(date);
            const getVal = (type: string) => { const part = parts.find(p => p.type === type); return part ? parseInt(part.value, 10) : 0; };
            const year = getVal('year'); const month = getVal('month') - 1; const day = getVal('day');
            let hour = getVal('hour'); if (hour === 24) hour = 0;
            const minute = getVal('minute'); const second = getVal('second');
            const londonUTCDate = Date.UTC(year, month, day, hour, minute, second);
            const inputUTCDate = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
            return (londonUTCDate - inputUTCDate) / 60000;
          } catch (e) { return 0; }
        };

        const parseDateSort = (txn: any) => {
          const d = txn.TransactionDate;
          if (!d) return 0;
          const formats = [
            "YYYY-MM-DDTHH:mm:ss[Z]",
            "YYYY-MM-DDTHH:mm:ss.SSS[Z]",
            "YYYY-MM-DD HH:mm:ss",
            "M/D/YYYY h:mm:ss A",
            "MM/DD/YYYY hh:mm:ss A",
            "DD/MM/YYYY hh:mm:ss A",
            "DD/MM/YYYY HH:mm:ss",
            "DD-MM-YYYY hh:mm:ss A",
            "DD-MM-YYYY HH:mm:ss",
            "YYYY-MM-DD hh:mm:ss A",
            "YYYY/MM/DD hh:mm:ss A",
            "DD-MM-YYYY",
            "DD/MM/YYYY",
            "DD-MMM-YYYY",
            "DD MMM, YYYY",
            "YYYY/MM/DD",
            "DD MMM YYYY hh:mm:ss A",
            "DD MMM YYYY"
          ];
          const isWalletTxn = txn.TransactionType === 'WALLET' || txn.TransactionMode === 'E-Wallet Debit' || (txn.TransID && txn.TransID.toString().startsWith("EE"));

          if (!isWalletTxn) {
            let m = moment.utc(d, formats);
            if (m.isValid()) {
              const utcDate = new Date(m.format("YYYY-MM-DDTHH:mm:ss[Z]"));
              m.subtract(getLondonOffset(utcDate), "minutes");
              return m.valueOf();
            }
          }
          let m = moment.utc(d, formats, true);
          if (m.isValid()) return m.valueOf();
          return moment(new Date(d)).valueOf() || 0;
        };

        allTxns.sort((a, b) => parseDateSort(b) - parseDateSort(a));

        // Take top 5
        setRecentTransaction(allTxns.slice(0, 5));
      }).catch((err) => {
        console.error('Fetch Transaction details error:', err);
      }).finally(() => setLoading(false));

    } catch (error) {
      console.error('Error fetching Transaction details:', error);
    }
  };

  useEffect(() => {
    if (isFocused && currentToken.tokenId && currentToken.remitterId) {
      const _currency = (typeof process !== 'undefined' && process.env && process.env.CURRENCY_SYMBOL) || '£';
      setCurrency(_currency);
      fetchReferDetails(currentToken.tokenId, currentToken.remitterId);
      fetchTransactionDetails(currentToken.tokenId, currentToken.remitterId);
      fetchWalletBalance(currentToken.tokenId, currentToken.remitterId);
      fetchDashboardDetails(currentToken.tokenId, currentToken.remitterId);
    }
  }, [isFocused]);

  const onRefresh = () => { }

  // Logic to sync summary values if API returns 0 but we have transactions
  useEffect(() => {
    if (RecentTransaction.length > 0 && (!totalAmount || totalAmount === "0.00" || totalAmount === "")) {
      const sum = RecentTransaction.reduce((acc, curr: any) => acc + parseFloat(curr.Amount || 0), 0);
      setTotalAmount(sum.toFixed(2));

      if (!transactionCount || transactionCount === "0" || transactionCount === "") {
        setTransactionCount(RecentTransaction.length.toString());
      }

      if (!totalBeneficiaries || totalBeneficiaries === "0" || totalBeneficiaries === "") {
        const uniqueBeneficiaries = new Set(RecentTransaction.map((t: any) => t.ReceiverID)).size;
        setTotalBeneficiaries(uniqueBeneficiaries.toString());
      }
    }
  }, [RecentTransaction, totalAmount]);

  return (
    <View style={localStyles.mainContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <HomeHeader name={currentToken.firstName} currency={currency} reward={reward} />

      {/* ScrollView with Grand Structure */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[localStyles.scrollContent, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9" />
        }
      >
        <WalletBalanceCard currency={currency} balance={accountBalance} />

        <View style={localStyles.contentSections}>
          <RateCard />
          <SummaryCard
            currency={currency}
            value={totalAmount}
            count={transactionCount}
            beneficiaries={totalBeneficiaries}
          />
          <TransactionCard item={RecentTransaction} currency={currency} />
        </View>
      </ScrollView>



      {loading && <Spinner visible={true} size='large' animation='fade' overlayColor="rgba(0,0,0,0.3)" />}
    </View>
  );
};

const localStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  contentSections: {
    marginTop: 20,
    gap: 25,
  }
});

export default Home;
