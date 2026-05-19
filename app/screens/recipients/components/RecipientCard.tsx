import { View, Text, FlatList, Image, TextProps, SafeAreaView, TouchableOpacity, RefreshControl } from "react-native";
import React, { useEffect, useState } from "react";
import { FONTS, SIZES } from "../../../constants/Assets";
import COLORS from "../../../constants/Colors";
import { IRecipientList } from "types";
import Vector from "app/assets/vectors";
import RecipientsItem from "./items/RecipientsItem";
interface IProps {
  items: any;
}

const RecipientCard = ({ items }: IProps) => {

  return (
    <View >
      <FlatList
        style={{
          width: '100%'
        }}
        nestedScrollEnabled={true}
        scrollEnabled={false}
        data={Object.keys(items)}
        renderItem={({item, index}) => <RecipientsItem items={items[item]} title={item} key={index} />}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ padding: SIZES.p20 }} 
        keyExtractor={(item, index) => 'key'+index}
        />

    </View>
  );
};

export default RecipientCard;
