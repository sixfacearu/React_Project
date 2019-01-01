import React, { Component } from 'react';
import { View, Text, Image,TouchableOpacity,ScrollView,TextInput, Dimensions, StyleSheet , Alert, TouchableHighlight, Linking, Platform} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Navigation } from 'react-native-navigation';

import { strings } from '../config/i18/i18n';
import commonStyles from '../styles/common.style';
import styles from '../styles/form.style';
import commonTheme from '../themes/common.theme';
import commonConstant from '../constants/common.constant';
import HttpUrlConstant from '../constants/http.constant';
import stringConstant from '../constants/string.constant';

import GoalLocalModel from '../models/goal.local.model';
import AsyncStorageUtil from '../utils/asyncstorage.util';
import commonUtil from '../utils/common.util';
import stackName from '../constants/stack.name.enum';
import LoaderComponent from '../components/loader.component';
import TitleBarComponent from '../components/title.bar.component';
import TitleBarModel from '../models/title.bar.model';

var screen = require('Dimensions').get('window');

export default class CreateGoalScreen extends Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);
        this.navigationEventHandler = this.navigationEventHandler.bind(this)
        Navigation.events().registerBottomTabSelectedListener(this.navigationEventHandler)
        // commonUtil.navigationEventHandler = commonUtil.navigationEventHandler.bind(this,this.props.componentId)
        // Navigation.events().registerBottomTabSelectedListener(commonUtil.navigationEventHandler)

        this.state = {
            enableNextBtn: false,
            showActivityIndicator: false,
            goalName: '',
            component_Id: this.props.componentId,
            titleBar: {}
        };
    }

    initializeStatusBar = () => {
        let titleBar = new TitleBarModel();
        titleBar.title = strings('creategoal.create_goal_title');
        titleBar.showBackButton = false;
        titleBar.textColorCode = commonTheme.SECONDARY_TEXT_COLOR_LIGHT;
        titleBar.backgroundColorCode = 'transparent';//commonTheme.PRIMARY_BTN_BACKGROUND_COLOR;
        this.setState({
            titleBar: titleBar
        });
    }

    componentDidMount () {
        this.initializeStatusBar();
    }
  
    navigationEventHandler(event) {
        const { unselectedTabIndex, selectedTabIndex } = event
        if (selectedTabIndex === 0) {
            setTimeout( this.redirectToB21Life, commonConstant.B21LIFE_APP_REDIRECTION_TIME);
            //this.redirectToB21Life();
        }
    }

    showLoader = (bit) => { // call this function to show/hide the loader
        this.setState({
          showActivityIndicator: bit
        });
    }

    redirectToB21Life = () => {
        Linking.openURL(HttpUrlConstant.B21_LIFE_SMART_URL).catch(err => console.error('An error occurred', err));
        Navigation.mergeOptions(this.state.component_Id, {
            bottomTabs: {
            currentTabIndex: 1
            }
        });

    }
    
    onSaveButton = () => { 
        this.showLoader(true);
        this.setState({
            enableNextBtn: false
        }, () => {
            AsyncStorageUtil.getItem(stringConstant.GOAL_INFO_STORAGE_KEY).then( (data) => {
                var goalInfo = new GoalLocalModel();
                data = JSON.parse(data);
                if(data){
                    goalInfo = data;
                }
                goalInfo.goalName = this.state.goalName;
                AsyncStorageUtil.storeItem(stringConstant.GOAL_INFO_STORAGE_KEY,goalInfo).then(() => {
                    Navigation.push(stackName.GoalScreenStack, {
                        component: {
                            name: 'B21.ChooseGoalCurrencyScreen'
                        }
                    });
                    setTimeout( () => {
                        this.showLoader(false);
                        this.setState({
                            enableNextBtn: true
                        });
                    },1000);
                });
            });
        });
    }

    render() {
        return (
            <View style={styles.mainDashboardContainer}>
                <LinearGradient 
                    colors = {
                        [
                            commonTheme.PRIMARY_BTN_BACKGROUND_COLOR,'white', 'white'
                        ]
                    }
                    style = {
                        [
                            styles.linearGradient,
                            commonStyles.paddingTop52
                        ]
                    }>
                    {/* <Text style={[styles.dashboardHeader]}>{ strings('creategoal.create_goal_title') }</Text> */}
                    <TitleBarComponent titleBar = { this.state.titleBar } />
                    <KeyboardAwareScrollView bounces={false} extraScrollHeight={50}>
                        <View style={[styles.roundedContainer]}>
                            <Image style = { styles.dashboardIconStyle } source = { require('../assets/goal_circle.icon.png') }/>
                            <Text style={[styles.descriptionTextStyle]}>{ strings('creategoal.create_goal_description') }</Text>
                            <TextInput
                                style={styles.dashboardTextInputView}
                                placeholder={ strings('creategoal.enter_goal_name_placeholder') }
                                maxLength = { commonConstant.MAX_CAHARCTER_GOAL_NAME }
                                onChangeText={ (value) => {
                                    this.setState({goalName:value});
                                    if(value.length > 0){
                                        this.setState({enableNextBtn:true});
                                    } else {
                                        this.setState({enableNextBtn:false});
                                    }
                                }}
                            />
                            <TouchableHighlight 
                            style={[styles.width90, styles.topMarginAboveBtn,styles.btnToTextfieldMargin]} 
                            disabled = { !this.state.enableNextBtn }
                            onPress={this.onSaveButton} underlayColor="white">
                                <View style={[styles.buttonRadius, 
                                    this.state.enableNextBtn ? styles.primaryBlueButton:styles.primaryDisableButtonLight]}>
                                    <Text style={styles.buttonTextWhite}>{ strings('creategoal.save_goal_name') }</Text>
                                </View>
                            </TouchableHighlight>
                        </View>
                    </KeyboardAwareScrollView>
                </LinearGradient>
             <LoaderComponent showLoader = { this.state.showActivityIndicator }/>
             </View>
        );
    }
}

