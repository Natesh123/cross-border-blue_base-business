import React, { memo, useRef, useState } from 'react';
import { View, Text } from 'react-native'; 
import DatePicker from 'react-native-date-picker' 
import styles from "../../styles";

type Props = React.ComponentProps<typeof DatePicker> & { label: string} & { errorText?: string };

const RmDatePicker = ({ label, errorText, ...props }: Props) => {
    const pickerRef = useRef<any>();
    const [selectedValue, setSelectedValue] = useState("GB");


    return (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
                {label}
            </Text>
            <View style={styles.inputControls}>
                <DatePicker
                   style={[styles.input, { flex: 1 }]}
                    {...props}
                    ref={pickerRef}  > 
                </DatePicker>
                {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
            </View>
        </View>
    )
};

export default memo(RmDatePicker);
