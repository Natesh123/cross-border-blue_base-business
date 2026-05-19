import React, { memo } from 'react';
import { View, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { TextInput as Input } from 'react-native-paper';
import { theme } from '../core/theme';

type Props = React.ComponentProps<typeof Input> & { errorText?: string };

const TextInput = ({ errorText, style, ...props }: Props) => {
  const { width } = useWindowDimensions();

  return (
    <View>
      <Input
        selectionColor={theme.colors.white}
        underlineColor="transparent"
        mode="flat"
        style={[
          {
            backgroundColor: '#fff', 
            width: width * 0.4,
            height: 40, 
          },
          style,
        ]}
        contentStyle={{
          height: 40,
          paddingVertical: 0,
          paddingHorizontal: 0,
        }}
        theme={{
          colors: {
            background: '#fff',
            primary: theme.colors.white,
            text: '#000',
          },
        }}
        {...props}
      />
      {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  error: {
    fontSize: 14,
    color: theme.colors.error,
    paddingHorizontal: 4,
    paddingTop: 4,
  },
});

export default memo(TextInput);
