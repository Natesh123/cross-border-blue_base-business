import {
  View,
  ScrollView,
  Dimensions,
  useWindowDimensions,
  Text,
} from "react-native";
import React, { useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  SendMoneyHeaderState,
  SendMoneyTabState,
} from "app/atoms";
import SendMoneyHeader from "app/components/SendMoneyHeader";
import SendMoneyTapHeader from "app/components/SendMoneyTapHeader";
import CashPickup from "app/components/sendMoney/CashPickup";
import MobileWallet from "app/components/sendMoney/MobileWallet";
import BankTransfer from "./components/BankTransfer";
import Container from "app/theme/Container";
import styles from "../../styles";

const SendMoney = () => {
  const sendMoneyTabState = useRecoilValue(SendMoneyTabState);
  const [sendMoneyHeaderState, setSendMoneyHeaderState] =
    useRecoilState(SendMoneyHeaderState);
  const screenHeight = Dimensions.get("window").height;
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      x: sendMoneyTabState * width,
      animated: true,
    });
  }, [sendMoneyTabState]);

  console.log("Current Tab Index:", sendMoneyTabState);

  return (
    <SafeAreaView style={[styles.container, { flex: 1, backgroundColor: '#316b83' }]}>
      <SendMoneyHeader title="Send Money" />
      <Container style={{ backgroundColor: '#f9f9f9', flex: 1 }}>
        <SendMoneyTapHeader width={Math.max(0, (width * 0.5) - 25)} />

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={true}
          style={{ height: screenHeight - 200 }}
          contentContainerStyle={{ flexDirection: "row" }}
          scrollEnabled={false}
        >
          <View style={{ width }}>
            <CashPickup />
          </View>
          <View style={{ width }}>
            <BankTransfer />
          </View>
          <View style={{ width }}>
            {/* Debug fallback for broken MobileWallet */}
            <MobileWallet />
            {/* <Text>Mobile Wallet should show here</Text> */}
          </View>
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
};

export default SendMoney;
