import { View, Text, TextInput } from "react-native";
import React from "react";
import { useRecoilValue } from "recoil";
import { FONTS, SIZES } from "../constants/Assets";
import COLORS from "../constants/Colors";
import styles from "../styles";
import Vector from "app/assets/vectors";
import TokenSelector from "../components/TokenSelector";
import { ProfileState } from "../atoms";
import TouchableText from "../components/TouchableText";
import Button from "./Button";
import { Navigation } from "../../types";
import { useNavigation } from "@react-navigation/native";


const InviteEarnCard = () => {
    const navigation = useNavigation();

    const currentToken = useRecoilValue(ProfileState);

    return (
        <View>
            <View style={[styles.cardMainWrapper, { padding: SIZES.p20 }]}>
            <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Text style={{ color: COLORS.black50, fontFamily: FONTS.monoLight }}>
                    Invite & Earn
                    </Text>
                </View>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginVertical:SIZES.p30
                    }}
                >
                    <Text numberOfLines={2} style={{ color: COLORS.black50,flexWrap: "wrap", fontFamily: FONTS.monoMedium }}>
                    Invite a friend earn {currentToken.currencySymbol} 10
                    </Text>
                </View>

            
            </View>
        </View>
    );
};

export default InviteEarnCard;
