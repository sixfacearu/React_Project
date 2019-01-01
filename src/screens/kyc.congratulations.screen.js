import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Navigation } from 'react-native-navigation';

import { strings } from '../config/i18/i18n';
import commonStyles from '../styles/common.style';
import styles from '../styles/form.style';
import commonTheme from '../themes/common.theme';
import stackName from '../constants/stack.name.enum';
import screenId from '../constants/screen.id.enum';

export default class KYCCongratulationsScreen extends Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {

        };
    }

    callNextScreen = () => {
        Navigation.setStackRoot(stackName.GoalScreenStack, {
            component : {
                name: screenId.GoalDashboardScreen
            }
        });
    }
    render() {
        return (
            <View style={commonStyles.congratulationsMainContainer}>
                <Text style={styles.welcomeHeader}> {strings('congratulationScreen.title')} </Text>
                <Image style={styles.welcomeIconStyle} source={require('../assets/welcome.icon.png')} />
                <Text style={styles.welcomeDescriptionText}> {strings('congratulationScreen.description')} </Text>

                <View style={[commonStyles.width90pc, commonStyles.footerPosition]}>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={commonStyles.congratulationsNextButton}
                        onPress={this.callNextScreen}>
                        <Text style={[commonStyles.fontSize20, commonStyles.secTextColor, commonStyles.textAlignCenter]} >
                            {strings('congratulationScreen.btn_title')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}