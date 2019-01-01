import React, { Component } from 'react';
import { View, Text, Picker, TextInput, TouchableOpacity, TouchableHighlight, ListView, Alert, Keyboard, NativeModules, Platform, Dimensions } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Switch } from 'react-native-switch';

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

import commonTheme from '../themes/common.theme';
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

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

var sortJsonArray = require('sort-json-array');

export default class KYCUniqueIdentificationScreen extends Component {
    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            isEVerifySupported: false,
            additionalFieldsSet: [],
            enableNextBtn: false,
            totalRequiredFields: 0,
            staticFlow: false,
            allDynamicFields: [],
            consentPresent: false,
            acceptConsents: false
        };
    }

    componentDidMount() {
        AsyncStorageUtil.getItem(stringConstant.EVERIFY_SUPPORT_INFO).then((data) => {
            data = JSON.parse(data);
            this.setState({
                isEVerifySupported: data
            });
            this.dynamicFlowStart();
        });
    }

    /**
     * CALL THIS METHOD TO SHOW OR HIDE THE PROGRESS LOADER
     */
    showLoader = (bit) => {
        this.setState({
            showActivityIndicator: bit
        });
    }

    checkIfNextBtnCanBeEnabled = () => {
        let enableNextBtn = false;
        let requiredCount = 0;
        this.state.additionalFieldsSet.forEach(element => {
            if (element.Required && element.value) {
                requiredCount++;
            }
        });

        if (this.state.consentPresent) {
            let tempConsent = !this.state.acceptConsents;
            if (tempConsent) {
                requiredCount++;
            }
            this.setState({
                acceptConsents: !this.state.acceptConsents
            });
        }
        if (requiredCount === this.state.totalRequiredFields) {
            enableNextBtn = true;
        }
        let tempadditionalFieldsSet = this.state.additionalFieldsSet;
        this.setState({
            additionalFieldsSet: tempadditionalFieldsSet,
            enableNextBtn: enableNextBtn
        });
    }

    dynamicFlowStart = () => {
        this.getNationalIDAPI();
    }

    getNationalIDAPI = () => {
        this.showLoader(true);

        AsyncStorageUtil.getItem(stringConstant.GET_REGISTER_NATIONAL_ID_INFO).then((data) => {
            data = JSON.parse(data);
            let userFieldArray = [];
            let tempTotalRequiredFields = 0;
            if (data) {
                userFieldArray = data;
                //alert(userFieldArray.length+JSON.stringify(userFieldArray));
                var filteredFields = [];
                //alert(JSON.stringify(userFieldArray));
                tempTotalRequiredFields = 0;
                userFieldArray.forEach(element => {

                    let arrayElement = new RegisterUserFieldArrayResponseModel()
                    arrayElement = element;
                    arrayElement.MinLen = parseInt(arrayElement.MinLen);
                    arrayElement.MaxLen = parseInt(arrayElement.MaxLen);
                    filteredFields.push(arrayElement);
                    if (arrayElement.Required) {
                        tempTotalRequiredFields++;
                    }

                    // after adding isplotted bit -> save the register user field info
                });
                this.showLoader(false);
                this.setState({
                    allDynamicFields: userFieldArray,
                    additionalFieldsSet: filteredFields,
                    totalRequiredFields: tempTotalRequiredFields
                });
            }
            AsyncStorageUtil.getItem(stringConstant.GET_REGISTER_CONSENTS_INFO).then((consentData) => {
                consentData = JSON.parse(consentData);
                if (consentData.length) {
                    let consentDataStr = "";
                    consentData.forEach((element, index) => {
                        if (index == 0) {
                            consentDataStr += ": ";
                        }
                        consentDataStr += element;
                        if (index == consentData.length - 1) {
                            consentDataStr += ".";
                        } else {
                            consentDataStr += ", ";
                        }
                    });
                    //alert(consentDataStr);
                    let tempTotalRequiredFields = this.state.totalRequiredFields;
                    tempTotalRequiredFields++;
                    this.setState({
                        consentPresent: true,
                        totalRequiredFields: tempTotalRequiredFields,
                        consentData: consentDataStr
                    }, () => {
                        //alert(this.state.totalRequiredFields)
                    });
                } else {
                    this.setState({
                        consentPresent: false
                    });
                }
                AsyncStorageUtil.getItem(stringConstant.STORE_KYC_NATIONAL_INFO).then((nationalInfoData) => {
                    nationalInfoData = JSON.parse(nationalInfoData);
                    if(nationalInfoData.length){
                        this.setState({                            
                            additionalFieldsSet: nationalInfoData
                        }, () => {
                            if(!this.state.consentPresent){
                                let tempTotalRequiredFields = 0;
                                this.state.additionalFieldsSet.forEach(element => {
                                    if(element.Required && element.value) {
                                        tempTotalRequiredFields++;
                                    }
                                });
                                if(tempTotalRequiredFields == this.state.totalRequiredFields) {
                                    this.setState({
                                        enableNextBtn: true
                                    });
                                }
                            }
                        });
                    }
                });
            });
        }, (err) => {
            this.showLoader(false);
        });
    }

    showLoader = (bit) => { // call this function to show/hide the loader
        this.setState({
            showActivityIndicator: bit
        });
    }

    focusNextInputField = (nextField) => {
        this.refs[nextField].focus();
    }

    backButton = () => {
        Navigation.pop(this.props.componentId);
    }

    updateUserInfo = () => {
        //alert("Data, locally saved, you have reached the end of this feature!");
        let tempadditionalFieldsSet = {};
        this.state.additionalFieldsSet.forEach(element => {
            tempadditionalFieldsSet[element.Name] = element.value;
        });
        AsyncStorageUtil.storeItem(stringConstant.STORE_KYC_NATIONAL_INFO, this.state.additionalFieldsSet).then((success) => {
            // Redirect to source of funds screen
            AsyncStorageUtil.storeItem(stringConstant.STORE_KYC_NATIONAL_INFO_KEY_VALUE,tempadditionalFieldsSet);
            Navigation.push(stackName.GoalScreenStack, {
                component : {
                    name: screenId.KYCSourceOfFundsScreen
                }
            });
        });

        //alert(this.state.countryCode+this.state.countryName+this.state.isEVerifySupported)
    }

    updateFields = (object, value) => {
        let requiredCount = 0;
        let enableNextBtn = false;
        this.state.additionalFieldsSet.forEach(element => {
            if (element.Name === object.Name) {
                //alert(element.Name);
                element.value = value;
            }
            if (element.Required && element.value) {
                requiredCount++;
            }
        });
        if (this.state.consentPresent) {
            let tempConsent = this.state.acceptConsents;
            if (tempConsent) {
                requiredCount++;
            }
        }
        if (requiredCount === this.state.totalRequiredFields) {
            enableNextBtn = true;
        }
        let tempadditionalFieldsSet = this.state.additionalFieldsSet;
        this.setState({
            additionalFieldsSet: tempadditionalFieldsSet,
            enableNextBtn: enableNextBtn
        });
    }

    render() {

        var fields = [];
        for (let i = 0; i < this.state.additionalFieldsSet.length; i++) {
            let iconName = this.mapIconFromTextFields(this.state.additionalFieldsSet[i].Name)
            fields.push(
                <View key={i} style={styles.kycDynamicFieldCoverView}>
                    <Text style={styles.kycHeaderLabel}>{this.state.additionalFieldsSet[i].DisplayName}</Text>
                    <View style={[styles.kycInputFieldCoverView, styles.kycInputFieldBottomBorderLight]}>
                        <Image style={styles.kycIcon} source={iconName} />
                        <TextInput
                            ref={i}
                            value={this.state.additionalFieldsSet[i].value}
                            onChangeText={(value) => this.updateFields(this.state.additionalFieldsSet[i], value)}
                            style={[styles.kycTextInputField]}
                            maxLength={this.state.additionalFieldsSet[i].MaxLen ? this.state.additionalFieldsSet[i].MaxLen : commonConstant.MAX_CHARACTER_DEFAULT}
                            //placeholder={this.state.additionalFieldsSet[i].Hint ? this.state.additionalFieldsSet[i].Hint : ""}
                            returnKeyType='next'
                            onSubmitEditing={() => this.focusNextInputField(this.state.additionalFieldsSet.length > i + 1 ? i + 1 : i)}
                        />
                    </View>
                </View>
            )
        }

        return (
            <View style={commonStyles.kycUniqueIdentificationMainContainer}>
                <View style={[styles.kycHeaderSection, { marginTop: 0 }]}>
                    <TouchableOpacity style={[styles.backButton]} onPress={this.backButton}>
                        <Image style={styles.backIcon} source={require("../assets/backArrowWhite.png")} />
                    </TouchableOpacity>
                    <Text style={[styles.kycAddressHeader]}>{strings('kycUniqueIdentification.title')}</Text>
                </View>
                <KeyboardAwareScrollView bounces={false}
                    style={[commonStyles.paddignTp40]}
                    showsVerticalScrollIndicator={false}
                    width={screenWidth}
                    contentContainerStyle={{ alignItems: 'center' }}>
                    {fields}
                    <View
                        style={
                            [
                                commonStyles.agreeConsentSection,
                                { marginTop: this.state.additionalFieldsSet.length ? 40 : 0 },
                                { display: this.state.consentPresent ? "flex" : "none" }
                            ]
                        }>
                        <Switch
                            value={this.state.acceptConsents}
                            onValueChange={this.checkIfNextBtnCanBeEnabled}
                            circleSize={30}
                            circleBorderWidth={0}
                            backgroundActive={commonTheme.TERTIARY_BTN_BACKGROUND_COLOR}
                            backgroundInactive={commonTheme.DISABLED_BTN_BACKGROUND_COLOR}
                            changeValueImmediately={true}
                        />
                        <Text style={commonStyles.agreeConsentText}>{strings('kycUniqueIdentification.agree_consent')}</Text>
                    </View>
                    <View style={
                        [
                            commonStyles.width80pc, commonStyles.margintp10,
                            { display: this.state.consentPresent ? "flex" : "none" }
                        ]
                    }>
                        <Text>{strings('kycUniqueIdentification.consent')}{this.state.consentData}</Text>
                    </View>
                    <TouchableOpacity
                        activeOpacity={1}
                        disabled={!this.state.enableNextBtn}
                        style={commonStyles.kycFloatingNextButton}
                        onPress={this.updateUserInfo}>
                        <View
                            style={
                                [
                                    commonStyles.defaultSmallPaddingBtn,
                                    this.state.enableNextBtn ? commonStyles.btnBackColorTerriary : commonStyles.btnDisabledbackgroundColor
                                ]
                            }>
                            <Text
                                style={
                                    [
                                        commonStyles.fontSizeLarge,
                                        this.state.enableNextBtn ? commonStyles.secTextColor : styles.disabledTextColor,
                                        commonStyles.textAlignCenter,
                                    ]
                                } >
                                {strings('common.next_btn')}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </KeyboardAwareScrollView>
                <LoaderComponent showLoader={this.state.showActivityIndicator} />
            </View>
        );
    }

    mapIconFromTextFields = (objectName) => {
        return require("../assets/kyc_gov_id_icon.png")
    }
}