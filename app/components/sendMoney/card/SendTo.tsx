import { View, Text, useWindowDimensions } from "react-native";
import React, { useRef, useState } from "react";
import { FONTS, SIZES } from "../../../constants/Assets";
import COLORS from "../../../constants/Colors";
import styles from "../../../styles";
import TextInput from "app/components/TextInput";
import Picker from "app/components/customComponents/Picker";
import { CurvedBg } from "app/components/layout/Curved-bg";



const SendTo = () => {
    const { width } = useWindowDimensions();
    const [selectedValue, setSelectedValue] = useState<any>("GB");
    const [amount, setAmount] = useState({ value: '', error: '' });
    const [country, setCountry] = useState({ value: '', error: '' });

    const pickerRef = useRef<any>();
    const [fromCountry, setFromCountry] = useState<{ dataValue: string, displayvalue: string }[]>([
        { dataValue: "GB", displayvalue: "GBR" },
        { dataValue: "IN", displayvalue: "INR" }]);

    return (
        <View>
            <View style={[styles.cardMainWrapper, { padding: SIZES.p15 }]}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", }}>
                    <Text style={{ color: COLORS.black50, fontFamily: FONTS.light, marginBottom:5 }}>
                         Recipients Gets
                    </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems:'center' }}>
                    <View style={[styles.inputControls, { flex: 1, marginRight:5, height:52, marginBottom:5 }]}>
                        <TextInput 
                            returnKeyType="next"
                            value={amount.value}
                            onChangeText={(text: any) => setAmount({ value: text, error: '' })}
                            error={!!amount.error}
                            errorText={amount.error}
                            autoCapitalize="none"
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={{ width: 100,  marginLeft:5 }}>
                        <Picker
                            dataList={fromCountry}
                            errorText={country.error}
                            selectedValue={selectedValue}
                            style={{ borderWidth: 0, height: 50, padding: 12, fontSize: 16, width: '100%', fontFamily: FONTS.regular }}
                            onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)} label={""} /> 
                    </View>
                </View> 
            </View>
            {/* <View style={{ flexDirection: "row" }}>

                <View style={{ width: width * .7 }}>
                </View>
                <View style={{ alignItems: "center", width: width * .3 }}>
                    <CurvedBg color={'#fff'}
                        style={{
                            height: 90,
                            width: 90
                        }}></CurvedBg>
                </View>

            </View> */}             
        </View> 
    );
};

export default SendTo;
