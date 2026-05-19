import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  Dimensions,
  Platform,
} from "react-native";
import { useRecoilState, useRecoilValue } from "recoil";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Spinner from "react-native-loading-spinner-overlay";

import { ProfileState, ProfileTabState } from "../../atoms";
import Container from "app/theme/Container";
import HomeHeader from "app/components/HomeHeader";
import ProfileTapHeader from "app/components/ProfileTapHeader";
import { GetReferDetails, GetRemitterProfile } from "app/http-services";

import PersonalDetails from "./components/personalDetails";
import BusinessDetails from "./components/BusinessDetails";
import AdditionalDetails from "./components/AdditionalDetails";
import ChangePassword from "./components/ChangePassword";

const Profile = () => {
  const { width } = useWindowDimensions();
  const screenHeight = Dimensions.get("window").height;
  const scrollRef = useRef<ScrollView>(null);

  const isFocused = useIsFocused();
  const currentToken = useRecoilValue(ProfileState);
  const [tabIndex] = useRecoilState(ProfileTabState);

  const [currency] = useState("£");
  const [profile, setProfile] = useState<any>("");
  const [loading, setLoading] = useState(false);
  const [reward, setReward] = useState("");
  const [accountType, setAccountType] = useState<string | null>(null);

  useEffect(() => {
    getAsyncUser();
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchReferDetails(currentToken.tokenId);
      fetchRemitterProfile(currentToken.tokenId);
    }
  }, [isFocused]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      x: tabIndex * width,
      animated: true,
    });
  }, [tabIndex]);

  const getAsyncUser = async () => {
    const stored = await AsyncStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setAccountType(user?.Is_BusinessType);
    }
  };

  const fetchReferDetails = async (tokenId: string) => {
    try {
      setLoading(true);
      const res: any = await GetReferDetails(tokenId);
      if (res.status === 200) setReward(res?.data?.Refer?.PotentialEarning);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRemitterProfile = async (tokenId: string) => {
    try {
      setLoading(true);
      const res: any = await GetRemitterProfile(tokenId);
      if (res.status === 200) setProfile(res?.data?.Sender);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={localStyles.mainContainer}>
      <HomeHeader
        name={currentToken.firstName}
        currency={currency}
        reward={reward}
      />

      <ProfileTapHeader accountType={accountType} />

      <View style={localStyles.contentWrapper}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ flexDirection: "row" }}
        >
          {/* PERSONAL */}
          <View style={{ width, flex: 1 }}>
            <PersonalDetails profile={profile} />
          </View>

          {/* BUSINESS */}
          {accountType === "Y" && (
            <View style={{ width, flex: 1 }}>
              <BusinessDetails />
            </View>
          )}

          {/* ADDITIONAL */}
          <View style={{ width, flex: 1 }}>
            <AdditionalDetails profile={profile} />
          </View>

          {/* SECURITY */}
          <View style={{ width, flex: 1 }}>
            <ChangePassword />
          </View>
        </ScrollView>
      </View>

      {loading && <Spinner visible={true} size="large" animation="slide" overlayColor="rgba(0,0,0,0.1)" />}
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentWrapper: {
    flex: 1,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    backgroundColor: '#fff',
    marginTop: -10,
    overflow: 'hidden',
  }
});

export default Profile;
