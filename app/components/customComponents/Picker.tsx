import React, { memo, useRef } from 'react';
import { View, Text } from 'react-native';
import { Picker as PickerSelect } from "@react-native-picker/picker";
import styles from "../../styles";

type Props = React.ComponentProps<typeof PickerSelect> & {
  label: string,
  dataList: { dataValue: string, displayvalue: string }[],
  errorText?: string
};

const Picker = ({ label, dataList, errorText, ...props }: Props) => {
  const pickerRef = useRef<any>();

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputControls}>
        <PickerSelect
          style={[styles.input, { flex: 1 }]}
          ref={pickerRef}
          {...props}
        >
          {dataList.map((item) => (
            <PickerSelect.Item
              key={item.dataValue}
              label={item.displayvalue}
              value={item.dataValue}
            />
          ))}
        </PickerSelect>
      </View>
      {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
    </View>
  );
};

export default memo(Picker);
