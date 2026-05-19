import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import React, { useEffect } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { FONTS, SIZES } from "../constants/Assets";
import { SendMoneyTabState } from "../atoms";
import { theme } from '../core/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { TransferTypeListState } from "app/atoms/TransferTypeListState";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { transparent } from "react-native-paper/lib/typescript/styles/themes/v2/colors";

type Props = {
  width: number,
};

// Tab route + match identifiers
const ROUTES = [
  { title: "Cash Collection", key: "cashPickup", match: "CGMONEY" },
  { title: "Bank Transfer", key: "bankTransfer", match: "Banks" },
  { title: "Mobile Wallet", key: "mobileWallet", match: "M-PESA" },
];

const SendMoneyTapHeader = ({ width }: Props) => {

  const [tabIndex, setTabIndex] = useRecoilState(SendMoneyTabState);

  // 🔥 Get allowed TransferTypes from Recoil (NOT AsyncStorage)
  const allowedTypes = useRecoilValue(TransferTypeListState);
  const setTransferTypeList = useSetRecoilState(TransferTypeListState);

  useEffect(() => {
    const loadAllowedTypes = async () => {
      if (allowedTypes.length === 0) {
        const stored = await AsyncStorage.getItem("TransferTypeList");
        if (stored) {
          setTransferTypeList(JSON.parse(stored));
        }
      }
    };
    loadAllowedTypes();
  }, [allowedTypes.length]);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.pillContainer}>
        {(allowedTypes.length === 0 ? ROUTES : ROUTES.filter(route =>
          allowedTypes.some(t => t && t.toLowerCase() === route.match.toLowerCase())
        ))
          .map((route) => {
            const originalIndex = ROUTES.findIndex(r => r.key === route.key);
            const isActive = tabIndex === originalIndex;
            return (
              <TouchableOpacity
                key={route.key}
                style={styles.tabButton}
                onPress={() => setTabIndex(originalIndex)}
                activeOpacity={0.8}
              >
                {isActive ? (
                  <LinearGradient
                    colors={['#0EA5E9', '#2563EB']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.activePill}
                  >
                    <Text style={[styles.tabText, styles.activeTabText]}>
                      {route.title}
                    </Text>
                  </LinearGradient>
                ) : (
                  <Text style={[styles.tabText, styles.inactiveTabText]}>
                    {route.title}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  pillContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    padding: 6,
    height: 52,
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
  },
  tabButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePill: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: SIZES.p13,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  activeTabText: {
    color: '#fff',
  },
  inactiveTabText: {
    color: '#94a3b8',
  },
});

export default SendMoneyTapHeader;
