import React, { Component } from 'react';
import {
    View, Text, Image, TouchableOpacity,
    ScrollView, TextInput, Dimensions, StyleSheet,
    Alert, TouchableHighlight, Linking, Platform
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Navigation } from 'react-native-navigation';
import DateTimePicker from 'react-native-modal-datetime-picker';
import Moment from 'react-moment';

import { strings } from '../config/i18/i18n';
import commonStyles from '../styles/common.style';
import styles from '../styles/form.style';
import commonTheme from '../themes/common.theme';
import commonConstant from '../constants/common.constant';
import HttpUrlConstant from '../constants/http.constant';
import stringConstant from '../constants/string.constant';

import GoalLocalModel from '../models/goal.local.model';
import LoaderComponent from '../components/loader.component';
import AsyncStorageUtil from '../utils/asyncstorage.util';
import commonUtil from '../utils/common.util';
import CurrencyArrayResponseModel from '../models/currency.response.array.model';
import stackName from '../constants/stack.name.enum';
import screenId from '../constants/screen.id.enum';
import GoalInterface from '../interfaces/goal.interface';
import GoalMainRequestModel from '../models/goal.main.request.model';
import UserAuthenticationModel from '../models/user.authentication.model';
import GoalResponseModel from '../models/goal.response.model';
import GoalRequestModel from '../models/goal.request.model';
import httpResponseModel from '../models/httpresponse.model';
import TitleBarModel from '../models/title.bar.model';
import TitleBarComponent from '../components/title.bar.component';

import ModalComponentModel from '../models/modal.component.model';
import CommonModal from '../components/common.modal';

var screen = require('Dimensions').get('window');
var moment = require('moment');

