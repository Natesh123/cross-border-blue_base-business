import { useWindowDimensions, View, Text, StyleSheet, Platform } from "react-native";
import { RateModel } from 'app/models/rate-model';
import { FONTS, SIZES } from 'app/constants/Assets';
import CountryFlag from "react-native-country-flag";
import { LinearGradient } from "expo-linear-gradient";
import Vector from "app/assets/vectors";
import Animated, { FadeInUp } from "react-native-reanimated";

type Props = RateModel;

const RateItem = ({ id, fromRate, fromCurrency, toRate, toCurrency, countryCode, countryflag, columnIndex, totalColumns }: Props) => {
    const getCountryISO2 = require("country-iso-3-to-2");
    const isFirst = columnIndex === 0;
    const isLast = columnIndex === totalColumns - 1;
    const { width } = useWindowDimensions();

    return (
        <Animated.View
            entering={FadeInUp.delay(columnIndex * 120).duration(700)}
            style={[
                localStyles.cardOuter,
                {
                    marginLeft: isFirst ? 0 : 15,
                    width: (width - 50) / 2,
                }
            ]}
        >
            <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                style={localStyles.cardInner}
            >
                {/* Live indicator dot */}
                <View style={localStyles.liveRow}>
                    <View style={localStyles.liveDot} />
                    <Text style={localStyles.liveText}>LIVE</Text>
                </View>

                {/* Currency Pair Header */}
                <View style={localStyles.pairRow}>
                    <View style={localStyles.fromCurrencyBox}>
                        <Text style={localStyles.fromCurrencyText}>{fromCurrency}</Text>
                    </View>
                    <View style={localStyles.arrowCircle}>
                        <Vector as="feather" name="arrow-right" size={10} color="#0ea5e9" />
                    </View>
                    <View style={localStyles.toCurrencyBox}>
                        <View style={localStyles.flagMini}>
                            <CountryFlag
                                isoCode={getCountryISO2(countryCode) || ""}
                                size={14}
                            />
                        </View>
                        <Text style={localStyles.toCurrencyText}>{toCurrency}</Text>
                    </View>
                </View>

                {/* Hero Rate */}
                <View style={localStyles.rateHero}>
                    <Text style={localStyles.ratePrefix}>{fromRate} {fromCurrency} =</Text>
                    <View style={localStyles.rateValueRow}>
                        <Text style={localStyles.rateAmount}>{toRate}</Text>
                        <View style={localStyles.trendBadge}>
                            <Vector as="materialicons" name="trending-up" size={10} color="#059669" />
                        </View>
                    </View>
                </View>

                {/* Bottom accent stripe */}
                <LinearGradient
                    colors={['#0ea5e9', '#0284c7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={localStyles.accentStripe}
                />

                {/* Decorative elements */}
                <View style={localStyles.decorCircle1} />
                <View style={localStyles.decorCircle2} />
            </LinearGradient>
        </Animated.View>
    );
};

const localStyles = StyleSheet.create({
    cardOuter: {
        borderRadius: 22,
        backgroundColor: '#ffffff',
        ...Platform.select({
            ios: {
                shadowColor: '#0369a1',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
            },
            android: { elevation: 5 },
        }),
    },
    cardInner: {
        borderRadius: 22,
        padding: 12,
        height: 110,
        justifyContent: 'space-between',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    liveRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#22c55e',
    },
    liveText: {
        fontSize: SIZES.p9,
        fontFamily: FONTS.bold,
        color: '#22c55e',
        letterSpacing: 1,
    },
    pairRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 2,
    },
    fromCurrencyBox: {
        backgroundColor: '#0ea5e9',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    fromCurrencyText: {
        fontSize: SIZES.p9,
        fontFamily: FONTS.bold,
        color: '#ffffff',
        letterSpacing: 0.5,
    },
    arrowCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#f0f9ff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#bae6fd',
    },
    toCurrencyBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        gap: 4,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    flagMini: {
        width: 16,
        height: 12,
        borderRadius: 2,
        overflow: 'hidden',
    },
    toCurrencyText: {
        fontSize: SIZES.p9,
        fontFamily: FONTS.bold,
        color: '#334155',
        letterSpacing: 0.5,
    },
    rateHero: {
        marginTop: 0,
    },
    ratePrefix: {
        fontSize: SIZES.p10,
        fontFamily: FONTS.medium,
        color: '#94a3b8',
    },
    rateValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 1,
    },
    rateAmount: {
        fontSize: SIZES.medium,
        fontFamily: FONTS.bold,
        color: '#0f172a',
    },
    trendBadge: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#ecfdf5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#a7f3d0',
    },
    accentStripe: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
    },
    decorCircle1: {
        position: 'absolute',
        top: -10,
        right: -10,
        width: 35,
        height: 35,
        borderRadius: 18,
        backgroundColor: 'rgba(14, 165, 233, 0.04)',
    },
    decorCircle2: {
        position: 'absolute',
        bottom: 15,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(14, 165, 233, 0.03)',
    },
});

export default RateItem;