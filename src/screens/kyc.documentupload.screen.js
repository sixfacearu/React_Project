import React, { Component } from 'react';
import { NativeModules,View, Image ,Text, Picker, TextInput,TouchableOpacity,TouchableHighlight, ListView, Alert,Keyboard , Platform, Dimensions } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ImagePicker from 'react-native-image-crop-picker';
import BottomSheet from 'react-native-bottomsheet';


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
import GetUserInfoResponseModel from '../models/getuserinfo.response.model';
import B21RequestModel from '../models/b21.request.model';
import KYCRegisterUserRequestModel from '../models/kyc.registeruser.request.model';
import KYCRegisterUserArrayModel from '../models/kyc.registeruser.array.model';
import KYCRegisterUserByDocumentRequestModel from '../models/kyc.registerbydocument.request.model';

import styles from '../styles/form.style';
//import Row from './countryPickerRow.view';
import country from './demoData';
//import Image from 'react-native-remote-svg'
import AsyncStorageUtil from '../utils/asyncstorage.util';
import httpResponseModel from '../models/httpresponse.model';
import CountryResponseModel from '../models/country.response.model';
import { PhoneRequestObjectModel } from '../models/phone.request.object.model';
import B21ResponseModel from '../models/b21.response.model';
import stringConstant from '../constants/string.constant';
import stackName from '../constants/stack.name.enum';
import screenId from '../constants/screen.id.enum';
import documentType from '../constants/document.type.enum';
import PropTypes from 'prop-types';

import KYCInterface from '../interfaces/kyc.interface';
import commonTheme from '../themes/common.theme';
import ModalComponentModel from '../models/modal.component.model';
import commonUtil from '../utils/common.util';
import CommonModal from '../components/common.modal';

const screenWidth = Dimensions.get('window').width;
const screenHeight= Dimensions.get('window').height;

const imagePickerConfig = {
    //width: screenWidth,
    //height: screenWidth*2/3,
    mediaType:"photo",
    //cropping: true,
    includeBase64:true,
    includeExif: true,
    compressImageQuality: 0.7,
    //forceJpg: true
  };

