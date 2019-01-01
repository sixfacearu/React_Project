import React, { Component } from 'react';
import {
    View, Text, Picker, TextInput,
    TouchableOpacity, TouchableHighlight, ListView,
    Alert, Keyboard, NativeModules, Platform, Dimensions
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePicker from 'react-native-modal-datetime-picker';
import Moment from 'react-moment';

import { strings } from '../config/i18/i18n';
import commonStyles from '../styles/common.style';
import fontFamilyStyles from '../styles/font.style';
import commonConstant from '../constants/common.constant';
import CountryRequestModel from '../models/country.request.model';
import LoaderComponent from '../components/loader.component';
import styles from '../styles/form.style';
import Image from 'react-native-remote-svg'
import AsyncStorageUtil from '../utils/asyncstorage.util';
import httpResponseModel from '../models/httpresponse.model';
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
import UpdatePersonRequestModel from '../models/update.person.request.model';
import UserAuthenticationModel from '../models/user.authentication.model';
import KycUserInfoDynamicModel from '../models/kyc.userinfo.dynamic.model';
import ModalComponentModel from '../models/modal.component.model';
import CommonModal from '../components/common.modal';
import commonUtil from '../utils/common.util';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

var sortJsonArray = require('sort-json-array');
var moment = require('moment');

export default class KYCDateOfBirthScreen extends Component {
    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            isEVerifySupported: false,
            userNameFieldsSet: [],
            enableNextBtn: false,
            totalRequiredFields: 0,
            staticFlow: false,
            isDateTimePickerVisible: false,
            selectedGoalDateLongFormat: strings('KycDobScreen.select_dob_placeholder'),
            dateValue: 0,
            selectedDay: '',
            selectedMonth: '',
            selectedYear: '',
            errorMessages: ' ',
            allDynamicFields: [],
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

    componentDidMount() {
        AsyncStorageUtil.getItem(stringConstant.EVERIFY_SUPPORT_INFO).then((data) => {
            data = JSON.parse(data);
            this.setState({
                isEVerifySupported: data,
                staticFlow: !data
            },() => {
                if(this.state.isEVerifySupported) {
                    AsyncStorageUtil.getItem(stringConstant.GET_REGISTER_USER_FIELD_INFO).then( (data) => {
                        data = JSON.parse(data);
                        if (data) {
                            let userFieldArray = data;
                            userFieldArray.forEach(element => {
                                for (let i = 0; i < RegisterUserFieldConstant.DateOfBirthFields.length; i++) {
                                    if (RegisterUserFieldConstant.DateOfBirthFields[i] === element.Name) {
                                        element.isPlotted = true;
                                    }
                                }
                                // after adding isplotted bit -> save the register user field info
                            });
                            AsyncStorageUtil.storeItem(stringConstant.GET_REGISTER_USER_FIELD_INFO, userFieldArray);
                            this.setState({
                                allDynamicFields: userFieldArray
                            });
                        }
                    }, (err) => {
    
                    });
                }
                AsyncStorageUtil.getItem(stringConstant.STORE_KYC_USER_DOB).then( (data) => {
                    data = JSON.parse(data);
                    if(data) {
                        this._handleDatePicked(data);
                    }
                });
            });
        });
    }

    _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

    _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

    _handleDatePicked = (date) => {
        this._hideDateTimePicker();
        this.setState({
            dateValue: date,
            selectedGoalDateLongFormat: moment(date).format('MMM DD, YYYY'),
            selectedDay: moment(date).format('DD'),
            selectedMonth: moment(date).format('MM'),
            selectedYear: moment(date).format('YYYY'),
            enableNextBtn: true
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

    updateUserInfo = () => {
        let selectedDateValue = moment(this.state.dateValue);
        let _18YearsBefore = moment(new Date()).subtract(18, 'year');
        let _110YearsBefore = moment(new Date()).subtract(110, 'year');
        let currentDate = moment(new Date());
        if(selectedDateValue.diff(_18YearsBefore, 'days') >= 0 && selectedDateValue.diff(currentDate) < 0) {
            // alert(strings('KycDobScreen.olderThan18'));
            this.setState({
                errorMessages: strings('KycDobScreen.olderThan18')
            });
            return;
        } else if(selectedDateValue.diff(_110YearsBefore, 'year') < 0) {
            // alert(strings('KycDobScreen.youngerThan110'));
            this.setState({
                errorMessages: strings('KycDobScreen.youngerThan110')
            });
            return;
        } else if(selectedDateValue.diff(currentDate) >= 0) {
            // alert(strings('KycDobScreen.cannotSelectFutureDate'));
            this.setState({
                errorMessages: strings('KycDobScreen.cannotSelectFutureDate')
            });
            return;
        } else {
            this.setState({
                selectedGoalDateLongFormat: moment(this.state.dateValue).format('MMM DD, YYYY'),
                selectedDay: moment(this.state.dateValue).format('DD'),
                selectedMonth: moment(this.state.dateValue).format('MM'),
                selectedYear: moment(this.state.dateValue).format('YYYY'),
                enableNextBtn: true,
                errorMessages: " "
            });
        }
        if (this.state.staticFlow) {
            AsyncStorageUtil.getItem(stringConstant.STORE_KYC_USER_STATIC_INFO).then( (data) => {
                data = JSON.parse(data);
                AsyncStorageUtil.getItem(stringConstant.SAVE_USER_INFO).then( (userData) => {
                    let userAuthentication = new UserAuthenticationModel();
                    userData = JSON.parse(userData);
                    userAuthentication = userData.AuthenticationToken;
                    if(data && userData && !this.state.showActivityIndicator) {
                        let kycUser = new KycUserStaticLocalModel();
                        kycUser = data;
                        let requestUpdatePersonData = new UpdatePersonRequestModel();
                        requestUpdatePersonData.AuthenticationToken = userAuthentication.Token;
                        requestUpdatePersonData.FirstName = kycUser.firstName;
                        requestUpdatePersonData.LastName = kycUser.lastName;
                        requestUpdatePersonData.DayOfBirth = this.state.selectedDay;
                        requestUpdatePersonData.MonthOfBirth = this.state.selectedMonth;
                        requestUpdatePersonData.YearOfBirth = this.state.selectedYear;
                        this.showLoader(true);
                        KYCInterface.updatePerson(requestUpdatePersonData).then( (response) => {
                            let res = new B21ResponseModel();
                            res = response;
                            if(res.ErrorCode == commonConstant.SUCCESS_CODE) {
                                //Navigate to source of funds screen user story #735
                                //Alert.alert("Data saved sucessfully","You have reached the end of this feature!")
                                Navigation.push(stackName.GoalScreenStack, {
                                    component : {
                                        name: screenId.KYCSourceOfFundsScreen
                                    }
                                });
                            } else if(res.ErrorCode == commonConstant.ACCESS_DENIED_ERROR_CODE) {
                                //Navigate to login screen
                                this.showCustomAlert(true,res.ErrorMsg);
                            } else {
                                this.showCustomAlert(true,res.ErrorMsg);
                            }
                            this.showLoader(false);
                        }, (err) => {
                            this.showLoader(false);
                            this.showCustomAlert(true,strings('common.api_failure'));
                        });
                    }
                });
            });
        } else {
            AsyncStorageUtil.getItem(stringConstant.STORE_KYC_USER_DYNAMIC_INFO).then( (data) => {
                data = JSON.parse(data);
                AsyncStorageUtil.getItem(stringConstant.SAVE_USER_INFO).then( (userData) => {
                    let userAuthentication = new UserAuthenticationModel();
                    userData = JSON.parse(userData);
                    userAuthentication = userData.AuthenticationToken;
                    if(data && userData && !this.state.showActivityIndicator) {
                        let kycUser = new KycUserDynamicLocalModel();
                        kycUser = data;
                        let requestUpdatePersonData = new UpdatePersonRequestModel();
                        requestUpdatePersonData.AuthenticationToken = userAuthentication.Token;
                        
                        let kycUserInfo = new KycUserInfoDynamicModel();

                        if(kycUser.firstGivenName) {
                            requestUpdatePersonData.FirstName = kycUser.firstGivenName;
                            kycUserInfo.FirstGivenName = kycUser.firstGivenName;
                        }
                        if(kycUser.firstSurName) {
                            requestUpdatePersonData.LastName = kycUser.firstSurName;
                            kycUserInfo.FirstSurName = kycUser.firstSurName;
                        }
                        if(kycUser.secondSurname) {
                            requestUpdatePersonData.SecondLastName = kycUser.secondSurname;
                            kycUserInfo.SecondSurname = kycUser.secondSurname;
                        }
                        if(kycUser.personalInfoAdditionalFieldsFullName) {
                            requestUpdatePersonData.FullName = kycUser.personalInfoAdditionalFieldsFullName;
                            kycUserInfo.PersonInfoAdditionalFieldsFullName = kycUser.personalInfoAdditionalFieldsFullName;
                        }
                        requestUpdatePersonData.DayOfBirth = this.state.selectedDay;
                        requestUpdatePersonData.MonthOfBirth = this.state.selectedMonth;
                        requestUpdatePersonData.YearOfBirth = this.state.selectedYear;
                        
                        kycUserInfo.DayOfBirth = this.state.selectedDay;
                        kycUserInfo.MonthOfBirth = this.state.selectedMonth;
                        kycUserInfo.YearOfBirth = this.state.selectedYear;
                        
                        AsyncStorageUtil.storeItem(stringConstant.STORE_KYC_USER_DYNAMIC_INFO_FOR_DOCUMENT_UPLOAD,kycUserInfo);
                       
                        
                        this.showLoader(true);
                        KYCInterface.updatePerson(requestUpdatePersonData).then( (response) => {
                            let res = new B21ResponseModel();
                            res = response;
                            if(res.ErrorCode == commonConstant.SUCCESS_CODE) {
                                //alert(JSON.stringify(this.state.allDynamicFields));
                                // Read user story #522,discussion #573 
                                AsyncStorageUtil.storeItem(stringConstant.STORE_KYC_USER_DOB, this.state.dateValue).then( (success) => {

                                });
                                AsyncStorageUtil.getItem(stringConstant.GET_REGISTER_NATIONAL_ID_INFO).then( (data) => {
                                    //alert(data);
                                    AsyncStorageUtil.getItem(stringConstant.GET_REGISTER_CONSENTS_INFO).then( (consentInfoData) => {
                                        let nationalIdFields = JSON.parse(data);
                                        let consentInfo = JSON.parse(consentInfoData);
                                        let additionalDynamicField = [];
                                        this.state.allDynamicFields.forEach(element => {
                                            if(!element.isPlotted && element.Name !== "MobileNumber") { //refer discusion #573
                                                additionalDynamicField.push(element);
                                            }
                                        });
                                        //alert(JSON.stringify(additionalDynamicField));
                                        if(additionalDynamicField.length) {
                                            Navigation.push(stackName.GoalScreenStack, {
                                                component : {
                                                    name: screenId.KYCAdditionalInformationScreen
                                                }
                                            });
                                        } else if((additionalDynamicField.length == 0 && nationalIdFields.length) || consentInfo.length) {
                                            //National Id field screen, user story #523
                                            Navigation.push(stackName.GoalScreenStack, {
                                                component : {
                                                    name: screenId.KYCUniqueIdentificationScreen
                                                }
                                            });
                                        } else {
                                            //source of fund screen, user story #735
                                            Navigation.push(stackName.GoalScreenStack, {
                                                component : {
                                                    name: screenId.KYCSourceOfFundsScreen
                                                }
                                            });
                                        }
                                    });
                                });
                            } else if(res.ErrorCode == commonConstant.ACCESS_DENIED_ERROR_CODE) {
                                //Navigate to login screen
                                this.showCustomAlert(true,res.ErrorMsg);
                            } else {
                                this.showCustomAlert(true,res.ErrorMsg);
                            }
                            this.showLoader(false);
                        }, (err) => {
                            this.showLoader(false);
                            this.showCustomAlert(true,strings('common.api_failure'));
                        });
                    }
                });
            });
        }
    }

    render() {

        return (
            <View style={[commonStyles.kycDOBMainContainer]}>
                <View style={styles.kycCountryHeaderSection}>
                    <View style={[styles.kycHeaderSection,{marginTop:0}]}>
                    <TouchableOpacity style={[styles.backButton]} onPress={this.backButton}>
                        <Image style={styles.backIcon} source={require("../assets/backArrowWhite.png")}/>
                    </TouchableOpacity>
                    <Text style={[styles.kycAddressHeader]}>{ strings('KycDobScreen.title') }</Text>
                </View>  
                    <Image style={styles.kycLogo} source={ require('../assets/dobKYC.png') }/>
                </View>
                <View style={styles.kycCountryFieldAndButtonSection}>
                    <View style={[commonStyles.kycFormView,commonStyles.width70pc]}>
                        <View style={[commonStyles.alignChildCenter]}>
                            <TouchableHighlight
                                style = {
                                    [
                                        commonStyles.dateTouchableViewFlatStyleBottomOnly,
                                        commonStyles.largeMarginTopBottom,
                                        commonStyles.fullWidth
                                    ]
                                }
                                onPress={this._showDateTimePicker} underlayColor="transparent">
                                <View style = { [commonStyles.fullWidth,commonStyles.flexDirectionRow,commonStyles.alignItemsCenter ]}>
                                    <Image style={[commonStyles.widHei28,commonStyles.marginLeft5]} source={ require('../assets/dob_icon.png') }/>
                                    <Text style={[commonStyles.dateSelectorFieldLeft,commonStyles.marginLeft15,{paddingTop:Platform.OS === "ios"?5:2}]}>
                                        {this.state.selectedGoalDateLongFormat}
                                    </Text>
                                </View>
                            </TouchableHighlight>
                            <DateTimePicker
                                isVisible={this.state.isDateTimePickerVisible}
                                onConfirm={this._handleDatePicked}
                                onCancel={this._hideDateTimePicker}
                            />
                        </View>
                        <Text 
                            style = {
                                [
                                    commonStyles.fontSize16,
                                    fontFamilyStyles.robotoRegular,
                                    commonStyles.secTextColor
                                ]
                        }>
                            { this.state.errorMessages }
                        </Text>
                    </View>
                    <TouchableOpacity
                        activeOpacity={1}
                        disabled={!this.state.enableNextBtn}
                        style = {[styles.kycNextButton,
                            this.state.enableNextBtn ?styles.kycNextButton:styles.kycNextButtonDisabled
                        ]}
                        onPress = { this.updateUserInfo }>
                        <Text style = { [commonStyles.fontSizeLarge, 
                            this.state.enableNextBtn ?commonStyles.secTextColor:styles.disabledTextColor,
                            commonStyles.textAlignCenter] } >
                            { strings('common.next_btn') } 
                        </Text>
                    </TouchableOpacity>
                </View>
                <LoaderComponent showLoader = { this.state.showActivityIndicator }/>
                <CommonModal modalComponent = {this.state.modalComponent}/>
            </View>
        );
    }
}