import { View, Text, FlatList, Image, TextProps, SafeAreaView, TouchableOpacity, RefreshControl, useWindowDimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { FONTS, SIZES } from "../../../constants/Assets";
import COLORS from "../../../constants/Colors";
import { ITransaction } from "types"; 
import { useRecoilValue } from "recoil";
import { ProfileState } from "../../../atoms";
import { SummaryModel } from "app/models/summary-model";
import styles from "app/styles";
import TransactionalPreferencesItems from "./items/TransactionalPreferencesItems";
type Props = {
    preferCountry: any[]; 
    onPress: ((preferCountry: any) => void),
};
const TransactionalPreferences = ({ preferCountry, onPress }: Props) => {
    const { width } = useWindowDimensions();  

    return (

        <View style={{
            flexDirection: "row",
        }}>
 { preferCountry.length > 0 &&  
            <FlatList
                horizontal
                stickyHeaderIndices={[0]}
                scrollEventThrottle={16}
                showsHorizontalScrollIndicator={false}
                data={preferCountry}
                keyExtractor={(item, index) => 'key' + index}
                contentContainerStyle={{ paddingBottom: SIZES.p6 }}
                renderItem={({ item, index }) => (
                    <View style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                paddingVertical: 8,
                                marginRight: 10,
                                width: width * 0.45,   // ✅ fixed width for consistency
                                height: 200,          // ✅ fixed height to avoid long cards
                            }}>
                        <TransactionalPreferencesItems onPress={onPress} amount={item.Amount} count={item.Count} country={item.Country} countryName={item.CountryName} reason={item.Reason} status={item.Status} columnIndex={index} totalColumns={preferCountry.length} />
                    </View>
                )}
            />}
        </View>

    );
};

export default TransactionalPreferences;
