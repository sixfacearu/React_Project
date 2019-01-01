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
import DepositRequestModel from '../models/deposit.request.model';

const propTypes = { depositRequestAPIInfo: PropTypes.object,paymentInstrumentModel : PropTypes.object, paymentInstrumentType : PropTypes.object};
const defaultProps = { depositRequestAPIInfo:  new DepositRequestModel(),paymentInstrumentModel: new PaymentInstrumentArrayModel() ,paymentInstrumentType: new PaymentSupportedInstrumentTypesModel()};

class InvestmentSummaryScreen extends Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            showActivityIndicator: false,
            titleBar: {},
            modalComponent: {},
            enableNextBtn: false,
            userInfoFromStorage: new UserResponseModel(),
            userAuthenticationFromStorage: new UserAuthenticationModel(),
            userGoalInfo: new GoalDashboardResponseModel(),
            showCurrencyInputField: false,
            investmentAmount: "",
            selectedCurrencySymbol: "",
            selectedMinGoalAmount: 0,
            selectedMaxGoalAmount: 0,
            currencyInputMaxLength: 0,
            paymentInstrumentModel: this.props.paymentInstrumentModel,
            currencyResponse: new CurrencyResponseModel(),
            errorMessages: "",
            paymentInstrumentType: this.props.paymentInstrumentType
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
                    } else if (res.ErrorCode == commonConstant.ACCESS_DENIED_ERROR_CODE) {
                        NavigationUtil.authenticationEntry();
                    }
                }, () => {
                    this.showLoader(false);
                    this.showCustomAlert(true, strings('common.api_failure'));
                });
            }

        }

        // console.log("Investment Data : "+this.state.paymentInstrumentType.investmentAmount)
        // console.log("Currency Symbole Data : "+this.state.paymentInstrumentType.investmentAmount)
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

        let depositRequestAPIInfo = new DepositRequestModel();
        depositRequestAPIInfo = this.props.depositRequestAPIInfo;

        this.setState({
            showActivityIndicator: true
        }, () => {
            Navigation.push(stackName.GoalScreenStack, {
                component: {
                    name: screenId.DebitCardAdditionalInformationScreen,
                    passProps: {
                        depositRequestAPIInfo: depositRequestAPIInfo,
                        paymentInstrumentModel: this.state.paymentInstrumentModel,
                        paymentInstrumentType : this.state.paymentInstrumentType
                    }
                }
            }).then(() => {
                this.setState({
                    showActivityIndicator: false
                });
            });
        });
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
                        {strings('investmentSummary.title')}
                    </Text>
                </View>
                <View style={[commonStyles.width80pc, styles.verticalAlign, styles.investBottomMarginNextButton,{ flex: 1}]}>
                    <ScrollView bounces={false} extraScrollHeight={50}
                        contentContainerStyle={{ alignItems: "center" }} style={{ width: "100%", height: "70%" }} >
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
                            {strings('investmentSummary.description')}
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

                            {this.state.selectedCurrencySymbol + this.state.paymentInstrumentModel.InvestmentAmount}
                            {/* {"$1234"} */}
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
                                {strings('investmentSummary.payment_method')}
                            </Text>
                            {/* <View style={[commonStyles.fullWidth, { height: 1, justifyContent: "center", alignItems: "center" }]}></view> */}

                            <View style={[commonStyles.width65pc, styles.SingleLineBackgroundColor, { height: 1, justifyContent: "center", alignItems: "center" }]}></View>

                            <Text
                                style={
                                    [
                                        styles.margin10Top,
                                        styles.margin10Bottom,
                                        fontFamilyStyles.robotoLight,
                                        commonStyles.fontSize16,
                                        commonStyles.textAlignCenter,
                                        commonStyles.primaryTextColorLight
                                    ]
                                }>
                                {this.state.paymentInstrumentType.PITypeName+" : "+this.state.paymentInstrumentModel.AcctDisplayName}
                                {/* {"Debit Card: "+this.state.paymentInstrumentType.AcctDisplayName} */}
                                {/* {"Debit Card: ****-****-****-0008"} */}
                            </Text>
                        </View>

                    </ScrollView>
                    <TouchableHighlight
                        style={[commonStyles.fullWidth, {
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
                            commonStyles.fontSize19, commonStyles.textAlignCenter,]}>{strings('investmentSummary.invest_now')}</Text>
                        </View>
                    </TouchableHighlight>
                </View>
                <LoaderComponent showLoader={this.state.showActivityIndicator} />
                <CommonModal modalComponent={this.state.modalComponent} />
            </View >
        );
    }
}
InvestmentSummaryScreen.propTypes = propTypes;
InvestmentSummaryScreen.defaultProps = defaultProps;


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

export default connect(mapStateToProps, mapDispatchToProps)(InvestmentSummaryScreen);
