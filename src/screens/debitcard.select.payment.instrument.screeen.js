import React, { Component } from 'react';
import {
    View, Text, TouchableOpacity,
    ScrollView, TextInput, Dimensions, StyleSheet,
    Alert, TouchableHighlight, Linking, Platform,
    ListView
} from 'react-native';
import Image from 'react-native-remote-svg';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Navigation } from 'react-native-navigation';
import * as _ from 'lodash';
import screenId from '../constants/screen.id.enum';

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
import UserResponseModel from '../models/user.response.model';
import fontFamilyStyles from '../styles/font.style';
import ModalComponentModel from '../models/modal.component.model';
import CommonModal from '../components/common.modal';
import paymentInstrumentDirection from '../constants/payment.instrument.direction.enum';
import PaymentInterface from '../interfaces/payment.interface';
import PaymentSupportedInstrumentTypesModel from '../models/payment.supported.instrument.types.model';
import paymentInstrumentDisplayName from '../constants/payment.instrument.display.name.enum';
import DepositInfoType from '../constants/deposit.info.enum';
import BuyAssetsInfoType from '../constants/buy.assets.info.enum';

import GetUserPaymentInstrumentsRequestModel from '../models/get.user.payment.instruments.request.model';
import PaymentInstrumentResponseModel from '../models/payment.instrument.response.model';
import PaymentInstrumentArrayModel from '../models/payment.instrument.array.model';
import SupportedCurrencyTypesArrayModel from '../models/payment.supported.currency.array.model';


