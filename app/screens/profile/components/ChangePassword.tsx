import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    useWindowDimensions,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Platform,
    ScrollView,
    KeyboardAvoidingView
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRecoilValue } from "recoil";
import Toast from "react-native-toast-message";

import { ProfileState } from "app/atoms";
import { PutChangePassword } from "app/http-services";
import { confirmPasswordValidator, passwordValidator } from "app/core/utils";
import { SIZES, FONTS } from "../../../constants/Assets";

const SectionHeader = ({ title, icon }: { title: string; icon: string }) => (
    <View style={localStyles.sectionHeaderBox}>
        <View style={localStyles.iconHalo}>
            <Ionicons name={icon as any} size={18} color="#0EA5E9" />
        </View>
        <Text style={localStyles.sectionTitleText}>{title}</Text>
    </View>
);

const PasswordInput = ({ label, value, onChange, error, secure, onToggleSecure, placeholder, icon }: any) => (
    <View style={localStyles.fieldGroup}>
        <View style={localStyles.labelRow}>
            <MaterialCommunityIcons name={icon} size={14} color="#64748B" style={{ marginRight: 6 }} />
            <Text style={localStyles.fieldLabel}>{label}</Text>
        </View>
        <View style={[localStyles.inputField, error ? { borderColor: '#ef4444' } : null]}>
            <TextInput
                style={localStyles.textValue}
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                placeholderTextColor="#94A3B8"
                secureTextEntry={secure}
            />
            <TouchableOpacity onPress={onToggleSecure} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name={secure ? "eye-off-outline" : "eye-outline"} size={20} color="#64748B" />
            </TouchableOpacity>
        </View>
        {error ? <Text style={localStyles.errorText}>{error}</Text> : null}
    </View>
);

const ChangePassword = () => {
    const { width: screenWidth } = useWindowDimensions();
    const currentToken = useRecoilValue(ProfileState);
    const [loading, setLoading] = useState(false);

    const [password, setPassword] = useState({ value: '', error: '' });
    const [newPassword, setNewPassword] = useState({ value: '', error: '' });
    const [confirmPassword, setConfirmPassword] = useState({ value: '', error: '' });

    const [secure, setSecure] = useState({ p: true, n: true, c: true });

    const onChangePassword = async () => {
        const pE = passwordValidator(password.value);
        const nE = passwordValidator(newPassword.value);
        const cE = confirmPasswordValidator(newPassword.value, confirmPassword.value);

        if (pE || nE || cE) {
            setPassword({ ...password, error: pE });
            setNewPassword({ ...newPassword, error: nE });
            setConfirmPassword({ ...confirmPassword, error: cE });
            return;
        }

        setLoading(true);
        try {
            const res: any = await PutChangePassword({
                tokenId: currentToken.tokenId,
                remitterId: currentToken.remitterId,
                newPassword: newPassword.value,
                oldPassword: password.value, // Fix: original logic used oldPassword
            });
            if (res.status === 200) {
                Toast.show({ type: 'success', text2: 'Password updated successfully' });
                setPassword({ value: '', error: '' });
                setNewPassword({ value: '', error: '' });
                setConfirmPassword({ value: '', error: '' });
            }
        } catch (e) {
            Toast.show({ type: 'error', text2: 'Failed to update password' });
        } finally {
            setLoading(false);
        }
    };

    const cardWidth = Math.min(screenWidth - 40, 560);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            <ScrollView
                style={{ flex: 1, backgroundColor: '#fff' }}
                contentContainerStyle={{ paddingVertical: 20, alignItems: 'center', paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[localStyles.card, { width: cardWidth }]}>
                    <SectionHeader title="SECURITY SETTINGS" icon="lock-closed-outline" />

                    <PasswordInput
                        label="CURRENT PASSWORD"
                        value={password.value}
                        onChange={(v: string) => setPassword({ value: v, error: '' })}
                        error={password.error}
                        secure={secure.p}
                        onToggleSecure={() => setSecure({ ...secure, p: !secure.p })}
                        placeholder="••••••••"
                        icon="key-outline"
                    />

                    <View style={localStyles.divider} />

                    <PasswordInput
                        label="NEW PASSWORD"
                        value={newPassword.value}
                        onChange={(v: string) => setNewPassword({ value: v, error: '' })}
                        error={newPassword.error}
                        secure={secure.n}
                        onToggleSecure={() => setSecure({ ...secure, n: !secure.n })}
                        placeholder="Min. 8 characters"
                        icon="lock-outline"
                    />

                    <PasswordInput
                        label="CONFIRM NEW PASSWORD"
                        value={confirmPassword.value}
                        onChange={(v: string) => setConfirmPassword({ value: v, error: '' })}
                        error={confirmPassword.error}
                        secure={secure.c}
                        onToggleSecure={() => setSecure({ ...secure, c: !secure.c })}
                        placeholder="Re-enter new password"
                        icon="lock-check-outline"
                    />

                    <TouchableOpacity onPress={onChangePassword} disabled={loading} style={localStyles.actionBtn}>
                        <LinearGradient colors={["#0EA5E9", "#0284C7"]} style={localStyles.gradient}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={localStyles.actionText}>REVISE SECURITY KEY</Text>}
                        </LinearGradient>
                    </TouchableOpacity>

                    <Text style={localStyles.hintText}>Updating your password will require re-authentication on all active sessions.</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const localStyles = StyleSheet.create({
    card: { backgroundColor: '#fff', borderRadius: 30, padding: 24, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 },
    sectionHeaderBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
    iconHalo: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    sectionTitleText: { fontSize: SIZES.p16, fontWeight: '900', color: '#0F172A', letterSpacing: 1.5, fontFamily: FONTS.bold },
    fieldGroup: { marginBottom: 20 },
    labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    fieldLabel: { fontSize: SIZES.p13, fontWeight: '800', color: '#64748B', letterSpacing: 1, fontFamily: FONTS.bold },
    inputField: { height: 52, backgroundColor: '#F8FAFC', borderRadius: 15, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
    textValue: { flex: 1, fontSize: SIZES.p16, fontWeight: '700', color: '#1E293B', fontFamily: FONTS.medium, ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any) },
    errorText: { color: '#ef4444', fontSize: SIZES.small, marginTop: 4, fontWeight: '600', fontFamily: FONTS.semibold },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10, marginBottom: 25 },
    actionBtn: { marginTop: 10, height: 56, borderRadius: 18, overflow: 'hidden' },
    gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    actionText: { color: '#fff', fontWeight: '900', fontSize: SIZES.p16, letterSpacing: 1, fontFamily: FONTS.bold },
    hintText: { textAlign: 'center', color: '#94A3B8', fontSize: SIZES.p11, marginTop: 15, lineHeight: 16, fontFamily: FONTS.medium },
});

export default ChangePassword;
