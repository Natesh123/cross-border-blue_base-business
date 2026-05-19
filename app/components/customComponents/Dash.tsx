import { View } from "react-native"
import COLORS from "../../constants/Colors";

interface IProps {
    dashLength: number ;
    dashThickness?: number|1;
}

 const Dash = ({ dashLength, dashThickness }:IProps) => {
    return(
       <View style={{
          borderStyle: 'dashed',
          height:dashLength,
          borderLeftWidth:3,
          borderColor: COLORS.gray10,
         }}/>
  
     )
  };

  export default Dash; 