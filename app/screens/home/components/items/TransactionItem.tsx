import React from "react";
import { View, Text, StyleSheet, Platform, Image } from "react-native";
import CountryFlag from "react-native-country-flag";
import { FONTS, SIZES } from "app/constants/Assets";
import { dateFormat } from "app/helpers";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInRight } from "react-native-reanimated";
import Vector from "app/assets/vectors";

interface IProps {
  item: any;
  index: number;
  isLast?: boolean;
  currency?: string;
}

const TransactionItem = ({ item, index, isLast, currency: sysCurrency }: IProps) => {
  const getCountryISO2 = require("country-iso-3-to-2");
  const isoCode = getCountryISO2(item.DestinationCountry) || "";

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Success":
        return { color: "#10b981", bg: "#f0fdf4", gradient: ['#10b98120', '#10b98110'] };
      case "Processing":
        return { color: "#f59e0b", bg: "#fffbeb", gradient: ['#f59e0b20', '#f59e0b10'] };
      default:
        return { color: "#ef4444", bg: "#fef2f2", gradient: ['#ef444420', '#ef444410'] };
    }
  };

  const { color: statusColor, bg: statusBg, gradient: statusGradient } = getStatusConfig(item.TranStatus);
  const isSuccess = item.TranStatus === "Success";

  // Display name priority: Receiver Name > Transaction Purpose > Default
  const displayName = (item.ReceiverFirstName || item.ReceiverLastName)
    ? `${item.ReceiverFirstName} ${item.ReceiverLastName}`.trim()
    : item.TransactionPurpose || "Money Transfer";

  const displayCurrency = item.Currency || sysCurrency || "£";

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100).duration(800)}
      style={[
        localStyles.itemContainer,
        !isLast && localStyles.separator
      ]}
    >
      <View style={localStyles.mainContainer}>
        {/* Left Section: Circular Flag Icon with Status Dot */}
        <View style={localStyles.iconSection}>
          <LinearGradient
            colors={statusGradient}
            style={localStyles.iconBase}
          >
            <View style={localStyles.flagInner}>
              {item.CountryFlag ? (
                <Image source={{ uri: item.CountryFlag }} style={localStyles.flagImg} />
              ) : isoCode ? (
                <CountryFlag isoCode={isoCode} size={24} style={localStyles.flagImg} />
              ) : (
                <Vector as="ionicons" name="swap-horizontal" size={20} color={statusColor} />
              )}
            </View>
          </LinearGradient>
          <View style={[localStyles.statusDot, { backgroundColor: statusColor }]} />
        </View>

        {/* Middle Section: Transaction Details */}
        <View style={localStyles.detailsSection}>
          <Text style={localStyles.receiverName} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={localStyles.transIdLabel}>#{item.TransID}</Text>

          <View style={localStyles.metaRow}>
            <Text style={localStyles.typeLabel}>{item.TransactionMode}</Text>
            <View style={localStyles.dotSeparator} />
            <Text style={localStyles.dateLabel}>{dateFormat(item.TransactionDate)}</Text>
          </View>
        </View>

        {/* Right Section: Amount & Status Badge */}
        <View style={localStyles.amountSection}>
          <View style={localStyles.amountRow}>
            <Text style={[localStyles.currencySymbol, { color: statusColor }]}>{displayCurrency}</Text>
            <Text style={localStyles.amountVal}>{item.Amount}</Text>
          </View>

          <View style={[localStyles.statusBadge, { backgroundColor: statusBg }]}>
            <Text style={[localStyles.statusText, { color: statusColor }]}>
              {item.TranStatus}
            </Text>
          </View>
        </View>

        <View style={localStyles.chevronBox}>
          <Vector as="feather" name="chevron-right" size={16} color="#cbd5e1" />
        </View>
      </View>
    </Animated.View>
  );
};

const localStyles = StyleSheet.create({
  itemContainer: {
    backgroundColor: '#ffffff',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  mainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconSection: {
    position: 'relative',
    marginRight: 12,
  },
  iconBase: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
      android: { elevation: 1 },
    }),
  },
  flagImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  detailsSection: {
    flex: 1,
    justifyContent: 'center',
  },
  receiverName: {
    fontSize: SIZES.font,
    fontFamily: FONTS.bold,
    color: '#1e293b',
  },
  transIdLabel: {
    fontSize: SIZES.p9,
    fontFamily: FONTS.bold,
    color: '#0ea5e9',
    marginBottom: 4,
    opacity: 0.8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: SIZES.p10,
    fontFamily: FONTS.medium,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 6,
  },
  dateLabel: {
    fontSize: SIZES.p10,
    fontFamily: FONTS.medium,
    color: '#94a3b8',
  },
  amountSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginRight: 6,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 2,
  },
  currencySymbol: {
    fontSize: SIZES.p11,
    fontFamily: FONTS.bold,
    marginTop: 2,
  },
  amountVal: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.bold,
    color: '#1e293b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: SIZES.p9,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  chevronBox: {
    justifyContent: 'center',
  }
});

export default TransactionItem;