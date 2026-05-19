import { View, Text, FlatList, Image, TextProps, SafeAreaView, TouchableOpacity, RefreshControl } from "react-native";
import React, { useEffect, useState } from "react";
import { FONTS, SIZES } from "../../../constants/Assets";
import COLORS from "../../../constants/Colors";
import { ITransaction } from "types";
import TransactionItem from "./items/TransactionItem";
import Vector from "app/assets/vectors";
import { Menu, MenuOption, MenuOptions, MenuProvider, MenuTrigger } from "react-native-popup-menu";
interface IProps {
  item: any[];
}

const TransactionCard = ({ item }: IProps) => {

  return (
    <View > 
      <FlatList
        style={{
          width: '100%'
        }}
        nestedScrollEnabled={true}
        scrollEnabled={false}
        data={item}
        renderItem={({ item, index }) => <TransactionItem item={item} key={index} />}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => 'key' + index}
        contentContainerStyle={{ padding: SIZES.p20, paddingTop:10 }} />

    </View>
  );
};

export default TransactionCard;
