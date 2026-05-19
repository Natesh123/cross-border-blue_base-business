import React, { useEffect, useState } from "react";
import { Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";

import { theme } from 'app/core/theme';
import Container from "app/theme/Container";
import styles from "app/styles";
import { emailValidator, passwordValidator } from "app/core/utils";
import { SafeAreaView } from "react-native-safe-area-context";
import { authenticate, GetCountryList, GetDocument, GetGDPR, GetNationality, GetRemitterProfile, RemitterPostRegistration } from "app/http-services";
import { useRecoilState } from "recoil";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { ProfileState } from "app/atoms";
import Toast from "react-native-toast-message";
import Spinner from "react-native-loading-spinner-overlay";
import Button from "app/components/controls/Button";
import Picker from "app/components/customComponents/Picker";
import { TDropDown } from "types";
import RmDatePicker from "app/components/controls/RmDatePicker";
import moment from 'moment';
import ModalHeaderBack from "app/components/ModalHeaderBack";
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import OWDatePicker from "app/components/customComponents/datePicker/OWDatePicker";
import CircularProgress from "app/components/CircularProgress";

const YourProfile = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const { width } = useWindowDimensions();
    const [profileItems, setProfileItems] = useRecoilState(ProfileState);
    const [profile, setProfile] = useState<any>('');
    const [loading, setLoading] = useState(false);

    const [title, setTitle] = useState<any>({ value: 'Mr', error: '' });
    const [firstName, setFirstName] = useState({ value: '', error: '' });
    const [remitterID, setRemitterID] = useState({ value: '', error: '' });
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
        {
            dataValue: "Mr", displayvalue: "Mr",
            ISDCode: undefined
        },
        {
            dataValue: "Mrs", displayvalue: "Mrs",
            ISDCode: undefined
        },
        {
            dataValue: "Ms", displayvalue: "Ms",
            ISDCode: undefined
        }]);

    const [genderList, setGenderList] = useState<TDropDown[]>([
        {
            dataValue: "M", displayvalue: "Male",
            ISDCode: undefined
        },
        {
            dataValue: "F", displayvalue: "Female",
            ISDCode: undefined
        }]);

    const [nationalityList, setNationalityList] = useState<TDropDown[]>([]);
    const [countryList, setCountryList] = useState<TDropDown[]>([]);
    const [checkedTermsRemitSMS, setCheckedTermsRemitSMS] = useState('N');
    const [checkedTermsRemitEMAIL, setCheckedTermsRemitEMAIL] = useState('N');
    const [checkedTermsInsureSMS, setCheckedTermsInsureSMS] = useState('N');
    const [checkedTermsInsureEMAIL, setCheckedTermsInsureEMAIL] = useState('N');
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 80 : 0;
    const [document, setDocument] = useState(0);


    useEffect(() => {
        fetchNationality(profileItems.tokenId, profileItems.remitterId);
        fetchCountryList(profileItems.tokenId, profileItems.remitterId);
        fetchRemitterProfile(profileItems.tokenId, profileItems.remitterId);
        fetchGDPR(profileItems.tokenId, profileItems.remitterId);
        fetchDocument(profileItems.tokenId, profileItems.remitterId);

    }, [isFocused]);

    const fetchDocument = async (tokenId: string, remitterId: string) => {
        try {
            setLoading(true);
            const response = GetDocument(tokenId);
            response.then((res: any) => {
                if (res.status === 200) {
                    if (res.data.StatusCode === "ER0000") {
                        if (res?.data?.Document) {
                            setDocument((res?.data?.Document as any[]).length);
                        }
                    } else {
                        setDocument(0)
                    }
                }
            })
                .catch((err) => {
                    console.error('Fetch Remitter Document', err.response?.data?.message)
                })
                .finally(() => setLoading(false));
        } catch (error) {
            console.error('Error Remitter profile:', error);
        }
    };


    const fetchGDPR = async (tokenId: string, remitterId: string) => {
        try {
            setLoading(true);
            const response = GetGDPR(tokenId);
            response.then((res: any) => {
                if (res.status === 200) {
                    setCheckedTermsRemitSMS(res?.data?.Option1)
                    setCheckedTermsRemitEMAIL(res?.data?.Consent)
                    setCheckedTermsInsureSMS(res?.data?.Option2)
                    setCheckedTermsInsureEMAIL(res?.data?.Option3)
                }
            })
                .catch((err) => {
                    console.error('Fetch Remitter profile', err.response?.data?.message)
                })
                .finally(() => setLoading(false));
        } catch (error) {
            console.error('Error Remitter profile:', error);
        }
    };


    const fetchRemitterProfile = async (tokenId: string, remitterId: string) => {
        try {
            setLoading(true);
            const response = GetRemitterProfile(tokenId);
            response.then((res: any) => {
                if (res.status === 200) {
                    setProfile(res?.data?.Sender);
                    setTitle({ value: res?.data?.Sender?.Title, error: '' });
                    setFirstName({ value: res?.data?.Sender?.FirstName, error: '' });
                    setRemitterID({ value: res?.data?.Sender?.RemitterID, error: '' });
                    setLastName({ value: res?.data?.Sender?.LastName, error: '' });
                    setEmail({ value: res?.data?.Sender?.Email, error: '' });
                    setMobile({ value: res?.data?.Sender?.Mobile, error: '' });
                    setGender({ value: res?.data?.Sender?.Gender, error: '' });
                    setDateOfBirth({ value: moment(res?.data?.Sender?.DOB, "MM/DD/YYYY").toDate(), error: '' });
                    setNationality({ value: res?.data?.Sender?.Nationality, error: '' });
                    setAddressLine1({ value: res?.data?.Sender?.Address1, error: '' });
                    setAddressLine2({ value: res?.data?.Sender?.Address2, error: '' });
                    setCountry({ value: res?.data?.Sender?.Country, error: '' });
                    setCity({ value: res?.data?.Sender?.City, error: '' });
                    setPostCode({ value: res?.data?.Sender?.PostCode, error: '' });
                }
            })
                .catch((err) => {
                    console.error('Fetch Remitter profile', err.response?.data?.message)
                })
                .finally(() => setLoading(false));
        } catch (error) {
            console.error('Error Remitter profile:', error);
        }
    };

    const fetchNationality = async (tokenId: string, remitterId: string) => {
        try {
            setLoading(true);
            const response = GetNationality(tokenId);
            response.then((res: any) => {
                if (res.status === 200) {
                    if (res?.data?.StatusCode === 'ER0000') {
                        const _NationalityList = res?.data?.Nationality.map((data: any) => {
                            return {
                                dataValue: data.Alpha_3_Code,
                                displayvalue: data.Nationalityy,
                            }
                        });

                        setNationalityList(_NationalityList)
                        setNationality({ value: _NationalityList[0].dataValue, error: '' });

                    }
                }
            })
                .catch((err) => {
                    console.error('GetNationality', err.response?.data?.message)
                })
                .finally(() => setLoading(false));
        } catch (error) {
            console.error('Error nationality:', error);
        }
    };

    const fetchCountryList = async (tokenId: string, remitterId: string) => {
        try {
            setLoading(true);
            const response = GetCountryList(tokenId);
            response.then((res: any) => {
                if (res.status === 200) {
                    if (res?.data?.StatusCode === 'ER0000') {
                        const _CountryList = res?.data?.CountryDetail.map((data: any) => {
                            return {
                                dataValue: data.Alpha_3_Code,
                                displayvalue: data.CountryName,
                            }
                        });
                        setCountryList(_CountryList)
                        setCountry({ value: _CountryList[0].dataValue, error: '' });
                    }
                }
            })
                .catch((err) => {
                    console.error('GetCountryList', err.response?.data?.message)
                })
                .finally(() => setLoading(false));
        } catch (error) {
            console.error('Error country list:', error);
        }
    };

    const _onUpdatePressed = async () => {
        setLoading(true)
        const postData: any = {
            tokenId: profileItems.tokenId,
            remitterId: profileItems.remitterId,
            addressLine1: addressLine1.value,
            addressLine2: addressLine2.value,
            city: city.value,
            country: country.value,
            countryName: '',
            postCode: postCode.value,
            dateOfBirth: '2024-09-17',
            email: email.value,
            title: title.value,
            firstName: firstName.value,
            lastName: lastName.value,
            gender: gender.value,
            mobile: mobile.value,
            nationality: nationality.value,
        };
        const response = RemitterPostRegistration(postData);
        response.then((res: any) => {
            if (res.status === 200) {
                if (res.data.StatusCode === "ER0000") {
                    // Toast.show({
                    //     type: 'success',
                    //     text1: 'Post registration',
                    //     text2: res.data.StatusMsg
                    // });
                    setProfileItems({
                        remitterId: profileItems.remitterId,
                        firstName: firstName.value,
                        lastName: lastName.value,
                        email: email.value,
                        mobileNo: mobile.value,
                        tokenId: profileItems.tokenId,
                    });
                    // navigation.navigate('Root');
                    navigation.navigate("Review" as never);

                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Post registration',
                        text2: res.data.StatusMsg
                    });
                }
            }
        })
            .catch((err: any) => {
                Toast.show({
                    type: 'error',
                    text1: 'Login',
                    text2: err
                });
            })
            .finally(() => setLoading(false));
    }

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [datePickerVisible, setDatePickerVisible] = useState(false);

    const showDatePicker = () => {
        setDatePickerVisible(true);
        setSelectedDate(dateOfBirth.value);
    };

    const hideDatePicker = () => {
        setDatePickerVisible(false);
    };

    const handleConfirm = (date: Date) => {
        setDateOfBirth({ value: date, error: '' });
        setDatePickerVisible(false);
    };

    return (
        <SafeAreaView style={[styles.container, { flex: 1, backgroundColor: '#0EA5E9' }]}>
            <ModalHeaderBack title="You" />
            <CircularProgress size={40} strokeWidth={6} progress={40} />

            <Container style={{ backgroundColor: '#f9f9f9', flex: 1 }}>
                <ScrollView style={{ width: "100%", padding: 10, marginBottom: 70 }} showsVerticalScrollIndicator={false}>
                    <View>
                        <View >
                            <Text style={styles.header}>Your Personal Details </Text>
                            <Text style={{ fontSize: 12, color: '#666', marginBottom: 15 }}>Please enter your information to proceed</Text>
                        </View>
                        <View >

                            <View pointerEvents="none" style={styles.inputContainer}>
                                {/* Label and KYC Documents in same row */}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={styles.inputLabel}>
                                        Remitter Id
                                    </Text>
                                    <TouchableOpacity onPress={() => console.log("View KYC Documents Pressed")}>
                                        <Text style={{ color: '#4B7BEC', fontSize: 12 }}>View KYC Documents {document}</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Input Box */}
                                <View style={styles.inputControls}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        value={remitterID.value}
                                        onChangeText={(text: any) => setRemitterID({ value: text, error: '' })}
                                        editable={false}
                                    />
                                </View>
                            </View>

                            <View pointerEvents="none" style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>
                                    First name
                                </Text>
                                <View style={styles.inputControls}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        value={firstName.value}
                                        onChangeText={(text: any) => setFirstName({ value: text, error: '' })}

                                    />
                                </View>
                                {firstName.error ? <Text style={styles.error}>{firstName.error}</Text> : null}
                            </View>
                            <View pointerEvents="none" style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>
                                    Last name
                                </Text>
                                <View style={styles.inputControls}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        value={lastName.value}
                                        onChangeText={(text: any) => setLastName({ value: text, error: '' })}

                                    />
                                </View>
                                {lastName.error ? <Text style={styles.error}>{lastName.error}</Text> : null}
                            </View>
                            <View pointerEvents="none" style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>
                                    Email id
                                </Text>
                                <View style={styles.inputControls}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        value={email.value}
                                        onChangeText={(text: any) => setEmail({ value: text, error: '' })}
                                        editable={false}
                                    />
                                </View>
                                {email.error ? <Text style={styles.error}>{email.error}</Text> : null}
                            </View>
                            <View pointerEvents="none" style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>
                                    Mobile
                                </Text>
                                <View style={styles.inputControls}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        value={mobile.value}
                                        onChangeText={(text: any) => setMobile({ value: text, error: '' })}
                                        editable={false}
                                    />
                                </View>
                                {mobile.error ? <Text style={styles.error}>{mobile.error}</Text> : null}
                            </View>

                            <Picker pointerEvents="none"
                                label="Gender"
                                dataList={genderList}
                                errorText={gender.error}
                                style={{
                                    borderWidth: 0,
                                    height: 50,
                                    padding: 12,
                                    fontSize: 16,
                                    width: '100%',
                                    backgroundColor: '#fff',
                                    outlineStyle: 'none',
                                } as any}
                                selectedValue={gender.value}
                                onValueChange={(itemValue, itemIndex) =>
                                    setGender({ value: itemValue, error: '' })
                                }>
                            </Picker>

                            <OWDatePicker label="Date of Birth"
                                errorText={dateOfBirth.error}
                                date={dateOfBirth.value}
                                onDateChange={(text: any) => setDateOfBirth({ value: text, error: '' })}></OWDatePicker>
                            <Picker pointerEvents="none"
                                label="Nationality"
                                dataList={nationalityList}
                                errorText={nationality.error}
                                selectedValue={nationality.value}
                                style={{
                                    borderWidth: 0,
                                    height: 50,
                                    padding: 12,
                                    fontSize: 16,
                                    width: '100%',
                                    backgroundColor: '#fff',
                                    outlineStyle: 'none',
                                } as any}
                                onValueChange={(itemValue, itemIndex) =>
                                    setNationality({ value: itemValue, error: '' })
                                }>
                            </Picker>

                            <View pointerEvents="none" style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>
                                    Address line 1
                                </Text>
                                <View style={styles.inputControls}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        value={addressLine1.value}
                                        onChangeText={(text: any) => setAddressLine1({ value: text, error: '' })}

                                    />
                                </View>
                                {addressLine1.error ? <Text style={styles.error}>{addressLine1.error}</Text> : null}
                            </View>
                            <View pointerEvents="none" style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>
                                    Address line 2
                                </Text>
                                <View style={styles.inputControls}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        value={addressLine2.value}
                                        onChangeText={(text: any) => setAddressLine2({ value: text, error: '' })}

                                    />
                                </View>
                                {addressLine2.error ? <Text style={styles.error}>{addressLine2.error}</Text> : null}
                            </View>
                            <View pointerEvents="none" >
                                <Picker
                                    label="Country"
                                    dataList={countryList}
                                    errorText={country.error}
                                    style={{
                                        borderWidth: 0,
                                        height: 50,
                                        padding: 12,
                                        fontSize: 16,
                                        width: '100%',
                                        backgroundColor: '#fff',
                                        outlineStyle: 'none',
                                    } as any}
                                    selectedValue={country.value}
                                    onValueChange={(itemValue, itemIndex) =>
                                        setCountry({ value: itemValue, error: '' })
                                    }
                                ></Picker>
                            </View>


                            <View pointerEvents="none" style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>
                                    City
                                </Text>
                                <View style={styles.inputControls}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        value={city.value}
                                        onChangeText={(text: any) => setCity({ value: text, error: '' })}

                                    />
                                </View>
                                {city.error ? <Text style={styles.error}>{city.error}</Text> : null}
                            </View>
                            <View pointerEvents="none" style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>
                                    Post code
                                </Text>
                                <View style={styles.inputControls}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        value={postCode.value}
                                        onChangeText={(text: any) => setPostCode({ value: text, error: '' })}
                                    />
                                </View>
                                {postCode.error ? <Text style={styles.error}>{postCode.error}</Text> : null}
                            </View>



                        </View>
                    </View>
                </ScrollView>
                {loading && <Spinner
                    visible={true}
                    size='large'
                    animation='slide'
                />}
            </Container>
            <View style={{
                width: '100%',
                padding: 10,
                backgroundColor: '#fff',
                position: 'absolute',
                bottom: 0,
                left: 0
            }}>

                <View style={styles.bottomButton}>
                    <Button style={styles.largeButton} onPress={_onUpdatePressed}>
                        Confirm & Continue
                    </Button>
                </View>
            </View>

        </SafeAreaView>
    );
};



export default YourProfile;
