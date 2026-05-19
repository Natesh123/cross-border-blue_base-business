import Vector from "app/assets/vectors";
import React, { useEffect, useState } from "react";
import COLORS from "../../../constants/Colors";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Animated,
    Text
} from "react-native";
import { SHADOWS } from "app/constants/Assets";
import Dash from "app/components/customComponents/Dash";

const DetailView = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [height] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.timing(height, {
            toValue: !isExpanded ? 20 : 260,
            duration: 1000,
            useNativeDriver: false
        }).start();
    }, [isExpanded, height]);

    const _onExpanded = async () => {
        setIsExpanded(!isExpanded)
    }
    return (

        <Animated.View
            style={{
                height, zIndex: 99,
                elevation: 99, 
                justifyContent: 'center',
                top:-15
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    flex: 1
                }}>
                <View style={{
                    flex: .9,
                    paddingRight: 10
                }}>
 <Text style={{ top:20, marginVertical:20}}>Our fee</Text>
 <Text style={{ marginVertical:20}}>Total Amount</Text>
 <Text style={{ marginVertical:20}}>Conversion Rate</Text>
                </View>
                <View style={{ flexDirection: "column", alignContent: 'center', alignItems: 'center'}}>
                {isExpanded && (
                <Dash dashLength={120}/>
                )}
                <View  style={{ justifyContent: 'center'  }}>

                    <TouchableOpacity onPress={_onExpanded}>
                        <View
                            style={{
                                height: 60,
                                width: 60,
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: 50,
                                backgroundColor: COLORS.white,
                                ...SHADOWS.shadow8,
                            }}
                        >
                            <Vector
                                as="ionicons"
                                name={isExpanded ? "contract-sharp" : "expand-outline"}
                                size={40}
                                color={COLORS.black50}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
                {isExpanded && (
                <Dash dashLength={120}/>
                )}
                </View>
            </View>
        </Animated.View>
    );
};

export default DetailView;