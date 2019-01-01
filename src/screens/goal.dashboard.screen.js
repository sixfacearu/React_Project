import React, { Component } from 'react';
import {
    View, Text, TouchableOpacity,
    ScrollView, TextInput, Dimensions, StyleSheet,
    Alert, TouchableHighlight, Linking, Platform,
    ListView
} from 'react-native';
import Image from 'react-native-remote-svg';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import * as _ from 'lodash';

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
import GoalInterface from '../interfaces/goal.interface';
import B21RequestModel from '../models/b21.request.model';
import UserAuthenticationModel from '../models/user.authentication.model';
import httpResponseModel from '../models/httpresponse.model';
import UserResponseModel from '../models/user.response.model';
import GoalDashboardResponseModel from '../models/goal.dashboard.response.model';
import fontFamilyStyles from '../styles/font.style';
import { addCurrency,addGoalDashboard } from "../config/redux.store/actions/index";
import CurrencyResponseModel from '../models/currency.response.model';
import CurrencyRequestModel from '../models/currency.request.model';
import CurrencyArrayResponseModel from '../models/currency.response.array.model';
import AssetPerformancesResponseModel from '../models/assets.performances.response.model';
import { CryptoCurrencyLocalModel } from '../models/cryptocurrency.local.model';
import DonutChartComponent from '../components/donutchart.component';
import Guage from "../components/guage.component";
import ModalComponentModel from '../models/modal.component.model';
import CommonModal from '../components/common.modal';
import screenId from '../constants/screen.id.enum';
import PropTypes from 'prop-types';

const propTypes = { goalInfoData: PropTypes.object };
const defaultProps = { goalInfoData: new GoalDashboardResponseModel() };

var screen = require('Dimensions').get('window');
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

