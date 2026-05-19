import React, { useState } from "react";
import { LayoutChangeEvent, View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export const CollapsableContainer = ({
  children,
  expanded,
}: {
  children: React.ReactNode;
  expanded: boolean;
}) => {
  const [height, setHeight] = useState(10);
  const animatedHeight = useSharedValue(10);

  const onLayout = (event: LayoutChangeEvent) => {
    const onLayoutHeight = event.nativeEvent.layout.height;

    if (onLayoutHeight > 10 && height !== onLayoutHeight) {
      setHeight(onLayoutHeight);
    }
  };

  const collapsableStyle = useAnimatedStyle(() => {
    animatedHeight.value = expanded ? withTiming(height) : withTiming(10);

    return {
      height: animatedHeight.value,
    };
  }, [expanded, height]);

  return (
    <Animated.View style={[collapsableStyle]}>
      <View onLayout={onLayout}>
        {children}
      </View>
    </Animated.View>
  );
};