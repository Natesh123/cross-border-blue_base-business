import { Animated, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { ProfileState, ProfileTabState } from "../../../../atoms"; 
import styles from "../../../../styles";
import Container from "app/theme/Container";
import HomeHeader from "app/components/HomeHeader";
import ProfileTapHeader from "app/components/ProfileTapHeader";
import { Navigation } from "types";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import GroupButton from "app/components/controls/GroupButton";
import { GetReferDetails, GetRemitterProfile } from "app/http-services";
 
import Spinner from "react-native-loading-spinner-overlay";
import BankDeposit from "./items/BankDeposit";
import CashPickup from "./items/CashPickup";
import MobileWallet from "./items/MobileWallet";
import { ReceivingModeField } from "app/models/receivingModeField.model";

type Props = {
    receivingModeField: ReceivingModeField | undefined, 
};
const ReceivingMode = ({receivingModeField}:Props) => {
  const [receivingModeTab, setReceivingModeTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();   
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    
}, [isFocused]);

  const onRefresh = () => { }
 
  const onChange = (selected: string) => {
    if (selected === 'Bank deposit') {
        setReceivingModeTab(0)
    }
    if (selected === 'Cash pickup') {
        setReceivingModeTab(1)
    }
    if (selected === 'Mobile wallet') {
        setReceivingModeTab(2)
    }
  }
  return (
    <SafeAreaView style={[styles.container]}>
       <View style={{
        flexDirection: "row",
        alignItems: "center"
      }}>
        <GroupButton width={width * .30} onPress={onChange} buttons={['Bank deposit', 'Cash pickup', 'Mobile wallet']}></GroupButton>
      </View>
      <Container >
        <ScrollView style={{ width: "100%", padding: 10 }} showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <Animated.View>
            <BankDeposit receivingModeField={receivingModeField} style={{ display: receivingModeTab === 0 ? "flex" : "none" }} />
            <CashPickup   style={{ display: receivingModeTab === 1 ? "flex" : "none" }} />
            <MobileWallet  style={{ display: receivingModeTab === 2 ? "flex" : "none" }} />
          </Animated.View>
        </ScrollView>
        {loading && <Spinner
          visible={true}
          size='large'
          animation='slide'
        />}
      </Container>
    </SafeAreaView>
  );
};

export default ReceivingMode;
 