class GoalDashboardScreen extends Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            goalDashboardInfo: this.props.goalInfoData,
            showActivityIndicator: false,
            component_Id: this.props.componentId,
            titleBar: {},
            goalDashboardModel: new GoalDashboardResponseModel(),
            totalValueForGoalMeter: 0,
            valueForGoalMeter: 0,
            currencySymbol: "",
            currencyResponse: new CurrencyResponseModel(),
            cryptoCurrencies: ds,
            toggleListDonutViewstate: false,
            selectedCurrenciesArr: [],
            userInfoFromStorage: new UserResponseModel(),
            userAuthenticationFromStorage: new UserAuthenticationModel(),
            modalComponent : {},
            exchangeCurrencySelected: new AssetPerformancesResponseModel()
        };
        this.getGoalDashboardValues = this.getGoalDashboardValues.bind(this);
    }

    initializeStatusBar = () => {
        let titleBar = new TitleBarModel();
        titleBar.title = strings('goalDashboardScreen.title');
        titleBar.showBackButton = false;
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
          modalComponent : initialModalComponent
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

    showCustomAlertforExchangeIcon= (visible, message) => {
        this.setState({
            modalComponent : commonUtil.setAlertComponent(visible,message,"Sell Coin","Buy Coin",true,true,() => this.sellCoin(), () => this.buyCoin(),() => this.closeButtonClicked())
        });
    }

    sellCoin = () => {
        this.showCustomAlert(false);
    }

    buyCoin = () => {
        this.showCustomAlert(false);
    }

    componentWillMount() {
        this.initializeModalComponent();
    }

    componentDidMount() {
        AsyncStorageUtil.getItem(stringConstant.SAVE_USER_INFO).then((userData) => {
            userData = JSON.parse(userData);
            let userInfoModel = new UserResponseModel();
            let userAuthentication = new UserAuthenticationModel();
            if(userData) {
                userInfoModel = userData.User;
                userAuthentication = userData.AuthenticationToken;
                //alert(JSON.stringify(userInfoModel));
                this.setState({
                    userInfoFromStorage: userInfoModel,
                    userAuthenticationFromStorage: userAuthentication
                }, () => {
                    this.initializeStatusBar();
                    this.getGoalDashboardValues();
                });
            }
        });
    }

    showLoader = (bit) => { // call this function to show/hide the loader
        this.setState({
            showActivityIndicator: bit
        });
    }

    getCurrencyInfoFromRedux = () => {
        if(!_.isEmpty(this.props.currencyResponse)) {
            let currencyResponse = new CurrencyResponseModel();
            currencyResponse = this.props.currencyResponse;
            this.setState({
                currencyResponse: currencyResponse
            }, () => {
                this.updateCurrencySymbol(currencyResponse);
            });
        } else {
           
            let userAuthentication = new UserAuthenticationModel();
            userAuthentication = this.state.userAuthenticationFromStorage;
            if (userAuthentication) {
                this.showLoader(true);
                // userAuthentication = data.AuthenticationToken;
                console.log(userAuthentication);
                let currencyRequest = new CurrencyRequestModel();
                currencyRequest.AuthenticationToken = userAuthentication.Token;
                // currencyRequest.CurrencyCategory = currencyType.Fiat;
                GoalInterface.getCurrency(currencyRequest).then((response) => {
                    console.log(response, 'currency data');
                    let res = new httpResponseModel();
                    res = response;
                    this.showLoader(false);
                    if (res.ErrorCode == commonConstant.SUCCESS_CODE) {
                        let currencyResponse = new CurrencyResponseModel();
                        currencyResponse = res.Result;
                        this.props.addCurrency(currencyResponse);
                        this.setState({
                            currencyResponse: currencyResponse
                        }, () => {
                            this.updateCurrencySymbol(this.state.currencyResponse);
                        });
                    } else if(res.ErrorCode == commonConstant.ACCESS_DENIED_ERROR_CODE) {
                        NavigationUtil.authenticationEntry();
                    }
                }, () => {
                    this.showLoader(false);
                    this.showCustomAlert(true,strings('common.api_failure'));
                });
            }
            
        }
    }

    updateCurrencySymbol = (currencyResponse) => {
        currencyResponse.Currencies.forEach(element => {
            let tempElement = new CurrencyArrayResponseModel();
            tempElement = element;
            
            this.state.goalDashboardModel.AssetPerformances.forEach(assetElement => {
                if(assetElement.CurrencyCode == tempElement.CurrencyCode) {
                    assetElement.HexCode = tempElement.HexCode;
                    assetElement.CurrencySymbol = tempElement.CurrencySymbol;
                }
            });
            if(tempElement.CurrencyCode == this.state.goalDashboardModel.GoalCurrencyCode) {
                this.setState({
                    currencySymbol: tempElement.CurrencySymbol
                });
            }
        });
        let tempArr = [];
        let tempCurrencyLocalModelArr = [];
        // this.state.goalDashboardModel.CashBalance=21700.00
        this.state.goalDashboardModel.CashBalance=this.state.goalDashboardModel.GoalAmount// Temp Solution For Cash Balance according to devarshi Please uncomment later
        if(this.state.goalDashboardModel.CashBalance) { //Insert cash balance if non zero
            let tempAsset = new AssetPerformancesResponseModel();
            tempAsset.Balance = this.state.goalDashboardModel.CashBalance;
            tempAsset.CurrencyCode = null;
            tempArr.push(tempAsset);
            let currencyLocalModel = new CryptoCurrencyLocalModel();
            currencyLocalModel.flagURL = this.state.currencyResponse.CurrencyImageBaseURL;
            currencyLocalModel.percentage = this.state.goalDashboardModel.CashAssetPercentage;
            currencyLocalModel.hexCode = commonTheme.BACKGROUND_COLOR_D7D7D7;
            currencyLocalModel.currencyCode = this.state.goalDashboardModel.GoalCurrencyCode;
            tempCurrencyLocalModelArr.push(currencyLocalModel);

            this.state.goalDashboardModel.AssetPerformances.forEach(element => {
                tempArr.push(element);
            });
        }
        this.state.goalDashboardModel.AssetPerformances.forEach(element => {
            let tempAsset = new AssetPerformancesResponseModel();
            tempAsset = element;
            let currencyLocalModel = new CryptoCurrencyLocalModel();
            currencyLocalModel.flagURL = this.state.currencyResponse.CurrencyImageBaseURL;
            currencyLocalModel.percentage = tempAsset.AssetPercentage;
            currencyLocalModel.hexCode = tempAsset.HexCode;
            currencyLocalModel.currencyCode = tempAsset.CurrencyCode;
            tempCurrencyLocalModelArr.push(currencyLocalModel);
        });
        this.setState({
            selectedCurrenciesArr: tempCurrencyLocalModelArr
        });
        if(tempArr.length) {
            this.setState({
                cryptoCurrencies: this.state.cryptoCurrencies.cloneWithRows(tempArr)
            });    
        } else {
            this.setState({
                cryptoCurrencies: this.state.cryptoCurrencies.cloneWithRows(this.state.goalDashboardModel.AssetPerformances)
            });
        }
    }
    getGoalDashboardValues = () => {
        
        if(!_.isEmpty(this.state.goalDashboardInfo)) {
            //alert(JSON.stringify(this.state.goalDashboardInfo))
            this.setState({
                goalDashboardModel: this.state.goalDashboardInfo,
                valueForGoalMeter: this.state.goalDashboardInfo.Balance,
                totalValueForGoalMeter: this.state.goalDashboardInfo.GoalAmount
            }, () => {
                this.getCurrencyInfoFromRedux();
            });
            let goalDashboardModel = new GoalDashboardResponseModel();
            goalDashboardModel.GoalCurrencyCode = this.state.goalDashboardInfo.GoalCurrencyCode;
            this.props.addGoalDashboard(goalDashboardModel);
        } else {
            let userInfoModel = new UserResponseModel();
            let userAuthentication = new UserAuthenticationModel();
            userInfoModel = this.state.userInfoFromStorage;
            userAuthentication = this.state.userAuthenticationFromStorage;
            if (!_.isEmpty(userInfoModel)) {
                //alert(JSON.stringify(userInfoModel));
                let request = new B21RequestModel();
                request.AuthenticationToken = userAuthentication.Token;
                console.log(request);
                this.showLoader(true);
                GoalInterface.getGoalDashboard(request).then((response) => {
                    let res = new httpResponseModel();
                    res = response;
                    console.log(res);
                    if (res.ErrorCode === commonConstant.SUCCESS_CODE) {
                        let tempGoalDashboardModel = new GoalDashboardResponseModel();
                        tempGoalDashboardModel = res.Result;
                        this.setState({
                            goalDashboardModel: tempGoalDashboardModel,
                            valueForGoalMeter: tempGoalDashboardModel.Balance,
                            totalValueForGoalMeter: tempGoalDashboardModel.GoalAmount
                        }, () => {
                            this.getCurrencyInfoFromRedux();
                        });
                        let goalDashboardModel = new GoalDashboardResponseModel();
                        goalDashboardModel.GoalCurrencyCode = tempGoalDashboardModel.GoalCurrencyCode;
                        this.props.addGoalDashboard(goalDashboardModel);
                    } else if (res.ErrorCode === commonConstant.ACCESS_DENIED_ERROR_CODE) {
                        //redirect to login
                    } else {
                        this.showCustomAlert(true,res.ErrorMsg);
                    }
                    this.showLoader(false);
                }, (error) => {
                    this.showLoader(false);
                    this.showCustomAlert(true,strings('common.api_failure'));
                })
            }
        }
        
        
    }

    redirectToInvestNowScreen = () => {
        //pass cash balance to ChooseInvestmentMethodScreen
          
        Navigation.push(stackName.GoalScreenStack, {
            component : {
                name: screenId.ChooseInvestmentMethodScreen,
                passProps : {

                    cashBalance : this.state.goalDashboardModel.CashBalance
                  
                  
                }
            }
        });
    }

    renderCurrencyView = (data) => {
        let tempData = new AssetPerformancesResponseModel();
        tempData = data;
        return (
            <View style = { [ commonStyles.fullWidth,commonStyles.default15PaddingLeftRight ] }>    
                <View
                    style={
                        [
                            commonStyles.cryptoCardViewDefaultContainer,
                            commonStyles.borderRadius8,
                            {
                                backgroundColor: tempData.CurrencyCode == null ? commonTheme.BACKGROUND_COLOR_D7D7D7 : commonTheme.TERTIARY_BACKGROUND_COLOR
                            }
                        ]
                    }>
                    <View 
                        style = {
                            [
                                {
                                    display: tempData.CurrencyCode == null ? 'none':'flex'
                                }
                            ]
                        }>
                        <Image
                            style = {
                                [
                                    commonStyles.cryptoCoinSelectedStyle,
                                    commonStyles.borderTopLeftRadius8
                                ]
                            }
                            source={require('../assets/coinCardCheck.png')} />
                    </View>
                    <View
                        style = {
                            [
                                commonStyles.fullWidth, 
                                commonStyles.listViewRowWrapper, 
                                commonStyles.flex1 
                            ]
                        }>
                        <View 
                            style = { 
                                [ 
                                    commonStyles.flex7,
                                    tempData.CurrencyCode == null? commonStyles.padding28TopBottom :commonStyles.default15PaddingTopBottom,
                                    commonStyles.default15PaddingLeftRight
                                ] 
                            }>
                            <View style = { [ commonStyles.flex1,commonStyles.flexDirectionRow ] }>    
                                <View style = { [commonStyles.flex7,commonStyles.flexDirectionRow,commonStyles.alignItemsCenter]}>
                                    <View style = { [commonStyles.flex4,commonStyles.flexDirectionRow,commonStyles.alignItemsFlexEnd,{display: tempData.CurrencyCode == null ? 'none':'flex'} ]}>
                                        <View
                                            style = {
                                                [
                                                    commonStyles.customizeCurrencyIcon,
                                                    { 
                                                        backgroundColor: tempData.HexCode,
                                                    }
                                                ]
                                            }>
                                            <Image
                                                source=
                                                {
                                                    { uri: `${this.state.currencyResponse.CurrencyImageBaseURL}${tempData.CurrencyCode}/symbol.svg` }
                                                }
                                                style={[commonStyles.customizeCurrencyIcon]}
                                            />
                                        </View>
                                    </View>
                                    <View 
                                        style = { 
                                            [
                                                commonStyles.flex6,
                                                // commonStyles.paddingLeft10,
                                                tempData.CurrencyCode == null ? commonStyles.flexDirectionRow: commonStyles.flexDirectionColumn
                                            ]
                                        }>
                                        <Text 
                                            style = {
                                                [
                                                    fontFamilyStyles.robotoRegular,
                                                    commonStyles.primaryTextColorLight,
                                                    commonStyles.fontSize18
                                                ]
                                            }>
                                            {tempData.CurrencyCode == null ? strings('goalDashboardScreen.cashBalance') : tempData.CurrencyName}
                                        </Text>
                                        <Text
                                            style = {
                                                [
                                                    fontFamilyStyles.robotoRegular,
                                                    // commonStyles.primaryTextColorLight,
                                                    commonStyles.fontSize15,
                                                    {
                                                        color: commonTheme.COLOR_989898
                                                    }
                                                ]
                                            }>
                                            {tempData.CurrencyCode == null?"": tempData.AssetAmount + " "+ tempData.CurrencyCode}
                                        </Text>
                                    </View>
                                </View>
                                <View style = { [commonStyles.flex3,commonStyles.flexDirectionRow,commonStyles.alignItemsCenter]}>
                                    <View 
                                        style = {
                                            [
                                                commonStyles.flex1,
                                                tempData.CurrencyCode == null ? commonStyles.flexDirectionRow: commonStyles.flexDirectionColumn,
                                                commonStyles.textAlignRight,
                                                {
                                                    paddingTop: tempData.CurrencyCode == null ? 0:4
                                                } 
                                            ]
                                        }>
                                        <Text
                                            style = {
                                                [
                                                    commonStyles.flex1,
                                                    fontFamilyStyles.robotoRegular,
                                                    commonStyles.primaryTextColorLight,
                                                    commonStyles.fontSize16,
                                                    commonStyles.textAlignRight
                                                ]
                                            }>
                                            {this.state.currencySymbol}{tempData.Balance}
                                            {/* {this.state.currencySymbol}70000 */}
                                        </Text>
                                        <Text
                                            style = {
                                                [
                                                    fontFamilyStyles.robotoRegular,
                                                    commonStyles.primaryTextColorLight,
                                                    commonStyles.fontSize18
                                                ]
                                            }>
                                            {tempData.CurrencyCode == null?"": " " }
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            {/* <View style = { [ commonStyles.flex2 ] }>

                            </View> */}
                        </View>
                        <View 
                            style = { 
                                [ 
                                    commonStyles.flex3,
                                    commonStyles.btnDisabledbackgroundColor,
                                    // commonStyles.paddingTop8,
                                    commonStyles.alignItemsCenter,
                                    commonStyles.borderTopBottomRightRadius8,
                                    {
                                        justifyContent:'center'
                                    }
                                ] 
                            }>
                            <TouchableOpacity
                                style = { [commonStyles.alignItemsCenter]}
                                onPress={this._onExchangeCurrencyItemPressed.bind(this, data)}>
                                <Image
                                    source={require('../assets/exchange_circle.png')}
                                    style={[commonStyles.customizeCurrencyIconWithoutBorderRadius]}
                                />
                                <Text 
                                    style = {
                                        [
                                            fontFamilyStyles.robotoRegular,
                                            // commonStyles.fontSize13,
                                            {
                                                fontSize: 12,
                                                marginTop:3
                                            },
                                            commonStyles.secTextColor
                                        ]
                                    }>
                                    {strings('goalDashboardScreen.exchange')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    _onExchangeCurrencyItemPressed = (data) => {
        // alert(JSON.stringify(data));
        this.setState({
            exchangeCurrencySelected: data
        },() => {
            this.showCustomAlertforExchangeIcon(true,"What exchange action would you like to take?");
        });
    }

    toggleListDonutView = () => {
        let temptoggleListDonutViewstate = this.state.toggleListDonutViewstate;
        temptoggleListDonutViewstate = !temptoggleListDonutViewstate;
        this.setState({
            toggleListDonutViewstate: temptoggleListDonutViewstate
        });
    }

    render() {
        let separator = (
            <View
                style={
                    [
                        commonStyles.fullWidth,
                        commonStyles.alignItemsCenter,
                        commonStyles.default20PaddingBottom
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
        );
        let GuageView = (
            !_.isEmpty(this.state.goalDashboardModel) ? 
                <Guage
                    size={screen.width * 8/10}
                    currentValue = { this.state.valueForGoalMeter }
                    maximumValue = { this.state.totalValueForGoalMeter }
                    progressColor = {`${this.state.valueForGoalMeter<=0?"transparent":commonTheme.COLOR_63C208}`}
                    needleWidth = {15}
                    needleColor = {commonTheme.COLOR_DCBA1F}
                    needleBaseColor = {commonTheme.COLOR_DCBA1F}
                    needleSharp = {true}
                    progressWidth = { 7 }
                    contentText1 = {strings('goalDashboardScreen.currentValue')}
                    contentText2 = {`${this.state.currencySymbol}${this.state.valueForGoalMeter}`}
                    textColor1 = {commonTheme.COLOR_000000}
                    textColor2 = {commonTheme.COLOR_369799}
                    textFontSize1 = {12}
                    textFontSize2 = {25}
                    textFontFamily1 = { commonTheme.ROBOTO_REGULAR }
                    textFontFamily2 = { commonTheme.ROBOTO_MEDIUM }
                    textViewVerticalOffset = { Platform.OS === "ios" ? 40:50 }
                /> : 
                <Guage
                    size={screen.width * 8/10}
                    currentValue = {0}//{this.state.valueForGoalMeter}
                    maximumValue = {100}
                    progressColor = {`${this.state.valueForGoalMeter<=0?"transparent":commonTheme.COLOR_63C208}`}
                    needleWidth = {15}
                    needleColor = {commonTheme.COLOR_DCBA1F}
                    needleBaseColor = {commonTheme.COLOR_DCBA1F}
                    needleSharp = {true}
                    progressWidth = { 7 }
                    contentText1 = {strings('goalDashboardScreen.currentValue')}
                    contentText2 = {`${this.state.currencySymbol}0`}
                    textColor1 = {commonTheme.COLOR_000000}
                    textColor2 = {commonTheme.COLOR_369799}
                    textFontSize1 = {12}
                    textFontSize2 = {25}
                    textFontFamily1 = { commonTheme.ROBOTO_REGULAR }
                    textFontFamily2 = { commonTheme.ROBOTO_MEDIUM }
                    textViewVerticalOffset = { Platform.OS === "ios" ? 40:50 }
                />
        );
        return (
            <View style={styles.mainDashboardContainer}>
          
                <LinearGradient
                    colors={
                        [
                            commonTheme.PRIMARY_BTN_BACKGROUND_COLOR, 'white', 'white'
                        ]
                    }
                    style={
                        [
                            styles.linearGradient,
                            commonStyles.paddingTop52
                        ]
                    }>
                    {/* <Text style={[styles.dashboardHeader]}>{ strings('creategoal.create_goal_title') }</Text> */}
                    <TitleBarComponent titleBar={this.state.titleBar} />
                    <KeyboardAwareScrollView bounces={false} contentContainerStyle={{ alignItems: "center" }} style={{ width: "100%" }}>
                        <View style={[commonStyles.roundedContainer]}>
                            <Text style={[styles.topGoalNameStyle]}>{this.state.goalDashboardModel.GoalName}</Text>
                            <View
                                style={
                                    [
                                        commonStyles.width90pc,
                                        commonStyles.alignItemsCenter,
                                        commonStyles.default20PaddingBottom
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
                            {
                                GuageView
                            }
                            <View
                                style={
                                    [
                                        commonStyles.fullWidth,
                                        commonStyles.alignItemsCenter,
                                        commonStyles.default20PaddingBottom
                                    ]
                                }>
                                <View
                                    style={
                                        [
                                            {
                                                width: screen.width * 8/10
                                            },
                                            commonStyles.default15PaddingLeftRight,
                                            commonStyles.borderBottomwidth1e4e4e4
                                        ]
                                    }>
                                </View>
                            </View>
                            <View
                                style={
                                    [
                                        commonStyles.width90pc,
                                        commonStyles.listViewRowWrapper,
                                        commonStyles.flex1,
                                        commonStyles.default20PaddingBottom
                                    ]
                                }>
                                <View
                                    style={
                                        [
                                            commonStyles.flex5
                                        ]
                                    }>
                                    <Text
                                        style={
                                            [
                                                fontFamilyStyles.robotoLight,
                                                commonStyles.secTextColorDark,
                                                commonStyles.fontSize19
                                            ]
                                        }>
                                        {strings('goalDashboardScreen.target')}
                                    </Text>
                                </View>
                                <View
                                    style={
                                        [
                                            commonStyles.flex5
                                        ]
                                    }>
                                    <Text
                                        style={
                                            [
                                                fontFamilyStyles.robotoRegular,
                                                commonStyles.textAlignRight,
                                                commonStyles.secTextColorDark,
                                                commonStyles.fontSize19
                                            ]
                                        } >
                                        {this.state.currencySymbol}{this.state.goalDashboardModel.GoalAmount}
                                    </Text>
                                </View>
                            </View>
                            {separator}
                            <View
                                style={
                                    [
                                        commonStyles.width90pc,
                                        commonStyles.listViewRowWrapper,
                                        commonStyles.flex1,
                                        commonStyles.default20PaddingBottom
                                    ]
                                }>
                                <View
                                    style={
                                        [
                                            commonStyles.flex3,
                                            commonStyles.borderRight979797
                                        ]
                                    }>
                                    <Text
                                        style={
                                            [
                                                fontFamilyStyles.robotoLight,
                                                commonStyles.secTextColorDark,
                                                commonStyles.fontSize16,
                                                commonStyles.textAlignCenter
                                            ]
                                        }>
                                        {strings('goalDashboardScreen.invested')}
                                    </Text>
                                    <Text
                                        style={
                                            [
                                                fontFamilyStyles.robotoMedium,
                                                commonStyles.textAlignRight,
                                                commonStyles.secTextColorDark,
                                                commonStyles.fontSize19,
                                                commonStyles.textAlignCenter,
                                                commonStyles.marginTop5
                                            ]
                                        } >
                                        {this.state.currencySymbol}{this.state.goalDashboardModel.AmountInvested}
                                    </Text>
                                </View>
                                <View
                                    style={
                                        [
                                            commonStyles.flex3,
                                            commonStyles.borderRight979797
                                        ]
                                    }>
                                    <Text
                                        style={
                                            [
                                                fontFamilyStyles.robotoLight,
                                                commonStyles.secTextColorDark,
                                                commonStyles.fontSize16,
                                                commonStyles.textAlignCenter
                                            ]
                                        }>
                                        {strings('goalDashboardScreen.gain')}
                                    </Text>
                                    <Text
                                        style={
                                            [
                                                fontFamilyStyles.robotoMedium,
                                                commonStyles.textAlignRight,
                                                commonStyles.secTextColorDark,
                                                commonStyles.fontSize19,
                                                commonStyles.textAlignCenter,
                                                commonStyles.marginTop5
                                            ]
                                        } >
                                        {this.state.currencySymbol}{this.state.goalDashboardModel.Gain}
                                    </Text>
                                </View>
                                <View
                                    style={
                                        [
                                            commonStyles.flex3
                                        ]
                                    }>
                                    <Text
                                        style={
                                            [
                                                fontFamilyStyles.robotoLight,
                                                commonStyles.secTextColorDark,
                                                commonStyles.fontSize16,
                                                commonStyles.textAlignCenter
                                            ]
                                        }>
                                        {strings('goalDashboardScreen.return')}
                                    </Text>
                                    <Text
                                        style={
                                            [
                                                fontFamilyStyles.robotoMedium,
                                                commonStyles.textAlignRight,
                                                commonStyles.secTextColorDark,
                                                commonStyles.fontSize19,
                                                commonStyles.textAlignCenter,
                                                commonStyles.marginTop5
                                            ]
                                        } >
                                        {this.state.goalDashboardModel.Return}%
                                    </Text>
                                </View>
                            </View>
                            {separator}
                            <TouchableHighlight
                                style={
                                    [
                                        styles.width90,
                                        commonStyles.default20PaddingBottom
                                    ]
                                }
                                onPress={this.redirectToInvestNowScreen} underlayColor="white">
                                <View
                                    style={
                                        [
                                            styles.buttonRadius,
                                            styles.primaryYellowButton
                                        ]
                                    }>
                                    <Text style={styles.buttonTextWhite}>{strings('goalDashboardScreen.investButton')}</Text>
                                </View>
                            </TouchableHighlight>
                            
                        </View>
                        <View 
                            style = {
                                [
                                    styles.fullWidth,
                                    {
                                        backgroundColor:'white'
                                    }
                                ]
                            }>
                            {separator}
                            <View 
                                style = {
                                    [
                                        styles.fullWidth,
                                        commonStyles.alignChildCenter
                                    ]
                                }>    
                                <View
                                    style={
                                        [
                                            // commonStyles.width90pc,
                                            commonStyles.listViewRowWrapper,
                                            commonStyles.flex1,
                                            commonStyles.default20PaddingBottom,
                                            {
                                                width: screen.width * 9/10,
                                                alignItems:"center"
                                            }
                                        ]
                                    }>
                                    <View
                                        style={
                                            [
                                                commonStyles.flex5
                                            ]
                                        }>
                                        <Text
                                            style={
                                                [
                                                    fontFamilyStyles.robotoMedium,
                                                    commonStyles.secTextColorDark,
                                                    commonStyles.fontSize16
                                                ]
                                            }>
                                            {strings('goalDashboardScreen.myPortfolio')}
                                        </Text>
                                    </View>
                                    <View
                                        style={
                                            [
                                                commonStyles.flex5,
                                                {alignItems:"flex-end"}
                                            ]
                                        }>
                                        <TouchableOpacity
                                            onPress = { this.toggleListDonutView }>
                                            <View 
                                                style = {
                                                    [ 
                                                        {
                                                            width: 34,height:34 
                                                        },
                                                        {
                                                            display: !this.state.toggleListDonutViewstate?"flex":"none"
                                                        }
                                                    ]
                                                } >
                                                <Image 
                                                    style={ [ {width: 34,height:34 } ]} 
                                                    source={require('../assets/show_donut_view.png')} />
                                            </View>
                                            <View 
                                                style = {
                                                    [ 
                                                        {
                                                            width: 34,height:34 
                                                        },
                                                        {
                                                            display: this.state.toggleListDonutViewstate?"flex":"none"
                                                        }
                                                    ]
                                                } >
                                                <Image 
                                                    style={ [ {width: 34,height:34 } ]} 
                                                    source={require('../assets/show_list_view.png')} />
                                            </View>
                                        </TouchableOpacity>
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
                                            commonStyles.borderBottomwidth1e4e4e4
                                        ]
                                    }>
                                </View>
                            </View>
                            <View 
                                style = {
                                    [
                                        styles.fullWidth,
                                        {
                                            paddingTop: 20,
                                            marginBottom: Platform.OS === 'ios'? 0:55,
                                            backgroundColor: "#f2f7fb"
                                        }
                                    ]
                                }>
                                <ListView
                                    style={{ display: !this.state.toggleListDonutViewstate ? 'flex' : 'none' }}
                                    dataSource={this.state.cryptoCurrencies}
                                    renderRow={(data) => this.renderCurrencyView(data)} />
                                <View style={{display: this.state.toggleListDonutViewstate ? 'flex' : 'none',height:270, width:'100%'}}>
                                    <DonutChartComponent currenciesData={this.state.selectedCurrenciesArr} />
                                </View>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </LinearGradient>
                <LoaderComponent showLoader={this.state.showActivityIndicator} />
                <CommonModal modalComponent = {this.state.modalComponent}/>
            </View>
        );
    }
}

const mapStateToProps = state => {
    return {
        currencyResponse: state.currencyReducer.currencyResponse,
        goalDashboardResponse: state.goalDashboardReducer.goalDashboardResponse
    };
}

const mapDispatchToProps = dispatch => {
    return {
        addCurrency: (currencyResponse) => dispatch(addCurrency(currencyResponse)),
        addGoalDashboard: (goalDashboardResponse) => dispatch(addGoalDashboard(goalDashboardResponse))
    }
}

export default (GoalDashboardScreen);