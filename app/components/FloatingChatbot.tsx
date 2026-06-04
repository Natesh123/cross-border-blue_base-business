import React, { useEffect, useRef } from "react";
import {
    TouchableOpacity,
    StyleSheet,
    Animated,
    Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "app/constants/Colors";

const FloatingChatbot = () => {
    const navigation = useNavigation<any>();
    const scaleValue = useRef(new Animated.Value(1)).current;

    // Pulse animation to draw attention, like Swiggy Genie
    useEffect(() => {
        const pulseAnimation = Animated.sequence([
            Animated.timing(scaleValue, {
                toValue: 1.1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
        ]);

        Animated.loop(pulseAnimation).start();
    }, []);

    const handlePress = () => {
        navigation.navigate("ChatSupport");
    };

    return (
        <Animated.View style={[styles.container, { transform: [{ scale: scaleValue }] }]}>
            <TouchableOpacity
                style={styles.button}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <Ionicons name="chatbubbles" size={28} color="#fff" />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 20,
        right: 20,
        zIndex: 999,
    },
    button: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.primary, // Using the primary color of the app
        justifyContent: "center",
        alignItems: "center",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
            },
            android: {
                elevation: 8,
            },
        }),
    },
});

export default FloatingChatbot;
