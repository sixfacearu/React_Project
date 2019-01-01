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
import NavigationUtil from '../utils/navigation.util';

var screen = require('Dimensions').get('window');
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

export default class GoalInvestConfirmScreen extends Component {

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
            titleBar: {}
        };
    }

    initializeStatusBar = () => {
        let titleBar = new TitleBarModel();
        titleBar.title = strings('goalinvestconfirm.main_title');
        titleBar.showBackButton = false;
        titleBar.textColorCode = commonTheme.SECONDARY_TEXT_COLOR_LIGHT;
        titleBar.backgroundColorCode = 'transparent';//commonTheme.PRIMARY_BTN_BACKGROUND_COLOR;
        this.setState({
            titleBar: titleBar
        });
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
                        { marginLeft: data.id % 3 !== 0 ? "5%" : "0%" }
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
        // NavigationUtil.setDefaultOptions();
        // NavigationUtil.setBottomTabsForKYC();
        Navigation.setStackRoot(stackName.GoalScreenStack, {
            component: {
                name: screenId.ConfirmYourCountryScreen
            }
        })
    }

    editPortfolioBtn = () => {
        let tempSelectedArr = this.state.selectedCurrenciesArr;
        tempSelectedArr.forEach(element => {
            delete element["id"];
        });
        AsyncStorageUtil.storeItem(stringConstant.CRYPTO_CURRENCY_INFO,tempSelectedArr).then( (success) => {
            Navigation.push(stackName.GoalScreenStack, {
                component: {
                    name: screenId.ChooseGoalCryptoCurrencyScreen,
                    passProps: {
                        showBackButton: true
                    }
                }
            });
        });
         
    }

    _onBackButtonPressed = () => {
        Navigation.pop(this.props.componentId);
    }

    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center',paddingBottom:25 }}>
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
                    <KeyboardAwareScrollView bounces={false}>    
                        <View style={[styles.roundedContainer, commonStyles.defaultLargeMarginBottom]}>
                            <Text style={[commonStyles.topGoalNameStyle, commonStyles.fontSize20]}>{this.state.goalName}</Text>
                            <View
                                style={
                                    [
                                        commonStyles.width90pc,
                                        commonStyles.alignItemsCenter,
                                        commonStyles.default15PaddingBottom
                                    ]
                                }>
                                <View
                                    style={
                                        [
                                            commonStyles.fullWidth,
                                            commonStyles.default15PaddingLeftRight,
                                            commonStyles.borderBottomwidth1e4e4e4
                                        ]
                                    }>
                                </View>
                            </View>
                            {/* Donut graph */}                            
                            <View style={{height:270, width:'100%', backgroundColor:'white'}}>
                                <DonutChartComponent currenciesData={this.state.selectedCurrenciesArr} />
                            </View>
                            <Text style={[styles.descriptionTextStyle]}>{strings('goalinvestconfirm.description')}</Text>
                            {/* write button code here */}
                            <TouchableHighlight
                                style={[commonStyles.width90pc]} //styles.fullWidth
                                onPress={this.onAcceptGoalAllocation} underlayColor="white">
                                <View
                                    style={
                                        [
                                            // commonStyles.defaultSmallPaddingBtn,
                                            commonStyles.alignItemsCenter,
                                            styles.buttonRadius,
                                            styles.primaryBlueButton
                                        ]
                                    }>
                                    <Text style={styles.buttonTextWhite}>{strings('goalinvestconfirm.verify_btn')}</Text>
                                </View>
                            </TouchableHighlight>
                            <TouchableHighlight 
                                style={{ alignItems: 'center' }} 
                                onPress={this.editPortfolioBtn} 
                                underlayColor="transparent">
                                <View style={styles.secondaryTransparentButton}>
                                    <Text 
                                        style = {
                                            [
                                                styles.buttonTextBlue,
                                                commonStyles.margin15TopBottom
                                            ]
                                        }>
                                        {strings('goalinvestconfirm.edit_portfolio_link')}
                                    </Text>
                                </View>
                            </TouchableHighlight>
                        </View>
                    </KeyboardAwareScrollView>                    
                </LinearGradient>
                <LoaderComponent showLoader={this.state.showActivityIndicator} />
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