import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs/lib/typescript/src/types';
 
import TabShape from "./curve";
import { theme } from '../../core/theme';
import Vector from 'app/assets/vectors';
type Props = BottomTabBarButtonProps & {
  bgColor?: string;
};

export const TabBarAdvancedButton: React.FC<Props> = ({
  bgColor,
  ...props
}) =>{ 
  return (
  <View
    style={styles.container} 
  >
   
    <TouchableOpacity
      style={styles.button}
      onPress={props.onPress}
    >
        <View  
                  style={{ width: 100,
                    height: 100,
                borderRadius:50,
                justifyContent:'center',
                alignItems:'center'
                }} >
                     
                   <Vector
                  as="ionicons"
                  name="paper-plane"
                  size={50}
                  color={theme.colors.secondary}
                />
                </View>
                
    </TouchableOpacity>
    <TabShape />
  </View>
);
}
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    position: 'absolute',  
    justifyContent: 'center',
    top:30
  },
  button: {
    top: -22.5,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    borderRadius: 27,
    backgroundColor: '#E94F37',
  },
  buttonIcon: {
    fontSize: 16,
    color: '#F6F7EB'
  }
});