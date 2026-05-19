import React, { memo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS, SIZES } from 'app/constants/Assets';
import Vector from 'app/assets/vectors';

type Props = {
  buttons: string[],
  width: number,
  onPress: ((button: string) => void),
};

const GroupButton = ({ buttons, width, onPress }: Props) => {
  const [selection, setSelection] = useState(buttons[0]);
  const translateX = useSharedValue(0);

  // Constants for layout based on the user's preferred design
  const pillWidth = width;
  const margin = 4;

  const _onPressed = (selected: string, index: number) => {
    setSelection(selected);
    translateX.value = withSpring(index * (pillWidth + margin), {
      damping: 20,
      stiffness: 100,
    });
    onPress(selected);
  };

  const getIcon = (btn: string) => {
    switch (btn.toLowerCase()) {
      case 'money_remittance':
      case 'money transfer': return { as: 'materialcommunityicons', name: 'bank-transfer' };
      case 'airtopup':
      case 'airtime topup': return { as: 'materialcommunityicons', name: 'cellphone-wireless' };
      default: return null;
    }
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.outerContainer}>
      <View style={styles.btnGroup}>
        {/* Sliding Active Indicator */}
        <Animated.View
          style={[
            styles.indicatorWrapper,
            { width: pillWidth },
            animatedIndicatorStyle
          ]}
        >
          <LinearGradient
            colors={['#0369a1', '#0ea5e9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.indicatorPill}
          />
        </Animated.View>

        {buttons.map((btn, index) => {
          const isSelected = selection === btn;
          const icon = getIcon(btn);

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.9}
              style={[styles.btnWrapper, { width: pillWidth }]}
              onPress={() => _onPressed(btn, index)}
            >
              <View style={styles.contentWrapper}>
                {icon && (
                  <Vector
                    as={icon.as as any}
                    name={icon.name}
                    size={20}
                    color={isSelected ? "#fff" : "#64748b"}
                    style={styles.icon}
                  />
                )}
                <Text
                  style={[
                    styles.text,
                    { color: isSelected ? '#fff' : '#64748b' }
                  ]}
                >
                  {btn}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    padding: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  btnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  indicatorWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 2,
    zIndex: 0,
    paddingVertical: 2,
  },
  indicatorPill: {
    flex: 1,
    borderRadius: 12,
    ...Platform.select({
      ios: { shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  btnWrapper: {
    marginHorizontal: 2,
    zIndex: 1,
    paddingVertical: 10,
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.p13,
    textAlign: 'center',
  },
});

export default memo(GroupButton);