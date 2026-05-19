import React from "react";
import { useNavigation } from "@react-navigation/native";
import TouchableText from "./TouchableText";
import { FONTS, SIZES } from "../constants/Assets";
import COLORS from "../constants/Colors";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRecoilValue } from "recoil";
import { SendMoneyTabState } from "../atoms";
import CircularProgress from "./CircularProgress";
type Props = {
    title?: string;
};
const RecipientHeader = ({ title = '' }: Props) => {
    const navigation = useNavigation();
    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: "#0EA5E9",
            paddingVertical: 15,
        },
        title: {
            fontSize: SIZES.h2,
            marginLeft: 12,
            fontWeight: 'bold',
            color: '#fff',
            fontFamily: FONTS.bold,
        },
    });
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
            {/* <CircularProgress size={40} strokeWidth={5} progress={20} /> */}
        </View>
    );
};

export default RecipientHeader;
