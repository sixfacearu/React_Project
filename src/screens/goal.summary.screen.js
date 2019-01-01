import React, { Component } from 'react';
import {
    View, Text, TouchableOpacity,
    ScrollView, TextInput, Dimensions,
    StyleSheet, Alert, TouchableHighlight,
    ListView, DeviceEventEmitter
} from 'react-native';
import Image from 'react-native-remote-svg';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Navigation } from 'react-native-navigation';

import { strings } from '../config/i18/i18n';
import commonStyles from '../styles/common.style';
import fontFamilyStyles from '../styles/font.style';
import styles from '../styles/form.style';
import commonTheme from '../themes/common.theme';
import GoalLocalModel from '../models/goal.local.model';
import AsyncStorageUtil from '../utils/asyncstorage.util';
import UserAuthenticationModel from '../models/user.authentication.model';
import CurrencyRequestModel from '../models/currency.request.model';
import currencyType from '../constants/currency.type.enum';
import GoalInterface from '../interfaces/goal.interface';
import CurrencyResponseModel from '../models/currency.response.model';
import httpResponseModel from '../models/httpresponse.model';
import commonConstant from '../constants/common.constant';
import LoaderComponent from '../components/loader.component';
import stringConstant from '../constants/string.constant';
import { CryptoCurrencyLocalModel } from '../models/cryptocurrency.local.model';
import numberUtil from '../utils/number.util';
import GoalMainAllocationRequestModel from '../models/goal.main.allocation.request.model';
import GoalAllocationRequestModel from '../models/goal.allocation.request.model';
import GoalAllocationCurrencyRequestModel from '../models/goal.allocation.currency.request.model';
import goalAllocationType from '../constants/goal.allocation.type.enum';
import GoalAllocationResponseModel from '../models/goal.allocation.response.model';

// for donut
import DonutChartComponent from '../components/donutchart.component';
import TitleBarModel from '../models/title.bar.model';
import TitleBarComponent from '../components/title.bar.component';
import stackName from '../constants/stack.name.enum';
import screenId from '../constants/screen.id.enum';
import eventEmitterEnum from '../constants/event.emitter.enum';
import ModalComponentModel from '../models/modal.component.model';
import commonUtil from '../utils/common.util';
import CommonModal from '../components/common.modal';

var screen = require('Dimensions').get('window');
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
const screenWidth = Dimensions.get('window').width;

