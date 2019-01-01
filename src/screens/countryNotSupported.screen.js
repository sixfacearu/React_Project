import React, { Component } from 'react';
import { View, Text, Image,TouchableOpacity,ScrollView, Dimensions } from 'react-native';
import PageControl from 'react-native-page-control';

import { Navigation } from 'react-native-navigation';

import { strings } from '../config/i18/i18n';
import commonStyles from '../styles/common.style';
import styles from '../styles/form.style';
import commonTheme from '../themes/common.theme';

var screen = require('Dimensions').get('window');

export default class CountryNotSupportedScreen extends Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);
    }

    render() {
        return (
        <View style={{flex: 1,justifyContent: 'center', alignItems: 'center'}}>
            <View style={[styles.welcomeMainContainer,styles.welcomeFirstContainer]}>
                    {/* <Text style = { styles.welcomeHeader }> { strings('common.welcome') } </Text>
                    <Image style = { styles.welcomeIconStyle } source = { require('../assets/welcome.icon.png') }/> */}
                    <Text style = {styles.welcomeDescriptionText}> { strings('welcome.country_not_supported') } </Text>
            </View>
        </View>
        );
    }
}
