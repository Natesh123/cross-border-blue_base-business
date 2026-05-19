import { StyleSheet, View, useWindowDimensions, Platform } from 'react-native';
import React, { useCallback } from 'react';
import Animated, {
  Extrapolate,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

type Props = {
  length: number;
  x: Animated.SharedValue<number>;
};

const PaginationComponent = ({
  index,
  x,
  SCREEN_WIDTH,
}: {
  index: number;
  x: Animated.SharedValue<number>;
  SCREEN_WIDTH: number;
}) => {
  const itemRnStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      x.value,
      [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
      [0.8, 1.3, 0.8],
      Extrapolate.CLAMP
    );

    const bgColor = interpolateColor(
      x.value,
      [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
      ['#475569', '#22D3EE', '#475569']
    );

    const shadowOpacity = interpolate(
      x.value,
      [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
      [0, 0.8, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      backgroundColor: bgColor,
      ...Platform.select({
        ios: {
          shadowOpacity,
        },
        android: {
          elevation: shadowOpacity * 8,
        },
      }),
    };
  }, [x, index, SCREEN_WIDTH]);

  return <Animated.View style={[styles.itemStyle, itemRnStyle]} />;
};

const PaginationElement = ({ length, x }: Props) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => {
        return (
          <PaginationComponent
            index={index}
            key={index}
            x={x}
            SCREEN_WIDTH={SCREEN_WIDTH}
          />
        );
      })}
    </View>
  );
};

export default React.memo(PaginationElement);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemStyle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 10,
    shadowColor: '#22D3EE',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
  },
});