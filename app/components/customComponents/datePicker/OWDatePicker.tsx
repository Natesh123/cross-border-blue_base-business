import Vector from 'app/assets/vectors';
import { theme } from 'app/core/theme';
import styles from 'app/styles';
import React, { memo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
type Props = { label: string, date: Date, onDateChange: any } & { errorText?: string };

const OWDatePicker = ({ label, date, onDateChange, errorText }: Props) => {


    const [selectedDate, setSelectedDate] = useState(new Date());
    const [datePickerVisible, setDatePickerVisible] = useState(false);

    const showDatePicker = () => {
        setDatePickerVisible(true);
        setSelectedDate(date);
    };

    const hideDatePicker = () => {
        setDatePickerVisible(false);
    };

    const handleConfirm = (date: Date) => {
        onDateChange(date);
        setDatePickerVisible(false);
    };

    const isWeb = Platform.OS === 'web';

    return (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
                {label}
            </Text>

            <TouchableOpacity
                style={styles.inputControls}
                onPress={!isWeb ? showDatePicker : undefined}
                activeOpacity={1}
            >
                <TextInput
                    style={[styles.input, { flex: 1, width: undefined }]}
                    placeholderTextColor={theme.colors.black50}
                    returnKeyType="done"
                    value={moment(date).isValid() ? moment(date).format('DD-MMM-YYYY') : ''}
                    editable={false}
                    pointerEvents="none"
                />
                <Vector
                    as="materialcommunityicons"
                    name='calendar-month'
                    size={30}
                    color={theme.colors.black50}
                    onPress={!isWeb ? showDatePicker : undefined}
                    style={{ marginLeft: 10 }}
                />

                {isWeb && (
                    <input
                        type="date"
                        value={moment(date).format('YYYY-MM-DD')}
                        onChange={(e: any) => {
                            const newDate = moment(e.target.value, 'YYYY-MM-DD').toDate();
                            onDateChange(newDate);
                        }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer',
                            zIndex: 10,
                        }}
                    />
                )}
            </TouchableOpacity>

            {!isWeb && (
                <DateTimePickerModal
                    date={selectedDate}
                    isVisible={datePickerVisible}
                    mode="date"
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                />
            )}

            {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
        </View>
    )
};

export default memo(OWDatePicker);