export default class KYCDocumentUploadScreen extends Component {
    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);
        this.openGalleryView = this.openGalleryView.bind(this)

        this.state = {
            enableNextBtn: false,
            isEVerifySupported: false,

            passportImage:null,
            utilityBillImage:null,

            passportImageBinary:"",
            utilityBillImageBinary:"",
            modalComponent : {}
        };
    }

    initializeModalComponent = () => {
        let initialModalComponent = new ModalComponentModel();
        initialModalComponent.shouldVisible = false;
        this.setState({
          modalComponent : initialModalComponent
        });
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

    componentWillMount() {
        this.initializeModalComponent();
    }
    
    componentWillReceiveProps (nextProps) {
        console.log(nextProps);
    }

    componentDidMount () {
       // this.checkEmailVerification();
        
    }
    
    /**
     * DECISION ON DYNAMIC OR STATIC FLOW BASED ON COUNTRY SELECTION IN PREVIOUS SCREEN
     */
    decideDynamicOrStaticFlow = () => {

        if(this.state.isEVerifySupported === true) { // i.e dynamic flow //
            
        } else { // i.e static flow //
            
        }
        
    }
    
    /**
     * CALL THIS METHOD TO SHOW OR HIDE THE PROGRESS LOADER
     */
    showLoader = (bit) => { 
        this.setState({
          showActivityIndicator: bit
        });
    }
    
    /**
     * BACK BUTTON ACTION
     */
    backButton=() => {
        Navigation.pop(this.props.componentId);
    }
    
    /**
     * ON NEXT BUTTONS' ACTION
     */
    onNextButtonClick = () => {
        this.checkEmailVerification()
    }

    /**
     * SELECT PASSPORT IMAGE
     */
    selectPassportImage = ()=>{
        this.openBottomMenu(documentType.passportImage)
    }

    /**
     * SELECT UTILITY BILL IMAGE
     */
    selectUtilityBillImage = ()=>{
        this.openBottomMenu(documentType.utilityBillImage)
    }

    /**
     * OPEN BOTTOM MENU
     */
    openBottomMenu = (imageType) => {
        BottomSheet.showBottomSheetWithOptions({
            options: [strings('kycDocumentUploadScreen.camera'), 
                strings('kycDocumentUploadScreen.gallery'), 
                strings('kycDocumentUploadScreen.cancel')],
            title: strings('kycDocumentUploadScreen.select_image'),
            dark: false,
            cancelButtonIndex: 2,
          }, (value) => {
            
            if(value === 0) {
                this.openCameraView(imageType);
            } else {
                this.openGalleryView(imageType);
            } 
          });
    }
    /**
     * OPEN CAMERA 
     */
    openCameraView = (imagetype) => {
        
        ImagePicker.openCamera(imagePickerConfig).then(image => {
            console.log(image);
            this.setImageValues(imagetype,image);

          }).catch(e => console.log(e));//alert(e)
    }

    /**
     * OPEN GALLERY VIEW
     */
    openGalleryView = (imagetype) => {
        ImagePicker.openPicker(imagePickerConfig).then(image => {
            console.log(image);
            this.setImageValues(imagetype,image);
            
          }).catch(e => console.log(e));
    }

    /**
     * SET IMAGE VALUE
     */
    setImageValues = (imagetype,image) => {

        //{uri: `data:${image.mime};base64,`+ image.data, width: image.width, height: image.height} // used earlier
        //{uri: `data:${image.mime};base64,${(new Buffer(image.data)).toString('base64')}`} // doesn't work

        if(imagetype === documentType.passportImage) {
            this.setState({
                passportImage: {uri: `data:${image.mime};base64,`+ image.data},
                passportImageBinary: image.data
            });
        }else {
            this.setState({
                utilityBillImage: {uri: `data:${image.mime};base64,`+ image.data},
                utilityBillImageBinary: image.data
            });
        }
        this.checkNextButtonStatus()
    }
    /**
     * CHECK NEXT BUTTON STATUS
     */
    checkNextButtonStatus = () => {
        if(this.state.passportImage !== null && this.state.utilityBillImage !== null) {
            this.setState({
                enableNextBtn:true
            });
        } else {
            this.setState({
                enableNextBtn:false
            });
        }
    }
    /**
     * LAYOUT RENDERING
     */
    render() {
        
        return (
        <View style={styles.kycDocumentUploadMainContainer}>

            <View style={[styles.kycDocumentUploadHeaderSection,{marginTop:0}]}>
                <TouchableOpacity style={[styles.backButton]} onPress={this.backButton}>
                     <Image style={styles.backIcon} source={require("../assets/backArrowWhite.png")}/>
                </TouchableOpacity>
                <Text style={[styles.kycAddressHeader]}>{ strings('kycDocumentUploadScreen.title') }</Text>
            </View>   
            <KeyboardAwareScrollView  
            bounces={false} showsVerticalScrollIndicator={false} width={screenWidth} contentContainerStyle={{alignItems:'center'}}>
                {/* Section 1 : GOVERNMENT ISSUED PHOTO ID */}
                <Text style = {styles.documentUploadTitle}>{ strings('kycDocumentUploadScreen.government_issued_id') }</Text>
                <Image style={[styles.kycDocumentPreview,{display:this.state.passportImage !== null?"flex":"none"}]} 
                source={this.state.passportImage} />
                <TouchableOpacity activeOpacity = {1} style = {styles.kycDocumentUploadButton} onPress =  {this.selectPassportImage} >
                    <View style={styles.kycUploadButtonView}>
                        <Image style={styles.kycUploadButtonIcon} source={require("../assets/kyc_gov_id_icon.png")} />
                        <Text style={styles.kycDocumentUploadButtonText}>{ strings('kycDocumentUploadScreen.add_photo_id') }</Text>
                    </View>
                </TouchableOpacity>
                <Text style = {styles.kycPhotoIdDescriptionText}>{ strings('kycDocumentUploadScreen.add_photo_id_description') }</Text>
                <View style={styles.kycLineView}></View>

                {/* Section 2 : ADDRESS PROOF */}
                <Text style = {styles.documentUploadTitle}>{ strings('kycDocumentUploadScreen.address_proof') }</Text>
                <Image style={[styles.kycDocumentPreview,{display:this.state.utilityBillImage !== null?"flex":"none"}]} 
                source={this.state.utilityBillImage} />
                <TouchableOpacity activeOpacity = {1} style = {styles.kycDocumentUploadButton} onPress = { this.selectUtilityBillImage }>
                    <View style={styles.kycUploadButtonView}>
                        <Image style={styles.kycUploadButtonIcon} source={require("../assets/adress_proof_id_icon.png")} />
                        <Text style={styles.kycDocumentUploadButtonText}>{ strings('kycDocumentUploadScreen.upload_utility_bill') }</Text>
                    </View>
                </TouchableOpacity>
                <Text style = {styles.kycPhotoIdDescriptionText}>{ strings('kycDocumentUploadScreen.upload_utility_bill_description') }</Text>
                
                {/* NEXT BUTTON */}
                <TouchableOpacity
                            disabled={!this.state.enableNextBtn}
                            activeOpacity = { 1 }
                            style = {[
                                this.state.enableNextBtn ?styles.kycFloatingNextButton:styles.kycFloatingDisabledNextButton]}
                            onPress = { this.onNextButtonClick }>
                            <Text style = { [commonStyles.fontSizeLarge, 
                                this.state.enableNextBtn ?commonStyles.secTextColor:styles.disabledTextColor,
                                commonStyles.textAlignCenter] } >
                                { strings('common.next_btn') } 
                            </Text>
                </TouchableOpacity>
            </KeyboardAwareScrollView>
            <LoaderComponent showLoader = { this.state.showActivityIndicator }/>
            <CommonModal modalComponent = {this.state.modalComponent}/>
        </View>
        );
    }

    /**
     * CHECK IF EMAIL IS VERIFIED: getUserInfo API CALL
     */
    checkEmailVerification = () => {
        this.showLoader(true);
        AsyncStorageUtil.getItem(stringConstant.SAVE_USER_INFO).then( (data) => {
            let userAuthentication = new UserAuthenticationModel();
            data = JSON.parse(data);
            if(data) {    
                userAuthentication = data.AuthenticationToken;
                console.log(userAuthentication);
                let requestData = new B21RequestModel();
                requestData.AuthenticationToken = userAuthentication.Token;
                
                KYCInterface.getUserInfo(requestData).then( (response) => {
                    let res = new httpResponseModel();
                    res = response;
                    this.showLoader(false);
                    if(res.ErrorCode == commonConstant.SUCCESS_CODE) {
                        
                        let infoResponse = new GetUserInfoResponseModel();
                        infoResponse = res.Result;

                        let isEmailVerified = infoResponse.UserSignupRegistrationInfo.EmailVerified;
                        if(isEmailVerified === true) {

                            // Check if eVerification is supported
                            AsyncStorageUtil.getItem(stringConstant.EVERIFY_SUPPORT_INFO).then( (data) => {
                                data = JSON.parse(data);
                                if(data === true) {
                                    AsyncStorageUtil.getItem(stringConstant.USER_CONTACT_INFO).then( (contactInfo) => {
                                        this.showLoader(true);
                                        //alert('RegisterUser API')
                                        let phoneStorageData = new PhoneRequestObjectModel();
                                        contactInfo = JSON.parse(contactInfo);
                                        phoneStorageData = contactInfo;
                                        // Prepare request model for RegisterUser API
                                        let registerUserRequestData = new KYCRegisterUserRequestModel()
                                        registerUserRequestData.AuthenticationToken = userAuthentication.Token;
                                        registerUserRequestData.UserID = infoResponse.User.UserID;
                                        registerUserRequestData.PassportImage = this.state.passportImageBinary;
                                        registerUserRequestData.UtilityBillImage = this.state.utilityBillImageBinary;
                                        // Prepare Address
                                        var fetchedData = []; 
                                        AsyncStorageUtil.getItem(stringConstant.STORE_KYC_USER_ADDRESS_INFO_KEY_VALUE).then( (data) => {
                                    
                                            if(data !== null) {
                                                data = JSON.parse(data);
                                                Object.keys(data).map((key, index) => ( 
                                                    fetchedData.push(this.dataIteration(data,key))
                                                ))
                                            }
                                            // Prepare user info
                                            AsyncStorageUtil.getItem(stringConstant.STORE_KYC_USER_DYNAMIC_INFO_FOR_DOCUMENT_UPLOAD).then( (data) => {
                                               
                                                if(data !== null) {
                                                    data = JSON.parse(data);
                                                    Object.keys(data).map((key, index) => ( 
                                                        fetchedData.push(this.dataIteration(data,key))
                                                    ))
                                                }
                                                
                                                AsyncStorageUtil.getItem(stringConstant.STORE_KYC_ADDITIONAL_INFO_KEY_VALUE).then( (data) => {
                                                    
                                                    if(data !== null) {
                                                        data = JSON.parse(data);
                                                        Object.keys(data).map((key, index) => ( 
                                                            fetchedData.push(this.dataIteration(data,key))
                                                        ));
                                                    }
                                                    
                                                    if(phoneStorageData.PhoneNumber) {// infoResponse.User.Phone
                                                        fetchedData.push(this.dataIterationWithKeyValue(phoneStorageData.PhoneNumber,"MobileNumber"));//infoResponse.User.Phone
                                                    }
                                                    //if(phoneStorageData.CountryCode) {
                                                    //    fetchedData.push(this.dataIterationWithKeyValue(phoneStorageData.CountryCode,"CountryCode"));
                                                    //}

                                                    // Alert.alert('',JSON.stringify(fetchedData));
                                                    registerUserRequestData.DataFields = fetchedData;
                                                    // prepare national id
                                                    var nationalIdData = [];
                                                    AsyncStorageUtil.getItem(stringConstant.STORE_KYC_NATIONAL_INFO_KEY_VALUE).then( (data) => { 
                                                        
                                                        if (data !== null) {
                                                            data = JSON.parse(data);
                                                            Object.keys(data).map((key, index) => ( 
                                                                nationalIdData.push(this.dataIteration(data,key))
                                                            ))

                                                            registerUserRequestData.NationalIDs = nationalIdData;
                                                        }
                                                        // prepare consent data
                                                        AsyncStorageUtil.getItem(stringConstant.GET_REGISTER_CONSENTS_INFO).then((consentData) => {
                                                            consentData = JSON.parse(consentData);
                                                            
                                                            if (consentData.length> 0) {
                                                                registerUserRequestData.Consent = true; 
                                                                registerUserRequestData.Consents = consentData;
                                                            } else {
                                                                registerUserRequestData.Consent = false;
                                                                registerUserRequestData.Consents = [];
                                                            }
                                                            this.showLoader(true);
                                                            console.log("register User request"+JSON.stringify(registerUserRequestData));
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
                        
                                                                    // Alert.alert('',res.ErrorMsg,
                                                                    //     [{text: 'OK', onPress: () => {
                                                                    //             //redirect to login screen
                                                                    //         }},
                                                                    //     ],
                                                                    //     { cancelable: false }
                                                                    // )
                                                                    this.showCustomAlert(true,res.ErrorMsg);
                                                                } else {
                                                                    this.showCustomAlert(true,res.ErrorMsg);
                                                                }
                                                            },(err) => {
                                                                this.showLoader(false);
                                                                this.showCustomAlert(true,strings('common.api_failure'));
                                                            });
                                                        });
                                                    });
                                                });
                                            });                                        
                                        });
                                        
                                        // setTimeout(() => {
                                            
                                        // },1000);
                                    });
                                } else {
                                    //alert('RegisterUserByDocument')
                                    this.showLoader(true);
                                    let requestData = new KYCRegisterUserByDocumentRequestModel();
                                    requestData.AuthenticationToken = userAuthentication.Token;
                                    requestData.PassportImage = this.state.passportImageBinary;
                                    requestData.UtilityBillImage = this.state.utilityBillImageBinary;
                                    
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

                                            // Alert.alert('',res.ErrorMsg,
                                            //     [{text: 'OK', onPress: () => {
                                            //             //redirect to login screen
                                            //         }},
                                            //     ],
                                            //     { cancelable: false }
                                            //   )
                                            this.showCustomAlert(true,res.ErrorMsg);
                                        } else {
                                            this.showCustomAlert(true,res.ErrorMsg);
                                        }
                                    },(err) => {
                                        this.showLoader(false);
                                        this.showCustomAlert(true,strings('common.api_failure'));
                                    });
                                }
                            });
                        } else {
                            //alert('redirect to email verification screen')
                            AsyncStorageUtil.getItem(stringConstant.EVERIFY_SUPPORT_INFO).then( (data) => {
                                data = JSON.parse(data);
                                if(data === true) {
                                    this.prepareDynamicFlowDataAndRedirectToEmailScreen();
                                } else {
                                    this.prepareStaticFlowDataAndRedirectToEmailScreen();
                                }
                            });
                        }

                    } else if (res.ErrorCode === commonConstant.ACCESS_DENIED_ERROR_CODE) {

                        // Alert.alert(
                        //     '',
                        //     res.ErrorMsg,
                        //     [
                        //       {text: 'OK', onPress: () => {
                        //             //redirect to login screen
                        //         }},
                        //     ],
                        //     { cancelable: false }
                        //   )
                        this.showCustomAlert(true,res.ErrorMsg);
                    } else {
                        this.showCustomAlert(true,res.ErrorMsg);
                    }
                    
                },(err) => {
                    this.showLoader(false);
                    this.showCustomAlert(true,strings('common.api_failure'));
                });
            } 
        }, (err) => {
            this.showLoader(false);
        });
    }

    prepareStaticFlowDataAndRedirectToEmailScreen = () => {

        AsyncStorageUtil.getItem(stringConstant.SAVE_USER_INFO).then( (data) => {
            let userAuthentication = new UserAuthenticationModel();
            data = JSON.parse(data);
            if(data) {    
                userAuthentication = data.AuthenticationToken;
                
                let requestData = new KYCRegisterUserByDocumentRequestModel();
                requestData.AuthenticationToken = userAuthentication.Token;
                requestData.PassportImage = this.state.passportImageBinary;
                requestData.UtilityBillImage = this.state.utilityBillImageBinary;
                this.showLoader(false);
                AsyncStorageUtil.storeItem(stringConstant.STORE_KYC_DOCUMENT_STATIC_INFO,requestData).then(() => {
                    this.goToEmailVerificationScreen();
                });
            }
        });

        
    }

    prepareDynamicFlowDataAndRedirectToEmailScreen = () => {

        AsyncStorageUtil.getItem(stringConstant.SAVE_USER_INFO).then( (data) => {
            let userAuthentication = new UserAuthenticationModel();
            data = JSON.parse(data);
            if(data) {    
                userAuthentication = data.AuthenticationToken;
                AsyncStorageUtil.getItem(stringConstant.USER_CONTACT_INFO).then( (contactInfo) => {
                    this.showLoader(true);
                    //alert('RegisterUser API')
                    let phoneStorageData = new PhoneRequestObjectModel();
                    contactInfo = JSON.parse(contactInfo);
                    phoneStorageData = contactInfo;
                    // Prepare request model for RegisterUser API
                    let registerUserRequestData = new KYCRegisterUserRequestModel()
                    registerUserRequestData.AuthenticationToken = userAuthentication.Token;
                    registerUserRequestData.UserID = data.User.UserID;
                    registerUserRequestData.PassportImage = this.state.passportImageBinary;
                    registerUserRequestData.UtilityBillImage = this.state.utilityBillImageBinary;
                    // Prepare Address
                    var fetchedData = []; 
                    AsyncStorageUtil.getItem(stringConstant.STORE_KYC_USER_ADDRESS_INFO_KEY_VALUE).then( (data) => {
                        
                        if (data !== null) {
                            data = JSON.parse(data);
                            Object.keys(data).map((key, index) => ( 
                                fetchedData.push(this.dataIteration(data,key))
                            ))
                        }
                        
                        AsyncStorageUtil.getItem(stringConstant.STORE_KYC_USER_DYNAMIC_INFO_FOR_DOCUMENT_UPLOAD).then( (data) => {
                            if (data !== null) {
                                data = JSON.parse(data);
                                Object.keys(data).map((key, index) => ( 
                                    fetchedData.push(this.dataIteration(data,key))
                                ))
                            }
                            
                            // Prepare user info
                            AsyncStorageUtil.getItem(stringConstant.STORE_KYC_ADDITIONAL_INFO_KEY_VALUE).then( (data) => {
                                
                                if (data !== null) {
                                    data = JSON.parse(data);
                                    Object.keys(data).map((key, index) => ( 
                                        fetchedData.push(this.dataIteration(data,key))
                                    ));
                                }
                                if(phoneStorageData.PhoneNumber) {// infoResponse.User.Phone
                                    fetchedData.push(this.dataIterationWithKeyValue(phoneStorageData.PhoneNumber,"MobileNumber"));//infoResponse.User.Phone
                                }
                                //if(phoneStorageData.CountryCode) {
                                //    fetchedData.push(this.dataIterationWithKeyValue(phoneStorageData.CountryCode,"CountryCode"));
                                //}
                                //Alert.alert('',JSON.stringify(fetchedData));
                                registerUserRequestData.DataFields = fetchedData;

                                // prepare national id
                                var nationalIdData = [];
                                AsyncStorageUtil.getItem(stringConstant.STORE_KYC_NATIONAL_INFO_KEY_VALUE).then( (data) => { 
                                    
                                    if (data !== null) {
                                        data = JSON.parse(data);
                                        Object.keys(data).map((key, index) => ( 
                                            nationalIdData.push(this.dataIteration(data,key))
                                        ))
                                        registerUserRequestData.NationalIDs = nationalIdData;
                                    }

                                    // prepare consent data
                                    AsyncStorageUtil.getItem(stringConstant.GET_REGISTER_CONSENTS_INFO).then((consentData) => {
                                        consentData = JSON.parse(consentData);
                                        
                                        if (consentData.length> 0) {
                                            registerUserRequestData.Consent = true; 
                                            registerUserRequestData.Consents = consentData;
                                        } else {
                                            registerUserRequestData.Consent = false;
                                            registerUserRequestData.Consents = [];
                                        }
                                        this.showLoader(false);
                                        AsyncStorageUtil.storeItem(stringConstant.STORE_KYC_DATA_WITH_DOCUMENT_DYNAMIC_INFO,registerUserRequestData).then(() => {
                                            this.goToEmailVerificationScreen();
                                            //alert(JSON.stringify(registerUserRequestData))
                                        });

                                    });
                                }); 

                            });

                        });
                                                            
                    });
                });
            }
        });
        
    }

    goToEmailVerificationScreen = () => {
        Navigation.push(stackName.GoalScreenStack, {
            component: {
              name: screenId.KYCConfirmEmailScreen,
            }
        });
    }

    dataIteration =(data, key) => {
        let nameValue = new KYCRegisterUserArrayModel()
        nameValue.Name = key;
        nameValue.Value = data[key];
        return nameValue;
    }

    dataIterationWithKeyValue = (value,key) => {
        let nameValue = new KYCRegisterUserArrayModel()
        nameValue.Name = key;
        nameValue.Value = value;
        return nameValue;
    }
    /**** END ****/
}


    

    
