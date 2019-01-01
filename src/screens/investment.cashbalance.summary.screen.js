import React, { Component } from 'react';
import {
    View, Text, TouchableOpacity,
    ScrollView, TextInput, Dimensions, StyleSheet,
    Alert, TouchableHighlight, Linking, Platform,
    ListView
} from 'react-native';
import Image from 'react-native-remote-svg';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import PropTypes from 'prop-types';
import * as _ from 'lodash';

import { strings } from '../config/i18/i18n';
import commonStyles from '../styles/common.style';
import styles from '../styles/form.style';
import commonTheme from '../themes/common.theme';
import commonConstant from '../constants/common.constant';
import stringConstant from '../constants/string.constant';

import AsyncStorageUtil from '../utils/asyncstorage.util';
import commonUtil from '../utils/common.util';
import stackName from '../constants/stack.name.enum';
import LoaderComponent from '../components/loader.component';
import B21RequestModel from '../models/b21.request.model';
import UserAuthenticationModel from '../models/user.authentication.model';
import httpResponseModel from '../models/httpresponse.model';
import CurrencyResponseModel from '../models/currency.response.model';
import UserResponseModel from '../models/user.response.model';
import fontFamilyStyles from '../styles/font.style';
import ModalComponentModel from '../models/modal.component.model';
import CommonModal from '../components/common.modal';
import screenId from '../constants/screen.id.enum';
import { addCurrency, addGoalDashboard } from "../config/redux.store/actions/index";
import CurrencyRequestModel from '../models/currency.request.model';
import NavigationUtil from '../utils/navigation.util';
import CurrencyArrayResponseModel from '../models/currency.response.array.model';
import GoalInterface from '../interfaces/goal.interface';
import GoalDashboardResponseModel from '../models/goal.dashboard.response.model';
import PaymentInstrumentArrayModel from '../models/payment.instrument.array.model';
import PaymentSupportedInstrumentTypesModel from '../models/payment.supported.instrument.types.model';
import BuyAssetsInfoRequestModel from '../models/buy.assets.info.model';
import TransactionInterface from '../interfaces/transaction.interface';

const propTypes = { cashBalance: PropTypes.any, investmentAmount: PropTypes.any };
const defaultProps = { cashBalance: 0, investmentAmount: 0 };

