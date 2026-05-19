import React, {useState} from 'react';
import {Platform, View} from 'react-native';
import { ScrollView as PaperScrollView } from 'react-native';

type Props = {
  persistentScrollbar?: boolean,
  children?: React.ReactNode,
} ;

export default function ScrollView({
  persistentScrollbar = false,
  children,
  ...other
}: Props) {
  const [nativeEvent, setNativeEvent] = useState();

  if (Platform.OS === 'android' || !persistentScrollbar) {
    return (
      <PaperScrollView persistentScrollbar={persistentScrollbar} {...other}>
        {children}
      </PaperScrollView>
    );
  }



  return (
    <PaperScrollView
      scrollEventThrottle={5}
      showsVerticalScrollIndicator={false}
      {...other}>
      {children}

      <View
        style={{
          position: 'absolute',
          right: 4,
          height: 200,
          width: 4,
          borderRadius: 20,
          backgroundColor: 'gray',
        }}
      />
    </PaperScrollView>
  );
}