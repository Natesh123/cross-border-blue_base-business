import React, { useEffect, useState } from "react";
import {
    Image,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp, Layout, FadeInRight } from "react-native-reanimated";
import { useRecoilState, useRecoilValue } from "recoil";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import Spinner from "react-native-loading-spinner-overlay";
import moment from 'moment';
import DateTimePicker from "@react-native-community/datetimepicker";
import { RFValue } from "react-native-responsive-fontsize";

import { ProfileState } from "../../atoms";
import { GetNationality, GetRemitterProfile, GetCountryList, RemitterPostRegistration } from "app/http-services";
import { FONTS, SIZES, SHADOWS } from "app/constants/Assets";
import Vector from "app/assets/vectors";
import ModalPicker from "app/components/customComponents/ModalPicker";
import { TDropDown } from "types";

const PostRegistration = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const { width } = useWindowDimensions();
    const [profileItems, setProfileItems] = useRecoilState(ProfileState);
    const [profile, setProfile] = useState<any>('');
    const [loading, setLoading] = useState(false);

    const [title, setTitle] = useState<any>({ value: 'Mr', error: '' });
    const [firstName, setFirstName] = useState({ value: '', error: '' });
    const [lastName, setLastName] = useState({ value: '', error: '' });
    const [email, setEmail] = useState({ value: profileItems.email, error: '' });
    const [mobile, setMobile] = useState({ value: profileItems.mobileNo, error: '' });
    const [gender, setGender] = useState<any>({ value: 'M', error: '' });
    const [dateOfBirth, setDateOfBirth] = useState({ value: new Date(), error: '' });
    const [nationality, setNationality] = useState<any>({ value: '', error: '' });
    const [addressLine1, setAddressLine1] = useState({ value: '', error: '' });
    const [addressLine2, setAddressLine2] = useState({ value: '', error: '' });
    const [country, setCountry] = useState<any>({ value: '', error: '' });
    const [city, setCity] = useState({ value: '', error: '' });
    const [postCode, setPostCode] = useState({ value: '', error: '' });

    const [titleList, setTitleList] = useState<TDropDown[]>([
        { dataValue: "Mr", displayvalue: "Mr", name: "Mr", Alpha_2_Code: "", ISDCode: undefined, flag: undefined, price: undefined, description: undefined },
        { dataValue: "Mrs", displayvalue: "Mrs", name: "Mrs", Alpha_2_Code: "", ISDCode: undefined, flag: undefined, price: undefined, description: undefined },
        { dataValue: "Ms", displayvalue: "Ms", name: "Ms", Alpha_2_Code: "", ISDCode: undefined, flag: undefined, price: undefined, description: undefined }
    ]);

    const [genderList, setGenderList] = useState<TDropDown[]>([
        { dataValue: "M", displayvalue: "Male", name: "Male", Alpha_2_Code: "M", ISDCode: undefined, flag: undefined, price: undefined, description: undefined },
        { dataValue: "F", displayvalue: "Female", name: "Female", Alpha_2_Code: "F", ISDCode: undefined, flag: undefined, price: undefined, description: undefined }
    ]);

    const [nationalityList, setNationalityList] = useState<TDropDown[]>([]);
    const [countryList, setCountryList] = useState<TDropDown[]>([]);
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        if (isFocused) {
            fetchInitialData();
        }
    }, [isFocused]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchNationality(profileItems.tokenId),
                fetchCountryList(profileItems.tokenId),
                fetchRemitterProfile(profileItems.tokenId)
            ]);
        } catch (error) {
            console.error("Error fetching initial data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRemitterProfile = async (tokenId: string) => {
        try {
            const res: any = await GetRemitterProfile(tokenId);
            if (res.status === 200) {
                const sender = res?.data?.Sender;
                setProfile(sender);
                setTitle({ value: sender?.Title || 'Mr', error: '' });
                setFirstName({ value: sender?.FirstName || '', error: '' });
                setLastName({ value: sender?.LastName || '', error: '' });
                setEmail({ value: sender?.Email || profileItems.email, error: '' });
                setMobile({ value: sender?.Mobile || profileItems.mobileNo, error: '' });
                setGender({ value: sender?.Gender || 'M', error: '' });

                let dobDate = new Date();
                if (sender?.DOB) {
                    const cleanDate = String(sender.DOB).replace(/\\\//g, "/");
                    const m = moment(cleanDate, [moment.ISO_8601, "MM/DD/YYYY", "YYYY-MM-DD", "DD-MM-YYYY", "DD/MM/YYYY"]);
                    if (m.isValid()) dobDate = m.toDate();
                }
                setDateOfBirth({ value: dobDate, error: '' });
                setNationality({ value: sender?.Nationality || '', error: '' });
                setAddressLine1({ value: sender?.Address1 || '', error: '' });
                setAddressLine2({ value: sender?.Address2 || '', error: '' });
                setCountry({ value: sender?.Country || '', error: '' });
                setCity({ value: sender?.City || '', error: '' });
                setPostCode({ value: sender?.PostCode || '', error: '' });
            }
        } catch (err) {
            console.error('Fetch Remitter profile error:', err);
        }
    };

    const fetchNationality = async (tokenId: string) => {
        try {
            const res: any = await GetNationality(tokenId);
            if (res.status === 200 && res?.data?.StatusCode === 'ER0000') {
                const _NationalityList = res?.data?.Nationality.map((data: any) => ({
                    dataValue: data.Alpha_3_Code,
                    displayvalue: data.Nationalityy,
                }));
                setNationalityList(_NationalityList);
                if (!nationality.value && _NationalityList.length > 0) {
                    setNationality({ value: _NationalityList[0].dataValue, error: '' });
                }
            }
        } catch (error) {
            console.error('Error nationality:', error);
        }
    };

    const fetchCountryList = async (tokenId: string) => {
        try {
            const res: any = await GetCountryList(tokenId);
            if (res.status === 200 && res?.data?.StatusCode === 'ER0000') {
                const _CountryList = res?.data?.CountryDetail.map((data: any) => ({
                    dataValue: data.Alpha_3_Code,
                    displayvalue: data.CountryName,
                }));
                setCountryList(_CountryList);
                if (!country.value && _CountryList.length > 0) {
                    setCountry({ value: _CountryList[0].dataValue, error: '' });
                }
            }
        } catch (error) {
            console.error('Error country list:', error);
        }
    };

    const _onUpdatePressed = async () => {
        // Simple validation
        if (!firstName.value) { setFirstName({ ...firstName, error: "First name is required" }); return; }
        if (!lastName.value) { setLastName({ ...lastName, error: "Last name is required" }); return; }

        setLoading(true);
        const postData: any = {
            tokenId: profileItems.tokenId,
            remitterId: profileItems.remitterId,
            addressLine1: addressLine1.value,
            addressLine2: addressLine2.value,
            city: city.value,
            country: country.value,
            countryName: '',
            postCode: postCode.value,
            dateOfBirth: moment(dateOfBirth.value).format('YYYY-MM-DD'),
            email: email.value,
            title: title.value,
            firstName: firstName.value,
            lastName: lastName.value,
            gender: gender.value,
            mobile: mobile.value,
            nationality: nationality.value,
        };

        try {
            const res: any = await RemitterPostRegistration(postData);
            if (res.status === 200) {
                if (res.data.StatusCode === "ER0000") {
                    Toast.show({ type: 'success', text1: 'Success', text2: res.data.StatusMsg });
                    setProfileItems({
                        ...profileItems,
                        firstName: firstName.value,
                        lastName: lastName.value,
                        email: email.value,
                        mobileNo: mobile.value,
                    });
                    navigation.navigate('Root' as never);
                } else {
                    Toast.show({ type: 'error', text1: 'Update Failed', text2: res.data.StatusMsg });
                }
            }
        } catch (err: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: err.message || "An error occurred" });
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label: string, value: string, onChangeText: (text: string) => void, error: string, editable: boolean = true, placeholder: string = "") => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={[styles.inputBox, !editable && styles.disabledInput]}>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    editable={editable}
                    placeholder={placeholder}
                    placeholderTextColor="#94a3b8"
                />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Elite Hero Header */}
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
                            <Text style={styles.headerTitle}>Post Registration</Text>
                            <Text style={styles.headerSub}>Complete your personal profile</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View
                        entering={FadeInDown.duration(600).delay(100)}
                        style={styles.sectionCard}
                    >
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionLabel}>YOUR PERSONAL DETAILS</Text>
                            <View style={styles.pulseDot} />
                        </View>

                        <ModalPicker
                            label="Title"
                            modalTitle="Select Title"
                            placeholder="Select Title"
                            dataList={titleList}
                            style={styles.pickerStyle}
                            selectedValue={title.value}
                            onValueChange={(itemValue) => setTitle({ value: itemValue, error: '' })}
                        />

                        {renderInput("First name", firstName.value, (text) => setFirstName({ value: text.replace(/[^a-zA-Z\s]/g, ""), error: '' }), firstName.error)}
                        {renderInput("Last name", lastName.value, (text) => setLastName({ value: text.replace(/[^a-zA-Z\s]/g, ""), error: '' }), lastName.error)}
                        {renderInput("Email id", email.value, () => { }, email.error, false)}
                        {renderInput("Mobile", mobile.value, (text) => setMobile({ value: text.replace(/[^0-9]/g, ""), error: '' }), mobile.error, false)}

                        <ModalPicker
                            label="Gender"
                            modalTitle="Select Gender"
                            placeholder="Select Gender"
                            dataList={genderList}
                            style={styles.pickerStyle}
                            selectedValue={gender.value}
                            onValueChange={(itemValue) => setGender({ value: itemValue, error: '' })}
                        />

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Date of Birth</Text>
                            <TouchableOpacity
                                onPress={() => setShowPicker(true)}
                                style={styles.inputBox}
                            >
                                <Text style={styles.dateText}>{dateOfBirth.value.toLocaleDateString()}</Text>
                                <Vector as="ionicons" name="calendar-outline" size={20} color="#64748b" />
                            </TouchableOpacity>

                            {showPicker && (
                                <DateTimePicker
                                    value={dateOfBirth.value}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        setShowPicker(false);
                                        if (selectedDate) {
                                            const age = moment().diff(selectedDate, 'years');
                                            if (age < 15) {
                                                setDateOfBirth({ value: selectedDate, error: 'You must be at least 15 years old' });
                                            } else {
                                                setDateOfBirth({ value: selectedDate, error: '' });
                                            }
                                        }
                                    }}
                                />
                            )}
                            {dateOfBirth.error ? <Text style={styles.errorText}>{dateOfBirth.error}</Text> : null}
                        </View>

                        <ModalPicker
                            label="Nationality"
                            modalTitle="Select Nationality"
                            placeholder="Select Nationality"
                            dataList={nationalityList}
                            style={styles.pickerStyle}
                            selectedValue={nationality.value}
                            onValueChange={(itemValue) => setNationality({ value: itemValue, error: '' })}
                        />
                    </Animated.View>

                    <Animated.View
                        entering={FadeInDown.duration(600).delay(300)}
                        style={[styles.sectionCard, { marginTop: 24 }]}
                    >
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionLabel}>ADDRESS DETAILS</Text>
                            <View style={[styles.pulseDot, { backgroundColor: '#8b5cf6' }]} />
                        </View>

                        {renderInput("Address line 1", addressLine1.value, (text) => setAddressLine1({ value: text, error: '' }), addressLine1.error)}
                        {renderInput("Address line 2", addressLine2.value, (text) => setAddressLine2({ value: text, error: '' }), addressLine2.error, true, "Optional")}

                        <ModalPicker
                            label="Country"
                            modalTitle="Select Country"
                            placeholder="Select Country"
                            dataList={countryList}
                            style={styles.pickerStyle}
                            selectedValue={country.value}
                            onValueChange={(itemValue) => setCountry({ value: itemValue, error: '' })}
                        />

                        {renderInput("City", city.value, (text) => setCity({ value: text.replace(/[^a-zA-Z\s]/g, ""), error: '' }), city.error)}
                        {renderInput("Post code", postCode.value, (text) => setPostCode({ value: text.replace(/[^0-9]/g, ""), error: '' }), postCode.error)}
                    </Animated.View>

                    <View style={{ height: 120 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Floating Update Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    onPress={_onUpdatePressed}
                    activeOpacity={0.8}
                    style={styles.updateButton}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={['#0369a1', '#0ea5e9']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.updateGradient}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <View style={styles.buttonContent}>
                                <Text style={styles.updateText}>Update Profile</Text>
                                <Vector as="ionicons" name="arrow-forward" size={18} color="#fff" />
                            </View>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0ea5e9" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    headerWrapper: {
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        paddingBottom: 15,
        ...SHADOWS.shadow8,
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
        fontSize: SIZES.h2,
        fontFamily: FONTS.bold,
        color: '#fff',
    },
    headerSub: {
        fontSize: SIZES.h4,
        fontFamily: FONTS.medium,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 1,
    },
    body: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: 24,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        ...SHADOWS.shadow,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionLabel: {
        fontSize: SIZES.h3,
        fontFamily: FONTS.bold,
        color: "#64748b",
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#0ea5e9",
        marginLeft: 10,
    },
    inputContainer: {
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: SIZES.h3,
        fontFamily: FONTS.semibold,
        color: "#334155",
        marginBottom: 6,
        marginLeft: 4,
    },
    inputBox: {
        height: 42,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    input: {
        flex: 1,
        fontSize: SIZES.h3,
        fontFamily: FONTS.medium,
        color: '#1e293b',
        ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any),
    },
    disabledInput: {
        backgroundColor: '#f1f5f9',
        borderColor: '#cbd5e1',
        opacity: 0.7,
    },
    dateText: {
        flex: 1,
        fontSize: SIZES.h3,
        fontFamily: FONTS.medium,
        color: '#1e293b',
    },
    pickerStyle: {
        width: '100%',
        marginBottom: 16,
    },
    errorText: {
        fontSize: SIZES.h4,
        color: '#ef4444',
        fontFamily: FONTS.medium,
        marginTop: 4,
        marginLeft: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: 'rgba(248, 250, 252, 0.9)',
    },
    updateButton: {
        height: 44,
        borderRadius: 16,
        overflow: 'hidden',
        ...SHADOWS.shadow8,
    },
    updateGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    updateText: {
        fontSize: SIZES.h3,
        fontFamily: FONTS.bold,
        color: '#fff',
        marginRight: 8,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
});

export default PostRegistration;
