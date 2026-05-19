import React, { memo } from 'react';
import { Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, Platform } from 'react-native';
import { theme } from '../core/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS, SIZES } from 'app/constants/Assets';

type Props = {
  onPress?: () => void,
  children?: React.ReactNode,
  outerLine?: boolean,
  style?: StyleProp<ViewStyle>;
};

const Button = ({ children, onPress, style, outerLine }: Props) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={[styles.buttonWrapper, outerLine && styles.outerLine]}
  >
    <LinearGradient
      colors={[theme.colors.buttonPrimary, theme.colors.buttonSecondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0.5 }}
      style={[styles.gradient, style]}
    >
      <Text style={styles.text}>{children}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  buttonWrapper: {
    marginVertical: 8,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.buttonPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  outerLine: {
    borderWidth: 1,
    borderColor: theme.colors.buttonPrimary,
    backgroundColor: 'transparent',
  },
  text: {
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.buttonColor,
    fontFamily: FONTS.semibold,
    letterSpacing: 0.5,
  },
});

export default memo(Button);
