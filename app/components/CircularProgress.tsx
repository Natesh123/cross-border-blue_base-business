import React from "react";
import { View } from "react-native";
import { Svg, Circle, Text as SVGText } from "react-native-svg";
import { useRecoilValue } from "recoil";
import { SendMoneyHeaderState } from "app/atoms";

interface IProps {
  size: number;
  strokeWidth: number;
  text?: string;
  bgColor?: string;
  pgColor?: string;
  textSize?: number;
  textColor?: string;
  progress?: number;
}

const CircularProgress = ({
  size,
  strokeWidth,
  text,
  bgColor = "#f2f2f2",
  pgColor = "green",
  textSize = 10,
  textColor = "#333333",
  progress
}: IProps) => {

  // ✅ Use Recoil state if progress prop is not provided
  const sendMoneyHeaderState = useRecoilValue(SendMoneyHeaderState);
  const currentProgress = progress ?? sendMoneyHeaderState.progressPercent;

  // ✅ Auto color change if progress = 100%
  const progressColor = currentProgress >= 100 ? "green" : pgColor;

  const radius = (size - strokeWidth) / 2;
  const circum = radius * 2 * Math.PI;
  const svgProgress = 100 - currentProgress;

  return (
    <View style={{ margin: 10, position: "absolute", right: 10 }}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          stroke={bgColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* Progress Circle */}
        <Circle
          stroke={progressColor}  // ✅ Auto green at 100%
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={`${circum} ${circum}`}
          strokeDashoffset={(circum * svgProgress) / 100}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
          strokeWidth={strokeWidth}
        />

        {/* Text */}
        <SVGText
          fontSize={textSize}
          x={size / 2}
          y={size / 2 + textSize / 3}
          textAnchor="middle"
          fill={textColor}
        >
          {currentProgress}
          {text ?? "%"}
        </SVGText>
      </Svg>
    </View>
  );
};

export default CircularProgress;
