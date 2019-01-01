import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, TextInput, Dimensions, StyleSheet, Alert, TouchableHighlight, Linking, Platform } from 'react-native';
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
import CurrencyArrayResponseModel from '../models/currency.response.array.model';
import stackName from '../constants/stack.name.enum';
import screenId from '../constants/screen.id.enum';
import LoaderComponent from '../components/loader.component';
import TitleBarModel from '../models/title.bar.model';
import TitleBarComponent from '../components/title.bar.component';

import ModalComponentModel from '../models/modal.component.model';
import CommonModal from '../components/common.modal';

var screen = require('Dimensions').get('window');

export default class SetGoalAmountScreen extends Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);
        this.navigationEventHandler = this.navigationEventHandler.bind(this)
        Navigation.events().registerBottomTabSelectedListener(this.navigationEventHandler)

        this.state = {
            enableNextBtn: false,
            showActivityIndicator: false,
            goalName: '',
            goalAmount: '',
            component_Id: this.props.componentId,
            selectedMinGoalAmount: 0,
            selectedMaxGoalAmount: 0,
            selectedCurrencyCode: "",
            selectedCurrencySymbol: "",
            showCurrencyInputField: false,
            currencyInputMaxLength: 0,
            titleBar: {},
            modalComponent : {}
        };
    }

    initializeModalComponent = () => {
        let initialModalComponent = new ModalComponentModel();
        initialModalComponent.shouldVisible = false;
        this.setState({
            modalComponent : initialModalComponent
        })
    }

    componentWillMount(){
    this.initializeModalComponent();
    }

    leftButtonClicked = () => {
    console.log("left button clicked!");
    this.showCustomAlert(false);
    }

    rightButtonClicked = () => {
    console.log("right button clicked!");
    this.showCustomAlert(false);
    }

    closeButtonClicked = () => {
    this.showCustomAlert(false);
    }

    showCustomAlert= (visible, message) => {
    this.setState({
        modalComponent : commonUtil.setAlertComponent(visible,message,strings('common.okay'),"",true,false,() => this.leftButtonClicked(), () => this.rightButtonClicked(),() => this.closeButtonClicked())
    });
    }

    initializeStatusBar = () => {
        let titleBar = new TitleBarModel();
        titleBar.title = strings('setgoalamount.goal_amount_title');
        titleBar.showBackButton = true;
        titleBar.textColorCode = commonTheme.SECONDARY_TEXT_COLOR_LIGHT;
        titleBar.componentId = this.props.componentId;
        titleBar.backgroundColorCode = 'transparent';//commonTheme.PRIMARY_BTN_BACKGROUND_COLOR;
        this.setState({
            titleBar: titleBar
        });
    }

    showLoader = (bit) => { // call this function to show/hide the loader
        this.setState({
            showActivityIndicator: bit
        });
    }

    navigationEventHandler(event) {
        const { unselectedTabIndex, selectedTabIndex } = event
        if (selectedTabIndex === 0) {
            setTimeout(this.redirectToB21Life, commonConstant.B21LIFE_APP_REDIRECTION_TIME);
            //this.redirectToB21Life();
        }
    }

    redirectToB21Life = () => {
        if (Platform.OS === "ios") {
            Linking.openURL(HttpUrlConstant.B21_LIFE_APPSTORE_URL);
        } else {
            Linking.openURL(HttpUrlConstant.B21_LIFE_PLAYSTORE_URL);
        }
        Navigation.mergeOptions(this.state.component_Id, {
            bottomTabs: {
                currentTabIndex: 1
            }
        });

    }

    componentDidMount() {
        this.initializeStatusBar();
        this.getGoalNameFromStorage();
        this.getGoalCurrencyInfoFromStorage();
    }

    getGoalNameFromStorage = () => {
        //TODO: write code to fetch goal data from storage and then bind goal name
        AsyncStorageUtil.getItem(stringConstant.GOAL_INFO_STORAGE_KEY).then((data) => {
            data = JSON.parse(data);
            let goalInfo = new GoalLocalModel();
            goalInfo = data;
            this.setState({
                goalName: goalInfo.goalName,
                selectedCurrencyCode: goalInfo.goalFiatCurrencyCode
            });
        });
    }

    getGoalCurrencyInfoFromStorage = () => {
        //TODO: write code to fetch goal data from storage and then bind goal name
        AsyncStorageUtil.getItem(stringConstant.SAVE_GOAL_CURRENCY_INFO).then((data) => {
            data = JSON.parse(data);
            let goalCurrencyInfo = new CurrencyArrayResponseModel();
            goalCurrencyInfo = data;
            this.setState({
                selectedMinGoalAmount: goalCurrencyInfo.MinGoalAmount,
                selectedMaxGoalAmount: goalCurrencyInfo.MaxGoalAmount,
                selectedCurrencySymbol: goalCurrencyInfo.CurrencySymbol
            }, () => {
                this.setState({
                    currencyInputMaxLength: this.state.selectedMaxGoalAmount.toString().length
                })
            });
        });
    }

    onSaveButton = () => {

        if (this.state.goalAmount && this.state.goalAmount < this.state.selectedMinGoalAmount) {
            //alert("Please enter amount greater than " + this.state.selectedMinGoalAmount);
            this.showCustomAlert(true,"Please enter amount greater than " + this.state.selectedMinGoalAmount);
            return;
        } else if (this.state.goalAmount && this.state.goalAmount > this.state.selectedMaxGoalAmount) {
            //alert("Please enter amount less than " + this.state.selectedMaxGoalAmount);
            this.showCustomAlert(true,"Please enter amount less than " + this.state.selectedMaxGoalAmount);
            return;
        }

        this.showLoader(true);
        this.setState({
            enableNextBtn: false
        }, () =>{
            var goalInfo = new GoalLocalModel();
            goalInfo.goalName = this.state.goalName;
            goalInfo.goalAmount = this.state.goalAmount;
            goalInfo.goalFiatCurrencyCode = this.state.selectedCurrencyCode;
            AsyncStorageUtil.storeItem(stringConstant.GOAL_INFO_STORAGE_KEY, goalInfo).then(() => {
                Navigation.push(stackName.GoalScreenStack, {
                    component: {
                        name: screenId.SetGoalDateScreen
                    }
                });
                setTimeout( () => {
                    this.showLoader(false);
                    this.setState({
                        enableNextBtn: true
                    });
                });
            });
        });
    }

    _onBackButtonPressed = () => {
        Navigation.pop(this.props.componentId);
    }

    showGoalAmountInputField = () => {
        this.setState({
            showCurrencyInputField: true
        }, () => {
            this.refs[0].focus();
        });
    }

    showPlaceholder = () => {
        if(this.state.goalAmount === ""){
            this.setState({
                showCurrencyInputField: false
            });
        }
    }

    render() {
        return (
            <View style={styles.mainDashboardContainer}>
                <LinearGradient 
                    colors = {
                        [
                            commonTheme.PRIMARY_BTN_BACKGROUND_COLOR, 'white', 'white'
                        ]
                    } 
                    style = {
                        [
                            styles.linearGradient,
                            commonStyles.paddingTop52
                        ]
                    }>
                    <TitleBarComponent titleBar = { this.state.titleBar } />
                    <KeyboardAwareScrollView bounces={false} extraScrollHeight={50}>
                        {/* <View
                            style={[commonStyles.goalHeaderWrapper]}>
                            <TouchableOpacity
                                onPress={this._onBackButtonPressed}
                                style={[commonStyles.touchableBackButtonImageWrapper]}>
                                <Image
                                    style={[styles.backIcon, commonStyles.topTouchableBackButtonImage]}
                                    source={require('../assets/backicon_white.png')} />
                            </TouchableOpacity>
                            <Text style={[commonStyles.headerWithLeftBackButton]}>{strings('setgoalamount.goal_amount_title')}</Text>
                        </View> */}
                        <View style={[styles.roundedContainer]}>
                            <Text style={[styles.topGoalNameStyle]}>{this.state.goalName}</Text>
                            <Image style={styles.dashboardIconStyle} source={require('../assets/dollor_circle.icon.png')} />
                            <Text style={[styles.descriptionTextStyle]}>{strings('setgoalamount.goal_amount_description')}</Text>
                            <View style={[commonStyles.rowContainerFullWidth, { justifyContent: "center",alignItems:"center" }]}>
                                <TouchableHighlight
                                    style = { 
                                        [
                                            commonStyles.dashboardTextInputTouchableView,
                                            { display: !this.state.showCurrencyInputField ? 'flex' : 'none' }
                                        ] 
                                    } 
                                    underlayColor="white"
                                    onPress = { this.showGoalAmountInputField } >
                                    <Text
                                        style = {
                                            [
                                                commonStyles.dashboardDummyTextInputView,
                                                commonStyles.textAlignCenter,
                                                { textAlignVertical: "center"}
                                            ]
                                        } >
                                        {strings('setgoalamount.goal_amount_placeholder')}
                                    </Text>
                                </TouchableHighlight>
                                <TextInput
                                    style={
                                        [
                                            commonStyles.dashboardTextInputView,
                                            commonStyles.textAlignRight,
                                            commonStyles.width35pc,
                                            { display: this.state.showCurrencyInputField ? 'flex' : 'none' }
                                        ]
                                    }
                                    value={this.state.selectedCurrencySymbol}
                                    editable={false}
                                />
                                <TextInput
                                    ref = "0"
                                    style={
                                        [
                                            commonStyles.dashboardTextInputView,
                                            commonStyles.default5PaddingLeft,
                                            commonStyles.textAlignLeft,
                                            {
                                                width: this.state.showCurrencyInputField ? "55%" : "90%",
                                                display: this.state.showCurrencyInputField ? 'flex' : 'none'
                                                //textAlign: this.state.showCurrencyInputField ? "left" : "center"
                                            }
                                        ]
                                    }
                                    //placeholder={strings('setgoalamount.goal_amount_placeholder')}
                                    maxLength={ this.state.currencyInputMaxLength }
                                    onChangeText={(value) => {
                                        this.setState({
                                            goalAmount: value
                                        }, () => {
                                            if (this.state.goalAmount.length > 0) {
                                                this.setState({
                                                    enableNextBtn: true
                                                });
                                            } else {
                                                this.setState({
                                                    enableNextBtn: false
                                                });
                                            }
                                        });
                                    }}
                                    onBlur = { this.showPlaceholder }
                                    keyboardType='numeric'
                                    returnKeyType='done'
                                />
                            </View>

                            <TouchableHighlight
                                style={[styles.width90, styles.topMarginAboveBtn,styles.btnToTextfieldMargin]}
                                disabled={!this.state.enableNextBtn}
                                onPress={this.onSaveButton} underlayColor="white">
                                <View style={[styles.buttonRadius,
                                this.state.enableNextBtn ? styles.primaryBlueButton : styles.primaryDisableButtonLight]}>
                                    <Text style={styles.buttonTextWhite}>{strings('setgoalamount.save_goal_amount')}</Text>
                                </View>
                            </TouchableHighlight>
                        </View>
                        </KeyboardAwareScrollView>
                </LinearGradient>
                <LoaderComponent showLoader={this.state.showActivityIndicator} />
                <CommonModal modalComponent = {this.state.modalComponent}/>
            </View>
        );
    }
}

