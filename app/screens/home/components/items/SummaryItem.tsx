import { View, Text, StyleSheet, Platform, useWindowDimensions } from "react-native";
import React from "react";
import { FONTS, SIZES } from "../../../../constants/Assets";
import Vector from "app/assets/vectors";
import { SummaryModel } from "app/models/summary-model";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp } from "react-native-reanimated";

type Props = SummaryModel;

const SummaryItem = ({ id, icon, title, value, columnIndex, totalColumns }: Props) => {
    const { width } = useWindowDimensions();
    const isFirst = columnIndex === 0;
    const isLast = columnIndex === totalColumns - 1;

    const config = [
        { main: '#0ea5e9', light: '#f0f9ff', border: '#bae6fd', iconBg: ['#0ea5e9', '#0284c7'] },
        { main: '#6366f1', light: '#eef2ff', border: '#c7d2fe', iconBg: ['#6366f1', '#4f46e5'] },
        { main: '#10b981', light: '#ecfdf5', border: '#a7f3d0', iconBg: ['#10b981', '#059669'] },
    ];
    const itemConfig = config[(id - 1) % config.length];

    return (
        <Animated.View
            entering={FadeInUp.delay(columnIndex * 120).duration(700)}
            style={[
                localStyles.card,
                {
                    marginLeft: isFirst ? 0 : 15,
                    width: (width - 50) / 2,
                }
            ]}
        >
            {/* Left accent bar */}
            <View style={[localStyles.accentSide, { backgroundColor: itemConfig.main }]} />

            <View style={localStyles.cardContent}>
                {/* Icon + Title Row */}
                <View style={localStyles.topRow}>
                    <LinearGradient
                        colors={itemConfig.iconBg}
                        style={localStyles.iconCircle}
                    >
                        <Vector as="ionicons" name={icon} size={14} color="#ffffff" />
                    </LinearGradient>
                    <Text style={localStyles.titleText} numberOfLines={1}>{title}</Text>
                </View>

                {/* Divider */}
                <View style={[localStyles.divider, { backgroundColor: itemConfig.border }]} />

                {/* Value Row */}
                <View style={localStyles.valueRow}>
                    <Text style={[localStyles.valueText, { color: itemConfig.main }]}>{value}</Text>
                    <View style={[localStyles.trendDot, { backgroundColor: itemConfig.light, borderColor: itemConfig.border }]}>
                        <Vector as="materialicons" name="trending-up" size={10} color={itemConfig.main} />
                    </View>
                </View>
            </View>
        </Animated.View>
    );
};

const localStyles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 18,
        flexDirection: 'row',
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#64748b',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 10,
            },
            android: { elevation: 3 },
        }),
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    accentSide: {
        width: 4,
    },
    cardContent: {
        flex: 1,
        padding: 14,
        justifyContent: 'space-between',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconCircle: {
        width: 28,
        height: 28,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText: {
        fontSize: SIZES.p10,
        fontFamily: FONTS.semibold,
        color: '#64748b',
        flex: 1,
    },
    divider: {
        height: 1,
        marginVertical: 10,
        borderRadius: 1,
    },
    valueRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    valueText: {
        fontSize: SIZES.large,
        fontFamily: FONTS.bold,
    },
    trendDot: {
        width: 22,
        height: 22,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
});

export default SummaryItem;
