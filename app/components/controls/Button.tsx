import React, { memo } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { theme } from '../../core/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS, SIZES } from 'app/constants/Assets';
import Vector from 'app/assets/vectors';

type TIcon = "add" | "delete" | "edit" | "save";

type Props = {
  onPress?: () => void,
  children?: React.ReactNode,
  outerLine?: boolean,
  style?: StyleProp<ViewStyle>;
  icon?: TIcon;
  disabled?: boolean,
};
const Button = ({ children, onPress, style, outerLine, icon, disabled=false }: Props) => {


  const renderIcon = () => {
    return (
      <Vector
        as="materialicons"
        name={icon}
        size={20}
        color={theme.colors.buttonColor}
      />
    );
  };

  return (<LinearGradient
    colors={[theme.colors.buttonPrimary, theme.colors.buttonSecondary]}
    start={{ x: -0.1, y: 0.0 }}
    end={{ x: 1.1, y: 0.4 }}
    style={[styles.grediant, style]}>
    <TouchableOpacity disabled={disabled} style={[styles.buttonContainer, {opacity: disabled ? 0.5 : 1, backgroundColor: outerLine ? theme.colors.buttonColor : theme.colors.transparent }]} onPress={onPress}>
      <View style={{
        flexDirection: "row",
        alignSelf: 'center',
        justifyContent: 'center',
      }}>
        {!!icon && renderIcon()}
        <Text style={[styles.buttonText, { color: outerLine ? theme.colors.buttonPrimary : theme.colors.buttonColor }]}>
          {children}
        </Text>
      </View>
    </TouchableOpacity>
  </LinearGradient>
  )
};

const styles = StyleSheet.create({

  grediant: {
    alignItems: 'center',
    borderRadius: 12,
    padding: 1,
  },
  buttonContainer: {
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 9,
    alignSelf: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  buttonText: {
    textAlign: 'center',
    color: theme.colors.buttonPrimary,
    alignSelf: 'center',
    fontFamily: FONTS.semibold,
    fontSize: SIZES.font
  },
  button: {
    marginVertical: 10,
    marginHorizontal: 20,
    padding: 0
  },
  text: {
    fontFamily: FONTS.monoBold,
    fontSize: 15,
    lineHeight: 26,
    textAlign: 'center',
    color: theme.colors.buttonColor
  },
});

export default memo(Button);
