import { View, Text, ViewStyle, ScrollView, RefreshControl, Dimensions } from "react-native";
import React, { useState } from "react";
import SendFrom from "./card/SendFrom";
import SendTo from "./card/SendTo";
import Checkbox from "../Checkbox";
import TextInput from "../TextInput";
import DetailView from "./card/DetailView";
import CollapsibleView from "../customComponents/CollapsibleView";
import ProgressStep from "../customComponents/ProgressStep";

const BankTransfer = ({ style }: { style?: ViewStyle }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [isCoupon, setIsCoupon] = useState(false);
  const [coupon, setCoupon] = useState({ value: '', error: '' });

  const { width, height } = Dimensions.get("window");

  const onRefresh = () => { }
  const fees = [
    {
      name: "Our fee"
    },
    {
      name: "Total Amount"
    },
    {
      name:
        "Conversion Rate"
    }
  ];
  return (
    <View style={style}>
      <ScrollView style={{ width: "100%", height: height - 250 }} showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <Text>Bank Transfer</Text>
        <SendFrom></SendFrom>
        <CollapsibleView>
          <View
            style={{
              flex: 1,
              paddingVertical:50
            }}>
            <ProgressStep steps={fees} />
          </View>
        </CollapsibleView>
        <SendTo></SendTo>
        <Checkbox status={isCoupon ? 'checked' : 'unchecked'} onPress={() => { setIsCoupon(!isCoupon); }} label="Coupon Code Available"></Checkbox>
        {isCoupon && (
          <TextInput
            returnKeyType="next"
            value={coupon.value}
            onChangeText={(text: any) => setCoupon({ value: text, error: '' })}
            error={!!coupon.error}
            errorText={coupon.error}
            autoCapitalize="none"
          />
        )}
      </ScrollView>
    </View>
  );
};

export default BankTransfer;
