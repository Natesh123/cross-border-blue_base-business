import { View, Text, ViewStyle, TextInput } from "react-native";
import React, { useEffect, useState } from "react";
import styles from "app/styles";
import { useIsFocused } from "@react-navigation/native";

type Props = { 
    style?: ViewStyle
};

const MobileWallet = ({ style }: Props) => {
    const isFocused = useIsFocused(); 
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Add any effect logic if needed
    }, [isFocused]);

    return (
        <View style={style}>
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mobile Wallet Number</Text>
                <View style={[styles.inputControls, { flexDirection: 'row', alignItems: 'center' }]}>
                    {/* Country Code */}
                    <View style={{
                        paddingHorizontal: 8,
                        paddingVertical: 12,
                        borderColor: '#ccc',
                        borderWidth: 1,
                        borderRightWidth: 0,
                        borderTopLeftRadius: 4,
                        borderBottomLeftRadius: 4,
                        backgroundColor: '#f5f5f5'
                    }}>
                        <Text style={{ fontSize: 16 }}>+91</Text>
                    </View>

                    {/* Input Field */}
                    <TextInput
                        style={[
                            styles.input,
                            {
                                flex: 1,
                                borderTopLeftRadius: 0,
                                borderBottomLeftRadius: 0,
                                borderLeftWidth: 0
                            }
                        ]}
                        placeholder="Enter Mobile Wallet Number"
                        keyboardType="phone-pad"
                    />
                </View>
            </View>
        </View>
    );
};

export default MobileWallet;
