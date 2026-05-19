import React from "react";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity, Text, StyleSheet, View, Platform, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS, SIZES } from "../constants/Assets";

type Props = {
    title?: string;
    subtitle?: string;
};

const SendMoneyHeader = ({ title = 'Send Money', subtitle = 'Transfer funds securely worldwide' }: Props) => {
    const navigation = useNavigation();

    return (
        <View style={styles.outerContainer}>
            <LinearGradient
                colors={['#0369a1', '#0ea5e9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                <View style={styles.content}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.textContainer}>
                        <Text style={styles.titleText}>{title}</Text>
                        <Text style={styles.subtitleText}>{subtitle}</Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        backgroundColor: '#fff',
    },
    container: {
        paddingTop: Platform.OS === 'ios' ? 45 : (StatusBar.currentHeight || 20) + 10,
        paddingBottom: 20,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: "#0ea5e9",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    textContainer: {
        marginLeft: 16,
        flex: 1,
    },
    titleText: {
        fontSize: SIZES.h2,
        fontWeight: '900',
        color: '#fff',
        fontFamily: FONTS.bold,
    },
    subtitleText: {
        fontSize: SIZES.p12,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 1,
        fontFamily: FONTS.medium,
    },
});

export default SendMoneyHeader;

