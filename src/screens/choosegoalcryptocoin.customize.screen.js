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
import eventEmitterEnum from '../constants/event.emitter.enum';
import ModalComponentModel from '../models/modal.component.model';
import CommonModal from '../components/common.modal';
import commonUtil from '../utils/common.util';
var screen = require('Dimensions').get('window');
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

export default class ChooseGoalCryptoCurrencyCustomizeScreen extends Component {

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
            currentIndex: -1,
            changedIndex: 0,
            modalComponent: {},
            keyPressMode: ""
        };
        this.leftButtonClicked = this.leftButtonClicked.bind(this);
        this.rightButtonClicked = this.rightButtonClicked.bind(this);
    }

    initializeStatusBar = () => {
        let titleBar = new TitleBarModel();
        titleBar.title = strings('customizeCryptoCurrency.main_title');
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
            modalComponent: initialModalComponent
        })
    }

    componentWillMount() {
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

    showCustomAlert = (visible, message) => {
        this.setState({
            modalComponent: commonUtil.setAlertComponent(visible, message, strings('common.okay'), "", true, false, () => this.leftButtonClicked(), () => this.rightButtonClicked(), () => this.closeButtonClicked())
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
                cryptoCurrencyInfo.sort((a, b) => {
                    if (a.percentage == b.percentage) {
                        return (a.currencyName.localeCompare(b.currencyName));
                    } else {
                        return (b.percentage - a.percentage);
                    }
                });
                cryptoCurrencyInfo.forEach(element => {
                    element.id = id;
                    element.locked = false;
                    id++;
                    element.enablePlusButton = true;
                    element.enableMinusButton = true;
                });
                if(cryptoCurrencyInfo.length == 1) {
                    cryptoCurrencyInfo.forEach(element => {
                        element.locked = true;
                        element.enablePlusButton = false;
                        element.enableMinusButton = false;
                    });
                }
                // alert(JSON.stringify(cryptoCurrencyInfo));
                this.setState({
                    selectedCurrenciesArr: cryptoCurrencyInfo,
                    currencies: this.state.currencies.cloneWithRows(cryptoCurrencyInfo),
                    showCurrencyListView: true,
                    enableNextBtn: true
                });
                this.showLoader(false);
            }
        }, () => {
            this.showLoader(false);
        });
    }

    lockUnlockCurrency = (currencyCode) => {
        //alert(currencyCode);
        if(this.state.selectedCurrenciesArr.length == 1) {
            return;
        }
        this.state.selectedCurrenciesArr.forEach(element => {
            if (element.currencyCode === currencyCode) {
                element.locked = !element.locked;
            }
        });
        let tempSelectedCurrenciesArr = this.state.selectedCurrenciesArr;
        this.setState({
            selectedCurrenciesArr: tempSelectedCurrenciesArr,
            currencies: this.state.currencies.cloneWithRows([])
        }, () => {
            this.setState({
                currencies: this.state.currencies.cloneWithRows(this.state.selectedCurrenciesArr)
            });
        });
    }

    onPercentageIncreasedDecreased = (currency,mode) => {
        //alert(JSON.stringify(currency));
        let lockedCurrencyCount = 0;
        this.state.selectedCurrenciesArr.forEach(element => {
            if(element.locked == true) {
                lockedCurrencyCount++;
            }
        });
        if(lockedCurrencyCount >= this.state.selectedCurrenciesArr.length-1) {
            // v alert("please unlock currencies to auto adjust allocations");
            this.showCustomAlert(true,strings('choosegoalcurrency.please_unlock_currencies_to_auto_adjust_allocations'));

            return;
        }
        let currentIndex = this.state.currentIndex;
        let changedIndex = this.state.changedIndex;
        console.log("Step 1: "+ " current index: "+ currentIndex + " changed Index: " + changedIndex);
        if(currentIndex !== currency.id) {
            currentIndex = currency.id;
            changedIndex = currency.id;
            console.log("Step 2:diff currency "+ " current index: "+ currentIndex + " changed Index: " + changedIndex);
        } else if(currentIndex == currency.id){
            currentIndex = currency.id;
            changedIndex = this.state.changedIndex;
            console.log("Step 2:same currency "+ " current index: "+ currentIndex + " changed Index: " + changedIndex);
        }
        if(this.state.selectedCurrenciesArr[currentIndex].percentage == 0 && mode !== "inc") {
            return;
        }
        if(this.state.selectedCurrenciesArr[currentIndex].percentage == 100 && mode == "inc") {

        }
        this.state.selectedCurrenciesArr.forEach((element,index) => {
            if (element.currencyCode === currency.currencyCode) {
                if(mode == "inc") {
                    element.percentage++;
                    if(element.percentage>100) {
                        element.percentage--;
                        return;
                    }
                    if(element.percentage==100) {
                        element.enablePlusButton = false;
                        this.handlePressOut();
                    }
                    if(element.percentage > 0){
                        element.enableMinusButton = true;
                    }
                } else {
                    element.percentage--;
                    if(element.percentage==0) {
                        element.enableMinusButton = false;
                    }
                    if(element.percentage < 100 || element.percentage > 0) {
                        element.enablePlusButton = true;
                    }
                    if(element.percentage < 0) {
                        element.percentage++;
                        return;
                    }
                }
            }
        });

        if (changedIndex >= this.state.selectedCurrenciesArr.length - 1) {
            changedIndex = 0;
        } else {
            changedIndex++;
        }
        if (changedIndex > this.state.selectedCurrenciesArr.length - 1) {
            changedIndex = currentIndex + 1;
        }
        try {
            while (this.state.selectedCurrenciesArr[changedIndex].locked) {
                if (this.state.selectedCurrenciesArr[changedIndex].locked) {
                    changedIndex++;
                }
                if (changedIndex > this.state.selectedCurrenciesArr.length - 1) {
                    changedIndex = 0;
                }
            }
        } catch (err) {

        }
        if (changedIndex == currentIndex) {
            changedIndex++;
            if (changedIndex > this.state.selectedCurrenciesArr.length - 1) {
                changedIndex = 0;
            }
            try {
                while (this.state.selectedCurrenciesArr[changedIndex].locked) {
                    if (this.state.selectedCurrenciesArr[changedIndex].locked) {
                        changedIndex++;
                    }
                    if (changedIndex > this.state.selectedCurrenciesArr.length - 1) {
                        changedIndex = 0;
                    }
                }
            } catch (err) {

            }
        }
        if (changedIndex > this.state.selectedCurrenciesArr.length - 1) {
            changedIndex = currentIndex + 1;
        }
        //alert(" current index: "+ currentIndex + " changed Index: " + changedIndex);
        if (mode == "inc") {
            this.state.selectedCurrenciesArr[changedIndex].percentage--;
            if (this.state.selectedCurrenciesArr[changedIndex].percentage <= 0) {
                if (this.state.selectedCurrenciesArr[changedIndex].percentage == -1) {
                    this.state.selectedCurrenciesArr[changedIndex].percentage++;
                    this.state.selectedCurrenciesArr.forEach((element, index) => {
                        if (element.currencyCode === currency.currencyCode) {
                            // if(element.percentage == 100) {
                            element.percentage--;
                            element.enablePlusButton = true;
                            // }
                        }
                    });
                    this.state.selectedCurrenciesArr[changedIndex].locked = true;
                } else if (this.state.selectedCurrenciesArr[changedIndex].percentage == 0
                    && this.state.selectedCurrenciesArr[changedIndex].locked) {
                    this.state.selectedCurrenciesArr.forEach((element, index) => {
                        if (element.currencyCode === currency.currencyCode) {
                            if (element.percentage > 1) {
                                element.percentage--;
                            }
                        }
                    });
                    // this.state.selectedCurrenciesArr[changedIndex].locked = true;
                }
                //this.state.selectedCurrenciesArr[changedIndex].enablePlusButton = false;
                this.state.selectedCurrenciesArr[changedIndex].enableMinusButton = false;
            }
            if (this.state.selectedCurrenciesArr[changedIndex].percentage < 100) {
                this.state.selectedCurrenciesArr[changedIndex].enablePlusButton = true;
            }
        } else {
            this.state.selectedCurrenciesArr[changedIndex].percentage++;
            if (this.state.selectedCurrenciesArr[changedIndex].percentage > 100) {
                this.state.selectedCurrenciesArr[changedIndex].percentage--;
                this.state.selectedCurrenciesArr[changedIndex].locked = true;
                this.state.selectedCurrenciesArr.forEach((element, index) => {
                    if (element.currencyCode === currency.currencyCode) {
                        element.percentage++;
                    }
                });
            }
            if (this.state.selectedCurrenciesArr[changedIndex].percentage == 100) {
                this.state.selectedCurrenciesArr[changedIndex].enablePlusButton = false;
            }
            if (this.state.selectedCurrenciesArr[changedIndex].percentage > 0) {
                this.state.selectedCurrenciesArr[changedIndex].enableMinusButton = true;
            }
        }
        let tempSelectedCurrenciesArr = this.state.selectedCurrenciesArr;
        this.setState({
            selectedCurrenciesArr: tempSelectedCurrenciesArr,
            currencies: this.state.currencies.cloneWithRows([])
        }, () => {
            this.setState({
                currencies: this.state.currencies.cloneWithRows(this.state.selectedCurrenciesArr),
                currentIndex: currentIndex,
                changedIndex: changedIndex
            });
        });
    }

    handlePressIn = (currency,mode) => {
        if(this.state.keyPressMode === "") {
            this.onPercentageIncreasedDecreased(currency,mode);
            this.state.selectedCurrenciesArr.forEach((element,index) => {
                if (element.currencyCode === currency.currencyCode) {
                    if(mode == "inc") {
                        if(element.percentage<100){
                            this._keyPressTimer = setInterval ( () => {
                                this.onPercentageIncreasedDecreased(currency,mode);
                            },150);
                            this.setState({
                                keyPressMode : mode
                            });
                        }
                    } else if(mode == "dec") {
                        if(element.percentage>1){
                            this._keyPressTimer = setInterval ( () => {
                                this.onPercentageIncreasedDecreased(currency,mode);
                            },150);
                            this.setState({
                                keyPressMode : mode
                            });
                        }
                    }
                }
            });
        }
    }
    
    handlePressOut = () => {
        clearInterval(this._keyPressTimer);
        this.setState({
            keyPressMode : ""
        });
    }

    renderCurrencyView = (data) => {
        return (
            <View
                style={
                    [
                        commonStyles.fullWidth,
                        commonStyles.default15PaddingLeftRight
                    ]
                }>
                <View
                    style={
                        [
                            commonStyles.fullWidth,
                            commonStyles.listViewRowWrapper,
                            commonStyles.margin15TopBottom
                        ]
                    }>
                    <View
                        style={
                            [
                                commonStyles.width40pc,
                                commonStyles.alignItemsCenter,
                                commonStyles.borderRight979797,
                            ]
                        }>
                        <TouchableOpacity
                            style={
                                [
                                    commonStyles.lockUnlockBtnWrapper,
                                    commonStyles.lockUnlockImage
                                ]
                            }
                            onPress={this.lockUnlockCurrency.bind(this, data.currencyCode)}
                            underlayColor="white">
                            <View>
                                <Image
                                    style={
                                        [
                                            commonStyles.lockUnlockImage,
                                            { display: data.locked ? "flex" : "none" }
                                        ]
                                    }
                                    source={require('../assets/lock_small.png')} />
                                <Image
                                    style={
                                        [
                                            commonStyles.lockUnlockImage,
                                            { display: !data.locked ? "flex" : "none" }
                                        ]
                                    }
                                    source={require('../assets/unlock_small.png')} />
                            </View>
                        </TouchableOpacity>
                        <View
                            style={
                                [
                                    commonStyles.customizeCurrencyIcon,
                                    { backgroundColor: data.hexCode }
                                ]
                            }>
                            <Image
                                source={
                                    { uri: `${data.flagURL}${data.currencyCode}/symbol.svg` }
                                }
                                style={
                                    [
                                        commonStyles.customizeCurrencyIcon
                                    ]
                                }
                            />
                        </View>
                        <Text
                            style={
                                [
                                    commonStyles.textAlignCenter,
                                    commonStyles.fontSize20,
                                    commonStyles.secTextColorDark
                                ]
                            } >{data.currencyName}</Text>
                    </View>
                    <View
                        style={
                            [
                                commonStyles.width60pc,
                                commonStyles.listViewRowWrapper
                            ]
                        }>
                        <View
                            style={
                                [
                                    commonStyles.width80pc,
                                    commonStyles.alignChildCenter
                                ]
                            }>
                            <Text
                                style={
                                    [
                                        commonStyles.font40,
                                        commonStyles.primaryTextColorLight
                                    ]
                                }>{data.percentage}%</Text>
                        </View>
                        <View
                            style={
                                [
                                    commonStyles.width20pc,
                                    commonStyles.columnContainer
                                ]
                            }>
                            {/* code might need to modify based on discussion */}
                            <TouchableHighlight
                                style={
                                    [
                                        {
                                            backgroundColor: !data.enablePlusButton || data.locked ? "#eee" : "#000",
                                            width: 32,
                                            height: 32,
                                            marginBottom: 10,
                                            borderRadius: 5
                                        }
                                    ]
                                } //styles.fullWidth
                                disabled={!data.enablePlusButton || data.locked}
                                // onPress={this.onPercentageIncreasedDecreased.bind(this, data, "inc")}
                                onPressIn={this.handlePressIn.bind(this, data, "inc")}
                                onPressOut = {this.handlePressOut.bind(this)}
                                underlayColor="white">
                                <View>
                                    <Image
                                        source={require('../assets/plus_small.png')}
                                        style={
                                            [
                                                { width: 32, height: 32 }
                                            ]
                                        }
                                    />
                                </View>
                            </TouchableHighlight>
                            <TouchableHighlight
                                style={
                                    [
                                        {
                                            backgroundColor: !data.enableMinusButton || data.locked ? "#eee" : "#000",
                                            width: 32,
                                            height: 32,
                                            borderRadius: 5
                                        }
                                    ]
                                } //styles.fullWidth
                                disabled={!data.enableMinusButton || data.locked}
                                // onPress={this.onPercentageIncreasedDecreased.bind(this, data, "dec")}
                                onPressIn={this.handlePressIn.bind(this, data, "dec")}
                                onPressOut = {this.handlePressOut.bind(this)}
                                underlayColor="white">
                                <View>
                                    <Image
                                        source={require('../assets/minus_small.png')}
                                        style={
                                            [
                                                { width: 32, height: 32 }
                                            ]
                                        }
                                    />
                                </View>
                            </TouchableHighlight>
                        </View>
                    </View>
                </View>
                <View
                    style={
                        [
                            commonStyles.fullWidth,
                            commonStyles.alignItemsCenter
                        ]
                    }>
                    <View
                        style={
                            [
                                commonStyles.fullWidth,
                                commonStyles.default15PaddingLeftRight,
                                commonStyles.borderBottomwidth2e4e4e4
                            ]
                        }>
                    </View>
                </View>
            </View>
        );
    }

    onUpdateButton = () => {
        // code commented for now, waiting on inputs as per discussion #
        let tempSelectedArr = [];
        this.state.selectedCurrenciesArr.forEach(element => {
            delete element.id;
            delete element.locked;
            delete element.enablePlusButton;
            delete element.enableMinusButton;
            if (element.percentage !== 0) {
                tempSelectedArr.push(element);
            }
        });
        AsyncStorageUtil.storeItem(stringConstant.CRYPTO_CURRENCY_INFO, tempSelectedArr).then((success) => {
            DeviceEventEmitter.emit(eventEmitterEnum.RefreshGoalSummaryScreen, {

            });
            Navigation.pop(this.props.componentId);
            //Code for emitting event need to update for requirement in screens
        });
    }

    customizeGoalAllocation = () => {
       //v alert("This feature is not available right now!");
        this.showCustomAlert(true,"This feature is not available right now!");

    }

    _onBackButtonPressed = () => {
        Navigation.pop(this.props.componentId);
    }

    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <LinearGradient
                    colors={
                        [
                            commonTheme.PRIMARY_BTN_BACKGROUND_COLOR, '#ffffff', '#ffffff'
                        ]
                    }
                    style={
                        [
                            styles.linearGradient,
                            commonStyles.paddingTop52
                        ]
                    }>
                    <TitleBarComponent titleBar={this.state.titleBar} />
                    <KeyboardAwareScrollView bounces={false}>
                        <View style={[styles.roundedContainer, commonStyles.defaultLargeMarginBottom]}>
                            <Image style={commonStyles.dashboardSmallIconStyle} source={require('../assets/coinPileCircle3x.png')} />
                            <Text style={[styles.descriptionTextStyle]}>{strings('customizeCryptoCurrency.description')}</Text>
                            {/* <View style={commonStyles.rowContainerFullWidth}>
                                <View style={{ width: "100%", marginTop: 25, marginBottom: 25, height: 2, backgroundColor: "#ededed" }}></View>
                            </View> */}
                            <ListView
                                contentContainerStyle={[commonStyles.listViewRowWrapper]}
                                style={{ width: "100%", display: this.state.showCurrencyListView ? 'flex' : 'none' }}
                                dataSource={this.state.currencies.cloneWithRows(this.state.selectedCurrenciesArr)}
                                renderRow={(data) => this.renderCurrencyView(data)} />
                            <TouchableHighlight
                                style={[commonStyles.width80pc, styles.topMarginAboveBtn]} //styles.fullWidth
                                disabled={!this.state.enableNextBtn}
                                onPress={this.onUpdateButton} underlayColor="white">
                                <View style={[styles.buttonRadius,
                                this.state.enableNextBtn ? styles.primaryBlueButton : styles.primaryDisableButtonLight]}>
                                    <Text style={styles.buttonTextWhite}>{strings('customizeCryptoCurrency.update_btn')}</Text>
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
        "maxBuyAmount": "",
        "locked": false
    }
];