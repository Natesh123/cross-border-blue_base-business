import Vector from 'app/assets/vectors';
import { SHADOWS } from 'app/constants/Assets';
import React, { useState } from 'react';
import { View, StyleSheet,Text, TouchableWithoutFeedback, Animated } from 'react-native';
import COLORS from "../../constants/Colors";

type Props = {
    children?: React.ReactNode,
};

const CollapsibleView = ({ children }: Props) => {
    const [collapsed, setCollapsed] = useState(true);
    const [animation] = useState(new Animated.Value(0));

    const toggleCollapse = () => {
        if (collapsed) {
            Animated.timing(animation, {
                toValue: 61,
                duration: 350,
                useNativeDriver: true
            }).start();
        } else {
            Animated.timing(animation, {
                toValue: 60,
                duration: 350,
                useNativeDriver: true
            }).start();
        }
        setCollapsed(!collapsed);
    };

    const heightInterpolate = animation.interpolate({
        inputRange: [60, 61],
        outputRange: [60, 200]
    });

    return (
        <View>
            <Animated.View style={[styles.collapsibleView, { height: heightInterpolate }]} >

                <View
                    style={{
                        flexDirection: "row",
                        flex: 1
                    }}>
                    <View style={{
                        flex: .9,
                        paddingRight: 10
                    }}>
                        {children}
                    </View>
                    <View style={{
                        flex: .1,
                        paddingRight: 10,
                          justifyContent: "center",
                                    alignItems: "center"
                    }}>
                        <TouchableWithoutFeedback onPress={toggleCollapse}>
                            <View
                                style={{
                                    height: 60,
                                    width: 60,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderRadius: 50,
                                    backgroundColor: COLORS.white,
                                    ...SHADOWS.shadow8,
                                }}>
                                <Vector
                                    as="ionicons"
                                    name={collapsed ? "expand-outline" : "contract-sharp"}
                                    size={40}
                                    color={COLORS.black50} />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>


            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    collapsibleView: {
      overflow: 'hidden',
      marginTop: 10,
    },
    contentText: {
      padding: 20,
    }
  });
  
export default CollapsibleView;