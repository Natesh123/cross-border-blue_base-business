import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Image,
    Animated,
    StatusBar,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { FONTS, SIZES } from "app/constants/Assets";
import Colors from "app/constants/Colors";

import { getBotResponse } from "app/constants/KnowledgeBase";

interface Message {
    id: string;
    text: string;
    sender: "bot" | "user";
    time: string;
}

const QUICK_REPLIES = [
    "What is Cross Border?",
    "How to send money?",
    "Exchange Rates",
    "Transfer Fees",
    "Transfer Time",
    "Sending Limits",
    "Receiver Information",
    "Account Opening",
    "Create Account",
    "Security",
    "Failed Transfer Refund",
    "Transaction Processing",
    "Refund Policy",
    "Add Beneficiary",
    "Wire Transfer",
    "Airtime Top-Up",
    "Referral Code",
    "Social Media Sharing",
    "Speak to Agent",
    "Wallet Balance"
];

const TypingDots = () => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animateDot = (dot: Animated.Value, delay: number) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(dot, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
                    Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true })
                ])
            ).start();
        };
        animateDot(dot1, 0);
        animateDot(dot2, 200);
        animateDot(dot3, 400);
    }, []);

    const dotStyle = (dot: Animated.Value) => ({
        opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
        transform: [{
            translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -3] })
        }]
    });

    return (
        <View style={styles.typingContainer}>
            <Animated.View style={[styles.typingDot, dotStyle(dot1)]} />
            <Animated.View style={[styles.typingDot, dotStyle(dot2)]} />
            <Animated.View style={[styles.typingDot, dotStyle(dot3)]} />
        </View>
    );
};

