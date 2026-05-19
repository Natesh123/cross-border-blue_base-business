import { View, FlatList, TouchableOpacity, Text, useWindowDimensions, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { FONTS, SIZES } from "../../../constants/Assets";
import { GetQuickWatchList } from "app/http-services";
import { ProfileState } from "app/atoms";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useRecoilValue } from "recoil";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RateItem from "./items/RateItem";
import Vector from "app/assets/vectors";

const RateCard = () => {
  const currentToken = useRecoilValue(ProfileState);
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const [watchList, setWatchList] = useState<any[]>([]);

  const fallbackList = [
    {
      id: 1,
      fromRate: "1",
      fromCurrency: "GBR",
      toRate: "110.99",
      toCurrency: "INR",
      countryCode: "IND",
      countryflag: "http://cashrest.tastybreadhouse.co.uk/CountryFlags/IND.png",
    },
    {
      id: 2,
      fromRate: "1",
      fromCurrency: "GBR",
      toRate: "433.32",
      toCurrency: "LKR",
      countryCode: "LKA",
      countryflag: "http://cashrest.tastybreadhouse.co.uk/CountryFlags/LKA.png",
    },
  ];

  useEffect(() => {
    if (isFocused) fetchQuickWatchList();
  }, [isFocused]);

  const fetchQuickWatchList = async () => {
    try {
      const req = { RemitterID: currentToken?.remitterId };
      const response = await GetQuickWatchList(req);

      if (
        response.data.StatusCode === "ER0000" &&
        Array.isArray(response.data.Quickwatchdetail)
      ) {
        const mapped = response.data.Quickwatchdetail.map((x: { ExchangeCheckRate: { toString: () => any; }; ToCurrency: any; ToCountryCode: any; CountryFlag: any; }, index: number) => ({
          id: index + 1,
          fromRate: "1",
          fromCurrency: "GBR",
          toRate: x.ExchangeCheckRate?.toString() ?? "0",
          toCurrency: x.ToCurrency,
          countryCode: x.ToCountryCode,
          countryflag: x.CountryFlag,
        }));

        setWatchList(mapped);
      } else {
        setWatchList([]);
      }
    } catch (error) {
      console.log("Error:", error);
      setWatchList([]);
    }
  };

  const finalData = watchList.length > 0 ? watchList : fallbackList;

  const onSelectCountry = async (code: string) => {
    try {
      await AsyncStorage.setItem("selectedRecipientCurrency", code);
      navigation.navigate("SendMoney");
    } catch (error) {
      console.log("AsyncStorage Error:", error);
    }
  };

  return (
    <View style={localStyles.container}>
      <View style={localStyles.header}>
        <View>
          <Text style={localStyles.title}>Live exchange rates</Text>
          <View style={localStyles.titleAccent} />
        </View>

        <View style={localStyles.liveBadge}>
          <View style={localStyles.pulseCircle} />
          <Text style={localStyles.liveTxt}>REAL-TIME</Text>
        </View>
      </View>

      <FlatList
        horizontal
        scrollEnabled={true}
        nestedScrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        data={finalData}
        keyExtractor={(item) => `${item.id}`}
        contentContainerStyle={localStyles.listContent}
        snapToInterval={(width - 50) / 2 + 15}
        decelerationRate="fast"
        snapToAlignment="start"
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => onSelectCountry(item.countryCode)}
            style={localStyles.itemWrapper}
            activeOpacity={0.8}
          >
            <RateItem
              id={item.id}
              fromRate={item.fromRate}
              fromCurrency={item.fromCurrency}
              toRate={item.toRate}
              toCurrency={item.toCurrency}
              countryCode={item.countryCode}
              countryflag={item.countryflag}
              columnIndex={index}
              totalColumns={finalData.length}
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    marginVertical: 5,
  },
  header: {
    marginBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: "#0f172a",
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  titleAccent: {
    height: 4,
    width: 25,
    backgroundColor: '#10b981', // Emerald accent for rates
    marginTop: 4,
    borderRadius: 10,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  pulseCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  liveTxt: {
    fontSize: SIZES.p9,
    fontFamily: FONTS.bold,
    color: '#059669',
    letterSpacing: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  itemWrapper: {
    paddingVertical: 5,
  }
});

export default RateCard;
