import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { FONTS } from "../../../constants/Assets";
import Vector from "app/assets/vectors";
import TransactionItem from "./items/TransactionItem";

interface IProps {
  item: any[];
  currency?: string;
}

const TransactionCard = ({ item, currency }: IProps) => {
  if (!item || item.length === 0) {
    return (
      <View style={localStyles.container}>
        <View style={localStyles.emptyHero}>
          <Text style={localStyles.emptyHeroTitle}>No Activity Yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={localStyles.container}>
      {/* Header matching web screenshot */}
      <View style={localStyles.headerRow}>
        <Text style={localStyles.titleText}>Recent Transactions</Text>
        <TouchableOpacity style={localStyles.iconBtn}>
          <Vector as="feather" name="arrow-up-right" size={16} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* List of redesigned items */}
      <View style={localStyles.listWrapper}>
        {item.map((transaction, idx) => (
          <TransactionItem
            key={transaction.TransID || transaction.TransactionID || idx}
            item={transaction}
            index={idx}
            currency={currency}
          />
        ))}
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: '#f8fafc',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  titleText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#0f766e', // Teal color matching the web text
  },
  iconBtn: {
    padding: 4,
  },
  listWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    // Add shadow to match web look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  emptyHero: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHeroTitle: {
    fontFamily: FONTS.semibold,
    color: '#64748b',
    fontSize: 14,
  }
});

export default TransactionCard;
