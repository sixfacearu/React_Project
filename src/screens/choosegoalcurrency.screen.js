import React, { Component } from 'react';
import {
    View, Text, TouchableOpacity,
    ScrollView, TextInput, Dimensions,
    StyleSheet, Alert, TouchableHighlight,
    ListView
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
import stackName from '../constants/stack.name.enum';
import stringConstant from '../constants/string.constant';
import CurrencyArrayResponseModel from '../models/currency.response.array.model';
import screenId from '../constants/screen.id.enum';
import NavigationUtil from '../utils/navigation.util';
import TitleBarModel from '../models/title.bar.model';
import TitleBarComponent from '../components/title.bar.component';
import ModalComponentModel from '../models/modal.component.model';
import commonUtil from '../utils/common.util';
import CommonModal from '../components/common.modal';

var screen = require('Dimensions').get('window');
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

export default class ChooseGoalCurrencyScreen extends Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            enableNextBtn: false,
            showActivityIndicator: false,
            currencies: ds,
            goalName: '', //after writing code to fetch goal name from storage initialize to ''
            showPicker: false,
            baseCurrencyFlagUrl: "http://mobapp.assets.b21.io/currencies/",
            selectedCurrencyFlagUrl: "", // change default flag URL
            selectedCurrencyCode: "",
            selectedMinGoalAmount: 0,
            selectedMaxGoalAmount: 0,
            selectedCurrencySymbol: "",
            allCurrencies : [],
            titleBar: {},
            modalComponent : {}
        };
        this.leftButtonClicked = this.leftButtonClicked.bind(this);
        this.rightButtonClicked = this.rightButtonClicked.bind(this);
    }

    initializeStatusBar = () => {
        let titleBar = new TitleBarModel();
        titleBar.title = strings('choosegoalcurrency.main_title');
        titleBar.showBackButton = true;
        titleBar.textColorCode = commonTheme.SECONDARY_TEXT_COLOR_LIGHT;
        titleBar.componentId = this.props.componentId;
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
    componentDidMount() {
        this.setState({
            currencies: this.state.currencies.cloneWithRows(currenciesData)
        });
        this.initializeStatusBar();
        AsyncStorageUtil.getItem(stringConstant.ALL_CURRENCY_INFO).then( (data) => {
            let currencyResponseData = new CurrencyResponseModel();
            data = JSON.parse(data);
            currencyResponseData = data;
            if(currencyResponseData){
                this.setState({
                    baseCurrencyFlagUrl: currencyResponseData.CurrencyImageBaseURL,
                    allCurrencies: currencyResponseData.Currencies,
                    enableNextBtn: true,
                    currencies: this.state.currencies.cloneWithRows(currencyResponseData.Currencies)
                }, () => {
                    AsyncStorageUtil.getItem(stringConstant.GOAL_INFO_STORAGE_KEY).then( (data) => {
                        let goalInfo = new GoalLocalModel();
                        data = JSON.parse(data);
                        goalInfo = data;
                        this.state.allCurrencies.forEach(element => {
                            if (element.CurrencyCode === goalInfo.goalFiatCurrencyCode) {
                                this.setState({
                                    selectedCurrencyFlagUrl: this.state.baseCurrencyFlagUrl + element.CurrencyCode + "/flag.svg",
                                    selectedCurrencyCode: element.CurrencyCode,
                                    selectedMinGoalAmount: element.MinGoalAmount,
                                    selectedMaxGoalAmount: element.MaxGoalAmount,
                                    selectedCurrencySymbol: element.CurrencySymbol
                                });
                            }
                        });
                        goalInfo.goalFiatCurrencyCode = this.state.selectedCurrencyCode;
                    });
                });
            } else {
                this.getCurrenciesList(0);
            }
        });
        this.getGoalNameFromStorage();
    }

    showLoader = (bit) => { // call this function to show/hide the loader
        this.setState({
            showActivityIndicator: bit
        });
    }

    getGoalNameFromStorage = () => {
        //TODO: write code to fetch goal data from storage and then bind goal name
        AsyncStorageUtil.getItem(stringConstant.GOAL_INFO_STORAGE_KEY).then((data) => {
            data = JSON.parse(data);
            this.setState({
                goalName: data.goalName,
            });
        });
    }

    getCurrenciesList = () => {
        AsyncStorageUtil.getItem('signup.userInfo').then((data) => {
            let userAuthentication = new UserAuthenticationModel();
            data = JSON.parse(data);
            if (data && !this.state.showActivityIndicator) {
                this.showLoader(true);
                userAuthentication = data.AuthenticationToken;
                console.log(userAuthentication);
                let currencyRequest = new CurrencyRequestModel();
                currencyRequest.AuthenticationToken = userAuthentication.Token;
                currencyRequest.CurrencyCategory = currencyType.Fiat;
                GoalInterface.getCurrency(currencyRequest).then((response) => {
                    console.log(response, 'currency data');
                    let res = new httpResponseModel();
                    res = response;
                    this.showLoader(false);
                    if (res.ErrorCode == commonConstant.SUCCESS_CODE) {
                        let currencyResponseData = new CurrencyResponseModel();
                        currencyResponseData = res.Result;
                        AsyncStorageUtil.storeItem(stringConstant.ALL_CURRENCY_INFO,currencyResponseData).then( (success) => {
                            
                        });
                        currencyResponseData.Currencies.forEach(element => {
                            if (element.CurrencyCode === commonConstant.CURRENCY_CODE_US) {
                                this.setState({
                                    selectedCurrencyCode: element.CurrencyCode,
                                    selectedCurrencyFlagUrl: currencyResponseData.CurrencyImageBaseURL + element.CurrencyCode + "/flag.svg",
                                    selectedMinGoalAmount: element.MinGoalAmount,
                                    selectedMaxGoalAmount: element.MaxGoalAmount,
                                    selectedCurrencySymbol: element.CurrencySymbol
                                });
                            }
                        });
                        if (this.state.selectedCurrencyCode !== commonConstant.CURRENCY_CODE_US) {
                            this.setState({
                                selectedCurrencyCode: currencyResponseData.Currencies[0].CurrencyCode,
                                selectedCurrencyFlagUrl: currencyResponseData.CurrencyImageBaseURL + currencyResponseData.Currencies[0].CurrencyCode + "/flag.svg",
                                selectedMinGoalAmount: currencyResponseData.Currencies[0].MinGoalAmount,
                                selectedMaxGoalAmount: currencyResponseData.Currencies[0].MaxGoalAmount,
                                selectedCurrencySymbol: currencyResponseData.Currencies[0].CurrencySymbol
                            });
                        }
                        this.setState({
                            baseCurrencyFlagUrl: currencyResponseData.CurrencyImageBaseURL,
                            currencies: this.state.currencies.cloneWithRows(currencyResponseData.Currencies),
                            enableNextBtn: true
                        });
                        this.saveGoalInfoInStorage(0);
                    } else if(res.ErrorCode == commonConstant.ACCESS_DENIED_ERROR_CODE) {
                        NavigationUtil.authenticationEntry();
                    }
                }, () => {
                    this.showLoader(false);
                    //v alert("API failure");
                    this.showCustomAlert(true, strings('common.api_failure'));
                });
            }
        }, () => {
            this.showLoader(false);
        });
    }

    renderCurrencyView = (data) => {
        return (
            <TouchableOpacity style={styles.pickerRowcontainer} onPress={this._onCurrencyItemPressed.bind(this, data)}>
                <Image source={{ uri: `${this.state.baseCurrencyFlagUrl}${data.CurrencyCode}/flag.svg` }} style={commonStyles.currencyPickerImage} />
                <Text style={commonStyles.currencyPickerText}>
                    {data.CurrencyCode}
                </Text>
                {/* { data.CountryCode } ( */}
            </TouchableOpacity>
        );
    }

    _onCurrencyItemPressed = (data) => {
        //alert(JSON.stringify(data));
        this.setState({
            selectedCurrencyCode: data.CurrencyCode,
            selectedCurrencyFlagUrl: this.state.baseCurrencyFlagUrl + data.CurrencyCode + "/flag.svg",
            selectedMinGoalAmount: data.MinGoalAmount,
            selectedMaxGoalAmount: data.MaxGoalAmount,
            selectedCurrencySymbol: data.CurrencySymbol
        }, () => {
            this.openCurrencySelector();
        });
    }

    openCurrencySelector = () => {
        if (this.state.showPicker) {
            this.setState({ showPicker: false });
        } else {
            this.setState({ showPicker: true });
        }
    }

    saveGoalInfoInStorage = (bit) => {
        let goalCurrencyInfo = new CurrencyArrayResponseModel();
        goalCurrencyInfo.MaxGoalAmount = this.state.selectedMaxGoalAmount;
        goalCurrencyInfo.MinGoalAmount = this.state.selectedMinGoalAmount;
        goalCurrencyInfo.CurrencySymbol = this.state.selectedCurrencySymbol;
        AsyncStorageUtil.storeItem(stringConstant.SAVE_GOAL_CURRENCY_INFO, goalCurrencyInfo).then((success) => {
            let goalInfo = new GoalLocalModel();
            goalInfo.goalName = this.state.goalName;
            goalInfo.goalFiatCurrencyCode = this.state.selectedCurrencyCode;
            AsyncStorageUtil.storeItem(stringConstant.GOAL_INFO_STORAGE_KEY, goalInfo).then(() => {
                if(bit) {
                    Navigation.push(stackName.GoalScreenStack, {
                        component: {
                            name: screenId.SetGoalAmountScreen
                        }
                    });
                }
                setTimeout( () => {
                    this.showLoader(false);
                    this.setState({
                        enableNextBtn: true
                    })
                },1000);
            });
        }, (err) => {

        });
    }

    onSaveButton = () => {
        this.showLoader(true);
        this.setState({
            enableNextBtn: false
        }, () => {
            this.saveGoalInfoInStorage(1);
        });
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
                    <TitleBarComponent titleBar = { this.state.titleBar } />
                    {/* <View
                        style={[commonStyles.goalHeaderWrapper]}>
                        <TouchableOpacity
                            onPress={this._onBackButtonPressed}
                            style={[commonStyles.touchableBackButtonImageWrapper]}>
                            <Image
                                style={[styles.backIcon, commonStyles.topTouchableBackButtonImage]}
                                source={require('../assets/backicon_white.png')} />
                        </TouchableOpacity>
                        <Text style={[commonStyles.headerWithLeftBackButton]}>{strings('choosegoalcurrency.main_title')}</Text>
                    </View> */}
                    <KeyboardAwareScrollView bounces={false}>
                        <View style={[styles.roundedContainer]}>
                            <Text style={[commonStyles.topGoalNameStyle, commonStyles.fontSize20]}>{this.state.goalName}</Text>
                            <Image style={styles.dashboardIconStyle} source={require('../assets/dollar_circle.png')} />
                            <Text style={[styles.descriptionTextStyle]}>{strings('choosegoalcurrency.select_curency_placeholder')}</Text>
                            <View style={[commonStyles.currencyDropDrownWrapper]}>
                                <TouchableOpacity
                                    style={
                                        [
                                            commonStyles.currencyFlagCoverView,
                                            commonStyles.inputField
                                        ]
                                    }
                                    onPress={this.openCurrencySelector}>
                                    <View style={styles.flagImgView}>
                                        <Image style={styles.flagIcon} source={{ uri: this.state.selectedCurrencyFlagUrl }} />
                                        <Image style={styles.downArrow} source={require("../assets/dropBtnSolid.png")} />
                                    </View>
                                    <View style={styles.lineView} />
                                </TouchableOpacity>
                                <View style={[commonStyles.currencyCodeInputViewWrapper, { flexDirection: 'row' }]}>
                                    <View style={[{ flex: 1 }]}>
                                        <TextInput
                                            editable={false}
                                            style={
                                                [
                                                    commonStyles.mobileCountryPrefix,
                                                    fontFamilyStyles.robotoLight,
                                                    commonStyles.primaryTextColorLight,
                                                    commonStyles.inputField
                                                ]
                                            }
                                            value={this.state.selectedCurrencyCode} />
                                    </View>
                                </View>
                            </View>
                            <View
                                style=
                                {
                                    [
                                        commonStyles.currencyDropdownView
                                    ]
                                } >
                                <ListView
                                    style={{ display: this.state.showPicker ? 'flex' : 'none' }}
                                    dataSource={this.state.currencies}
                                    renderRow={(data) => this.renderCurrencyView(data)} />
                            </View>
                            <TouchableHighlight
                                style={[styles.width90, styles.topMarginAboveBtn, {marginTop:40}]} //styles.fullWidth
                                disabled={!this.state.enableNextBtn}
                                onPress={this.onSaveButton} underlayColor="white">
                                <View style={[styles.buttonRadius,
                                this.state.enableNextBtn ? styles.primaryBlueButton : styles.primaryDisableButtonLight]}>
                                    <Text style={styles.buttonTextWhite}>{strings('choosegoalcurrency.save_goal_fiat_currency')}</Text>
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

const currenciesData = [
    {
        "CurrencyId": "1",
        "CurrencyName": "US Dollar",
        "CurrencyCode": "USD",
        "CurrencyCategoryDisplayName": "Fial",
        "HexCode": "",
        "MinGoalAmount": 50,
        "MaxGoalAmount": 1000000,
        "MinWithdrawalAmount": 50,
        "MaxWithdrawalAmount": 1000000,
        "MinSellAmount": 50,
        "MaxSellAmount": 100000,
        "MinBuyAmount": 50,
        "MaxBuyAmount": 100000
    }
];