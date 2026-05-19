import { SIZES } from 'app/constants/Assets';
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import CountryFlag from 'react-native-country-flag';

interface IProps {
    name?: string ;
    code: string;
}

const PickerItem = ({ name, code }:IProps) => (
  <View style={styles.pickerItem}>
    <CountryFlag isoCode={code} size={SIZES.p20} />

    <Text style={styles.label}>{name}</Text>
  </View>
);

const styles = StyleSheet.create({
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  label: {
    fontSize: 16,
  },
});

export default PickerItem;