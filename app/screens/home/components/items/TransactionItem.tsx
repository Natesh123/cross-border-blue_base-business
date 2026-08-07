import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import CountryFlag from "react-native-country-flag";
import { FONTS } from "app/constants/Assets";
import Vector from "app/assets/vectors";
import moment from "moment";
import { LinearGradient } from "expo-linear-gradient";

interface IProps {
  item: any;
  index: number;
  currency?: string;
  variant?: string;
}

const TransactionItem = ({ item, index, currency: sysCurrency }: IProps) => {
  const getCountryISO2 = require("country-iso-3-to-2");
  const isoCode = getCountryISO2(item.DestinationCountry) || "";

  const isWalletTxn = 
    item.TransactionType === "WALLET" ||
    item.TransactionMode === "E-Wallet Debit" ||
    (item.TransID && String(item.TransID).startsWith("EE")) ||
    (item.TransactionID && String(item.TransactionID).startsWith("EE"));

  const displayName = (item.ReceiverFirstName || item.ReceiverLastName)
    ? `${item.ReceiverFirstName} ${item.ReceiverLastName}`.trim()
    : item.TransactionPurpose || (isWalletTxn ? "Wallet Transfer" : "Money Transfer");

  const displayCurrency = item.Currency || sysCurrency || "£";

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success': 
      case 'ew_ew_success': return '#059669';
      case 'pending':
      case 'processing': return '#d97706';
      case 'failed':
      case 'rejected': return '#dc2626';
      default: return '#64748b';
    }
  };

  const getStatusText = (status: string) => {
    if (status === 'EW_EW_SUCCESS') return 'Success';
    return status || 'Failed';
  };

  const statusColor = getStatusColor(item.TranStatus);
  const statusText = getStatusText(item.TranStatus);

  const getLondonOffset = (date: Date): number => {
    try {
      const dtf = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/London',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
      });
      const parts = dtf.formatToParts(date);
      const getVal = (type: string) => {
        const part = parts.find(p => p.type === type);
        return part ? parseInt(part.value, 10) : 0;
      };
      const year = getVal('year');
      const month = getVal('month') - 1;
      const day = getVal('day');
      let hour = getVal('hour');
      if (hour === 24) hour = 0;
      const minute = getVal('minute');
      const second = getVal('second');
      const londonUTCDate = Date.UTC(year, month, day, hour, minute, second);
      const inputUTCDate = Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
      );
      return (londonUTCDate - inputUTCDate) / 60000;
    } catch (e) {
      return 0; // Fallback if Intl is not supported
    }
  };

  const parseDate = (d: string) => {
    if (!d) return moment(0);
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

    if (!isWalletTxn) {
      // Standard transfer date is in UK local time (Europe/London)
      let m = moment.utc(d, formats);
      if (m.isValid()) {
        const utcDate = new Date(m.format("YYYY-MM-DDTHH:mm:ss[Z]"));
        const offset = getLondonOffset(utcDate);
        m.subtract(offset, "minutes");
        return m.local();
      }
    }

    // Wallet transfers parsed directly as UTC
    let m = moment.utc(d, formats, true);
    if (m.isValid()) return m.local();
    
    return moment(new Date(d));
  };

  const formattedDate = parseDate(item.TransactionDate).format("DD MMM, YYYY hh:mm A");

  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.card}>
      {/* Left Icon */}
      <View style={styles.iconWrapper}>
        {isWalletTxn ? (
          <LinearGradient
            colors={['#4a889f', '#1b3139']}
            style={styles.iconCircle}
          >
            <Vector as="materialcommunityicons" name="wallet" size={16} color="#FFF" />
          </LinearGradient>
        ) : isoCode ? (
          <View style={styles.flagWrapper}>
            <CountryFlag isoCode={isoCode} size={24} />
          </View>
        ) : (
          <View style={[styles.iconCircle, { backgroundColor: '#0f172a' }]}>
            <Vector as="materialcommunityicons" name="bank-transfer" size={20} color="#FFF" />
          </View>
        )}
      </View>

      {/* Middle Content */}
      <View style={styles.contentCol}>
        <Text style={styles.nameTxt} numberOfLines={1}>{displayName}</Text>
        <Text style={styles.metaTxt}>
          {item.TransID || item.TransactionID} • {formattedDate} • {item.Amount}
        </Text>
      </View>

      {/* Right Status */}
      <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
        <Text style={styles.statusTxt}>{statusText}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default TransactionItem;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#2dd4bf', // matching the teal/green border from screenshot
    borderRadius: 24, // highly rounded corners like screenshot
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  iconWrapper: {
    marginRight: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  contentCol: {
    flex: 1,
    justifyContent: 'center',
  },
  nameTxt: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 4,
  },
  metaTxt: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: '#94a3b8',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 10,
  },
  statusTxt: {
    fontFamily: FONTS.semibold,
    fontSize: 12,
    color: '#FFF',
  }
});