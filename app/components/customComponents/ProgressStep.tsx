import { FONTS } from "app/constants/Assets";
import { theme } from "app/core/theme";
import styles from "app/styles";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  steps: { name: string }[],
};

const ProgressStep = ({ steps }: Props) => {
  return ( 
    <View style={localstyles.progressPath}>
      {steps.map((step, i) => (
        <View key={i} style={localstyles.stepContainer}>
          <View style={localstyles.stepIndicator}>
            <View style={localstyles.dot} />
            {i < steps.length - 1 ? <View style={localstyles.stepLine} />: null}
          </View>
          <View>
            <Text style={localstyles.step}>{step.name}</Text>
          </View>
        </View>
      ))}
    </View>

  );
}

const localstyles = StyleSheet.create({
  progressPath: {
    flexDirection: 'column',
    paddingLeft: 10, paddingTop:20, width:'70%'
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30, // space between steps
  },
  stepIndicator: {
    alignItems: 'center',
    width: 20,
    marginTop:5
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    zIndex: 2,
  },
  stepLine: {
    position: 'absolute',
    top: 10,
    left: 9,
    width: 1,
    height: 40, // adjust spacing between steps
    borderStyle: 'dotted',
    borderWidth: 1,
    borderColor: '#ccc',
    zIndex: 1,
  },
  step: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
});


export default ProgressStep;