export default class GoalSummaryScreen extends Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            enableNextBtn: false,
            showActivityIndicator: false,
            currencies: ds,
            goalName: '', 
            baseCurrencyFlagUrl: "http://mobapp.assets.b21.io/currencies/",
            showCurrencyListView: false,
            selectedCurrenciesArr: [],
            goalInfo: {},
            titleBar: {},
            modalComponent : {}
        };
    }

    initializeStatusBar = () => {
        let titleBar = new TitleBarModel();
        titleBar.title = strings('goalsummary.main_title');
        titleBar.showBackButton = true;
        titleBar.textColorCode = commonTheme.SECONDARY_TEXT_COLOR_LIGHT;
        titleBar.componentId = this.props.componentId;
        titleBar.eventEmitterName = eventEmitterEnum.RefreshCryptoCoinScreen;
        titleBar.backgroundColorCode = 'transparent';//commonTheme.PRIMARY_BTN_BACKGROUND_COLOR;
        this.setState({
            titleBar: titleBar
        });
    }

    initializeModalComponent = () => {
        let initialModalComponent = new ModalComponentModel();
        initialModalComponent.shouldVisible = false;
        this.setState({
          modalComponent : initialModalComponent
        });
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

    componentWillMount () {
        this.initializeModalComponent();
        //Code for catching event need to update for re-rendering 
        DeviceEventEmitter.addListener(eventEmitterEnum.RefreshGoalSummaryScreen, () => {
            this.getCurrenciesList();
        })
    }

    componentDidMount() {
        this.initializeStatusBar();
        this.setState({
            currencies: this.state.currencies.cloneWithRows(currenciesData)
        });
        this.getGoalNameFromStorage();
        this.getCurrenciesList();
    }

    getGoalNameFromStorage = () => {
        //TODO: write code to fetch goal data from storage and then bind goal name
        AsyncStorageUtil.getItem(stringConstant.GOAL_INFO_STORAGE_KEY).then((data) => {
            data = JSON.parse(data);
            let goalInfo = new GoalLocalModel();
            goalInfo = data;
            this.setState({
                goalName: goalInfo.goalName,
                goalInfo: goalInfo
            });
        });
    }

    showLoader = (bit) => { // call this function to show/hide the loader
        this.setState({
            showActivityIndicator: bit
        });
    }

    getCurrenciesList = () => {
        AsyncStorageUtil.getItem(stringConstant.CRYPTO_CURRENCY_INFO).then((data) => {
            data = JSON.parse(data);
            let cryptoCurrencyInfo = data;
            if (cryptoCurrencyInfo) {
                this.showLoader(true);
                let id = 0;
                cryptoCurrencyInfo.forEach(element => {
                    element.id = id;
                    id++;
                });
                this.setState({
                    currencies: this.state.currencies.cloneWithRows(cryptoCurrencyInfo),
                    selectedCurrenciesArr: cryptoCurrencyInfo,
                    showCurrencyListView: true
                });
                this.showLoader(false);
            }
        }, () => {
            this.showLoader(false);
        });
    }

    renderCurrencyView = (data) => {
        return (
            <View
                style={
                    [
                        commonStyles.cryptoCardViewContainer,
                        commonStyles.summaryScreenCryptoCardViewContainer,
                        // { marginLeft: data.id % 3 !== 0 ? "5%" : "0%" },
                        { marginLeft: data.id % 3 == 0 ? 10 : "2%" }
                    ]
                }>
                <View>
                    <Image
                        style={[commonStyles.cryptoCoinSelectedStyle]}
                        source={require('../assets/coinCardCheck.png')} />
                </View>
                <View
                    style={[commonStyles.cryptoCardViewContentWrapper]}>
                    <View
                        style={[commonStyles.squareImageMedium,commonStyles.cryptoCoinImageMargins, { backgroundColor: data.hexCode }]}>
                        <Image
                            source={
                                { uri: `${data.flagURL}${data.currencyCode}/symbol.svg` }
                            }
                            style={[commonStyles.squareImageMedium]}
                        />
                    </View>
                    <Text style={{ textAlign: "center" }} >{data.currencyName}</Text>
                </View>
            </View>
        );
    }


    onAcceptGoalAllocation = () => {
        //Integrate API call to create goal allocation
        AsyncStorageUtil.getItem(stringConstant.SAVE_USER_INFO).then((data) => {
            let userAuthentication = new UserAuthenticationModel();
            data = JSON.parse(data);
            if (data && !this.state.showActivityIndicator) {
                userAuthentication = data.AuthenticationToken;
                console.log(userAuthentication);
                this.showLoader(true);
                let goalAllocationItemsArr = [];
                this.state.selectedCurrenciesArr.forEach(element => {
                    let goalAllocationCurrencyRequestModel = new GoalAllocationCurrencyRequestModel();
                    goalAllocationCurrencyRequestModel.Percentage = element.percentage;
                    goalAllocationCurrencyRequestModel.CurrencyCode = element.currencyCode;
                    goalAllocationItemsArr.push(goalAllocationCurrencyRequestModel);
                });

                let goalInfo = new GoalLocalModel();
                goalInfo = this.state.goalInfo;
                

                AsyncStorageUtil.getItem(stringConstant.GOAL_ALLOCATION_INFO).then((data) => {
                    //alert(JSON.stringify(data));
                    let localGoalAllocationData = new GoalAllocationResponseModel();
                    localGoalAllocationData = JSON.parse(data);
                    if (!localGoalAllocationData) {
                        let goalAllocationRequestModel = new GoalAllocationRequestModel();
                        goalAllocationRequestModel.GoalID = goalInfo.goalId;
                        goalAllocationRequestModel.GoalAllocationType = goalAllocationType.InwardFund;
                        goalAllocationRequestModel.GoalAllocationItems = goalAllocationItemsArr;
                        
                        let goalMainAllocationRequestModel = new GoalMainAllocationRequestModel();
                        goalMainAllocationRequestModel.AuthenticationToken = userAuthentication.Token;
                        goalMainAllocationRequestModel.GoalAllocation = goalAllocationRequestModel;
                        console.log(goalMainAllocationRequestModel,"create  goal allocation request");
                        GoalInterface.createGoalAllocation(goalMainAllocationRequestModel).then((response) => {
                            this.showLoader(false);
                            let res = new httpResponseModel();
                            res = response;
                            console.log(res,"create  goal allocation");
                            if (res.ErrorCode === commonConstant.SUCCESS_CODE) {
                                let goalAllocationResponse = new GoalAllocationResponseModel();
                                goalAllocationResponse = res.Result;
                                AsyncStorageUtil.storeItem(stringConstant.GOAL_ALLOCATION_INFO, goalAllocationResponse).then((success) => {
                                    Navigation.setStackRoot(stackName.GoalScreenStack, {
                                        component: {
                                          name: screenId.GoalInvestConfirmScreen
                                        }
                                    });
                                });
                            } else {
                                this.showCustomAlert(true,res.ErrorMsg);
                            }
                        }, (err) => {
                            this.showLoader(false);
                            this.showCustomAlert(true,strings('common.api_failure'));
                        });
                    } else {
                        //Update goal allocation
                        let goalAllocationRequestModel = new GoalAllocationRequestModel();
                        goalAllocationRequestModel.GoalAllocationID = localGoalAllocationData.GoalAllocationID;
                        goalAllocationRequestModel.GoalAllocationItems = goalAllocationItemsArr;

                        let goalMainAllocationRequestModel = new GoalMainAllocationRequestModel();
                        goalMainAllocationRequestModel.AuthenticationToken = userAuthentication.Token;
                        goalMainAllocationRequestModel.GoalAllocation = goalAllocationRequestModel;
                        console.log(goalMainAllocationRequestModel,"update goal allocation request");
                        GoalInterface.updateGoalAllocation(goalMainAllocationRequestModel).then((response) => {
                            this.showLoader(false);
                            let res = new httpResponseModel();
                            res = response;
                            console.log(res,"update goal allocation response");
                            if (res.ErrorCode === commonConstant.SUCCESS_CODE) {
                                let goalAllocationResponse = new GoalAllocationResponseModel();
                                goalAllocationResponse = res.Result;

                                AsyncStorageUtil.storeItem(stringConstant.GOAL_ALLOCATION_INFO, goalAllocationResponse).then((success) => {                                  
                                    Navigation.setStackRoot(stackName.GoalScreenStack, {
                                        component: {
                                          name: screenId.GoalInvestConfirmScreen
                                        }
                                    });
                                });
                            } else {
                                this.showCustomAlert(true,res.ErrorMsg);
                            }
                        }, (err) => {
                            this.showLoader(false);
                            this.showCustomAlert(true,strings('common.api_failure'));
                        });
                    }
                }, (err) => {
                    
                });
            }
        });

    }

    customizeGoalAllocation = () => {
        Navigation.push(stackName.GoalScreenStack, {
            component: {
                name: screenId.ChooseGoalCryptoCurrencyCustomizeScreen
            }
        })
    }

    _onBackButtonPressed = () => {
        Navigation.pop(this.props.componentId);
    }

    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <LinearGradient 
                    colors = {
                        [
                            commonTheme.PRIMARY_BTN_BACKGROUND_COLOR, '#ffffff', '#ffffff'
                        ]
                    } 
                    style = {
                        [
                            styles.linearGradient,
                            commonStyles.paddingTop52
                        ]
                    }>
                    {/* use this code if back button needs to be implemented */}
                    {/* <View
                        style={[commonStyles.goalHeaderWrapper]}>
                        <TouchableOpacity
                            onPress={this._onBackButtonPressed}
                            style={[commonStyles.touchableBackButtonImageWrapper]}>
                            <Image
                                style={[styles.backIcon, commonStyles.topTouchableBackButtonImage]}
                                source={require('../assets/backicon_white.png')} />
                        </TouchableOpacity>
                        <Text style={[commonStyles.headerWithLeftBackButton]}>{strings('goalsummary.main_title')}</Text>
                    </View> */}
                    <TitleBarComponent titleBar = { this.state.titleBar } />
                    <KeyboardAwareScrollView bounces={false} contentContainerStyle = { {alignItems:"center"} } style = { {width:"100%"}}>    
                        
                            <View style={[styles.roundedContainer, commonStyles.defaultLargeMarginBottom]}>
                                <Text style={[commonStyles.topGoalNameStyle, commonStyles.fontSize20]}>{this.state.goalName}</Text>
                                {/* Donut graph */}                            
                                <View style={{height:270, width:'100%', backgroundColor:'white'}}>
                                    <DonutChartComponent currenciesData={this.state.selectedCurrenciesArr} />
                                </View>
                                <Text style={[styles.descriptionTextStyle]}>{strings('goalsummary.description')}</Text>
                                {/* write button code here */}
                                <View style={commonStyles.rowContainerFullWidth}>
                                    <TouchableHighlight
                                        style={[commonStyles.width45pc,{paddingLeft:10}]} //styles.fullWidth
                                        onPress={this.customizeGoalAllocation} underlayColor="white">
                                        <View
                                            style={
                                                [
                                                    commonStyles.defaultSmallPaddingBtn,
                                                    commonStyles.alignItemsCenter,
                                                    styles.buttonRadius,
                                                    styles.primaryYellowButton
                                                ]
                                            }>
                                            <Text style={styles.buttonTextWhite}>{strings('goalsummary.customize_button')}</Text>
                                        </View>
                                    </TouchableHighlight>
                                    <TouchableHighlight
                                        style={[commonStyles.width45pc,{paddingRight:10}]} //styles.fullWidth
                                        onPress={this.onAcceptGoalAllocation} underlayColor="white">
                                        <View
                                            style={
                                                [
                                                    commonStyles.defaultSmallPaddingBtn,
                                                    commonStyles.alignItemsCenter,
                                                    styles.buttonRadius,
                                                    styles.primaryBlueButton
                                                ]
                                            }>
                                            <Text style={styles.buttonTextWhite}>{strings('goalsummary.accept_button')}</Text>
                                        </View>
                                    </TouchableHighlight>
                                </View>
                                <View style={commonStyles.rowContainerFullWidth}>
                                    <View style={{paddingLeft:10,paddingRight:10, width: "100%", marginTop: 25, marginBottom: 25, height: 2, backgroundColor: "#ededed" }}></View>
                                </View>
                                <ListView
                                    contentContainerStyle={[commonStyles.listViewRowWrapper]}
                                    style={{ width: "100%", display: this.state.showCurrencyListView ? 'flex' : 'none' }}
                                    dataSource={this.state.currencies}
                                    renderRow={(data) => this.renderCurrencyView(data)} />
                            </View>
                    </KeyboardAwareScrollView>                    
                </LinearGradient>
                <LoaderComponent showLoader={this.state.showActivityIndicator} />
                <CommonModal modalComponent = {this.state.modalComponent}/>
            </View>
        );
    }
}

const currenciesData = [
    {
        "id": "0",
        "flagURL": "http://mobapp.assets.b21.io/currencies/",
        "percentage": "1",
        "currencyId": "1",
        "currencyName": "Bitcoin",
        "currencyCode": "BTC",
        "currencyCategoryDisplayName": "crypto",
        "hexCode": "#EEEEEE",
        "minGoalAmount": "",
        "maxGoalAmount": "",
        "minWithdrawalAmount": "",
        "maxWithdrawalAmount": "",
        "minSellAmount": "",
        "maxSellAmount": "",
        "minBuyAmount": "",
        "maxBuyAmount": ""
    }
];