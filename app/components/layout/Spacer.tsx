import React from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'

type SpacerProps = ViewProps & {
  x?: number
  y?: number
}

const Spacer: React.FC<SpacerProps> = ({ x, y, style, ...delegated }) => {
  const width = x || 1
  const height = y || 1

  return (
    <View
      style={[
        {
          width,
          minWidth: width,
          height,
          minHeight: height
        },
        styles.spacer,
        style
      ]}
      {...delegated}
    />
  )
}

const styles = StyleSheet.create({
  spacer: {}
})

export default Spacer