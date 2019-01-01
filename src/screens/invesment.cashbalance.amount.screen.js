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

const propTypes = { cashBalance: PropTypes.any,};
const defaultProps = { cashBalance: 0,};

class InvestmentCashBalanceAmountScreen extends Component {

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
            currencyInputMaxLength: 0,
            currencyResponse: new CurrencyResponseModel(),
            errorMessages: "",
            cashBalance: this.props.cashBalance,
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
            let goalDashboardModel = new GoalDashboardResponseModel();
            if (userData) {
                userInfoModel = userData.User;
                userAuthentication = userData.AuthenticationToken;
                goalDashboardModel = this.props.goalDashboardResponse;
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
    }

    updateCurrencySymbol = (currencyResponse) => {
        currencyResponse.Currencies.forEach(element => {
            let tempElement = new CurrencyArrayResponseModel();
            tempElement = element;
            if (this.state.userGoalInfo.GoalCurrencyCode === tempElement.CurrencyCode) {
                this.setState({
                    selectedCurrencySymbol: tempElement.CurrencySymbol,
                    selectedMinGoalAmount: tempElement.MinGoalAmount,
                }, () => {
                    this.setState({
                        currencyInputMaxLength: this.state.cashBalance.toString().length
                    });
                });
            }
        });

    }

    showGoalAmountInputField = () => {
        this.setState({
            showCurrencyInputField: true
        }, () => {
            this.refs[0].focus();
        });
    }

    showPlaceholder = () => {
        if (this.state.investmentAmount === "") {
            this.setState({
                showCurrencyInputField: false
            });
        }
    }

    backButton = () => {
        Navigation.pop(this.props.componentId);
    }

    onCashBalancePressed = () => {
        console.log("Balance clicked : " + this.state.cashBalance);
        this.setState({
            investmentAmount: this.state.cashBalance,
            enableNextBtn: true

        });
        this.showGoalAmountInputField();
    }

