import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ViewStyle,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    useWindowDimensions,
    Platform
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import moment from "moment";
import { useRecoilValue } from "recoil";
import { useIsFocused } from "@react-navigation/native";

import { GetDocument, GetGDPR } from "app/http-services";
import { ProfileState } from "app/atoms";
import { FONTS, SIZES } from "../../../constants/Assets";
import Checkbox from "../../../components/Checkbox";

type Props = {
    profile: any;
    style?: ViewStyle;
};

const FieldRow = ({ label, value, icon }: { label: string; value?: string; icon: any }) => (
    <View style={localStyles.fieldGroup}>
        <View style={localStyles.labelRow}>
            <MaterialCommunityIcons name={icon} size={14} color="#64748B" style={{ marginRight: 6 }} />
            <Text style={localStyles.fieldLabel}>{label}</Text>
        </View>
        <View style={localStyles.inputField}>
            <TextInput
                style={localStyles.textValue}
                value={value || "Not provided"}
                editable={false}
            />
        </View>
    </View>
);

const SectionHeader = ({ title, icon }: { title: string; icon: string }) => (
    <View style={localStyles.sectionHeaderBox}>
        <View style={localStyles.iconHalo}>
            <Ionicons name={icon as any} size={18} color="#0EA5E9" />
        </View>
        <Text style={localStyles.sectionTitleText}>{title}</Text>
    </View>
);

const PersonalDetails = ({ profile }: Props) => {
    const { width: screenWidth } = useWindowDimensions();
    const isFocused = useIsFocused();
    const currentToken = useRecoilValue(ProfileState);
    const [documentCount, setDocumentCount] = useState(0);
    const [gdpr, setGdpr] = useState({ rSMS: 'N', rEmail: 'N', iSMS: 'N', iEmail: 'N' });

    useEffect(() => {
        if (isFocused) {
            fetchData();
        }
    }, [isFocused]);

    const fetchData = async () => {
        try {
            const docRes: any = await GetDocument(currentToken.tokenId);
            if (docRes.status === 200 && docRes.data.StatusCode === "ER0000") {
                setDocumentCount(docRes.data.Document?.length || 0);
            }

            const gdprRes: any = await GetGDPR(currentToken.tokenId);
            if (gdprRes.status === 200) {
                setGdpr({
                    rSMS: gdprRes.data.Option1,
                    rEmail: gdprRes.data.Consent,
                    iSMS: gdprRes.data.Option2,
                    iEmail: gdprRes.data.Option3
                });
            }
        } catch (e) {
            console.error("fetchData error:", e);
        }
    };

    const cardWidth = Math.min(screenWidth - 40, 600);

    const formattedDOB = profile?.DOB
        ? moment(profile.DOB).format('MMMM DD, YYYY')
        : "--";

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: '#fff' }}
            contentContainerStyle={{ paddingVertical: 20, alignItems: 'center', paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
        >
            <View style={[localStyles.card, { width: cardWidth }]}>
                <SectionHeader title="IDENTIFICATION" icon="person-outline" />

                <View style={localStyles.row}>
                    <FieldRow label="FIRST NAME" value={profile?.FirstName} icon="account" />
                    <FieldRow label="LAST NAME" value={profile?.LastName} icon="account-details" />
                </View>

                <FieldRow label="EMAIL ADDRESS" value={profile?.Email} icon="email-outline" />
                <FieldRow label="MOBILE CONTACT" value={profile?.Mobile} icon="phone-outline" />
                <FieldRow label="DATE OF BIRTH" value={formattedDOB} icon="calendar-month" />
            </View>

            <View style={[localStyles.card, { width: cardWidth, marginTop: 24 }]}>
                <SectionHeader title="RESIDENTIAL ADDRESS" icon="location-outline" />
                <FieldRow label="STREET ADDRESS (1)" value={profile?.Address1} icon="home-outline" />
                <FieldRow label="STREET ADDRESS (2)" value={profile?.Address2} icon="home-city-outline" />

                <View style={localStyles.row}>
                    <FieldRow label="COUNTRY" value={profile?.CountryName} icon="earth" />
                    <FieldRow label="POSTAL CODE" value={profile?.PostCode} icon="mailbox-outline" />
                </View>
            </View>

            <View style={[localStyles.card, { width: cardWidth, marginTop: 24 }]}>
                <SectionHeader title="VERIFICATION & CONSENT" icon="shield-checkmark-outline" />

                <View style={localStyles.infoPill}>
                    <Ionicons name="documents-outline" size={16} color="#0EA5E9" style={{ marginRight: 10 }} />
                    <Text style={localStyles.pillText}>KYC DOCUMENTS SUBMITTED: {documentCount}</Text>
                </View>

                <View style={localStyles.divider} />

                <View style={localStyles.consentGroup}>
                    <Text style={localStyles.consentLabel}>MARKETING PERMISSIONS</Text>

                    {[
                        { label: "SMS Notifications (Cross Border)", val: gdpr.rSMS },
                        { label: "Email Offers (Cross Border)", val: gdpr.rEmail },
                        { label: "SMS Notifications (Insure)", val: gdpr.iSMS },
                        { label: "Email Offers (Insure)", val: gdpr.iEmail },
                    ].map((item, idx) => (
                        <View key={idx} style={localStyles.checkboxRow}>
                            <Checkbox status={item.val === 'Y' ? 'checked' : 'unchecked'} onPress={() => { }} />
                            <Text style={localStyles.checkboxText}>{item.label}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const localStyles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 24,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
    },
    sectionHeaderBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconHalo: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sectionTitleText: { fontSize: SIZES.p16, fontWeight: '900', color: '#0F172A', letterSpacing: 1.5, fontFamily: FONTS.bold },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    fieldGroup: {
        flex: 1,
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    fieldLabel: { fontSize: SIZES.p13, fontWeight: '800', color: '#64748B', letterSpacing: 1, fontFamily: FONTS.bold },
    inputField: {
        height: 52,
        backgroundColor: '#F8FAFC',
        borderRadius: 15,
        paddingHorizontal: 16,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    textValue: { fontSize: SIZES.p20, fontWeight: '700', color: '#1E293B', fontFamily: FONTS.bold, ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any) },
    infoPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F9FF',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 15,
        marginBottom: 10,
    },
    pillText: {
        fontSize: SIZES.font,
        fontWeight: '800',
        color: '#0284C7',
        letterSpacing: 0.5,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 15,
    },
    consentGroup: {
        marginTop: 5,
    },
    consentLabel: {
        fontSize: SIZES.p15,
        fontWeight: '800',
        color: '#64748B',
        letterSpacing: 1,
        marginBottom: 15,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    checkboxText: {
        fontSize: SIZES.font,
        fontWeight: '600',
        color: '#334155',
        marginLeft: 10,
        flexShrink: 1,
    },
});

export default PersonalDetails;
