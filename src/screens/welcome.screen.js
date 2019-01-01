import React, { Component } from 'react';
import { View, Text, Image,TouchableOpacity,ScrollView,Alert, Dimensions } from 'react-native';
import PageControl from 'react-native-page-control';

import { Navigation } from 'react-native-navigation';

import { strings } from '../config/i18/i18n';
import commonStyles from '../styles/common.style';
import styles from '../styles/form.style';
import commonTheme from '../themes/common.theme';
//import {goToDashboard} from '../../App';
import NavigationUtil from '../utils/navigation.util';

var screen = require('Dimensions').get('window');

export default class WelcomeScreen extends Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        Navigation.setDefaultOptions({
            gesturesEnabled: false,
            topBar: {
                visible: false
              }
        });

        this.state = {
            showActivityIndicator: false,
            currentPage: 0
        };
    }

    callCreateGoalScreen = () => {
        NavigationUtil.setDefaultOptions();
        NavigationUtil.setBottomTabsForGoal();        
    }

    callSecondWelcomeScreen = (event) => {
        this.setState({
            currentPage: 1
          });
          this.refs.scrollView.scrollTo({x:screen.width, y:0, animated:true});
    }

    onScroll=(event)=>{
        var offsetX = event.nativeEvent.contentOffset.x,
            pageWidth = screen.width - 10;
        this.setState({
          currentPage: Math.floor((offsetX - pageWidth / 2) / pageWidth) + 1
        });
      }

    render() {
        return (
        <View style={{flex: 1,justifyContent: 'center', alignItems: 'center'}}>
            <View style={styles.welcomeMainContainer}>
              <ScrollView
                ref="scrollView"
                pagingEnabled
                horizontal
                showsHorizontalScrollIndicator={false}
                bounces={false}
                onScroll={this.onScroll}
                scrollEventThrottle={16}
                scrollToEnd={true}
              >
                <View style={styles.welcomeFirstContainer}>
                    <View style={styles.welcomeUpperSection}>
                        <Text style = { styles.welcomeHeader }> { strings('common.welcome') } </Text>
                        <Image style = { styles.welcomeIconStyle } source = { require('../assets/welcome.icon.png') }/>
                        <Text style = {styles.welcomeDescriptionText}> { strings('welcome.screenone_description') } </Text>
                    </View>
                    <View style = {styles.welcomeButtonsSection} >
                        <TouchableOpacity
                            activeOpacity = { 1 }
                            style = {styles.welcomeNextButton}
                            onPress = { this.callSecondWelcomeScreen }>
                            <Text style = { [commonStyles.fontSizeLarge, commonStyles.secTextColor,commonStyles.textAlignCenter] } >
                                { strings('common.next_btn') } 
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity = { 0 }
                            style = {styles.welcomeSkipButton}
                            onPress = { this.callCreateGoalScreen }>
                            <Text style = { [{fontSize:commonTheme.FONT_SIZE_INPUT_FIELD}, commonStyles.secTextColor,commonStyles.textAlignCenter] } >
                                { strings('common.skip_btn') } 
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                <View style={styles.welcomeSecondContainer}>
                    <View style={styles.welcomeUpperSection}>
                        <Text style = { styles.welcomeHeader }> { strings('common.welcome') } </Text>
                        <Image style = { styles.welcomeIconStyle } source = { require('../assets/welcome.icon.png') }/>
                        <Text style = {styles.welcomeDescriptionText}> { strings('welcome.screensecond_description') } </Text>
                    </View>
                    <View style = {styles.welcomeButtonsSection} >
                        <TouchableOpacity
                            activeOpacity = { 1 }
                            style = {styles.welcomeNextButton}
                            onPress = { this.callCreateGoalScreen }>
                            <Text style = { [commonStyles.fontSizeLarge, commonStyles.secTextColor,commonStyles.textAlignCenter] } >
                                { strings('common.next_btn') } 
                            </Text>
                        </TouchableOpacity>
                        <View style = {styles.welcomeSkipButton}></View>
                    </View>
                </View>
              </ScrollView>
              <PageControl
                style={{ position:'absolute', left:0, right:0, bottom:135 }}
                numberOfPages={2} currentPage={this.state.currentPage}
                hidesForSinglePage
                pageIndicatorTintColor={commonTheme.INPUT_FIELD_BORDER_COLOR}
                indicatorSize={{ width:8, height:8 }}
                currentPageIndicatorTintColor='black'
              />
            </View>
        </View>
        );
    }
}
