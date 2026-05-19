import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
  StyleSheet
} from "react-native";
import { useRecoilValue } from "recoil";
import { useNavigation } from "@react-navigation/native";
import CountryFlag from "react-native-country-flag";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ Import
import { ProfileState } from "app/atoms";
import { FONTS, SIZES } from "app/constants/Assets";
import styles from "app/styles";
import { LinearGradient } from "expo-linear-gradient";

interface IProps {
  items: any[];
  title: string;
  onSelect?: (selectedItem: any) => void;
  selectedPurpose?: string;
}

const RecipientItem = ({ items, title, onSelect, selectedPurpose }: IProps) => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const getCountryISO2 = require("country-iso-3-to-2");
  const currentToken = useRecoilValue(ProfileState);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null);
  const [filteredItems, setFilteredItems] = useState<any[]>([]); // ✅ store filtered recipients
  const [currencyCode, setCurrencyCode] = useState<string | null>(null);
  const [transferReason, setTransferReason] = useState("");


  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const value = await AsyncStorage.getItem("selectedRecipientCurrency");
        if (value) {
          setCurrencyCode(value);
        }
      } catch (error) {
        console.error("Error fetching currency from storage:", error);
      }
    };
    fetchCurrency();
  }, []);

  useEffect(() => {
    if (currencyCode && items.length > 0) {
      // ✅ filter recipients only for matching country code
      const filtered = items.filter(
        (item) => item.CountryCode?.toUpperCase() === currencyCode.toUpperCase()
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [currencyCode, items]);

  const handleSelect = (item: any) => {
    const newSelectedId =
      item.ReceiverID === selectedId ? null : item.ReceiverID;

    setSelectedId(newSelectedId);
    setSelectedRecipient(item.ReceiverID === selectedId ? null : item);

    if (onSelect) onSelect(item);
  };

  const handleEditRecipient = (recipientData: any) => {

    if (!selectedPurpose) {
      Alert.alert("Required", "Please select a transfer reason");
      return;
    }

    if (!recipientData) {
      Alert.alert("Selection Required", "Please select a recipient first");
      console.warn("⚠️ No recipient selected");
      return;
    }

    (navigation as any).navigate("AddRecipient", { editData: recipientData });

  };

  const isProceedEnabled =
    selectedRecipient !== null && selectedPurpose !== "";


  return (
    <View style={localStyles.container}>
      {/* Header */}
      <View style={localStyles.listHeader}>
        <Text style={localStyles.headerText}>My Recipients List</Text>
      </View>

      {/* Recipients List */}
      <View style={localStyles.listContent}>
        {filteredItems.map((item) => {
          const isSelected = item.ReceiverID === selectedId;

          return (
            <TouchableOpacity
              key={item.ReceiverID?.toString()}
              onPress={() => handleSelect(item)}
              activeOpacity={0.7}
              style={[
                localStyles.recipientCard,
                isSelected && localStyles.recipientCardSelected,
              ]}
            >
              <View style={localStyles.cardInner}>
                {/* Flag Section */}
                <View style={localStyles.flagWrapper}>
                  <CountryFlag
                    style={localStyles.flagIcon}
                    isoCode={getCountryISO2(item.CountryCode) || ""}
                    size={24}
                  />
                </View>

                {/* Info Section */}
                <View style={localStyles.infoWrapper}>
                  <Text style={localStyles.recipientName}>
                    {item.FirstName} {item.LastName}
                  </Text>
                  <Text style={localStyles.recipientCountry}>
                    {item.Country || (item.CountryCode === 'IND' ? 'India' : item.CountryCode)}
                  </Text>
                </View>

                {/* Selection Section */}
                <View style={[
                  localStyles.radioOuter,
                  isSelected && localStyles.radioOuterSelected
                ]}>
                  {isSelected && <View style={localStyles.radioInner} />}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Action Section */}
      <View style={localStyles.actionWrapper}>
        <TouchableOpacity
          style={[
            localStyles.proceedButton,
            !isProceedEnabled && { opacity: 0.5 }
          ]}
          disabled={!isProceedEnabled}
          onPress={() => handleEditRecipient(selectedRecipient)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isProceedEnabled ? ["#0EA5E9", "#38bdf8"] : ["#cbd5e1", "#e2e8f0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={localStyles.gradientButton}
          >
            <Text style={localStyles.proceedText}>Proceed</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 4,
  },
  listHeader: {
    marginBottom: 12,
  },
  headerText: {
    fontSize: SIZES.p16,
    fontWeight: '900',
    color: '#0f172a',
    fontFamily: FONTS.bold,
  },
  listContent: {
    gap: 8,
  },
  recipientCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  recipientCardSelected: {
    borderColor: '#0EA5E9',
    backgroundColor: '#f0f9ff',
    borderWidth: 1.2,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  flagWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  flagIcon: {
    width: 40,
    height: 40,
  },
  infoWrapper: {
    flex: 1,
  },
  recipientName: {
    fontSize: SIZES.p14,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: FONTS.bold,
    textTransform: 'capitalize',
  },
  recipientCountry: {
    fontSize: SIZES.p11,
    color: '#64748b',
    fontFamily: FONTS.regular,
    marginTop: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#0EA5E9',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0EA5E9',
  },
  actionWrapper: {
    marginTop: 24,
    marginBottom: 16,
  },
  proceedButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedText: {
    color: '#fff',
    fontSize: SIZES.p15,
    fontWeight: '900',
    fontFamily: FONTS.bold,
    letterSpacing: 0.4,
  },
});

export default RecipientItem;