import PropTypes from 'prop-types';
import DepositRequestModel from '../models/deposit.request.model';
import DepositInfoRequestModel from '../models/deposit.info.request.model';
import BuyAssetsInfoRequestModel from '../models/buy.assets.info.model';
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
const propTypes = { paymentInstrumentType: PropTypes.object };
const defaultProps = { paymentInstrumentType: new PaymentSupportedInstrumentTypesModel() };
export default class DebitCardSelectPaymentInstrumentScreen extends Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            showActivityIndicator: false,
            titleBar: {},
            isDataAvailable: false,
            paymentInstrumentType: this.props.paymentInstrumentType,
            userInfoFromStorage: new UserResponseModel(),
            userAuthenticationFromStorage: new UserAuthenticationModel(),
            modalComponent: {},
            paymentInstrumentsArr: []
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
    }

    componentDidMount() {
        AsyncStorageUtil.getItem(stringConstant.SAVE_USER_INFO).then((userData) => {
            userData = JSON.parse(userData);
            let userInfoModel = new UserResponseModel();
            let userAuthentication = new UserAuthenticationModel();
            if (userData) {
                userInfoModel = userData.User;
                userAuthentication = userData.AuthenticationToken;
                //alert(JSON.stringify(userInfoModel));
                this.setState({
                    userInfoFromStorage: userInfoModel,
                    userAuthenticationFromStorage: userAuthentication
                }, () => {
                    /* Fetch Data */
                    this.getUserPaymentInstrumentsFromAPI();
                });
            }
        });
    }


    getUserPaymentInstrumentsFromAPI = () => {
        let userInfoModel = new UserResponseModel();
        let userAuthentication = new UserAuthenticationModel();
        userInfoModel = this.state.userInfoFromStorage;
        userAuthentication = this.state.userAuthenticationFromStorage;
        if (!_.isEmpty(userInfoModel)) {
            this.showLoader(true);
            let requestModel = new GetUserPaymentInstrumentsRequestModel();
            requestModel.AuthenticationToken = userAuthentication.Token;
            requestModel.Direction = paymentInstrumentDirection.Deposit;
            requestModel.PITypeName = paymentInstrumentDisplayName.Card;
            PaymentInterface.getUserPaymentInstruments(requestModel).then((response) => {
                let res = new httpResponseModel();
                res = response;
                console.log(res);
                if (res.ErrorCode === commonConstant.SUCCESS_CODE) {

                    // ORIGINAL CODE - LATER UNCOMMENT THIS & DELETE TEMP SECTION
                    
                    let userPaymentInstrumentResponse = new PaymentInstrumentResponseModel();
                    userPaymentInstrumentResponse = res.Result;
                    this.setState({
                        paymentInstrumentsArr: userPaymentInstrumentResponse.PaymentInstruments
                    }, () => {
                        console.log('payment instrument response \n' + JSON.stringify(this.state.paymentInstrumentsArr) + "\n" +  JSON.stringify(userPaymentInstrumentResponse));
                    });
                } else if (res.ErrorCode === commonConstant.ACCESS_DENIED_ERROR_CODE) {
                    //redirect to login
                    this.showCustomAlert(true, res.ErrorMsg);
                } else {
                    this.showCustomAlert(true, res.ErrorMsg);
                }
                this.showLoader(false);
            }, (error) => {
                this.showLoader(false);
                this.showCustomAlert(true, strings('common.api_failure'));
            });
        }
    }

    showLoader = (bit) => { // call this function to show/hide the loader
        this.setState({
            showActivityIndicator: bit
        });
    }

    backButton = () => {
        Navigation.pop(this.props.componentId);
    }

    useThisCardClick = (data) => {
        //this.showCustomAlert(true, "This feature is not available right now. : " + data.AcctDisplayName);
        let PI = new PaymentInstrumentArrayModel();
        PI = data;

        this.setState({
            showActivityIndicator: true
        }, () => {
            let depositRequestAPIInfo = new DepositRequestModel();
            let depositInfo = new DepositInfoRequestModel();
            depositInfo.DepositInfoType = DepositInfoType.DepositFunds;
            depositInfo.PIID = PI.PIID;
            depositInfo.PIName = PI.AcctDisplayName;
            depositInfo.PIRequiredFieldValues = [];
            depositInfo.PISourceCurrencyAmount = "";
            depositInfo.PISourceCurrencyCode = "";
            depositInfo.PITypeName = paymentInstrumentDisplayName.Card;

            let buyAssetsInfo = new BuyAssetsInfoRequestModel();
            buyAssetsInfo.BuyAssetsInfoType = BuyAssetsInfoType.GoalAllocation;
            buyAssetsInfo.GoalAllocationCashAmount = "";
            buyAssetsInfo.GoalCurrencyCode = "";

            depositRequestAPIInfo.DepositInfo = depositInfo;
            depositRequestAPIInfo.BuyAssetsInfo = buyAssetsInfo;

            Navigation.push(stackName.GoalScreenStack, {
                component: {
                    name: screenId.InvestmentAmountScreen,
                    passProps: {
                        depositRequestAPIInfo: depositRequestAPIInfo,
                        paymentInstrumentModel: data,
                        paymentInstrumentType: this.state.paymentInstrumentType
                    }
                }
            }).then(() => {
                this.setState({
                    showActivityIndicator: false
                });
            });
        });
    }
    addNewDebitCardClck = () => {

        // let paymentInstrumentData = new PaymentSupportedInstrumentTypesModel();
        // paymentInstrumentData.PITypeName = this.state.paymentInstrumentType.PITypeName;
        // paymentInstrumentData.PITypeID = this.state.paymentInstrumentType.PITypeID;
        // // this.showCustomAlert(true, "This feature is not available right now. PITName : " + this.state.paymentInstrumentType.PITypeName + "\n" + "PITTypeID : " + this.state.paymentInstrumentType.PITypeID);
        // this.showCustomAlert(true, "This feature is not available right now.");
        this.setState({
            showActivityIndicator: true
        }, () => {
            let depositRequestAPIInfo = new DepositRequestModel();
            let depositInfo = new DepositInfoRequestModel();
            depositInfo.DepositInfoType = DepositInfoType.CreatePaymentInstrumentAndDepositFunds;
            depositInfo.PIID = "";
            depositInfo.PIName = "";
            depositInfo.PIRequiredFieldValues = [];
            depositInfo.PISourceCurrencyAmount = "";
            depositInfo.PISourceCurrencyCode = "";
            depositInfo.PITypeName = paymentInstrumentDisplayName.Card;

            let buyAssetsInfo = new BuyAssetsInfoRequestModel();
            buyAssetsInfo.BuyAssetsInfoType = BuyAssetsInfoType.GoalAllocation;
            buyAssetsInfo.GoalAllocationCashAmount = "";
            buyAssetsInfo.GoalCurrencyCode = "";

            depositRequestAPIInfo.DepositInfo = depositInfo;
            depositRequestAPIInfo.BuyAssetsInfo = buyAssetsInfo;

            Navigation.push(stackName.GoalScreenStack, {
                component: {
                    name: screenId.DebitCardAdditionalInformationScreen,
                    passProps: {
                        depositRequestAPIInfo: depositRequestAPIInfo,
                        // paymentInstrumentModel: data,
                        paymentInstrumentType: this.state.paymentInstrumentType
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

        var fields = [];
        for (let i = 0; i < this.state.paymentInstrumentsArr.length; i++) {
            fields.push(

                <View key={i} style={[commonStyles.alignItemsCenter, commonStyles.alignChildCenter, commonStyles.fullWidth, commonStyles.flex1, commonStyles.flexDirectionColumn]}>

                    <View
                        style={
                            [
                                commonStyles.fullWidth,
                                commonStyles.alignChildCenter, {
                                    marginTop: 30
                                }
                            ]
                        }>
                        <Text
                            style={
                                [
                                    commonStyles.fontSize18,
                                    fontFamilyStyles.robotoLight,
                                    commonStyles.primaryTextColorLight
                                ]
                            }>
                            {/* {this.state.paymentInstrumentsArr[i].PIType} */}
                             {this.state.paymentInstrumentType.PITypeName }
                            
                        </Text>
                    </View>

                    <View
                        style={
                            [
                                commonStyles.fullWidth,
                                commonStyles.alignChildCenter,
                                {
                                    marginTop: 15
                                }
                            ]
                        }>
                        <Text
                            style={
                                [
                                    commonStyles.fontSize18,
                                    fontFamilyStyles.robotoLight,
                                    commonStyles.primaryTextColorLight
                                ]
                            }>
                            {this.state.paymentInstrumentsArr[i].AcctDisplayName}
                        </Text>
                    </View>

                    <TouchableHighlight
                        style={[commonStyles.fullWidth, commonStyles.defaultSmallPaddingBtn,
                            commonStyles.alignItemsCenter,
                            styles.buttonRadius,
                            styles.SelectPaymentInstrumentBlueButton,{
                            marginTop: 15
                        }]} //styles.fullWidth
                        onPress={this.useThisCardClick.bind(this, this.state.paymentInstrumentsArr[i])} underlayColor="white">
                       
                            <Text 
                                style = { 
                                    [
                                        styles.buttonTextWhite,fontFamilyStyles.robotoRegular,
                                        commonStyles.fontSize19, commonStyles.textAlignCenter
                                    ]
                                }>
                                {strings('debitCardSelectPaymentIntrument.use_this_card')}
                            </Text>
                       
                    </TouchableHighlight>
                </View>


            )


        }

        return (
            <View style={[commonStyles.commonScreenContainer]}>
                <View style={[styles.SelectpaymentInstrumentHeaderSection, { marginTop: 0 }]}>
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
                        {this.state.paymentInstrumentType.PITypeName}
                    </Text>
                </View>
                <KeyboardAwareScrollView
                    scrollEnabled={true}
                    bounces={false} showsVerticalScrollIndicator={false} width={screenWidth} contentContainerStyle={{ alignItems: 'center' }}>
                    <Image style={[styles.SelectpaymentInstrumentLogo, commonStyles.alignChildCenter]} source={require('../assets/card_circle_blue.png')} />
                    <View style={[commonStyles.alignItemsCenter, commonStyles.width80pc, commonStyles.alignChildCenter]}>
                        <Text
                            style={
                                [
                                    fontFamilyStyles.robotoMedium,
                                    commonStyles.fontSize16,
                                    commonStyles.primaryTextColorLight,
                                    commonStyles.alignItemsCenter,
                                    { marginTop: 28, display: this.state.paymentInstrumentsArr.length > 0 ? "flex" : "none" },
                                ]
                            }>
                            {strings('debitCardSelectPaymentIntrument.added_debit_card')}
                        </Text>
                        <View
                            style={
                                [
                                    commonStyles.fullWidth, commonStyles.alignItemsCenter, commonStyles.alignChildCenter,
                                    styles.investBottomMarginNextButton
                                ]
                            }>
                            <View style={[commonStyles.fullWidth, commonStyles.alignChildCenter]}>
                                {fields
                                }

                                <Text
                                    style={
                                        [
                                            fontFamilyStyles.robotoRegular,
                                            styles.fontSize24,
                                            commonStyles.primaryTextColorLight,
                                            commonStyles.alignItemsCenter,
                                            commonStyles.alignChildCenter,
                                            commonStyles.textAlignCenter,
                                            { marginTop: 25, display: this.state.paymentInstrumentsArr.length > 0 ? "flex" : "none" },
                                        ]
                                    }>
                                    {strings('debitCardSelectPaymentIntrument.or')}
                                </Text>
                                <Text
                                    style={
                                        [
                                            fontFamilyStyles.robotoLight,
                                            commonStyles.fontSize16,
                                            commonStyles.primaryTextColorLight,
                                            commonStyles.alignItemsCenter,
                                            commonStyles.alignChildCenter,
                                            commonStyles.textAlignCenter,
                                            { marginTop: 25 }
                                        ]
                                    }>
                                    {strings('debitCardSelectPaymentIntrument.do_want_to_invest_another_debit_card_for_this_investment')}
                                </Text>

                                <TouchableHighlight
                                    style={[commonStyles.fullWidth,commonStyles.defaultSmallPaddingBtn,
                                        commonStyles.alignItemsCenter,
                                        styles.buttonRadius,
                                        styles.SelectPaymentInstrumentYellowButton,
                                        { marginTop: this.state.paymentInstrumentsArr.length > 0 ? 20 : 30 }]} //styles.fullWidth
                                    onPress={this.addNewDebitCardClck} underlayColor="white">
                                   
                                        <Text 
                                            style = {
                                                [
                                                    styles.buttonTextWhite,fontFamilyStyles.robotoRegular,
                                                    commonStyles.fontSize19, commonStyles.textAlignCenter
                                                ]
                                            }>
                                            {strings('debitCardSelectPaymentIntrument.add_new_debit_card') + this.state.paymentInstrumentType.PITypeName}
                                        </Text>
                                   
                                </TouchableHighlight>

                            </View>
                        </View>
                    </View>
                </KeyboardAwareScrollView>

                <LoaderComponent showLoader={this.state.showActivityIndicator} />
                <CommonModal modalComponent={this.state.modalComponent} />
            </View >

        );
    }
}
DebitCardSelectPaymentInstrumentScreen.propTypes = propTypes;
DebitCardSelectPaymentInstrumentScreen.defaultProps = defaultProps;