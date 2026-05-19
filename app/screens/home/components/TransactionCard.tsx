import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform } from "react-native";
import React from "react";
import { FONTS, SIZES } from "../../../constants/Assets";
import Vector from "app/assets/vectors";
import TransactionItem from "./items/TransactionItem";
import { useNavigation } from "@react-navigation/native";

interface IProps {
  item: any[];
  currency?: string;
}

const TransactionCard = ({ item, currency }: IProps) => {
  const navigation = useNavigation();

  return (
    <View style={localStyles.container}>
      {/* Header Section remains premium but simple */}
      <View style={localStyles.header}>
        <View>
          <Text style={localStyles.title}>Recent transactions</Text>
          <View style={localStyles.titleAccent} />
        </View>

        <View style={localStyles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Transactions")}
            style={localStyles.seeAllBtn}
          >
            <Text style={localStyles.seeAllTxt}>See All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Transactions")}
            style={localStyles.filterBtn}
          >
            <Vector as="feather" name="sliders" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Reverting to original FlatList logic but with premium container styling */}
      {item.length === 0 ? (
        <View style={localStyles.emptyBox}>
          <Vector as="ionicons" name="receipt-outline" size={32} color="#cbd5e1" />
          <Text style={localStyles.emptyTxt}>No recent transactions found</Text>
        </View>
      ) : (
        <View style={localStyles.listContainer}>
          <FlatList
            data={item}
            keyExtractor={(item: any, index) => index.toString()}
            renderItem={({ item: tr, index }) => (
              <TransactionItem
                item={tr}
                index={index}
                isLast={index === item.length - 1}
                currency={currency}
              />
            )}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: "#0f172a",
  },
  titleAccent: {
    height: 4,
    width: 25,
    backgroundColor: '#0ea5e9',
    marginTop: 4,
    borderRadius: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  seeAllBtn: {
    paddingHorizontal: 4,
  },
  seeAllTxt: {
    fontSize: SIZES.p11,
    fontFamily: FONTS.bold,
    color: '#0ea5e9',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterBtn: {
    backgroundColor: '#0ea5e9',
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 },
      android: { elevation: 3 }
    })
  },
  listContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 15,
      },
      android: { elevation: 4 },
    }),
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#e2e8f0',
  },
  emptyTxt: {
    fontSize: SIZES.p11,
    fontFamily: FONTS.medium,
    color: '#94a3b8',
    marginTop: 10,
  }
});

export default TransactionCard;
