import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  StatusBar,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS, SIZES } from "app/constants/Assets";
import COLORS from "app/constants/Colors";
import Vector from "app/assets/vectors";
import { RFValue } from "react-native-responsive-fontsize";

const { width } = Dimensions.get('window');

const Faq = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Enable LayoutAnimation for Android
  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    setLoading(false);
  }, []);

  const faqData = [
    {
      id: 1,
      category: "General",
      question: "What is money remittance?",
      answer:
        "Money remittance is the process of sending money from one place to another, typically across borders.",
      icon: "earth"
    },
    {
      id: 2,
      category: "Process",
      question: "How do I send money using this platform?",
      answer:
        "You can send money by signing up, verifying your identity, and selecting your recipient and amount.",
      icon: "send"
    },
    {
      id: 3,
      category: "Coverage",
      question: "Which countries can I send money to?",
      answer:
        "We support over 50 countries. The list is available during the send money process.",
      icon: "map-marker"
    },
    {
      id: 4,
      category: "Security",
      question: "What documents are required for verification?",
      answer:
        "You’ll need to provide a valid government-issued ID and sometimes proof of address. Accepted formats: JPG, JPEG, PNG, or PDF, with a max file size of 2MB.",
      icon: "shield-check"
    },
    {
      id: 5,
      category: "Timing",
      question: "How long does the transfer take?",
      answer:
        "Transfers usually complete within minutes to 2 business days depending on the country and method.",
      icon: "clock-outline"
    },
    {
      id: 6,
      category: "Fees",
      question: "Are there any fees?",
      answer:
        "Fees depend on the country, currency, and transfer method. You’ll see the fee before confirming.",
      icon: "currency-usd"
    },
    {
      id: 7,
      category: "Security",
      question: "Is my money safe?",
      answer:
        "Yes. We use encrypted secure transactions and comply with financial regulations.",
      icon: "lock-outline"
    },
    {
      id: 8,
      category: "Tracking",
      question: "Can I track my transfer?",
      answer:
        "Yes. You can view real-time status from your dashboard after sending money.",
      icon: "radar"
    },
    {
      id: 9,
      category: "Coverage",
      question: "What currencies are supported?",
      answer:
        "We support major global currencies including USD, GBP, EUR, INR, and more.",
      icon: "cash-multiple"
    },
  ];


  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ELITE HERO HEADER */}
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
              <Vector as="ionicons" name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.titleBox}>
              <Text style={styles.headerTitle}>Help Center</Text>
              <Text style={styles.headerSub}>Frequently Asked Questions</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading FAQs...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {faqData.map((item, index) => {
            const isExpanded = expandedIndex === index;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.card,
                  isExpanded && styles.expandedCard
                ]}
                activeOpacity={0.9}
                onPress={() => toggleExpand(index)}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: isExpanded ? '#0EA5E9' : '#F1F5F9' }]}>
                    <MaterialCommunityIcons
                      name={item.icon as any}
                      size={20}
                      color={isExpanded ? '#fff' : '#64748B'}
                    />
                  </View>
                  <View style={styles.questionContainer}>
                    <Text style={[styles.categoryText, isExpanded && { color: '#0EA5E9' }]}>
                      {item.category}
                    </Text>
                    <Text style={[styles.title, isExpanded && styles.expandedTitle]}>
                      {item.question}
                    </Text>
                  </View>
                  <View style={[styles.chevronBox, isExpanded && styles.expandedChevronBox]}>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={isExpanded ? "#fff" : "#94A3B8"}
                    />
                  </View>
                </View>

                {isExpanded && (
                  <View style={styles.answerContainer}>
                    <View style={styles.answerDivider} />
                    <Text style={styles.description}>
                      {item.answer}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Need more help section */}
          <View style={styles.supportSection}>
            <Text style={styles.supportTitle}>Still have questions?</Text>
            <Text style={styles.supportSub}>We're here to help you 24/7</Text>

            <TouchableOpacity style={styles.contactBtn}>
              <LinearGradient
                colors={['#0369a1', '#0ea5e9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.contactGradient}
              >
                <Ionicons name="chatbubbles-outline" size={20} color="#fff" />
                <Text style={styles.contactBtnText}>Contact Support</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default Faq;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAF8",
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
  titleBox: {
    marginLeft: 18,
  },
  headerTitle: {
    fontSize: SIZES.h1,
    fontFamily: FONTS.bold,
    color: '#fff',
  },
  headerSub: {
    fontSize: SIZES.p11,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: FONTS.medium,
    marginTop: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  expandedCard: {
    borderColor: '#BAE6FD',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: { shadowColor: '#0EA5E9', shadowOpacity: 0.1, shadowRadius: 15 },
      android: { elevation: 5 }
    })
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionContainer: {
    flex: 1,
    marginLeft: 14,
  },
  categoryText: {
    fontSize: SIZES.p11,
    fontFamily: FONTS.bold,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  title: {
    fontSize: SIZES.p18,
    fontFamily: FONTS.bold,
    color: "#1E293B",
  },
  expandedTitle: {
    color: '#0EA5E9',
  },
  chevronBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedChevronBox: {
    backgroundColor: '#0EA5E9',
  },
  answerContainer: {
    marginTop: 12,
  },
  answerDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  description: {
    fontSize: SIZES.p15,
    fontFamily: FONTS.regular,
    color: "#475569",
    lineHeight: 18,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontFamily: FONTS.medium,
    color: '#64748B',
  },
  supportSection: {
    marginTop: 30,
    backgroundColor: '#E0F2FE',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  supportTitle: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    color: '#0369a1',
  },
  supportSub: {
    fontSize: SIZES.p16,
    fontFamily: FONTS.medium,
    color: '#0ea5e9',
    marginTop: 4,
    marginBottom: 20,
  },
  contactBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  contactGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  contactBtnText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: SIZES.p20,
  },
});