import React, { Component } from 'react';
import { View, Text, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Navigation } from 'react-native-navigation';

import { strings } from '../config/i18/i18n';
import styles from '../styles/form.style';
import commonTheme from '../themes/common.theme';


export default class LearnScreen extends Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);
    }
    
    componentDidMount(){}
    
    render() {
        return (
        <View style={{flex: 1,justifyContent: 'center', alignItems: 'center'}}>
            <View style={[styles.welcomeMainContainer,styles.welcomeFirstContainer]}>
                    <Text style = {styles.welcomeDescriptionText}> Redirecting you to B21 Life... </Text>
            </View>
        </View>
        // <View style={styles.mainDashboardContainer}>
        //     <LinearGradient colors={[commonTheme.PRIMARY_BTN_BACKGROUND_COLOR,'white', 'white']} style={[styles.linearGradient]}>
        //         <Text style={[styles.dashboardHeader]}>Learn</Text>
        //         <View style={[styles.roundedContainer]}>
        //             {/* <Image style = { styles.dashboardIconStyle } source = { require('../assets/goal_circle.icon.png') }/> */}
        //             <Text style={[styles.descriptionTextStyle]}>Redirecting you to B21 Life...</Text>
        //         </View>
        //     </LinearGradient>
        // </View>
        );
    }
}
