import React, { Component } from 'react';
import { View, Text, Picker, TextInput, TouchableOpacity, TouchableHighlight, ListView, Alert, Keyboard, NativeModules, Platform, Dimensions } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { connect } from 'react-redux';
import * as _ from 'lodash';

import { addUserInfo,addGoalDashboard, addUserAuthorization } from "../config/redux.store/actions/index";
import { strings } from '../config/i18/i18n';
import commonStyles from '../styles/common.style';
import fontFamilyStyles from '../styles/font.style';
import commonConstant from '../constants/common.constant';
import CountryRequestModel from '../models/country.request.model';

import LoaderComponent from '../components/loader.component';
import HttpUrlConstant from '../constants/http.constant';
import AuthInterface from '../interfaces/auth.interface';

import UserAuthenticationModel from '../models/user.authentication.model';
import UserRequestModel from '../models/user.request.model';

import styles from '../styles/form.style';
//import Row from './countryPickerRow.view';
import country from './demoData';
import Image from 'react-native-remote-svg'
import AsyncStorageUtil from '../utils/asyncstorage.util';
import httpResponseModel from '../models/httpresponse.model';
import CountryResponseModel from '../models/country.response.model';
import { PhoneRequestObjectModel } from '../models/phone.request.object.model';
import B21ResponseModel from '../models/b21.response.model';
import stringConstant from '../constants/string.constant';
import stackName from '../constants/stack.name.enum';
import screenId from '../constants/screen.id.enum';
import PropTypes from 'prop-types';

import KYCInterface from '../interfaces/kyc.interface';
import registerUserFieldRequestModel from '../models/registerUserField.request.model';
import RegisterUserFieldResponseModel from '../models/registerUserField.response.model';
import UserResponseModel from '../models/user.response.model';
import RegisterUserFieldArrayResponseModel from '../models/registerUserField.response.array.model';
import StateResponseModel from '../models/state.response.model';

import RegisterUserFieldConstant from '../constants/registerUserField.constant.keys';
import userNameFields from '../constants/user.name.fields.type.enum';
import KycUserStaticLocalModel from '../models/kyc.user.static.local.model';
import userNameStaticFields from '../constants/user.name.static.fields.type.enum';
import KycUserDynamicLocalModel from '../models/kyc.user.dynamic.local.model';
import PaymentInterface from '../interfaces/payment.interface';
import ModalComponentModel from '../models/modal.component.model';
import CommonModal from '../components/common.modal';
import commonUtil from '../utils/common.util';
import PaymentInstrumentRequirementRequestModel from '../models/payment.instrument.requirements.request.model';
import paymentInstrumentDirection from '../constants/payment.instrument.direction.enum';
import PaymentInstrumentRequirementResponseModel from '../models/payment.instrument.requirements.response.model';
import PaymentFieldsRequirementModel from '../models/payment.fields.requirement.model';
import paymentDebitCardInfoKey from '../constants/payment.debit.card.info.enum';
import PaymentInstrumentArrayModel from '../models/payment.instrument.array.model';
import DepositRequestModel from '../models/deposit.request.model';
import DepositInfoType from '../constants/deposit.info.enum';
import KYCRegisterUserArrayModel from '../models/kyc.registeruser.array.model';
import DepositInfoRequestModel from '../models/deposit.info.request.model';
import BuyAssetsInfoRequestModel from '../models/buy.assets.info.model';
import BuyAssetsInfoType from '../constants/buy.assets.info.enum';
import PaymentSupportedInstrumentTypesModel from '../models/payment.supported.instrument.types.model';
import DepositReponseModel from '../models/deposit.response.model';
import CountryArrayResponseModel from '../models/country.response.array.model';
import StateArrayResponseModel from '../models/state.response.array.model';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

var moment = require('moment');

var sortJsonArray = require('sort-json-array');
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

const propTypes = { depositRequestAPIInfo: PropTypes.object,paymentInstrumentModel: PropTypes.object,paymentInstrumentType: PropTypes.object };
const defaultProps = { depositRequestAPIInfo: new DepositRequestModel(),paymentInstrumentModel: new PaymentInstrumentArrayModel(),paymentInstrumentType: new PaymentSupportedInstrumentTypesModel() };