export default class SetGoalDateScreen extends Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);
        this.navigationEventHandler = this.navigationEventHandler.bind(this)
        Navigation.events().registerBottomTabSelectedListener(this.navigationEventHandler)

        this.state = {
            enableNextBtn: false,
            goalName: '',
            goalAmount: 0,
            isDateTimePickerVisible: false,
            component_Id: this.props.componentId,
            selectedMinGoalAmount: 0,
            selectedMaxGoalAmount: 0,
            selectedCurrencyCode: "",
            selectedGoalDate: "" ,
            selectedGoalDateLongFormat:strings('setgoaldate.select_goal_date_placeholder') ,
            dateValue:0,
            selectedDay:'',
            selectedMonth:'',
            selectedYear:'',
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
        titleBar.title = strings('setgoaldate.goal_date_title');
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
    }

    _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });
 
    _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });
 
    _handleDatePicked = (date) => {
        console.log('A date has been picked: ', date);
        
        this.setState({
            dateValue:date,
            selectedGoalDate: moment(date).format('YYYY-MM-DD'),
            selectedGoalDateLongFormat: moment(date).format('MMM DD, YYYY'),
            selectedDay:moment(date).format('DD'),
            selectedMonth:moment(date).format('MM'),
            selectedYear:moment(date).format('YYYY'),
            enableNextBtn:true
        });
        this._hideDateTimePicker();
    };

    getGoalNameFromStorage = () => {
        //TODO: write code to fetch goal data from storage and then bind goal name
        AsyncStorageUtil.getItem(stringConstant.GOAL_INFO_STORAGE_KEY).then((data) => {
            data = JSON.parse(data);
            let goalInfo = new GoalLocalModel();
            goalInfo = data;
            this.setState({
                goalName: goalInfo.goalName,
                selectedCurrencyCode: goalInfo.goalFiatCurrencyCode,
                goalAmount: goalInfo.goalAmount
            });
        });
    }

    onSaveButton = () => {

        let selectedDateValue = moment(this.state.dateValue);
        let oneMonthFromNow = moment(new Date()).add(1, 'month');
        let fourtyYearsFromNow = moment(new Date()).add(40, 'year');

        if(selectedDateValue.diff(oneMonthFromNow, 'months') < 1 && selectedDateValue.diff(oneMonthFromNow, 'days') < 0) {
            console.log('Please enter date greater than or equal to one month'+ selectedDateValue.diff(oneMonthFromNow, 'months')+ ' & ' + selectedDateValue.diff(oneMonthFromNow, 'days'));
            //alert('Please select date greater than or equal to ' + oneMonthFromNow.format('MMM DD, YYYY') + ' i.e. one month from today\'s date.')
            this.showCustomAlert(true,'Please select date greater than or equal to ' + oneMonthFromNow.format('MMM DD, YYYY') + ' i.e. one month from today\'s date.');
            return;
        } else if (selectedDateValue.diff(fourtyYearsFromNow, 'years') >= 0 && selectedDateValue.diff(fourtyYearsFromNow, 'months') >= 0 && selectedDateValue.diff(fourtyYearsFromNow, 'days') >= 0) {
            console.log('Please enter maximum date which is 40 years from today\'s date'+ selectedDateValue.diff(fourtyYearsFromNow, 'years')+ ' & month' +selectedDateValue.diff(fourtyYearsFromNow, 'months')+ ' & days' + selectedDateValue.diff(fourtyYearsFromNow, 'days'));
            //alert('Please select date less than '+ fourtyYearsFromNow.format('MMM DD, YYYY') + ' i.e. 40 years from today\'s date.')
            this.showCustomAlert(true,'Please select date less than '+ fourtyYearsFromNow.format('MMM DD, YYYY') + ' i.e. 40 years from today\'s date.');
            return;
         }

        
        if (this.state.selectedGoalDate) {
            AsyncStorageUtil.getItem(stringConstant.SAVE_USER_INFO).then((data) => {
                let userAuthentication = new UserAuthenticationModel();
                data = JSON.parse(data);
                if (data) {
                    userAuthentication = data.AuthenticationToken;
                    console.log(userAuthentication);
                    let goalMainRequest = new GoalMainRequestModel();
                    goalMainRequest.AuthenticationToken = userAuthentication.Token;
                    let goalRequest = new GoalRequestModel();
                    goalRequest.GoalName = this.state.goalName;
                    goalRequest.GoalFiatCurrencyCode = this.state.selectedCurrencyCode;
                    goalRequest.GoalAmount = this.state.goalAmount;
                    goalRequest.GoalDate = this.state.selectedGoalDate;
                    goalMainRequest.Goal = goalRequest;
                    this.showLoader(true);
                    GoalInterface.createGoal(goalMainRequest).then((response) => {
                        this.showLoader(false);
                        let res = new httpResponseModel();
                        res = response;
                        if (res.ErrorCode == "0") {
                            let goalResponseData = new GoalResponseModel();
                            let goalLocalData = new GoalLocalModel();
                            goalResponseData = res.Result;
                            goalLocalData.goalId = goalResponseData.GoalID;
                            goalLocalData.goalAmount = goalResponseData.GoalAmount;
                            goalLocalData.goalDate = goalResponseData.GoalDate;
                            goalLocalData.goalFiatCurrencyCode = goalResponseData.GoalFiatCurrencyCode;
                            goalLocalData.goalName = goalResponseData.GoalName;
                            AsyncStorageUtil.removeItem(stringConstant.ALL_CURRENCY_INFO);
                            AsyncStorageUtil.storeItem(stringConstant.GOAL_INFO_STORAGE_KEY,goalLocalData).then((data) => {
                                Navigation.setStackRoot(stackName.GoalScreenStack, {
                                    component: {
                                        name: screenId.ChooseGoalCryptoCurrencyScreen
                                    }
                                });
                            });
                        } else {
                            this.showCustomAlert(true,res.ErrorMsg)
                        }
                    }, (err) => {
                        this.showLoader(false);
                        this.showCustomAlert(true,strings('common.api_failure'));
                    });
                }
            });
        }
       
    }


    _onBackButtonPressed = () => {
        Navigation.pop(this.props.componentId);
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
                            <Text style={[commonStyles.headerWithLeftBackButton]}>{strings('setgoaldate.goal_date_title')}</Text>
                        </View> */}
                        <View style={[styles.roundedContainer]}>
                            <Text style={[styles.topGoalNameStyle]}>{this.state.goalName}</Text>
                            <Image style={styles.dashboardIconStyle} source={require('../assets/calender_circle.icon.png')} />
                            <Text style={[styles.descriptionTextStyle]}>{strings('setgoaldate.goal_date_description')}</Text>
                            {/* BOX STYLE */}
                            {/* <TouchableHighlight
                                style={[styles.dateTouchableView]}
                                onPress={this._showDateTimePicker} underlayColor="white">
                                <View style={[styles.dateContainerView]}>
                                        <View style={styles.dateElement}>
                                        <Text style={styles.dateElementPlaceholder}>{strings('setgoaldate.day')}</Text>
                                        <TextInput 
                                            disabled
                                            editable = { false }
                                            style = {styles.dateElementValue}
                                            placeholder = 'DD'
                                            placeholderTextColor = {commonTheme.PRIMARY_TEXT_COLOR_DARK}
                                            value = {this.state.selectedDay}/>
                                    </View>
                                    <View style={[styles.dateElement, styles.dateElementBorder]}>
                                        <Text style={styles.dateElementPlaceholder}>{strings('setgoaldate.month')}</Text>
                                        <TextInput 
                                            disabled
                                            editable = { false }
                                            style = {styles.dateElementValue}
                                            placeholder = 'MM'
                                            placeholderTextColor = {commonTheme.PRIMARY_TEXT_COLOR_DARK}
                                            value = {this.state.selectedMonth}/>
                                    </View>
                                    <View style={styles.dateElement}>
                                        <Text style={styles.dateElementPlaceholder}>{strings('setgoaldate.year')}</Text>
                                        <TextInput 
                                            disabled
                                            editable = { false }
                                            style = {styles.dateElementValue}
                                            placeholder = 'YYYY'
                                            placeholderTextColor = {commonTheme.PRIMARY_TEXT_COLOR_DARK}
                                            value = {this.state.selectedYear}/>
                                    </View>  
                                </View>
                            </TouchableHighlight> */}

                            {/* FLAT STYLE */}
                            <TouchableHighlight
                                style={[styles.dateTouchableViewFlatStyle]}
                                onPress={this._showDateTimePicker} underlayColor="white">
                                    <Text style = {styles.dateSelectorField}>{this.state.selectedGoalDateLongFormat}</Text>
                            </TouchableHighlight>
                            <DateTimePicker
                                isVisible={this.state.isDateTimePickerVisible}
                                onConfirm={this._handleDatePicked}
                                onCancel={this._hideDateTimePicker}
                            />
                            <TouchableHighlight
                                style={[styles.width90, styles.topMarginAboveBtn, styles.btnToTextfieldMargin]}
                                disabled={!this.state.enableNextBtn}
                                onPress={this.onSaveButton} underlayColor="white">
                                <View style={[styles.buttonRadius,
                                this.state.enableNextBtn ? styles.primaryBlueButton : styles.primaryDisableButtonLight]}>
                                    <Text style={styles.buttonTextWhite}>{strings('setgoaldate.save_date_amount')}</Text>
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