    onNextButtonPressed = () => {


        if (this.state.investmentAmount && this.state.investmentAmount < this.state.selectedMinGoalAmount) {
            this.setState({
                errorMessages: strings('investmentCashBalanceAmount.investmentAmtGreaterThan') + this.state.selectedCurrencySymbol + this.state.selectedMinGoalAmount
            });
            return;
        } else if (this.state.investmentAmount && this.state.investmentAmount > this.state.cashBalance) {
            this.setState({
                errorMessages: strings('investmentCashBalanceAmount.investmentAmtLessThan') + this.state.selectedCurrencySymbol + this.state.cashBalance
            });
            return;
        }

        this.setState({
            errorMessages: ""
        });

        // Navigate to investment summary screen (US #1390) by passing investment amount and cashBalance as prop,
        // this.showCustomAlert(true, "This function is not available right now");
        this.setState({
            showActivityIndicator: true
        });

        Navigation.push(stackName.GoalScreenStack, {
            component: {
                name: screenId.InvestmentCashBalanceSummaryScreen,
                passProps: {
                    cashBalance:this.state.cashBalance,
                    investmentAmount:this.state.investmentAmount
                }
            }
        }).then(() => {
            this.setState({
                showActivityIndicator: false
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
                        {strings('investmentCashBalanceAmount.title')}
                    </Text>
                </View>
                <KeyboardAwareScrollView bounces={false} extraScrollHeight={30}
                    contentContainerStyle={{ alignItems: "center" }} style={{ width: "100%" }} >
                    <Image style={[styles.SelectpaymentInstrumentLogo]} source={require('../assets/dollars_colis_circle.png')} />

                    <TouchableOpacity
                        style={[styles.margin25Top,
                        styles.margin25Bottom]}
                        onPress={this.onCashBalancePressed}><Text
                            style={
                                [

                                    fontFamilyStyles.robotoMedium,
                                    commonStyles.fontSize20,
                                    commonStyles.textAlignCenter,
                                    styles.textColorLightBlue
                                ]
                            }  >
                            {"Cash Balance " + this.state.selectedCurrencySymbol + "" + ((this.state.cashBalance).toFixed(2))}
                        </Text>
                    </TouchableOpacity>
                    <View style={[commonStyles.width80pc]}>
                        <View style={[commonStyles.rowContainerFullWidth, { justifyContent: "center", alignItems: "center" }]}>
                            <TouchableHighlight
                                style={
                                    [
                                        commonStyles.dashboardTextInputTouchableView,
                                        { display: !this.state.showCurrencyInputField ? 'flex' : 'none' }
                                    ]
                                }
                                underlayColor="white"
                                onPress={this.showGoalAmountInputField} >
                                <Text
                                    style={
                                        [
                                            commonStyles.dashboardDummyTextInputView,
                                            commonStyles.textAlignCenter,
                                            { textAlignVertical: "center" }
                                        ]
                                    } >
                                    {strings('investmentCashBalanceAmount.investment_amount_placeholder')}
                                </Text>
                            </TouchableHighlight>
                            <TextInput
                                style={
                                    [
                                        commonStyles.dashboardTextInputView,
                                        commonStyles.textAlignRight,
                                        commonStyles.width35pc,
                                        { display: this.state.showCurrencyInputField ? 'flex' : 'none' }
                                    ]
                                }
                                value={this.state.selectedCurrencySymbol}
                                editable={false}
                            />
                            <TextInput
                                ref="0"
                                style={
                                    [
                                        commonStyles.dashboardTextInputView,
                                        commonStyles.default5PaddingLeft,
                                        commonStyles.textAlignLeft,
                                        {
                                            width: this.state.showCurrencyInputField ? "55%" : "90%",
                                            display: this.state.showCurrencyInputField ? 'flex' : 'none'
                                            //textAlign: this.state.showCurrencyInputField ? "left" : "center"
                                        }
                                    ]
                                }
                                value={(this.state.investmentAmount).toString()}
                                //placeholder={strings('setgoalamount.goal_amount_placeholder')}
                                // maxLength={this.state.currencyInputMaxLength} //Removed 
                                onChangeText={(value) => {
                                    this.setState({
                                        investmentAmount: value
                                    }, () => {
                                        if (this.state.investmentAmount.length > 0) {
                                            this.setState({
                                                enableNextBtn: true
                                            });
                                        } else {
                                            this.setState({
                                                enableNextBtn: false
                                            });
                                        }
                                    });
                                }}
                                onBlur={this.showPlaceholder}
                                keyboardType='numeric'
                                returnKeyType='done'
                            />
                            <Text
                                style={
                                    [
                                        commonStyles.margintp10,
                                        commonStyles.fontSize14,
                                        fontFamilyStyles.robotoLight,
                                        commonStyles.primaryErrorTextColor
                                    ]
                                }>
                                {this.state.errorMessages}
                            </Text>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
                <TouchableOpacity
                    activeOpacity={1}
                    disabled={!this.state.enableNextBtn}
                    style={
                        [
                            commonStyles.floatingNextButton,
                            this.state.enableNextBtn ? commonStyles.btnActivebackgroundColor : commonStyles.btnDisabledbackgroundColor
                        ]
                    }
                    onPress={this.onNextButtonPressed}>
                    <Text style={[commonStyles.fontSizeLarge,
                    fontFamilyStyles.robotoRegular, commonStyles.fontSize19,
                    this.state.enableNextBtn ? commonStyles.secTextColor : styles.disabledTextColor,
                    commonStyles.textAlignCenter]} >
                        {strings('common.next_btn')}
                    </Text>
                </TouchableOpacity>
                <LoaderComponent showLoader={this.state.showActivityIndicator} />
                <CommonModal modalComponent={this.state.modalComponent} />
            </View>
        );
    }
}

InvestmentCashBalanceAmountScreen.propTypes = propTypes;
InvestmentCashBalanceAmountScreen.defaultProps = defaultProps;

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

export default connect(mapStateToProps, mapDispatchToProps)(InvestmentCashBalanceAmountScreen);