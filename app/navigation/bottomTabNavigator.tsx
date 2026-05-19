import React from 'react';
import {
    Animated,
    StyleSheet,
    TouchableOpacity,
    View,
    Text,
    Platform,
    Dimensions
} from 'react-native';
import { CurvedBottomBarExpo } from 'react-native-curved-bottom-bar';
import Recipients from 'app/screens/recipients/Recipients';
import Vector from 'app/assets/vectors';
import Transactions from 'app/screens/transactions/Transactions';
import Profile from "../screens/profile/Profile";
import { theme } from '../core/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Home from 'app/screens/home/Home';
import { SIZES, FONTS, SHADOWS } from 'app/constants/Assets';

const { width } = Dimensions.get('window');

export default function BottomTabNavigator() {
    const _renderIcon = (routeName: string, selectedTab: string) => {
        let icon = '';
        type TVector = "feather" | "fontawesome" | "ionicons" | "materialCI" | "materialicons" | "materialcommunityicons";

        let asIcon: TVector = 'ionicons';
        switch (routeName) {
            case 'Dashboard':
                icon = 'grid-view';
                asIcon = 'materialicons';
                break;
            case 'Recipients':
                icon = 'group';
                asIcon = 'materialicons';
                break;
            case 'Transactions':
                icon = 'swap-vertical-bold';
                asIcon = 'materialcommunityicons';
                break;
            case 'Profile':
                icon = 'person-circle-outline';
                asIcon = 'ionicons';
                break;
            default:
                break;
        }

        const isActive = routeName === selectedTab;

        return (
            <View style={[
                styles.iconWrapper,
                isActive && styles.activeIconWrapper
            ]}>
                <Vector
                    as={asIcon}
                    name={icon}
                    size={22}
                    color={isActive ? '#fff' : '#94a3b8'}
                />
            </View>
        );
    };

    const renderTabBar = ({ routeName, selectedTab, navigate }: { routeName: string, selectedTab: string, navigate: any }) => {
        const isActive = routeName === selectedTab;
        return (
            <TouchableOpacity
                onPress={() => navigate(routeName)}
                style={styles.tabbarItem}
                activeOpacity={0.7}
            >
                {_renderIcon(routeName, selectedTab)}
                <Text style={[
                    styles.tabLabel,
                    {
                        color: isActive ? theme.colors.buttonPrimary : '#94a3b8',
                        fontFamily: isActive ? FONTS.bold : FONTS.medium,
                        marginTop: isActive ? 4 : 6
                    }
                ]}>
                    {routeName}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <CurvedBottomBarExpo.Navigator
            type="DOWN"
            shadowStyle={styles.shadow}
            height={85}
            circleWidth={60}
            bgColor="#ffffff"
            initialRouteName="Dashboard"
            borderTopLeftRight
            screenOptions={{ headerShown: false }}
            renderCircle={({ selectedTab, navigate }) => (
                <View style={[styles.btnCircleUp]}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigate('SendMoney')}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={['#0ea5e9', '#0284c7']}
                            style={styles.gradientCircle}
                        >
                            <Vector as="ionicons" name="paper-plane" size={26} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}
            tabBar={renderTabBar}
        >
            <CurvedBottomBarExpo.Screen
                name="Dashboard"
                position="LEFT"
                component={() => <Home />}
            />
            <CurvedBottomBarExpo.Screen
                name="Recipients"
                position="LEFT"
                component={() => <Recipients />}
            />
            <CurvedBottomBarExpo.Screen
                name="Transactions"
                position="RIGHT"
                component={() => <Transactions />}
            />
            <CurvedBottomBarExpo.Screen
                name="Profile"
                position="RIGHT"
                component={() => <Profile />}
            />
        </CurvedBottomBarExpo.Navigator>
    );
}

const styles = StyleSheet.create({
    shadow: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: 0.08,
            shadowRadius: 20,
        },
        android: {
            elevation: 20,
        },
        web: {
            boxShadow: '0px -8px 20px rgba(0,0,0,0.08)',
        }
    }) as any,
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnCircleUp: Platform.select({
        ios: {
            width: 72,
            height: 72,
            borderRadius: 36,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            bottom: 38,
            shadowColor: '#0ea5e9',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 10,
        },
        android: {
            width: 72,
            height: 72,
            borderRadius: 36,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            bottom: 38,
            elevation: 10,
        },
        web: {
            width: 72,
            height: 72,
            borderRadius: 36,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            bottom: 38,
            boxShadow: '0px 8px 10px rgba(14, 165, 233, 0.4)',
        }
    }) as any,
    gradientCircle: {
        width: 58,
        height: 58,
        borderRadius: 29,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.shadow,
    },
    tabbarItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 12,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    activeIconWrapper: Platform.select({
        ios: {
            backgroundColor: theme.colors.buttonPrimary,
            shadowColor: theme.colors.buttonPrimary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
        },
        android: {
            backgroundColor: theme.colors.buttonPrimary,
            elevation: 4,
        },
        web: {
            backgroundColor: theme.colors.buttonPrimary,
            boxShadow: `0px 4px 6px ${theme.colors.buttonPrimary}4D`, // 4D is ~0.3 opacity in hex
        }
    }) as any,
    tabLabel: {
        fontSize: SIZES.p16,
        textTransform: 'capitalize',
        letterSpacing: 0.2,
    },
});