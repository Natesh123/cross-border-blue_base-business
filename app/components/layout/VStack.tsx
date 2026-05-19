import React from 'react'
import { StyleSheet, StyleProp, ViewStyle, View, FlexAlignType, ViewProps } from 'react-native'

type VStackProps = ViewProps & {
  align?: FlexAlignType
  style?: StyleProp<ViewStyle>
}

const VStack: React.FC<VStackProps> = ({ align = 'stretch', style, children, ...delegated }) => {
  return (
    <View style={[styles.vStack, { alignItems: align }, style]} {...delegated}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  vStack: {
    flexDirection: 'column'
  }
})

export default VStack