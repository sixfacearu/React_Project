import React, { Component } from 'react';
import { View, Text, Image,TouchableOpacity } from 'react-native';

import { Navigation } from 'react-native-navigation';

import { strings } from '../config/i18/i18n';
import commonStyles from '../styles/common.style';

export default class WelcomeSecondScreen extends Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            showActivityIndicator: false
        };
    }

    callCreateGoalScreen = () => {
        
    }

    render() {
        return (
          <View style = { [ commonStyles.mainContainer, commonStyles.lightyellowBackground ] } >
            <View style = { [ commonStyles.subContainer,commonStyles.defaultPaddingLeftRight ] }>
                <Text 
                    style = { [ commonStyles.fontSizeExtraLarge,commonStyles.textAlignCenter,commonStyles.secTextColor ] }> 
                    { strings('common.welcome') } 
                </Text>
                <View style = { commonStyles.alignItemsCenter }>
                    <Image 
                        style = { [ commonStyles.imageSize112,commonStyles.defaultMarginTopBottom ] }
                        source = { require('../assets/welcome.icon.png') }/>
                </View>
                <Text 
                    style = { 
                        [ commonStyles.fontSizeMedium,
                          commonStyles.textAlignCenter,
                          commonStyles.primaryTextColorLight,
                          commonStyles.marginBottom25
                        ] }> 
                    { strings('welcome.screensecond_description') } 
                </Text>
                <View style = { [ commonStyles.alignChildCenter, commonStyles.flexDirectionRow ] } >
                    <View style = { [ commonStyles.smallCircle,commonStyles.quarternaryBackgroundColor ] } ></View>
                    <View style = { [ commonStyles.smallCircle,commonStyles.tertiaryBackgroundColor, commonStyles.marginLeft5 ] } ></View>
                </View>
             </View>
            <View style = { [ commonStyles.alignChildCenter,commonStyles.flexDirectionColumn ] } >
                    <TouchableOpacity
                        //disabled = { !this.state.enableNextBtn }
                        activeOpacity = { 1 }
                        style = { 
                            [ commonStyles.btnLarge,commonStyles.btnBackColorTerriary,
                            this.state.enableNextBtn ? commonStyles.btnActivebackgroundColor:commonStyles.btnDisabledbackgroundColor 
                            ] 
                        }
                        onPress = { this.callSecondWelcomeScreen }>
                        <Text style = { [commonStyles.fontSizeLarge, commonStyles.secTextColor,commonStyles.textAlignCenter] } >
                            { strings('common.next_btn') } 
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        //disabled = { !this.state.enableNextBtn }
                        activeOpacity = { 0 }
                        style = { 
                            [ commonStyles.btnLarge
                            ] 
                        }
                        onPress = { this.callSecondWelcomeScreen }>
                        <Text style = { [commonStyles.fontSizeLarge, commonStyles.secTextColor,commonStyles.textAlignCenter] } >
                            { strings('common.skip_btn') } 
                        </Text>
                    </TouchableOpacity>
                </View>
          </View>
        );
    }
}