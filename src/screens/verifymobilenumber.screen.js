import React, { Component } from 'react';
import { ScrollView, View, Text, Image, TextInput,TouchableOpacity,TouchableHighlight, Alert, Platform } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import OtpInputs from 'react-native-otp-inputs';
import PropTypes from 'prop-types';
import * as _ from 'lodash';

import { strings } from '../config/i18/i18n';
import commonStyles from '../styles/common.style';
import fontFamilyStyles from '../styles/font.style';

import LoaderComponent from '../components/loader.component';
import AuthInterface from '../interfaces/auth.interface';
import styles from '../styles/form.style';
import commonTheme from '../themes/common.theme';
import { PhoneRequestObjectModel } from '../models/phone.request.object.model';
import { httpResponseModel } from '../models/httpresponse.model';
import AsyncStorageUtil from '../utils/asyncstorage.util';
import UserAuthenticationModel from '../models/user.authentication.model';
import { PhoneRequestModel } from '../models/phone.request.model';
import B21ResponseModel from '../models/b21.response.model';
import UserRequestModel from '../models/user.request.model';
import stackName from '../constants/stack.name.enum';
import stringConstant from '../constants/string.constant';
import screenId from '../constants/screen.id.enum';

import ModalComponentModel from '../models/modal.component.model';
import CommonModal from '../components/common.modal';
import commonUtil from '../utils/common.util';

const propTypes = { Phone : PropTypes.object };
const defaultProps = { Phone: new PhoneRequestObjectModel() };

