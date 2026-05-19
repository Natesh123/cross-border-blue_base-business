import React, { memo } from 'react';
import { ImageBackground, StyleSheet, KeyboardAvoidingView, View } from 'react-native';
import COLORS from "../constants/Colors";
import { SIZES } from '../constants/Assets';
type Props = {
  children: React.ReactNode;
  style?: any;
};

const Container = ({ children, style }: Props) => (

  <KeyboardAvoidingView style={[styles.container, style]} behavior="padding">
    {children}
  </KeyboardAvoidingView>


);

const styles = StyleSheet.create({

  container: {
    flex: 1,
    width: '100%',

  },

});

export default memo(Container);
