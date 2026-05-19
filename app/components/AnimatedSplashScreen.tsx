import React, { useEffect } from 'react';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withRepeat,
    withSequence,
    Easing,
    runOnJS
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface Props {
    onAnimationComplete: () => void;
}

const AnimatedSplashScreen: React.FC<Props> = ({ onAnimationComplete }) => {
    const scale = useSharedValue(0.5);
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(50);
    const rotation = useSharedValue(0);
    const floatValue = useSharedValue(0);
    const ringScale1 = useSharedValue(0.8);
    const ringScale2 = useSharedValue(0.8);

    useEffect(() => {
        // Hide the native splash screen as soon as this component mounts
        SplashScreen.hideAsync().catch(() => { });

        // Stage 1: Entrance
        opacity.value = withTiming(1, { duration: 800 });
        translateY.value = withSpring(0, { damping: 12, stiffness: 100 });
        scale.value = withSpring(1, { damping: 12, stiffness: 100 });

        // Stage 2: Continuous Animations

        // Floating animation
        floatValue.value = withRepeat(
            withSequence(
                withTiming(-15, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        );

        // Slight rotation
        rotation.value = withRepeat(
            withSequence(
                withTiming(-0.05, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
                withTiming(0.05, { duration: 2000, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        );

        // Pulsing Rings
        ringScale1.value = withRepeat(
            withTiming(2, { duration: 2500, easing: Easing.out(Easing.ease) }),
            -1,
            false
        );

        setTimeout(() => {
            ringScale2.value = withRepeat(
                withTiming(2, { duration: 2500, easing: Easing.out(Easing.ease) }),
                -1,
                false
            );
        }, 1250);

        // Stage 3: Transition to app (after 3 seconds)
        const timer = setTimeout(() => {
            opacity.value = withTiming(0, { duration: 800 }, (completed) => {
                if (completed) {
                    runOnJS(onAnimationComplete)();
                }
            });
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const logoStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [
                { scale: scale.value },
                { translateY: translateY.value + floatValue.value },
                { rotate: `${rotation.value}rad` }
            ],
        };
    });

    const ringStyle1 = useAnimatedStyle(() => {
        const ringOpacity = (1 - (ringScale1.value - 0.8) / 1.2) * opacity.value * 0.4;
        return {
            opacity: Math.max(0, ringOpacity),
            transform: [{ scale: ringScale1.value }],
        };
    });

    const ringStyle2 = useAnimatedStyle(() => {
        const ringOpacity = (1 - (ringScale2.value - 0.8) / 1.2) * opacity.value * 0.4;
        return {
            opacity: Math.max(0, ringOpacity),
            transform: [{ scale: ringScale2.value }],
        };
    });

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <LinearGradient
                colors={['#ffffff', '#f0f9ff', '#e0f2fe']}
                style={styles.gradient}
            />

            {/* Animated Rings */}
            <Animated.View style={[styles.ring, ringStyle1]} />
            <Animated.View style={[styles.ring, ringStyle2]} />

            <Animated.View style={[styles.logoContainer, logoStyle]}>
                <View style={styles.imageShadow}>
                    <Image
                        source={require('../assets/logos/kashremit_logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    ring: {
        position: 'absolute',
        width: width * 0.4,
        height: width * 0.4,
        borderRadius: width * 0.2,
        borderWidth: 2,
        borderColor: 'rgba(14, 165, 233, 0.2)',
    },
    logoContainer: {
        width: width * 0.5,
        height: width * 0.5,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: width * 0.25,
        overflow: 'hidden',
    },
    imageShadow: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    logo: {
        width: '100%',
        height: '100%',
        borderRadius: width * 0.25,
    },
});

export default AnimatedSplashScreen;