class DebitCardAdditionalInformationScreen extends Component {
    
    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            isEVerifySupported: false,
            allDynamicFields: [],
            enableNextBtn: false,
            totalRequiredFields: 0,
            staticFlow: false,
            allDynamicFields: [],
            modalComponent : {},
            paymentInstrumentType: new PaymentSupportedInstrumentTypesModel(),
            paymentInstrumentModel: new PaymentInstrumentArrayModel(),
            userAuthorization: new UserAuthenticationModel(),
            userInfo: new UserResponseModel(),
            currencyCode: "",
            enableScrollViewScroll: true,
            statesListDS:ds,
            statesNameArray:[],
            countryListDS:ds,
            countriesNameArray:[],
            showCountryPicker: false,
            showStatePicker: false,
            excludeInputFocusArr: []
        };
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
            userAuthorization: this.props.userAuthorizationResponse,
            userInfo: this.props.UserResponseModel,
            paymentInstrumentType: this.props.paymentInstrumentType,
            currencyCode: this.props.goalDashboardResponse.GoalCurrencyCode,
            paymentInstrumentModel: this.props.paymentInstrumentModel
        }, () => {
            if(this.state.userAuthorization.Token) {
                this.showLoader(true);
                let request = new PaymentInstrumentRequirementRequestModel();
                request.AuthenticationToken = this.state.userAuthorization.Token;
                request.Direction = paymentInstrumentDirection.Deposit;
                request.PITypeName = this.state.paymentInstrumentType.PITypeName;
                request.PIID = this.state.paymentInstrumentType.PITypeID;
                
                PaymentInterface.getPaymentInstrumentRequirements(request).then( (response) => {
                    let res = new httpResponseModel();
                    res = response;
                    if (res.ErrorCode === commonConstant.SUCCESS_CODE) {
                        let paymentInstrumentRequirementModel = new PaymentInstrumentRequirementResponseModel();
                        paymentInstrumentRequirementModel = res.Result;
                        let depositRequestAPIInfo = new DepositRequestModel();
                        depositRequestAPIInfo = this.props.depositRequestAPIInfo;
                        let callStateCountryAPI = false;
                        let excludeInputFocusArr = [];
                        let counter = 0;
                        if(depositRequestAPIInfo.DepositInfo.DepositInfoType === DepositInfoType.DepositFunds) {
                            paymentInstrumentRequirementModel.DepositFundsPIFieldRequirements.forEach(element => {
                                let paymentFieldsRequirementModel = new PaymentFieldsRequirementModel();
                                counter++;
                                paymentFieldsRequirementModel = element;
                                paymentFieldsRequirementModel.MaxLen = parseInt(paymentFieldsRequirementModel.MaxLen);
                                paymentFieldsRequirementModel.MinLen = parseInt(paymentFieldsRequirementModel.MinLen);
                                paymentFieldsRequirementModel.SecureTextEntry = false;
                                paymentFieldsRequirementModel.KeyboardType = "";
                                if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.CVV2) {
                                    paymentFieldsRequirementModel.KeyboardType = "numeric";
                                    paymentFieldsRequirementModel.SecureTextEntry = true;
                                } else if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.CardNumber) {
                                    paymentFieldsRequirementModel.KeyboardType = "numeric";
                                    paymentFieldsRequirementModel.SecureTextEntry = false;
                                } else if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.CardExpirationMonth
                                        || paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.CardExpirationYear){
                                    paymentFieldsRequirementModel.KeyboardType = "numeric";
                                    paymentFieldsRequirementModel.SecureTextEntry = false;
                                } else if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.BillingPostalCode) {
                                    paymentFieldsRequirementModel.KeyboardType = "numeric";
                                    paymentFieldsRequirementModel.SecureTextEntry = false;
                                    paymentFieldsRequirementModel.Value = this.state.userInfo.PostalCode;
                                } else if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.CardHolderName) {
                                    paymentFieldsRequirementModel.Value = this.state.userInfo.FirstName + " " + this.state.userInfo.LastName;
                                } else if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.BillingAddress1) {
                                    paymentFieldsRequirementModel.Value = this.state.userInfo.Address1;
                                } else if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.BillingCity) {
                                    paymentFieldsRequirementModel.Value = this.state.userInfo.City;
                                } else if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.BillingStateCode) {
                                    excludeInputFocusArr.push(counter);
                                } else if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.BillingCountryCode) {
                                    excludeInputFocusArr.push(counter);
                                    callStateCountryAPI = true;
                                }
                                element = paymentFieldsRequirementModel;
                            });
                            // sort array based on Display Order, currently that is coming 1 for every object, need to
                            // test after modifications in API.
                            paymentInstrumentRequirementModel.DepositFundsPIFieldRequirements.sort( (a,b) => {
                                return a.DisplayOrder - b.DisplayOrder;
                            });
                            this.setState({
                                allDynamicFields: paymentInstrumentRequirementModel.DepositFundsPIFieldRequirements,
                                excludeInputFocusArr: excludeInputFocusArr
                            }, () => {
                                console.log(this.state.allDynamicFields);
                            });
                        } else if(depositRequestAPIInfo.DepositInfo.DepositInfoType === DepositInfoType.CreatePaymentInstrumentAndDepositFunds) {
                            // for new card
                            let newPaymentFieldsRequirementModel = new PaymentFieldsRequirementModel();
                            newPaymentFieldsRequirementModel.DisplayName = paymentDebitCardInfoKey.NickName;
                            newPaymentFieldsRequirementModel.Name = paymentDebitCardInfoKey.NickName;
                            newPaymentFieldsRequirementModel.DisplayOrder = 0;
                            newPaymentFieldsRequirementModel.MaxLen = commonConstant.MAX_CHARACTER_20;
                            newPaymentFieldsRequirementModel.MinLen = commonConstant.MIN_CHARACTER_4;
                            paymentInstrumentRequirementModel.CreatePIFieldRequirements.push(newPaymentFieldsRequirementModel);

                            paymentInstrumentRequirementModel.CreatePIFieldRequirements.forEach(element => {
                                let paymentFieldsRequirementModel = new PaymentFieldsRequirementModel();
                                paymentFieldsRequirementModel = element;
                                counter++;
                                paymentFieldsRequirementModel.MaxLen = parseInt(paymentFieldsRequirementModel.MaxLen);
                                paymentFieldsRequirementModel.MinLen = parseInt(paymentFieldsRequirementModel.MinLen);
                                paymentFieldsRequirementModel.SecureTextEntry = false;
                                paymentFieldsRequirementModel.KeyboardType = "";
                                if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.CVV2) {
                                    paymentFieldsRequirementModel.KeyboardType = "numeric";
                                    paymentFieldsRequirementModel.SecureTextEntry = true;
                                } else if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.CardNumber) {
                                    paymentFieldsRequirementModel.KeyboardType = "numeric";
                                    paymentFieldsRequirementModel.SecureTextEntry = false;
                                } else if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.CardExpirationMonth
                                        || paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.CardExpirationYear){
                                    paymentFieldsRequirementModel.KeyboardType = "numeric";
                                    paymentFieldsRequirementModel.SecureTextEntry = false;
                                } else if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.BillingPostalCode) {
                                    paymentFieldsRequirementModel.KeyboardType = "numeric";
                                    paymentFieldsRequirementModel.SecureTextEntry = false;
                                    paymentFieldsRequirementModel.Value = this.state.userInfo.PostalCode;
                                } else if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.CardHolderName) {
                                    paymentFieldsRequirementModel.Value = this.state.userInfo.FirstName + " " + this.state.userInfo.LastName;
                                } else if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.BillingAddress1) {
                                    paymentFieldsRequirementModel.Value = this.state.userInfo.Address1;
                                } else if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.BillingCity) {
                                    paymentFieldsRequirementModel.Value = this.state.userInfo.City;
                                } else if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.BillingStateCode) {
                                    excludeInputFocusArr.push(counter);
                                } else if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.BillingCountryCode) {
                                    excludeInputFocusArr.push(counter);
                                    callStateCountryAPI = true;
                                }
                                element = paymentFieldsRequirementModel;
                            });
                            // sort array based on Display Order, currently that is coming 1 for every object, need to
                            // test after modifications in API.
                            paymentInstrumentRequirementModel.CreatePIFieldRequirements.sort( (a,b) => {
                                return a.DisplayOrder - b.DisplayOrder;
                            });
                            this.setState({
                                allDynamicFields: paymentInstrumentRequirementModel.CreatePIFieldRequirements,
                                excludeInputFocusArr: excludeInputFocusArr
                            }, () => {
                                console.log(this.state.allDynamicFields);
                                if(callStateCountryAPI) {
                                    this.callGetCountryAPI();
                                }
                            });
                        }
                    } else if (res.ErrorCode === commonConstant.ACCESS_DENIED_ERROR_CODE) {
                        //redirect to login
                    } else {
                        this.showCustomAlert(true,res.ErrorMsg);
                    }
                    this.showLoader(false);
                }, (error) => {
                    this.showLoader(false);
                    this.showCustomAlert(true,strings('common.api_failure'));
                });
            } else {
                // redirect to login
            }
        });
    }

    callGetCountryAPI = () => {
        
        let userAuthentication = new UserAuthenticationModel();
        userAuthentication = this.state.userAuthorization;
        if(!_.isEmpty(userAuthentication)) {
            this.showLoader(true);
            let countryRequestData = new CountryRequestModel();
            countryRequestData.AuthenticationToken = userAuthentication.Token;
            countryRequestData.RetrieveSignupSupportedOnlyCountries = false;
            AuthInterface.getCountries(countryRequestData).then( (response) => {
                console.log(response,'country data');
                let res = new httpResponseModel();
                res = response;
                this.showLoader(false);
                if(res.ErrorCode == "0") {
                    let countryResponseData = new CountryResponseModel();
                    countryResponseData = res.Result;
                    console.log(countryResponseData,'country response array');
                    let tempAllcountriesArr = countryResponseData.Countries;
                    tempAllcountriesArr.sort( (a,b) => {
                        return (a.PhonePrefixes[0] - b.PhonePrefixes[0]);
                    });
                    
                    let tempAllDynamicFields = new PaymentFieldsRequirementModel();
                    tempAllDynamicFields = this.state.allDynamicFields;
                    tempAllDynamicFields.forEach(element => {
                        let paymentFieldsRequirementModel = new PaymentFieldsRequirementModel();
                        paymentFieldsRequirementModel = element;
                        if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.BillingCountryCode){
                            tempAllcountriesArr.forEach(countryElement => {
                                let country = new CountryArrayResponseModel();
                                country = countryElement;
                                if(country.CountryCode == this.state.userInfo.CountryCode) {
                                    paymentFieldsRequirementModel.Value = country.CountryName;
                                }
                            });
                        }
                    });
                    this.setState({
                        countryListDS: this.state.countryListDS.cloneWithRows(tempAllcountriesArr),
                        countriesNameArray: tempAllcountriesArr,
                        allDynamicFields: tempAllDynamicFields
                    }, () => {
                        this.callGetStatesAPI(null);
                    });
                } else {
                    this.showCustomAlert(true,res.ErrorMsg);
                }
            }, (err) => {
                this.showLoader(false);
                this.showCustomAlert(true,strings('common.api_failure'));
            });
        }
    }
    
    callGetStatesAPI = (countryCode) => {
        let userAuthentication = new UserAuthenticationModel();
        userAuthentication = this.state.userAuthorization;
        if(!_.isEmpty(userAuthentication)) { 
            let requestData = new registerUserFieldRequestModel();
            requestData.AuthenticationToken = userAuthentication.Token;
            requestData.CountryCode = countryCode == null?this.state.userInfo.CountryCode:countryCode;
            this.showLoader(true);
            KYCInterface.getCountryStates(requestData).then( (response) => {
                let res = new httpResponseModel();
                res = response;
                if(res.ErrorCode == "0") {
                    let stateResponse = new StateResponseModel();
                    stateResponse = res.Result;

                    //sorting logic for States based on State Name in ascending order.

                    let statesArray = stateResponse.States;
                    statesArray = sortJsonArray(statesArray,"StateName")

                    let tempAllDynamicFields = new PaymentFieldsRequirementModel();
                    tempAllDynamicFields = this.state.allDynamicFields;
                    tempAllDynamicFields.forEach(element => {
                        let paymentFieldsRequirementModel = new PaymentFieldsRequirementModel();
                        paymentFieldsRequirementModel = element;
                        if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.BillingStateCode){
                            statesArray.forEach(stateElement => {
                                let state = new StateArrayResponseModel();
                                state = stateElement;
                                if(countryCode == null && (state.StateCode == this.state.userInfo.StateCode)) {
                                    paymentFieldsRequirementModel.Value = state.StateName;
                                } else {
                                    paymentFieldsRequirementModel.Value = statesArray[0].StateName;
                                }
                            });
                        }
                    });
                    this.setState({
                        statesListDS: this.state.statesListDS.cloneWithRows(statesArray),
                        statesNameArray: statesArray,
                        allDynamicFields: tempAllDynamicFields
                    });
                    //console.log(statesArray.length+JSON.stringify(statesArray));
                } else if (res.ErrorCode === commonConstant.ACCESS_DENIED_ERROR_CODE) {
                   this.showCustomAlertForLoginScreenRedirection(true,res.ErrorMsg);
                } else {
                    this.showCustomAlert(true,res.ErrorMsg)
                }
                
                this.showLoader(false);
                
            },(err) => {
                this.showLoader(false);
                this.showCustomAlert(true,strings('common.api_failure'));
            });
        } 
    }

    /**
     * CALL THIS METHOD TO SHOW OR HIDE THE PROGRESS LOADER
     */
    
    showLoader = (bit) => { // call this function to show/hide the loader
        this.setState({
            showActivityIndicator: bit
        });
    }

    focusNextInputField = (nextField) => {
        let excludeInputFocusArr = this.state.excludeInputFocusArr;
        // alert(JSON.stringify(excludeInputFocusArr));
        excludeInputFocusArr.forEach(element => {
            if(element == nextField){
                nextField++;
                if(nextField >= this.state.allDynamicFields.length){
                    nextField = -1;
                }
            }
        });
        let allDynamicFields = this.state.allDynamicFields;
        allDynamicFields.forEach(element => {
            let paymentFieldsRequirementModel = new PaymentFieldsRequirementModel();
            paymentFieldsRequirementModel = element;
            if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.CardExpirationMonth) {
                if(paymentFieldsRequirementModel.Value && parseInt(paymentFieldsRequirementModel.Value) == 0){
                    paymentFieldsRequirementModel.Value = "1";
                }
                if(paymentFieldsRequirementModel.Value && paymentFieldsRequirementModel.Value.length == 1) {
                    paymentFieldsRequirementModel.Value = "0" + paymentFieldsRequirementModel.Value;
                }
            }
        });
        this.setState({
            allDynamicFields: allDynamicFields
        });
        if(nextField != -1) { 
            this.refs[nextField].focus();
        }
    }

    backButton = () => {
        Navigation.pop(this.props.componentId);
    }

    updateCardInfo = () => {
        // alert(JSON.stringify(this.state.allDynamicFields));
        let depositRequestAPIInfo = new DepositRequestModel();
        depositRequestAPIInfo = this.props.depositRequestAPIInfo;
        if(depositRequestAPIInfo.DepositInfo.DepositInfoType === DepositInfoType.DepositFunds) {
            this.showLoader(true);
            let request = new DepositRequestModel();
            let depositInfoRequest = new DepositInfoRequestModel();
            let PIRequiredFieldValues = [];
            this.state.allDynamicFields.forEach(element => {
                let paymentFieldsRequirementModel = new PaymentFieldsRequirementModel();
                paymentFieldsRequirementModel = element;
                let keyValuePair = new KYCRegisterUserArrayModel();
                keyValuePair.Name = paymentFieldsRequirementModel.Name;
                keyValuePair.Value = paymentFieldsRequirementModel.Value;
                PIRequiredFieldValues.push(keyValuePair);
            });
            depositInfoRequest.DepositInfoType = DepositInfoType.DepositFunds;
            depositInfoRequest.PIID = this.state.paymentInstrumentModel.PIID;
            depositInfoRequest.PIName = this.state.paymentInstrumentModel.AcctDisplayName;
            depositInfoRequest.PIRequiredFieldValues = PIRequiredFieldValues;
            depositInfoRequest.PISourceCurrencyAmount = this.state.paymentInstrumentModel.InvestmentAmount;
            depositInfoRequest.PISourceCurrencyCode = this.state.currencyCode;
            // depositInfoRequest.PITypeName = this.state.paymentInstrumentType.PITypeName;

            let buyAssetsInfoRequest = new BuyAssetsInfoRequestModel();
            buyAssetsInfoRequest.BuyAssetsInfoType = BuyAssetsInfoType.GoalAllocation;
            buyAssetsInfoRequest.GoalAllocationCashAmount = this.state.paymentInstrumentModel.InvestmentAmount;
            buyAssetsInfoRequest.GoalCurrencyCode = this.state.currencyCode;
            
            request.AuthenticationToken = this.state.userAuthorization.Token;
            request.DepositInfo = depositInfoRequest;
            request.BuyAssetsInfo = buyAssetsInfoRequest;
            console.log(request);
            PaymentInterface.deposit(request).then( (response) => {
                let res = new httpResponseModel();
                res = response;
                let depositResponse = new DepositReponseModel();
                depositResponse = res.Result;
                if (res.ErrorCode === commonConstant.SUCCESS_CODE 
                    && (depositResponse.BrowserHTML == null || depositResponse.BrowserHTML == "")) {
                    // as discussed in user story #1364 success block is confirmed, need to modify code to handle 
                    // failure screnario
                    
                    Navigation.setStackRoot(stackName.GoalScreenStack, {
                        component : {
                            name: screenId.InvestmentTransactionSummaryScreen,
                            passProps: {
                                transactionProcess: true,
                                transactionID: depositResponse.DepositTransactionID,
                                transactionMessage: ""
                            }
                        }
                    });
                } else if (res.ErrorCode === commonConstant.ACCESS_DENIED_ERROR_CODE) {
                    //redirect to login
                } else {
                    Navigation.setStackRoot(stackName.GoalScreenStack, {
                        component : {
                            name: screenId.InvestmentTransactionSummaryScreen,
                            passProps: {
                                transactionProcess: false,
                                transactionID: depositResponse.DepositTransactionID,
                                transactionMessage: res.ErrorMsg
                            }
                        }
                    });
                    //this.showCustomAlert(true,res.ErrorMsgDebug);
                }
                this.showLoader(false);
            }, (error) => {
                this.showLoader(false);
                this.showCustomAlert(true,strings('common.api_failure'));
            });
        } else if(depositRequestAPIInfo.DepositInfo.DepositInfoType === DepositInfoType.CreatePaymentInstrumentAndDepositFunds) {
            let todayMonth = moment(new Date()).format("MM");
            let todayYear = moment(new Date()).format("YYYY");
            let userEnteredMonth = "";
            let userEnteredYear = "";
            this.state.allDynamicFields.forEach(element => {
                if (element.Name === paymentDebitCardInfoKey.CardExpirationMonth) {
                    userEnteredMonth = element.Value;
                }
                if(element.Name === paymentDebitCardInfoKey.CardExpirationYear) {
                    userEnteredYear = element.Value;
                }
            });
            let cardValidation = false;
            if(userEnteredYear == todayYear) {
                if(userEnteredMonth >= todayMonth) {
                    cardValidation = true;
                }
            } else if(userEnteredYear >= todayYear) {
                cardValidation = true
            }
            if(cardValidation) {
                //prepare key value pair 
                let PIRequiredFieldValues = [];
                let PIName = "";
                this.state.allDynamicFields.forEach(element => {
                    let paymentFieldsRequirementModel = new PaymentFieldsRequirementModel();
                    paymentFieldsRequirementModel = element;
                    if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.NickName) {
                        PIName = paymentFieldsRequirementModel.Value;
                    } else {
                        let keyValuePair = new KYCRegisterUserArrayModel();
                        keyValuePair.Name = paymentFieldsRequirementModel.Name;
                        if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.BillingCountryCode){
                            this.state.countriesNameArray.forEach(countryElement => {
                                let country = new CountryArrayResponseModel();
                                country = countryElement;
                                if(country.CountryName == paymentFieldsRequirementModel.Value){
                                    keyValuePair.Value = country.CountryCode;
                                }
                            });
                        } else if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.BillingStateCode){
                            this.state.statesNameArray.forEach(stateElement => {
                                let state = new StateArrayResponseModel();
                                state = stateElement;
                                if(state.StateName == paymentFieldsRequirementModel.Value){
                                    keyValuePair.Value = state.StateCode;
                                }
                            });
                        } else {
                            keyValuePair.Value = paymentFieldsRequirementModel.Value.trim();
                        }
                        
                        PIRequiredFieldValues.push(keyValuePair);
                    }
                });
                let depositRequestAPIInfo = new DepositRequestModel();
                depositRequestAPIInfo = Object.assign({}, this.props.depositRequestAPIInfo);
                let depositInfo = new DepositInfoRequestModel();
                depositInfo = Object.assign({},depositRequestAPIInfo.DepositInfo);
                depositInfo.PIRequiredFieldValues = PIRequiredFieldValues;
                depositInfo.PIName = PIName;
                depositRequestAPIInfo.DepositInfo = depositInfo;

                //alert(JSON.stringify(depositRequestAPIInfo));
                this.showCustomAlert(true,"you have reached the end of this feature!");
                //Navigate to next screen based on further discussion on 
            } else {
                this.showCustomAlert(true,strings('common.invalid_card_expiration'))
            }
        }
    }

    updateFields = (object, value) => {
        let requiredCount = 0;
        let enableNextBtn = false;
        this.state.allDynamicFields.forEach(element => {
            if (element.Name === object.Name) {
                element.Value = value;   
                if(object.Name === paymentDebitCardInfoKey.CardNumber) {
                    element.Value = commonUtil.validateNumericFields(value);
                }
                if(object.Name === paymentDebitCardInfoKey.CardExpirationMonth) {
                    element.Value = commonUtil.validateNumericFields(value);
                    if(parseInt(element.Value) > 12) {
                        element.Value = "12";
                    }
                }
                if(object.Name === paymentDebitCardInfoKey.CardExpirationYear) {
                    element.Value = commonUtil.validateNumericFields(value);
                }    
            }
            
            if (element.Value && element.Value.length >= element.MinLen) {
                requiredCount++;
            }
        });
        if (requiredCount === this.state.allDynamicFields.length) {
            enableNextBtn = true;
        }
        let tempallDynamicFields = this.state.allDynamicFields;
        this.setState({
            allDynamicFields: tempallDynamicFields,
            enableNextBtn: enableNextBtn
        });
    }

    openStateSelector = () => {
        if(this.state.statesNameArray.length > 0) {
            if(this.state.showStatePicker) {
                this.setState({
                    showStatePicker: false,
                    enableScrollViewScroll: true
                });
            } else {
                this.setState({
                    showStatePicker: true,
                });
    
            }
        } else {
            this.showCustomAlertForRetryStatesLoading(true,strings('kycAddressScreen.retry_states_list_loading'))
        }
    }

    openCountrySelector = () => {
        if(this.state.countriesNameArray.length > 0) {
            if(this.state.showCountryPicker) {
                this.setState({
                    showCountryPicker: false,
                    enableScrollViewScroll: true
                });
            } else {
                this.setState({
                    showCountryPicker: true,
                });
            }
        } else {
            // this.showCustomAlertForRetryStatesLoading(true,strings('kycAddressScreen.retry_states_list_loading'))
        }
    }

    renderStateView = (data) => {
        return (
            <TouchableOpacity style={styles.pickerRowcontainer} onPress={this._onStateItemPressed.bind(this,data)}>
                <Text style = { styles.statePickerText }>
                    { data.StateName }
                </Text>
            </TouchableOpacity>
        );
    }

    _onStateItemPressed = (data) => {
        let tempAllDynamicFields = new PaymentFieldsRequirementModel();
        tempAllDynamicFields = this.state.allDynamicFields;
        tempAllDynamicFields.forEach(element => {
            let paymentFieldsRequirementModel = new PaymentFieldsRequirementModel();
            paymentFieldsRequirementModel = element;
            if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.BillingStateCode){
                this.state.statesNameArray.forEach(statesElement => {
                    let states = new StateArrayResponseModel();
                    states = statesElement;
                    if(states.StateCode == data.StateCode) {
                        paymentFieldsRequirementModel.Value = states.StateName;
                    }
                });
            }
        });
        this.setState({
            allDynamicFields: tempAllDynamicFields
        }, () => {
            this.openStateSelector();
        });

    }

    renderCountryView = (data) => {
        return (
            <TouchableOpacity style={styles.pickerRowcontainer} onPress={this._onCountryItemPressed.bind(this,data)}>
                {/* <Image source={{ uri:`${this.state.baseCountryFlagUrl}${data.CountryCode}/flag.svg`}} style={styles.pickerImage} /> */}
                <Text style = { styles.pickerText }>
                    { data.CountryName }
                </Text>
                {/* { data.CountryCode } ( */}
            </TouchableOpacity>
        );
    }

    _onCountryItemPressed = (data) => {
        let tempAllDynamicFields = new PaymentFieldsRequirementModel();
        let tempCountryCode = "";
        tempAllDynamicFields = this.state.allDynamicFields;
        tempAllDynamicFields.forEach(element => {
            let paymentFieldsRequirementModel = new PaymentFieldsRequirementModel();
            paymentFieldsRequirementModel = element;
            if(paymentFieldsRequirementModel.Name === paymentDebitCardInfoKey.BillingCountryCode){
                this.state.countriesNameArray.forEach(countryElement => {
                    let country = new CountryArrayResponseModel();
                    country = countryElement;
                    if(country.CountryCode == data.CountryCode) {
                        paymentFieldsRequirementModel.Value = country.CountryName;
                        tempCountryCode = country.CountryCode;
                    }
                });
            }
        });
        this.setState({
            allDynamicFields: tempAllDynamicFields
        }, () => {
            this.openCountrySelector();
            this.callGetStatesAPI(tempCountryCode);
        });

    }

    customEnableScrollView = (isEnable) => {
        this.setState({ enableScrollViewScroll: isEnable });
    }

    render() {

        var fields = [];
        for (let i = 0; i < this.state.allDynamicFields.length; i++) {
            // let iconName = this.mapIconFromTextFields(this.state.allDynamicFields[i].Name)
            if(this.state.allDynamicFields[i].Name === paymentDebitCardInfoKey.BillingStateCode) {
                fields.push(
                    <View key={i}>
                        <View style={styles.kycDynamicFieldCoverView}>
                        <Text style={commonStyles.dynamicHeaderLabel}>{this.state.allDynamicFields[i].DisplayName}</Text>
                            <TouchableHighlight underlayColor='transparent' onPress = { this.openStateSelector }>
                            <View style={[styles.kycInputFieldCoverView,styles.kycInputFieldBottomBorderLight]}>
                                {/* <Image style={styles.kycIcon} source={iconName} /> */}
                                <Text style={[styles.kycTextStateField]}>{this.state.allDynamicFields[i].Value}</Text>
                            </View>
                            </TouchableHighlight>
                        </View>
                        <View style={[styles.stateDropdownView, 
                                    {display:this.state.showStatePicker? 'flex':'none'}]}
                                    onStartShouldSetResponderCapture={() =>this.customEnableScrollView(false)}
                                    >
                            <ListView
                            style={{flex:1}} 
                            dataSource={this.state.statesListDS} 
                            renderRow={(data) => this.renderStateView(data) }
                            />
                        </View>
                        
                    </View>
                    
                )
            } else if(this.state.allDynamicFields[i].Name === paymentDebitCardInfoKey.BillingCountryCode) {
                fields.push(
                    <View key={i}>
                        <View style={styles.kycDynamicFieldCoverView}>
                            <Text style={commonStyles.dynamicHeaderLabel}>{this.state.allDynamicFields[i].DisplayName}</Text>
                            <TouchableHighlight underlayColor='transparent' onPress = { this.openCountrySelector }>
                                <View style={[styles.kycInputFieldCoverView,styles.kycInputFieldBottomBorderLight]}>
                                    {/* <Image style={styles.kycIcon} source={iconName} /> */}
                                    <Text style={[styles.kycTextStateField]}>{this.state.allDynamicFields[i].Value}</Text>
                                </View>
                            </TouchableHighlight>
                        </View>
                        <View style={[styles.stateDropdownView, 
                                    {display:this.state.showCountryPicker? 'flex':'none'}]}
                                    onStartShouldSetResponderCapture={() =>this.customEnableScrollView(false)}
                                    >
                            <ListView
                            style={{flex:1}} 
                            dataSource={this.state.countryListDS} 
                            renderRow={(data) => this.renderCountryView(data) }
                            />
                        </View>
                        
                    </View>
                    
                )
            } else {
                fields.push(
                    <View key={i} style={styles.kycDynamicFieldCoverView} onStartShouldSetResponderCapture={() =>this.customEnableScrollView(true)}>
                        <Text style={commonStyles.dynamicHeaderLabel}>{this.state.allDynamicFields[i].DisplayName}</Text>
                        <View style={[styles.kycInputFieldCoverView, commonStyles.inputFieldBottomBorderc7c7c7]}>
                            {/* <Image style={styles.kycIcon} source={iconName} /> */}
                            <TextInput
                                ref={i}
                                value={this.state.allDynamicFields[i].Value}
                                onChangeText={(value) => this.updateFields(this.state.allDynamicFields[i], value)}
                                style={[styles.kycTextInputField]}
                                maxLength={this.state.allDynamicFields[i].MaxLen ? this.state.allDynamicFields[i].MaxLen : commonConstant.MAX_CHARACTER_DEFAULT}
                                //placeholder={this.state.allDynamicFields[i].Hint ? this.state.allDynamicFields[i].Hint : ""}
                                returnKeyType='next'
                                secureTextEntry={this.state.allDynamicFields[i].SecureTextEntry}
                                keyboardType= {this.state.allDynamicFields[i].KeyboardType}
                                onSubmitEditing={() => this.focusNextInputField(this.state.allDynamicFields.length > i + 1 ? i + 1 : i)}              
                            />
                        </View>
                    </View>
                )
            }
        }

        return (
            <View style={commonStyles.commonScreenContainer}>
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
                        {strings('debitCardAdditionalInfo.title')}
                    </Text>
                </View>
                <KeyboardAwareScrollView bounces={false} 
                    // style = { [ { paddingTop: 30 } ] }
                    scrollEnabled={this.state.enableScrollViewScroll}
                    //commonStyles.defaultPaddingTop
                    showsVerticalScrollIndicator={false} 
                    width={screenWidth} 
                    contentContainerStyle={{ alignItems: 'center' }}>
                    {fields}
                    <TouchableOpacity
                        activeOpacity={1}
                        disabled={!this.state.enableNextBtn}
                        style={commonStyles.kycFloatingNextButton}
                        onPress={this.updateCardInfo}>
                        <View
                            style={
                                [
                                    commonStyles.defaultSmallPaddingBtn,
                                    this.state.enableNextBtn ? commonStyles.btnActivebackgroundColor : commonStyles.btnDisabledbackgroundColor
                                ]
                            }>
                            <Text
                                style={
                                    [
                                        fontFamilyStyles.robotoRegular, ,
                                        commonStyles.fontSize19, commonStyles.textAlignCenter,
                                        this.state.enableNextBtn ?commonStyles.secTextColor:styles.disabledTextColor,
                                        
                                    ]
                                } >
                                {strings('common.next_btn')}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </KeyboardAwareScrollView>
                <LoaderComponent showLoader={this.state.showActivityIndicator} />
                <CommonModal modalComponent = {this.state.modalComponent}/>
            </View>
        );
    }

    mapIconFromTextFields = (objectName) => {
        if(objectName === paymentDebitCardInfoKey.CVV2) {
            return require("../assets/card_security.png")
        }
        return require("../assets/users_Info.png")
    }
}

DebitCardAdditionalInformationScreen.propTypes = propTypes;
DebitCardAdditionalInformationScreen.defaultProps = defaultProps;

const mapStateToProps = state => {
    return {
      UserResponseModel: state.userInfoReducer.userResponse,
      goalDashboardResponse: state.goalDashboardReducer.goalDashboardResponse,
      userAuthorizationResponse: state.userAuthorizationReducer.userAuthorizationResponse
    };
}
  
const mapDispatchToProps = dispatch => {
    return {
      addUserInfo: (UserResponseModel) => dispatch(addUserInfo(UserResponseModel)),
      addGoalDashboard: (goalDashboardResponse) => dispatch(addGoalDashboard(goalDashboardResponse)),
      addUserAuthorization: (userAuthorizationResponse) => dispatch(addUserAuthorization(userAuthorizationResponse))
    }
}
  
export default connect(mapStateToProps,mapDispatchToProps)(DebitCardAdditionalInformationScreen);