export default class VerifyMobileNumberScreen extends Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            showActivityIndicator: false,
            enableNextBtn: false,
            Phone: this.props.Phone,
            verificationCode: "",
            enableResendCodeBtn: false,
            timesAllowedToCall: 3,
            showProblemReceivingCodeBlock: false,
            modalComponent : {}
        };
        console.log(this.state.Phone);
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

    showLoader = (bit) => { // call this function to show/hide the loader
        this.setState({
          showActivityIndicator: bit
        });
    }
    componentDidMount () {
        this._initializeTimer();
    }
    componentDidUpdate() {
        
    }
    componentWillUnmount () {
        clearInterval(this._resendCodeTimer);
    }
    componentWillReceiveProps (nextProps) {
        console.log(nextProps);
        if(!_.isEqual(this.props.Phone,nextProps.Phone)) {
          this.setState({
            Phone: nextProps.Phone
          });
        }
    }

    // Actions
    _backButton(){
        //Navigation.popToRoot('Authentication');
        Navigation.popToRoot(stackName.AuthenticationStack);
        
    }

    _initializeTimer = () => {
        var time = 0;
        this._resendCodeTimer = setInterval ( () => {
            time++;
            this.setState({
                enableResendCodeBtn: false
            });
            //console.log('timer initialized',time);
            if(time>60){
                this.setState({
                    enableResendCodeBtn: true
                },() => {
                    clearInterval(this._resendCodeTimer);
                });
            }
        },1000);
    }

    _onNextButtonClicked = () => {
        if(this.state.verificationCode.length=="6"){
            AsyncStorageUtil.getItem(stringConstant.SAVE_USER_INFO).then( (data) => {
                let userAuthentication = new UserAuthenticationModel();
                data = JSON.parse(data);
                if(data && !this.state.showActivityIndicator) {
                    userAuthentication = data.AuthenticationToken;
                    let otpData = new PhoneRequestModel();
                    otpData.VerificationCode = this.state.verificationCode;
                    otpData.AuthenticationToken = userAuthentication.Token;
                    let phoneData = new PhoneRequestObjectModel();
                    phoneData.PhoneNumber = this.state.Phone.PhoneNumber;
                    phoneData.PhoneType = this.state.Phone.PhoneType;
                    otpData.Phone = phoneData;
                    console.log(otpData,'otp request data');
                    this.showLoader(true);
                    AuthInterface.verifyOTP(otpData).then( (response) => {
                        console.log(response);
                        this.showLoader(false);
                        let res = new B21ResponseModel();
                        res = response;
                        if(res.ErrorCode == "0") {
                            let phoneStorageData = new PhoneRequestObjectModel();
                            phoneStorageData.PhoneNumber = this.state.Phone.PhoneNumber;
                            phoneStorageData.PhoneNumberWithOutPrefix = this.state.Phone.PhoneNumberWithOutPrefix;
                            phoneStorageData.PhoneType = this.state.Phone.PhoneType;
                            phoneStorageData.CountryCode = this.state.Phone.CountryCode;
                            phoneStorageData.EVerifySupported = this.state.Phone.EVerifySupported;
                            phoneStorageData.SignupSupported = this.state.Phone.SignupSupported;
                            phoneStorageData.CountryName = this.state.Phone.CountryName;
                            AsyncStorageUtil.storeItem(stringConstant.USER_CONTACT_INFO,phoneStorageData).then( (success) => {
                            // Need to modify code to redirect to terms and contiditons screen
                                Navigation.setStackRoot(stackName.AuthenticationStack, {
                                    component: {
                                        name: screenId.TermsAndConditionsScreen
                                    }
                                });
                            });
                        } else {
                            this.showCustomAlert(true,res.ErrorMsg)
                        }
                    }, (err) => {
                        this.showLoader(false);
                        this.showCustomAlert(true,strings('common.api_failure'));
                    });
                }
            });
        }
    }

    sendMobileVerificationCode = () => {
        if(this.state.timesAllowedToCall != 0) {
            console.log('resend code called!');
            AsyncStorageUtil.getItem('signup.userInfo').then( (data) => {
                let userAuthentication = new UserAuthenticationModel();
                data = JSON.parse(data);
                if(data) {    
                    userAuthentication = data.AuthenticationToken;
                    console.log(userAuthentication);
                    let mobileData = new UserRequestModel();
                    mobileData.AuthenticationToken = userAuthentication.Token;
                    mobileData.MobilePhone = this.state.Phone.PhoneNumber;
                    mobileData.CountryCode = this.state.Phone.CountryCode;
                    console.log(mobileData);
                    this.showLoader(true);
                    AuthInterface.sendMobileNumberVerificationCode(mobileData).then( (response) => {
                        let res = new B21ResponseModel();
                        res = response;
                        this.showLoader(false);
                        if(res.ErrorCode == "0") {
                            console.log(res);
                            let timesCalled = this.state.timesAllowedToCall;
                            timesCalled--;
                            this._initializeTimer();
                            this.setState({
                                timesAllowedToCall: timesCalled
                            }, () => {
                                if(this.state.timesAllowedToCall == 0){
                                    this.setState({
                                        showProblemReceivingCodeBlock: true
                                    });
                                }
                                this.showCustomAlert(true,strings('signup.verification_code_sent_successfully'))
                            });
                        } else if(res.ErrorCode == "58") {
                            this.showCustomAlert(true,res.ErrorMsg)
                        } else if(res.ErrorCode == "57") {
                            this.showCustomAlert(true,res.ErrorMsg)
                        }
                    }, (err) => {
                        this.showLoader(false);
                        this.showCustomAlert(true,strings('common.api_failure'));
                    });
                } 
            });
        } else {
            this.setState({
                enableResendCodeBtn: true,
                showProblemReceivingCodeBlock: true
            });
        }
    }
    
    _updateOTPField = (code) => {
        this.setState({
            verificationCode: code
        }, () => {
            if(this.state.verificationCode.length == "6") {
                this.setState({
                    enableNextBtn : true
                });
            } else {
                this.setState({
                    enableNextBtn : false
                });
            }
            console.log(this.state.verificationCode);
        });
    }

    showProblemReceivingCodeAlert = () => {
        this.showCustomAlert(true,strings('signup.problem_receiving_code_message'))
    }

    render() {
        return (
          <View style={{flex:1}}>
            <View style={{flex:9}}>
              <KeyboardAwareScrollView>
              <View style={styles.container}>
                <View style={styles.backIconView}>
                  <TouchableOpacity style={styles.backButton} onPress={this._backButton} disabled = { !this.state.enableResendCodeBtn }>
                    <Image style={styles.backIcon} source={require("../assets/backIcon.png")}/>
                  </TouchableOpacity>
                </View>
                <Text style={styles.signUpheader}>{ strings('signup.verify_mobile_number_header') }</Text>
                <Image style={styles.logo} source={require("../assets/smsCircle.png")}/>
                <Text style={styles.descriptionText}>{ strings('signup.enter_code_below') }</Text>
                <View style={styles.VerifyMobileformView}>
                    <OtpInputs handleChange={code => this._updateOTPField(code)} 
                    numberOfInputs={6} 
                    inputContainerStyles = { [ styles.otpFieldStyle ] }
                    keyboardType = 'default'
                    inputStyles = {styles.otpInputStyle}/>
                </View>
                <TouchableOpacity 
                    style={styles.resendButton}
                    disabled = { !this.state.enableResendCodeBtn }
                    onPress = { this.sendMobileVerificationCode }>
                    <Text style={styles.resendButtonText}>{ strings('signup.resend_code') }</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style = { 
                        [
                            styles.problemReceivingCode,
                            { display:this.state.showProblemReceivingCodeBlock ? 'flex' : 'none' }
                        ]
                    }
                    underlayColor="white"
                    onPress = { this.showProblemReceivingCodeAlert }
                    >
                    <View 
                        style = { styles.secondaryTransparentButton }>
                        <Text style={styles.buttonTextBlue}>{ strings('signup.problem_receiving_code') }</Text>
                    </View>
                </TouchableOpacity>
              </View>
            </KeyboardAwareScrollView>
          </View>
          <View style={{flex:1}}>
            <TouchableHighlight 
                disabled = { !this.state.enableNextBtn }
                style = {
                    [
                        styles.fullSize,
                    ]
                } 
                onPress = { this._onNextButtonClicked }
                underlayColor="white">
                  <View style = {
                        [
                            styles.primaryBlueButton, styles.fullSize,
                            this.state.enableNextBtn ? commonStyles.btnActivebackgroundColor:commonStyles.btnDisabledbackgroundColor 
                        ]
                    }>
                    <Text style={styles.buttonTextWhite}>{ strings('setpassword.next_btn') }</Text>
                  </View>
              </TouchableHighlight>
          </View>
          <LoaderComponent showLoader = { this.state.showActivityIndicator }/>
          <CommonModal modalComponent = {this.state.modalComponent}/>
        </View>
        );
      }
}

VerifyMobileNumberScreen.propTypes = propTypes;
VerifyMobileNumberScreen.defaultProps = defaultProps;