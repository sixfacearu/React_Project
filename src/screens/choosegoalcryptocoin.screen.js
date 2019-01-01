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
import * as _ from 'lodash';

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
import stackName from '../constants/stack.name.enum';
import screenId from '../constants/screen.id.enum';
import TitleBarModel from '../models/title.bar.model';
import TitleBarComponent from '../components/title.bar.component';
import eventEmitterEnum from '../constants/event.emitter.enum';
import CommonModal from '../components/common.modal';
import ModalComponentModel from '../models/modal.component.model';
import commonUtil from '../utils/common.util';

var screen = require('Dimensions').get('window');
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

export default class ChooseGoalCryptoCurrencyScreen extends Component {

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
            currenciesArr: [],
            selectedCurrenciesArr: [],
            titleBar: {},
            showBackButton: false,
            modalComponent: {}
        };
        this.leftButtonClicked = this.leftButtonClicked.bind(this);
        this.rightButtonClicked = this.rightButtonClicked.bind(this);
    }

    initializeStatusBar = () => {
        let titleBar = new TitleBarModel();
        titleBar.title = strings('selectCryptoCurrency.main_title');
        titleBar.showBackButton = this.state.showBackButton;
        if(this.state.showBackButton) {
            titleBar.componentId = this.props.componentId;
        }
        titleBar.textColorCode = commonTheme.SECONDARY_TEXT_COLOR_LIGHT;
        titleBar.backgroundColorCode = 'transparent';//commonTheme.PRIMARY_BTN_BACKGROUND_COLOR;
        this.setState({
            titleBar: titleBar
        });
    }
    initializeModalComponent = () => {
        let initialModalComponent = new ModalComponentModel();
        initialModalComponent.shouldVisible = false;
        this.setState({
            modalComponent: initialModalComponent
        })
    }

    componentWillMount () {

        this.initializeModalComponent();
        //Code for catching event need to update for re-rendering 
        DeviceEventEmitter.addListener(eventEmitterEnum.RefreshCryptoCoinScreen, () => {
            this.getCurrenciesList(true);
        })
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
            showBackButton: this.props.showBackButton
        }, () => {
            this.initializeStatusBar();
        });
        this.setState({
            currencies: this.state.currencies.cloneWithRows(currenciesData)
        });
        this.getCurrenciesList(false);
        this.getGoalNameFromStorage();
    }

    getGoalNameFromStorage = () => {
        //TODO: write code to fetch goal data from storage and then bind goal name
        AsyncStorageUtil.getItem(stringConstant.GOAL_INFO_STORAGE_KEY).then((data) => {
            data = JSON.parse(data);
            let goalInfo = new GoalLocalModel();
            goalInfo = data;
            this.setState({
                goalName: goalInfo.goalName
            });
        });
    }

    showLoader = (bit) => { // call this function to show/hide the loader
        this.setState({
            showActivityIndicator: bit
        });
    }

    getCurrenciesList = (isRefresh) => {
        AsyncStorageUtil.getItem(stringConstant.SAVE_USER_INFO).then((data) => {
            let userAuthentication = new UserAuthenticationModel();
            data = JSON.parse(data);
            if (data && !this.state.showActivityIndicator) {
                this.showLoader(true);
                userAuthentication = data.AuthenticationToken;
                console.log(userAuthentication);
                AsyncStorageUtil.getItem(stringConstant.ALL_CRPTO_CURRENCIES).then((storageData) => {
                    let currencyResponseData = new CurrencyResponseModel();
                    currencyResponseData = JSON.parse(storageData);
                    if(!_.isEmpty(currencyResponseData)) {
                        this.showLoader(false);
                        AsyncStorageUtil.getItem(stringConstant.CRYPTO_CURRENCY_INFO).then((data) => {
                            let tempCurrencyArr = JSON.parse(data)
                            if(tempCurrencyArr) {
                                let tempSelectedArr = [];
                                tempCurrencyArr.forEach(tempElement => {
                                    currencyResponseData.Currencies.forEach(element => {
                                        if(tempElement.currencyCode === element.CurrencyCode){
                                            element.Selected = true;
                                            tempSelectedArr.push(element);
                                        }
                                    });
                                });
                                this.setState({
                                    selectedCurrenciesArr: tempSelectedArr,
                                });
                            }
                            this.setState({ 
                                baseCurrencyFlagUrl: currencyResponseData.CurrencyImageBaseURL,
                                currencies: this.state.currencies.cloneWithRows([]),
                                currenciesArr: currencyResponseData.Currencies,
                                showCurrencyListView: true,
                                enableNextBtn: true
                            }, () => {
                                this.setState({
                                    currencies: this.state.currencies.cloneWithRows(currencyResponseData.Currencies),
                                });
                            });
                        });
                    } else {
                        let currencyRequest = new CurrencyRequestModel();
                        currencyRequest.AuthenticationToken = userAuthentication.Token;
                        currencyRequest.CurrencyCategory = currencyType.Crypto;
                        GoalInterface.getCurrency(currencyRequest).then((response) => {
                            console.log(response, 'currency data');
                            let res = new httpResponseModel();
                            res = response;
                            this.showLoader(false);
                            if (res.ErrorCode == commonConstant.SUCCESS_CODE) {
                                let currencyResponseData = new CurrencyResponseModel();
                                currencyResponseData = res.Result;
                                let id = 0;
                                currencyResponseData.Currencies.forEach(element => {
                                    element.ID = id;
                                    element.Selected = false;
                                    id++;
                                });
                                
                                this.setState({
                                    baseCurrencyFlagUrl: currencyResponseData.CurrencyImageBaseURL,
                                    currencies: this.state.currencies.cloneWithRows(currencyResponseData.Currencies),
                                    currenciesArr: currencyResponseData.Currencies,
                                    showCurrencyListView: true
                                });

                                AsyncStorageUtil.storeItem(stringConstant.ALL_CRPTO_CURRENCIES, currencyResponseData).then((success) => {

                                });
                            } else if (res.Result == commonConstant.ACCESS_DENIED_ERROR_CODE) {
                                //redirect to login screen
                                //Navigation.setRoot();
                            }
                        }, (err) => {
                            this.showLoader(false);
                            //v alert("API failure");
                            this.showCustomAlert(true, strings('common.api_failure'));
                        });
                    }
                });
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
                        // { marginLeft: data.ID % 3 !== 0 ? "4%" : "0.5%" },
                        { marginLeft: data.id % 3 == 0 ? 10 : "2%" },
                        { marginRight: data.ID % 3 !== 0 ? "0.5%" : "0.5%" }
                    ]
                }>
                <TouchableOpacity
                    onPress={this._onCurrencyItemPressed.bind(this, data)}>
                    <View
                        style={
                            {
                                display: data.Selected ? 'flex' : 'none'
                            }
                        }>
                        <Image
                            style={[commonStyles.cryptoCoinSelectedStyle]}
                            source={require('../assets/coinCardCheck.png')} />
                    </View>
                    <View
                        style={[commonStyles.cryptoCardViewContentWrapper]}>
                        <View
                            style={[commonStyles.squareImageMedium,commonStyles.cryptoCoinImageMargins, { backgroundColor: data.HexCode }]}>
                            <Image
                                source=
                                {
                                    { uri: `${this.state.baseCurrencyFlagUrl}${data.CurrencyCode}/symbol.svg` }
                                }
                                style={[commonStyles.squareImageMedium]}
                            />
                        </View>
                        <Text style={{ textAlign: "center" }} >{data.CurrencyName}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    _onCurrencyItemPressed = (data) => {
        //alert(JSON.stringify(data));
        let selectedCurrencies = [];
        this.state.currenciesArr.forEach(element => {
            if (element.CurrencyCode === data.CurrencyCode) {
                element.Selected = !element.Selected;
                //alert(JSON.stringify(element));
            }
            if (element.Selected) {
                selectedCurrencies.push(element);
            }
        });
        this.setState({
            selectedCurrenciesArr: selectedCurrencies,
            currencies: this.state.currencies.cloneWithRows([])
        }, () => {
            this.setState({
                currencies: this.state.currencies.cloneWithRows(this.state.currenciesArr)
            });
            if (this.state.selectedCurrenciesArr.length) {
                this.setState({
                    enableNextBtn: true
                });
            } else {
                this.setState({
                    enableNextBtn: false
                });
            }
        });
    }

    onSaveButton = () => {
        let cryptoCurrencyForStorageArr = [];
        let defaultPercentage = Math.floor(100/this.state.selectedCurrenciesArr.length);
        //parseFloat((100 / this.state.selectedCurrenciesArr.length));
        //defaultPercentage = numberUtil.returnIgnoredRoundedValues(defaultPercentage, 2);
        let count = -1;
        count = 100 - (defaultPercentage * (this.state.selectedCurrenciesArr.length));
        
        //incrementedPercentage = numberUtil.returnIgnoredRoundedValues(incrementedPercentage, 2);
        this.state.selectedCurrenciesArr.forEach(element => {
            let currency = new CryptoCurrencyLocalModel();
            currency.currencyId = element.CurrencyId;
            currency.currencyName = element.CurrencyName;
            currency.currencyCode = element.CurrencyCode;
            currency.currencyCategoryDisplayName = element.CurrencyCategoryDisplayName;
            currency.hexCode = element.HexCode;
            currency.minGoalAmount = element.MinGoalAmount;
            currency.maxGoalAmount = element.MaxGoalAmount;
            currency.minWithdrawalAmount = element.MinWithdrawalAmount;
            currency.maxWithdrawalAmount = element.MaxWithdrawalAmount;
            currency.minSellAmount = element.MinSellAmount;
            currency.maxSellAmount = element.MaxSellAmount;
            currency.minBuyAmount = element.MinBuyAmount;
            currency.maxBuyAmount = element.MaxBuyAmount;

            if (count > 0) {
                currency.percentage = defaultPercentage + 1;
                count--;
            } else {
                currency.percentage = defaultPercentage;
            }
            currency.flagURL = this.state.baseCurrencyFlagUrl;
            cryptoCurrencyForStorageArr.push(currency);
        });
        //console.log(cryptoCurrencyForStorageArr);
        AsyncStorageUtil.storeItem(stringConstant.CRYPTO_CURRENCY_INFO, cryptoCurrencyForStorageArr).then((success) => {
            Navigation.push(stackName.GoalScreenStack, {
                component: {
                    name: screenId.GoalSummaryScreen
                }
            })
        });
    }

    _onBackButtonPressed = () => {
        console.log('back btn pressed');
    }

    render() {
        return (
            <View style={styles.mainDashboardContainer}>
                <LinearGradient 
                    colors = {
                        [
                            commonTheme.PRIMARY_BTN_BACKGROUND_COLOR, '#ffffff', '#ffffff'
                        ]
                    } 
                    style = {
                        [
                            styles.linearGradient, 
                            //commonStyles.defaultPaddingBottom,
                            commonStyles.paddingTop52
                        ]
                    }>
                    {/* use this code if back button needs to be implemented */}
                    {/* <View 
                        style = { [ commonStyles.goalHeaderWrapper ] }>
                        <TouchableOpacity 
                            onPress = { this._onBackButtonPressed }
                            style = { [ commonStyles.touchableBackButtonImageWrapper ] }>
                            <Image 
                                style = { [styles.backIcon,commonStyles.topTouchableBackButtonImage ] } 
                                source = { require('../assets/backicon_white.png') } />
                        </TouchableOpacity>
                        <Text style={[commonStyles.headerWithLeftBackButton]}>{ strings('selectCryptoCurrency.main_title') }</Text>
                    </View> */}
                    <TitleBarComponent titleBar = { this.state.titleBar } />
                    {/* <Text style={[styles.dashboardHeader]}>{strings('selectCryptoCurrency.main_title')}</Text> */}
                    <KeyboardAwareScrollView bounces={false} extraScrollHeight={50} contentContainerStyle = { {alignItems:"center"} } style = { {width:"100%"}}>    
                        <View style={[styles.roundedContainer]}>
                            <Text style={[commonStyles.topGoalNameStyle, commonStyles.fontSize20]}>{this.state.goalName}</Text>
                            <Image style={commonStyles.dashboardSmallIconStyle} source={require('../assets/coinPileCircle3x.png')} />
                            <Text style={[styles.descriptionTextStyle]}>{strings('selectCryptoCurrency.description_text')}</Text>
                            <ListView
                                contentContainerStyle={[commonStyles.listViewRowWrapper]}
                                style={{ width:"100%",paddingTop:10,display: this.state.showCurrencyListView ? 'flex' : 'none' }}
                                dataSource={this.state.currencies.cloneWithRows(this.state.currenciesArr)}
                                renderRow={(data) => this.renderCurrencyView(data)} />
                            <TouchableHighlight
                                style={[commonStyles.width80pc, styles.topMarginAboveBtn]} //styles.fullWidth
                                disabled={!this.state.enableNextBtn}
                                onPress={this.onSaveButton} underlayColor="white">
                                <View style={[styles.buttonRadius,
                                this.state.enableNextBtn ? styles.primaryBlueButton : styles.primaryDisableButtonLight]}>
                                    <Text style={styles.buttonTextWhite}>{strings('selectCryptoCurrency.save_goal_crypto_btn')}</Text>
                                </View>
                            </TouchableHighlight>
                        </View>
                    </KeyboardAwareScrollView>
                </LinearGradient>
                <LoaderComponent showLoader={this.state.showActivityIndicator} />
                <CommonModal modalComponent={this.state.modalComponent} />
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