import {
  View,
  useWindowDimensions,
  ImageURISource,
  StyleSheet,
  ViewStyle,
  Text,
  Platform,
  Image
} from 'react-native';
import React from 'react';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import { FONTS, SIZES } from '../../../constants/Assets';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  item: { text: string; description: string; image: ImageURISource; showPlane?: boolean };
  index: number;
  x: Animated.SharedValue<number>;
  style?: ViewStyle;
};

const ListItem = ({ item, index, x, style }: Props) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

  const rnImageStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [0.8, 1, 0.8],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [40, 0, 40],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }, { translateY }],
      opacity: interpolate(
        x.value,
        [(index - 0.6) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 0.6) * SCREEN_WIDTH],
        [0, 1, 0],
        Extrapolate.CLAMP
      ),
    };
  }, [index, x]);

  const rnTextStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [60, 0, 60],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
      opacity: interpolate(
        x.value,
        [(index - 0.4) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 0.4) * SCREEN_WIDTH],
        [0, 1, 0],
        Extrapolate.CLAMP
      ),
    };
  }, [index, x]);

  return (
    <View style={[styles.itemContainer, { width: SCREEN_WIDTH }]}>
      <View style={styles.topDecoration}>
        <LinearGradient
          colors={['rgba(14, 165, 233, 0.1)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={styles.contentWrapper}>
        <Animated.View style={[styles.imageWrapper, rnImageStyle]}>
          <View style={styles.imageBacking}>
            <LinearGradient
              colors={['#ffffff', '#f0f9ff']}
              style={styles.backingGradient}
            />
            <Image
              source={item.image}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          {/* Subtle reflection effect */}
          <View style={styles.reflection} />
        </Animated.View>

        <Animated.View style={[styles.textContainer, rnTextStyle]}>
          <Text style={styles.title}>
            {item.text}
          </Text>
          <View style={styles.accentBar} />
          <Text style={styles.description}>
            {item.description}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

export default React.memo(ListItem);

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  imageWrapper: {
    marginTop: 100,
    marginBottom: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBacking: {
    width: 220,
    height: 220,
    borderRadius: 60,
    backgroundColor: '#fff',
    padding: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0ea5e9',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
      },
      android: {
        elevation: 15,
      }
    }),
  },
  backingGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  reflection: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    zIndex: -1,
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.semibold,
    color: '#0369a1',
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  accentBar: {
    width: 50,
    height: 4,
    backgroundColor: '#0ea5e9',
    borderRadius: 2,
    marginBottom: 20,
  },
  description: {
    fontSize: SIZES.small,
    fontFamily: FONTS.medium,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
    opacity: 0.85,
  },
  planeIcon: {
    fontSize: 14,
    color: '#0ea5e9',
  }
});
