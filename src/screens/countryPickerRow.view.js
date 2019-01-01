import React from 'react';
import { View, Text, TouchableOpacity} from 'react-native';
import Image from 'react-native-remote-svg'
import styles from '../styles/form.style';
import AddMobileNumberScreen from './addmobilenumber.screen'
const CountryFlagBaseURL= "http://mobapp.assets.b21.io/countries/";

_onItemPressed = (item) => {
 console.log(item);
}

const Row = (props) => (

<TouchableOpacity style={styles.pickerRowcontainer} onPress={_onItemPressed(props)}>
    <Image source={{ uri:`${CountryFlagBaseURL}${props.CountryCode}/flag.svg`}} style={styles.pickerImage} />
    <Text style={styles.pickerText}>
      {props.CountryCode}
    </Text>
  </TouchableOpacity>
);

export default Row;