const ChatSupport = () => {
    const navigation = useNavigation();
    const scrollViewRef = useRef<ScrollView>(null);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "Hi! I'm Penny, your remittance assistant. I'm here 24/7 to help with transfers, rates, account queries, and anything else you need. What can I help you with today?",
            sender: "bot",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
    ]);
    const [inputText, setInputText] = useState("");
    const [isAgentHandoff, setIsAgentHandoff] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages, isTyping]);

    const handleSend = (text: string) => {
        if (!text.trim() || isAgentHandoff) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: text.trim(),
            sender: "user",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText("");
        setIsTyping(true);

        // Handle Agent Handoff Simulation
        if (text.toLowerCase().includes("speak to agent") || text.toLowerCase().includes("live agent") || text.toLowerCase().includes("human")) {
            setTimeout(() => {
                setIsTyping(false);
                const botReply: Message = {
                    id: (Date.now() + 1).toString(),
                    text: "This one needs a closer look from our team. I'm passing you to a human agent now and sharing all the details of our conversation so you won't need to repeat yourself. One moment please.",
                    sender: "bot",
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                setMessages((prev) => [...prev, botReply]);
                setIsAgentHandoff(true);
            }, 1500);
            return;
        }

        // Simulate bot typing & reply
        setTimeout(() => {
            setIsTyping(false);
            const botResponseText = getBotResponse(text);

            const botReply: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponseText,
                sender: "bot",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, botReply]);
        }, 1500);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            {/* Header */}
            <LinearGradient
                colors={['#0369a1', '#0ea5e9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerWrapper}
            >
                <SafeAreaView style={styles.safeHeader}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backCircle}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="chevron-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.headerInfo}>
                            <View style={styles.avatarContainer}>
                                <MaterialCommunityIcons name="robot-outline" size={24} color={Colors.primary} />
                            </View>
                            <View style={styles.titleBox}>
                                <Text style={styles.headerTitle}>Penny - Support</Text>
                                <Text style={styles.headerSub}>Typically replies instantly</Text>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <KeyboardAvoidingView
                style={styles.chatContainer}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {messages.map((msg) => (
                        <View
                            key={msg.id}
                            style={[
                                styles.messageBubble,
                                msg.sender === "user" ? styles.userBubble : styles.botBubble
                            ]}
                        >
                            <Text style={[styles.messageText, msg.sender === "user" && styles.userMessageText]}>
                                {msg.text}
                            </Text>
                            <Text style={[styles.timeText, msg.sender === "user" && styles.userTimeText]}>
                                {msg.time}
                            </Text>
                        </View>
                    ))}
                    {isTyping && <TypingDots />}
                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>Powered by Penny · Secure & FCA regulated</Text>
                    </View>
                </ScrollView>

                {/* Quick Replies - Always available horizontally above the input */}
                <View style={styles.quickRepliesWrapper}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.quickRepliesContainerHorizontal}
                    >
                        {QUICK_REPLIES.map((reply, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.quickReplyChip}
                                onPress={() => handleSend(reply)}
                            >
                                <Text style={styles.quickReplyText}>{reply}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Input Area */}
                <View style={styles.inputContainer}>
                    {isAgentHandoff ? (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 }}>
                            <Text style={{ fontFamily: FONTS.medium, color: Colors.primary }}>Connecting you to an agent...</Text>
                        </View>
                    ) : (
                        <>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Type a message..."
                                placeholderTextColor="#999"
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                            />
                            <TouchableOpacity
                                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                                onPress={() => handleSend(inputText)}
                                disabled={!inputText.trim()}
                            >
                                <Ionicons name="send" size={20} color="#fff" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.gray,
    },
    headerWrapper: {
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        paddingBottom: 15,
        ...Platform.select({
            ios: { shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 12 },
            android: { elevation: 8 },
        }),
    },
    safeHeader: {
        marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 5,
    },
    backCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    headerInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 18,
    },
    avatarContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    titleBox: {
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: SIZES.h1,
        fontFamily: FONTS.bold,
        color: "#fff",
    },
    headerSub: {
        fontSize: SIZES.p11,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 1,
    },
    chatContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: "80%",
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
    },
    botBubble: {
        backgroundColor: "#fff",
        alignSelf: "flex-start",
        borderBottomLeftRadius: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    userBubble: {
        backgroundColor: Colors.primary,
        alignSelf: "flex-end",
        borderBottomRightRadius: 4,
    },
    messageText: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: "#333",
        lineHeight: 20,
    },
    userMessageText: {
        color: "#fff",
    },
    timeText: {
        fontSize: 10,
        fontFamily: FONTS.regular,
        color: "#999",
        marginTop: 4,
        alignSelf: "flex-end",
    },
    userTimeText: {
        color: "rgba(255,255,255,0.7)",
    },
    quickRepliesWrapper: {
        backgroundColor: "#fff",
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    quickRepliesContainerHorizontal: {
        paddingHorizontal: 16,
        gap: 8, // Gap works in modern React Native horizontally too, but let's use margin in the chip just in case
    },
    quickReplyChip: {
        backgroundColor: "rgba(14, 165, 233, 0.1)",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(14, 165, 233, 0.3)",
        marginRight: 8,
    },
    quickReplyText: {
        color: Colors.primary,
        fontFamily: FONTS.medium,
        fontSize: 13,
    },
    inputContainer: {
        flexDirection: "row",
        padding: 12,
        paddingBottom: Platform.OS === "ios" ? 30 : 12,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#eee",
        alignItems: "center",
    },
    textInput: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        fontSize: 14,
        fontFamily: FONTS.regular,
        maxHeight: 100,
        minHeight: 40,
        color: "#333",
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
    },
    sendButtonDisabled: {
        backgroundColor: Colors.secondary,
    },
    typingContainer: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: "#fff",
        padding: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderBottomLeftRadius: 4,
        marginBottom: 12,
        height: 38,
    },
    typingDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary,
        marginHorizontal: 3,
    },
    footerContainer: {
        alignItems: "center",
        marginTop: 20,
        marginBottom: 10,
    },
    footerText: {
        fontSize: 10,
        fontFamily: FONTS.regular,
        color: "#999",
    },
});

export default ChatSupport;
