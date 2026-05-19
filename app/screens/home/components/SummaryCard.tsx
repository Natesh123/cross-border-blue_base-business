import { View, Text, FlatList, useWindowDimensions, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { FONTS, SIZES } from "../../../constants/Assets";
import Vector from "app/assets/vectors";
import SummaryItem from "./items/SummaryItem";
import { SummaryModel } from "app/models/summary-model";

interface IProps {
    currency: string;
    value: string;
    count: string;
    beneficiaries: string;
}

const SummaryCard = ({ currency, value, count, beneficiaries }: IProps) => {
    const { width } = useWindowDimensions();

    const rawSummary = [
        {
            id: 1,
            icon: "cash-outline",
            title: "Transaction value",
            value: `${currency} ${value || "0.00"}`
        },
        {
            id: 2,
            icon: "stats-chart-outline",
            title: "Transaction Count",
            value: `${count || "0"}`
        },
        {
            id: 3,
            icon: "people-outline",
            title: "Beneficiaries",
            value: `${beneficiaries || "0"}`
        },
    ];

    const LastMonthSummary: SummaryModel[] = rawSummary.map((item, index) => ({
        ...item,
        columnIndex: index,
        totalColumns: rawSummary.length
    }));

    return (
        <View style={localStyles.container}>
            <View style={localStyles.header}>
                <View>
                    <Text style={localStyles.title}>Last month summary</Text>
                    <View style={localStyles.titleAccent} />
                </View>

                <View style={[localStyles.periodBadge]}>
                    <Vector as="feather" name="calendar" size={12} color="#64748b" />
                    <Text style={localStyles.periodTxt}>MONTHLY</Text>
                </View>
            </View>

            <FlatList
                data={LastMonthSummary}
                keyExtractor={(item: any) => item.id.toString()}
                horizontal
                nestedScrollEnabled={true}
                contentContainerStyle={localStyles.listContent}
                snapToInterval={(width - 50) / 2 + 15} // Restored original logic
                decelerationRate="fast"
                snapToAlignment="start"
                renderItem={({ item, index }) => <SummaryItem {...item} columnIndex={index} totalColumns={LastMonthSummary.length} />}
                showsHorizontalScrollIndicator={false}
            />
        </View>
    );
};

const localStyles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    header: {
        marginBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: SIZES.large,
        fontFamily: FONTS.bold,
        color: "#0f172a",
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    titleAccent: {
        height: 4,
        width: 25,
        backgroundColor: '#6366f1', // Indigo accent for summary
        marginTop: 4,
        borderRadius: 10,
    },
    periodBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    periodTxt: {
        fontSize: SIZES.p9,
        fontFamily: FONTS.bold,
        color: '#64748b',
        letterSpacing: 1,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 5,
    }
});

export default SummaryCard;
