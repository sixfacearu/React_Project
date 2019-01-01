import React, { Component } from 'react';
import {
    View, Text, Picker, TextInput,
    TouchableOpacity, TouchableHighlight, ListView,
    Alert, Keyboard, NativeModules, Platform, Dimensions
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Image from 'react-native-remote-svg';

import { strings } from '../config/i18/i18n';
import commonStyles from '../styles/common.style';
import fontFamilyStyles from '../styles/font.style';
import commonConstant from '../constants/common.constant';
import CountryRequestModel from '../models/country.request.model';
import LoaderComponent from '../components/loader.component';
import styles from '../styles/form.style';
import AsyncStorageUtil from '../utils/asyncstorage.util';
import httpResponseModel from '../models/httpresponse.model';
import B21ResponseModel from '../models/b21.response.model';
import stringConstant from '../constants/string.constant';
import stackName from '../constants/stack.name.enum';
import screenId from '../constants/screen.id.enum';
import PropTypes from 'prop-types';

import KYCInterface from '../interfaces/kyc.interface';
import UserAuthenticationModel from '../models/user.authentication.model';
import UserResponseModel from '../models/user.response.model';
import B21RequestModel from '../models/b21.request.model';
import AuthInterface from '../interfaces/auth.interface';
import UserRegistrationResponseModel from '../models/userregistration.model';
import GetUserInfoResponseModel from '../models/getuserinfo.response.model';
import { PhoneRequestObjectModel } from '../models/phone.request.object.model';
import KYCRegisterUserRequestModel from '../models/kyc.registeruser.request.model';
import KYCRegisterUserByDocumentRequestModel from '../models/kyc.registerbydocument.request.model';
import ModalComponentModel from '../models/modal.component.model';
import commonUtil from '../utils/common.util';
import CommonModal from '../components/common.modal';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;


export default class KYCConfirmEmailScreen extends Component {
    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            isEVerifySupported: false,
            enableNextBtn: true,
            userEmail: "",
            showActivityIndicator: false,
            userInfoFromStorage: new UserResponseModel(),
            userAuthenticationFromStorage: new UserAuthenticationModel(),
            modalComponent: {}
        };

        this.leftButtonClicked = this.leftButtonClicked.bind(this);
        this.rightButtonClicked = this.rightButtonClicked.bind(this);
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

        AsyncStorageUtil.getItem(stringConstant.EVERIFY_SUPPORT_INFO).then((data) => {
            data = JSON.parse(data);
            this.setState({
                isEVerifySupported: data
            });
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
                    });
                }
            });
        });
    }

    showLoader = (bit) => { // call this function to show/hide the loader
        this.setState({
            showActivityIndicator: bit
        });
    }


    backButton = () => {
        Navigation.pop(this.props.componentId);
    }

    showProblemReceivingCodeAlert = () => {
        //v Alert.alert("",strings('kycConfirmEmail.checkEmailAndContactSupport'));
        this.showCustomAlert(true,strings('kycConfirmEmail.checkEmailAndContactSupport'));
    }

    resendEmail = () => {
           
        console.log("Resend button clicked")
        this.showLoader(true);
        //if(!this.state.showActivityIndicator) {
            let request = new B21RequestModel();
            request.AuthenticationToken = this.state.userAuthenticationFromStorage.Token;
            KYCInterface.resendEmailVerification(request).then( (response) => {
                let res = new B21ResponseModel();
                res = response;
                if(res.ErrorCode == commonConstant.SUCCESS_CODE) {
                    //Navigate to source of funds screen user story #735
                    //v Alert.alert("",strings('kycConfirmEmail.verificationLinkSend'));
                    this.showCustomAlert(true,strings('kycConfirmEmail.verificationLinkSend'));
                } else if(res.ErrorCode == commonConstant.ACCESS_DENIED_ERROR_CODE) {
                    //Navigate to login screen
                    //v alert(res.ErrorMsg);
                    this.showCustomAlert(true,res.ErrorMsg);
                } else {
                    //v alert(res.ErrorMsg);
                    this.showCustomAlert(true,res.ErrorMsg);
                }
                this.showLoader(false);
            }, (err) => {
                this.showLoader(false);
                this.showCustomAlert(true,strings('common.api_failure'));
            });
        //}
    }

    onNextButtonPressed = () => {
        this.showLoader(true);
        if(!this.state.showActivityIndicator) {
            let request = new B21RequestModel();
            request.AuthenticationToken = this.state.userAuthenticationFromStorage.Token;
            AuthInterface.getUserInfo(request).then( (response) => {
                let res = new B21ResponseModel();
                res = response;
                if(res.ErrorCode == commonConstant.SUCCESS_CODE) {
                    //Navigate to source of funds screen user story #735
                    let infoResponse = new GetUserInfoResponseModel();
                    infoResponse = res.Result;
                    let isEmailVerified = infoResponse.UserSignupRegistrationInfo.EmailVerified;
                    //alert(JSON.stringify(registrationInfo));
                    if(isEmailVerified) {
                        AsyncStorageUtil.getItem(stringConstant.EVERIFY_SUPPORT_INFO).then( (data) => {
                            data = JSON.parse(data);
                            if(data === true) {
                                AsyncStorageUtil.getItem(stringConstant.STORE_KYC_DATA_WITH_DOCUMENT_DYNAMIC_INFO).then( (registerUserRequestDataTemp) => {
                                    this.showLoader(true);
                                    //alert('RegisterUser API')
                                    let registerUserRequestData = new KYCRegisterUserRequestModel();
                                    registerUserRequestData = JSON.parse(registerUserRequestDataTemp);
                                    console.log('register user request',JSON.stringify(registerUserRequestData));
                                    if(registerUserRequestData) {
                                        KYCInterface.registerUser(registerUserRequestData).then( (response) => {
                                            this.showLoader(false);
                                            let res = new httpResponseModel();
                                            res = response;
                                            console.log("register User response"+JSON.stringify(res))
                                            if(res.ErrorCode == commonConstant.SUCCESS_CODE) {
                                                // Alert.alert('KYC verified successfully!',
                                                // "This marks the end of the feature, we are hard at work creating next feature.");
                                                Navigation.setStackRoot(stackName.GoalScreenStack, {
                                                    component : {
                                                        name: screenId.KYCCongratulationsScreen
                                                    }
                                                });
                                            } else if (res.ErrorCode === commonConstant.ACCESS_DENIED_ERROR_CODE) {

                                                //v Alert.alert('',res.ErrorMsg,
                                                //     [{text: 'OK', onPress: () => {
                                                //             //redirect to login screen
                                                //         }},
                                                //     ],
                                                //     { cancelable: false }
                                                // )

                                                this.showCustomAlert(true,res.ErrorMsg);
                                                
                                            } else {
                                                //v alert(res.ErrorMsg)
                                                this.showCustomAlert(true,res.ErrorMsg);
                                            }
                                        },(err) => {
                                            this.showLoader(false);
                                            //v alert("API failure");
                                            this.showCustomAlert(true, strings('common.api_failure'));
                                        });
                                    }
                                });
                            } else {
                                //alert('RegisterUserByDocument')
                                this.showLoader(true);
                                
                                AsyncStorageUtil.getItem(stringConstant.STORE_KYC_DOCUMENT_STATIC_INFO).then((KYCRegisterUserByDocumentRequestTempModel) => {
                                    let requestData = new KYCRegisterUserByDocumentRequestModel();
                                    requestData = JSON.parse(KYCRegisterUserByDocumentRequestTempModel);
                                    if(requestData) {
                                        KYCInterface.registerUserByDocument(requestData).then( (response) => {
                                            this.showLoader(false);
                                            let res = new httpResponseModel();
                                            res = response;
                                            if(res.ErrorCode == commonConstant.SUCCESS_CODE) {
                                                // Alert.alert('KYC verified successfully!',
                                                // "This marks the end of the feature, we are hard at work creating next feature.");
                                                Navigation.setStackRoot(stackName.GoalScreenStack, {
                                                    component : {
                                                        name: screenId.KYCCongratulationsScreen
                                                    }
                                                });
                                            } else if (res.ErrorCode === commonConstant.ACCESS_DENIED_ERROR_CODE) {

                                                //v Alert.alert('',res.ErrorMsg,
                                                //     [{text: 'OK', onPress: () => {
                                                //             //redirect to login screen
                                                //         }},
                                                //     ],
                                                //     { cancelable: false }
                                                // )
                                                
                                                this.showCustomAlert(true, res.ErrorMsg);
                                            } else {
                                                alert(res.ErrorMsg)
                                            }
                                        },(err) => {
                                            this.showLoader(false);
                                            //v alert("API failure");
                                            this.showCustomAlert(true, strings('common.api_failure'));
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        this.showLoader(false);
                        //v Alert.alert("", strings('kycConfirmEmail.emailNotVerified'));
                        this.showCustomAlert(true, strings('kycConfirmEmail.emailNotVerified'));
                    }
                } else if(res.ErrorCode == commonConstant.ACCESS_DENIED_ERROR_CODE) {
                    //Navigate to login screen
                    this.showLoader(false);
                    //v alert(res.ErrorMsg);
                    this.showCustomAlert(true, res.ErrorMsg);
                } else {
                    this.showLoader(false);
                    //v alert(res.ErrorMsg);
                    this.showCustomAlert(true, res.ErrorMsg);
                }
                //this.showLoader(false);
            }, (err) => {
                this.showLoader(false);
                //v alert("API failure");
                this.showCustomAlert(true, strings('common.api_failure'));
            });
        }
    }

    render() {

        // NEW UI
        return (
            <View style={[styles.kycConfirmEmailMainContainer]}>
                
                    <View style={[styles.kycHeaderSection,{marginTop:0}]}>
                        <TouchableOpacity style={[styles.backButton]} onPress={this.backButton}>
                            <Image style={styles.backIcon} source={require("../assets/backArrowWhite.png")}/>
                        </TouchableOpacity>
                        <Text style={[styles.kycAddressHeader]}>{ strings('kycConfirmEmail.title') }</Text>
                    </View>  
                    <Image style={styles.kycConfirmMailLogo} source={ require('../assets/sendKYC.png') }/>
                    
                    <Text 
                        style = {
                            [
                                commonStyles.width80pc,
                                commonStyles.textAlignCenter,
                                commonStyles.fontSize18,
                                fontFamilyStyles.robotoLight,
                                commonStyles.textColorDisabled
                            ]
                        }>
                        { strings('kycConfirmEmail.description') } { this.state.userInfoFromStorage.Email }
                    </Text>
                    <View
                        style = {
                            [
                                commonStyles.fullWidth,
                                commonStyles.alignChildCenter,
                                commonStyles.margin40Top
                            ]
                        }>
                        <TouchableOpacity
                            activeOpacity={1}
                            style = {
                                [
                                    commonStyles.width40pc,
                                    commonStyles.defaultPaddingTopBottom10,
                                    commonStyles.borderRadius5,
                                    commonStyles.tertiaryBackgroundColor
                                ]
                            }
                            onPress = { this.resendEmail }
                            underlayColor="white">
                            <Text
                                style = {
                                    [
                                        commonStyles.textAlignCenter
                                    ]
                                }>
                                { strings('kycConfirmEmail.resendEmail') }
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View 
                        style = {
                            [
                                commonStyles.fullWidth,
                                commonStyles.alignChildCenter
                            ]
                        }>
                        <TouchableOpacity 
                            style = { 
                                [
                                    styles.problemReceivingCode
                                ]
                            }
                            underlayColor="white"
                            onPress = { this.showProblemReceivingCodeAlert }
                            >
                            <View 
                                style = { styles.secondaryTransparentButton }>
                                <Text style={commonStyles.buttonTextWhite}>{ strings('kycConfirmEmail.problemsReceivingCode') }</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        activeOpacity={1}
                        disabled={!this.state.enableNextBtn}
                        style = {[styles.kycNextButton,
                            this.state.enableNextBtn ?styles.kycNextButton:styles.kycNextButtonDisabled
                        ]}
                        onPress = { this.onNextButtonPressed }>
                        <Text style = { [commonStyles.fontSizeLarge, 
                            this.state.enableNextBtn ?commonStyles.secTextColor:styles.disabledTextColor,
                            commonStyles.textAlignCenter] } >
                            { strings('common.next_btn') } 
                        </Text>
                    </TouchableOpacity>
                {/* </View> */}
                <LoaderComponent showLoader = { this.state.showActivityIndicator }/>
                <CommonModal modalComponent = {this.state.modalComponent}/>
            </View>
        );
        // NEW UI ENDS
    }
}