class InvestmentCashbalanceSummaryScreen extends Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            showActivityIndicator: false,
            titleBar: {},
            modalComponent: {},
            userInfoFromStorage: new UserResponseModel(),
            userAuthenticationFromStorage: new UserAuthenticationModel(),
            userGoalInfo: new GoalDashboardResponseModel(),
            showCurrencyInputField: false,
            investmentAmount: this.props.investmentAmount,
            cashBalance: this.props.cashBalance,
            selectedCurrencySymbol: "",
            currencyResponse: new CurrencyResponseModel(),

        };
    }

    initializeModalComponent = () => {
        let initialModalComponent = new ModalComponentModel();
        initialModalComponent.shouldVisible = false;
        this.setState({
            modalComponent: initialModalComponent
        })
    }

    leftButtonClicked = () => {
        this.showCustomAlert(false);
    }

    rightButtonClicked = () => {
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

    componentWillMount() {
        this.initializeModalComponent();

        // console.log("Investment Data : "+JSON.stringify(this.state.paymentInstrumentType))
    }

    componentDidMount() {
        AsyncStorageUtil.getItem(stringConstant.SAVE_USER_INFO).then((userData) => {
            userData = JSON.parse(userData);
            let userInfoModel = new UserResponseModel();
            let userAuthentication = new UserAuthenticationModel();
            let goalDashboardModel = new GoalDashboardResponseModel();
            if (userData) {
                userInfoModel = userData.User;
                userAuthentication = userData.AuthenticationToken;
                goalDashboardModel = userData.GoalDashboard;
                //alert(JSON.stringify(userInfoModel));
                this.setState({
                    userInfoFromStorage: userInfoModel,
                    userAuthenticationFromStorage: userAuthentication,
                    userGoalInfo: goalDashboardModel
                }, () => {
                    this.getCurrencyInfoFromRedux();
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
        if (!_.isEmpty(this.props.currencyResponse)) {
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
                    } else if (res.ErrorCode == commonConstant.ACCESS_DENIED_ERROR_CODE) {
                        NavigationUtil.authenticationEntry();
                    }
                }, () => {
                    this.showLoader(false);
                    this.showCustomAlert(true, strings('common.api_failure'));
                });
            }

        }
    }

    buyAssetsApiCall = () => {
        let userInfoModel = new UserResponseModel();
        let userAuthentication = new UserAuthenticationModel();
        userInfoModel = this.state.userInfoFromStorage;
        userAuthentication = this.state.userAuthenticationFromStorage;
        if (!_.isEmpty(userInfoModel)) {
            this.showLoader(true);
            let buyAssetsModel = new BuyAssetsInfoRequestModel();
            buyAssetsModel.AuthenticationToken = userAuthentication.Token;
            buyAssetsModel.BuyAssetsInfoType = "Goal Allocation";
            buyAssetsModel.GoalAllocationCashAmount = parseInt(this.state.investmentAmount);
            buyAssetsModel.GoalCurrencyCode = this.state.userGoalInfo.GoalCurrencyCode;
            TransactionInterface.buyAssets(buyAssetsModel).then((response) => {
                let res = new httpResponseModel();
                res = response;
                console.log(res);

                if (_.isEmpty(res.ExceptionMessage)) {//This will show an error "The method or operation is not implemented" if implemented then it will not occure 
                    if (res.ErrorCode === commonConstant.SUCCESS_CODE) {
                        //redirect to respective screen
                        this.redirectToNectScreen(true);
                        // this.showCustomAlert(true, "Transaction is Successful.\nNext screen to be implement.");//TEMP remove after redirecting to respective screen
                    } else if (res.ErrorCode === commonConstant.ACCESS_DENIED_ERROR_CODE) {
                        //redirect to login screen
                        this.showCustomAlert(true, res.ErrorMsg);
                    } else {
                        //Failed
                        this.redirectToNectScreen(false);
                        // this.showCustomAlert(true, res.ErrorMsg);
                    }
                } else {
                    this.showCustomAlert(true, res.ExceptionMessage);
                    
                    
                }
                this.showLoader(false);
            }, (error) => {
                this.showLoader(false);
                this.showCustomAlert(true, strings('common.api_failure'));
            });
        }
    }

    redirectToNectScreen = (bool) => {
        this.setState({
            showActivityIndicator: true
        });
        Navigation.push(stackName.GoalScreenStack, {
            component: {
                name: screenId.InvestmentCashBalanceTansactionSummaryScreen,
                passProps: {
                    tansacationStatus: bool,
                }
            }
        }).then(() => {
            this.setState({
                showActivityIndicator: false
            });
        });
    }

    updateCurrencySymbol = (currencyResponse) => {
        currencyResponse.Currencies.forEach(element => {
            let tempElement = new CurrencyArrayResponseModel();
            tempElement = element;
            if (this.state.userGoalInfo.GoalCurrencyCode === tempElement.CurrencyCode) {
                this.setState({
                    selectedCurrencySymbol: tempElement.CurrencySymbol,
                    selectedMinGoalAmount: tempElement.MinGoalAmount,
                    selectedMaxGoalAmount: tempElement.MaxGoalAmount,
                }, () => {
                    this.setState({
                        currencyInputMaxLength: this.state.selectedMaxGoalAmount.toString().length
                    });
                });
            }
        });

    }

    backButton = () => {
        Navigation.pop(this.props.componentId);
    }

    investMentClick = () => {

        this.buyAssetsApiCall();

    }

    render() {
        return (
            <View style={[commonStyles.commonScreenContainer]}>
                <View style={[styles.kycHeaderSection, { marginTop: 0 }]}>
                    <TouchableOpacity style={[styles.backButton]} onPress={this.backButton}>
                        <Image style={styles.backIcon} source={require("../assets/backIcon.png")} />
                    </TouchableOpacity>
                    <Text
                        style={
                            [
                                fontFamilyStyles.robotoRegular,
                                commonStyles.fontSize23,
                                commonStyles.primaryTextColorLight
                            ]
                        }>
                        {strings('investmentCashBalanceSummmary.title')}
                    </Text>
                </View>
                <View style={[commonStyles.fullWidth, commonStyles.alignChildCenter, styles.verticalAlign, styles.investBottomMarginNextButton, { flex: 1 }]}>
                    <ScrollView
                        bounces={false}
                        contentContainerStyle={{ alignItems: "center", paddingBottom: 20 }} style={{ width: "100%", height: "70%" }} >
                        <View style={[commonStyles.width80pc, styles.verticalAlign, { alignItems: "center", }]}>
                            <Image style={[styles.SelectpaymentInstrumentLogo]} source={require('../assets/dollars_colis_circle.png')} />
                            <Text
                                style={
                                    [
                                        styles.margin15Top,
                                        fontFamilyStyles.robotoRegular,
                                        commonStyles.fontSize16,
                                        commonStyles.textAlignCenter,
                                        commonStyles.primaryTextColorLight
                                    ]
                                }>
                                {strings('investmentCashBalanceSummmary.description')}
                            </Text>

                            <Text
                                style={
                                    [
                                        styles.margin10Top,
                                        fontFamilyStyles.robotoLight,
                                        styles.fontSize22,
                                        commonStyles.textAlignCenter,
                                        commonStyles.primaryTextColorLight
                                    ]
                                }>

                                {/* {this.state.selectedCurrencySymbol + this.state.paymentInstrumentModel.InvestmentAmount} */}
                                {this.state.selectedCurrencySymbol + this.state.investmentAmount}
                            </Text>

                            <View style={[commonStyles.fullWidth, commonStyles.alignChildCenter, styles.verticalAlign, styles.margin10Top, { justifyContent: "center", alignItems: "center" }]}>

                                <Text
                                    style={
                                        [
                                            styles.margin10Top,
                                            styles.margin10Bottom,
                                            fontFamilyStyles.robotoRegular,
                                            commonStyles.fontSize16,
                                            commonStyles.textAlignCenter,
                                            commonStyles.primaryTextColorLight
                                        ]
                                    }>
                                    {strings('investmentCashBalanceSummmary.cash_balance_after_investment')}
                                </Text>

                                <Text
                                    style={
                                        [

                                            fontFamilyStyles.robotoLight,
                                            styles.fontSize22,
                                            commonStyles.textAlignCenter,
                                            commonStyles.primaryTextColorLight
                                        ]
                                    }>

                                    {this.state.selectedCurrencySymbol + ((this.state.cashBalance - this.state.investmentAmount).toFixed(2)).toString()}
                                </Text>


                                <Text
                                    style={
                                        [
                                            styles.margin20Top,

                                            fontFamilyStyles.robotoRegular,
                                            commonStyles.fontSize16,
                                            commonStyles.textAlignCenter,
                                            commonStyles.primaryTextColorLight
                                        ]
                                    }>
                                    {strings('investmentCashBalanceSummmary.source')}
                                </Text>
                                <Text
                                    style={
                                        [
                                            styles.margin10Top,
                                            fontFamilyStyles.robotoLight,
                                            styles.fontSize22,
                                            commonStyles.textAlignCenter,
                                            commonStyles.primaryTextColorLight
                                        ]
                                    }>

                                    {strings('investmentCashBalanceSummmary.cash_balance')}
                                </Text>

                            </View>
                        </View>
                    </ScrollView>
                    <TouchableHighlight
                        style={[commonStyles.width80pc, {
                            marginTop: 0
                        }]} //styles.fullWidth
                        onPress={this.investMentClick.bind(this)} underlayColor="white">
                        <View
                            style={
                                [
                                    commonStyles.defaultSmallPaddingBtn,
                                    commonStyles.alignItemsCenter,
                                    styles.buttonRadius,
                                    styles.SelectPaymentInstrumentBlueButton
                                ]
                            }>
                            <Text style={[styles.buttonTextWhite, fontFamilyStyles.robotoRegular, ,
                            commonStyles.fontSize19, commonStyles.textAlignCenter,]}>{strings('investmentCashBalanceSummmary.invest_now')}</Text>
                        </View>
                    </TouchableHighlight>
                </View>
                <LoaderComponent showLoader={this.state.showActivityIndicator} />
                <CommonModal modalComponent={this.state.modalComponent} />
            </View >
        );
    }
}
InvestmentCashbalanceSummaryScreen.propTypes = propTypes;
InvestmentCashbalanceSummaryScreen.defaultProps = defaultProps;


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

export default connect(mapStateToProps, mapDispatchToProps)(InvestmentCashbalanceSummaryScreen);
