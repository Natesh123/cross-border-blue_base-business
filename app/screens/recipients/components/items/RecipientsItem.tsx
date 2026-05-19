import React, { useState } from "react";
import {
  Text,
  View,
  FlatList,
  Button,
  Modal,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import CountryFlag from "react-native-country-flag";
import { Menu, MenuOption, MenuOptions, MenuTrigger } from "react-native-popup-menu";
import { DeleteBeneficiary } from "app/http-services";
import Toast from "react-native-toast-message";
import { useRecoilValue } from "recoil";
import { ProfileState } from "app/atoms";
import Vector from "app/assets/vectors";
import { FONTS, SIZES } from "app/constants/Assets";
import { theme } from "app/core/theme";
import styles from "app/styles";
import AsyncStorage from "@react-native-async-storage/async-storage";



interface IProps {
  items: any[];
  title: string;
  onDeleteSuccess?: (deletedItem: any) => void;
}

const RecipientsItem = ({ items, title, onDeleteSuccess }: IProps) => {
  const { width } = useWindowDimensions();
  const getCountryISO2 = require("country-iso-3-to-2");
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const currentToken = useRecoilValue(ProfileState);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null);

  const handleDeleteRecipient = (recipientData: any) => {
    setSelectedRecipient(recipientData);
    setShowConfirm(true);
  };
  
  const executeDelete = async (recipientData: any) => {
    setLoading(true);
    const postData: any = {
      ReceiverID: recipientData.ReceiverID,
      remitterId: currentToken.remitterId,
      tokenId: currentToken.tokenId || "",
    };
    try {
      const response = await DeleteBeneficiary(postData);
      if (response && response.status === 200 && response.data) {
        const { StatusCode, StatusMsg } = response.data;

        if (StatusCode === "ER0086" || StatusCode === "ER0000") {
          Toast.show({
            type: "success",
            text1: "Deleted Recipient",
            text2: StatusMsg || "Recipient deleted successfully.",
          });
          
          // ✅ Call parent callback
          if (onDeleteSuccess) {
            onDeleteSuccess(recipientData);
          }
        } else {
          Toast.show({
            type: "error",
            text1: "Deleted Recipient",
            text2: StatusMsg || "Failed to delete recipient.",
          });
        }
      } else {
        throw new Error("Invalid response or missing data.");
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.message || "An error occurred while deleting the recipient.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditRecipient = (recipientData: any) => {
    // navigation.navigate("AddRecipients", { editData: recipientData });
    (navigation as any).navigate("AddRecipients", { editData: recipientData });

  };

  const handleSendMoney = async (recipientData: any) => {
  console.log("Recipient Data:", recipientData);

  await AsyncStorage.setItem('selectedRecipientCurrency', recipientData?.CountryCode || '');
  (navigation as any).navigate("SendMoney", { editData: recipientData });
};

  
  const confirmDelete = () => {
    setShowConfirm(false);
    if (selectedRecipient) {
      executeDelete(selectedRecipient);
    }
  };
  
  return (
    <View style={{ flexDirection: "column", width: "100%" }}>
      <FlatList
        ListHeaderComponent={() => (
          <View style={{ flexDirection: "row", marginVertical: 20, marginBottom: 10, alignItems: "center", justifyContent: "space-between" }}>
            <View style={{marginLeft:"8%"}}>
              <Text style={styles.header}>{title} Recipients List</Text>
            </View>
            <View />
          </View>
        )}
        data={items}
        keyExtractor={(item) => item.ReceiverID?.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.cardMainWrapper,
              {
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
                marginLeft:20,
                width: "90%",
                padding: SIZES.p10,
                borderRadius: SIZES.p20,
              },
            ]}
          >
            <View style={{ width: SIZES.p40, height: SIZES.p40, borderRadius: 10, alignItems: "center", overflow: "hidden" }}>
              <CountryFlag
                style={{ width: SIZES.p40, height: SIZES.p40 }}
                isoCode={getCountryISO2(item.CountryCode) || ""}
                size={35}
              />
            </View>
            <View style={{ width: "100%", marginLeft: SIZES.p15, flex: 1 }}>
              <Text
                style={{
                  fontFamily: FONTS.semibold,
                  fontWeight: "500",
                  fontSize: 12,
                  textTransform: "capitalize",
                }}
                numberOfLines={1}
              >
                {item.FirstName} {item.LastName}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                alignContent: "center",
              }}
            >
              <Menu>
                <MenuTrigger>
                  <Vector as="materialCI" name="dots-vertical" size={25} color={theme.colors.black50} />
                </MenuTrigger>
                <MenuOptions>
                   <MenuOption onSelect={() => handleSendMoney(item)} text="Send Money" />
                  <MenuOption onSelect={() => handleEditRecipient(item)} text="Edit" />
                  <MenuOption onSelect={() => handleDeleteRecipient(item)} text="Delete" />
                </MenuOptions>
              </Menu>
            </View>
          </View>
        )}
      />
      {showConfirm && (
  <Modal transparent visible animationType="fade">
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          backgroundColor: "#fff",
          paddingVertical: 25,
          paddingHorizontal: 20,
          borderRadius: 6,
          minWidth: 300,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 14, textAlign: "center", marginBottom: 20 }}>
          Are you sure you want to delete this beneficiary?
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <TouchableOpacity
            style={{
              paddingVertical: 8,
              paddingHorizontal: 15,
              borderRadius: 4,
              backgroundColor: "#f1f1f1",
              marginRight: 10,
            }}
            onPress={() => setShowConfirm(false)}
          >
            <Text style={{ color: "#0EA5E9", fontWeight: "bold" }}>CANCEL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              paddingVertical: 8,
              paddingHorizontal: 15,
              borderRadius: 4,
              backgroundColor: "#0EA5E9",
            }}
            onPress={confirmDelete}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>YES, DELETE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
)}

    </View>
  );
};

export default RecipientsItem;

