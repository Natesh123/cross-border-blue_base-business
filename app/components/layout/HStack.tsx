import React from 'react'
import { StyleSheet, StyleProp, ViewStyle, View, FlexAlignType, ViewProps } from 'react-native'

type HStackProps = ViewProps & {
  align?: FlexAlignType
  style?: StyleProp<ViewStyle>
}

const HStack: React.FC<HStackProps> = ({ align = 'stretch', style, children, ...delegated }) => {
  return (
    <View style={[styles.hStack, { alignItems: align }, style]} {...delegated}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  hStack: {
    flexDirection: 'row'
  }
})

export default HStack