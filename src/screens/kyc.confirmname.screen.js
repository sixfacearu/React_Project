import React, { Component } from 'react';
import { View, Text, Picker, TextInput, TouchableOpacity, TouchableHighlight, ListView, Alert, Keyboard, NativeModules, Platform, Dimensions } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

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

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

var sortJsonArray = require('sort-json-array');

const propTypes = { countryCode: PropTypes.string, countryName: PropTypes.string, eVerifySupport: PropTypes.bool };
const defaultProps = { countryCode: "", countryName: "", eVerifySupport: false };
let arrayLength = 5;

export default class KYCConfirmNameScreen extends Component {
    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            isEVerifySupported: false,
            userNameFieldsSet: [],
            enableNextBtn: false,
            totalRequiredFields: 0,
            staticFlow: false,
            allDynamicFields: []
        };
    }

    componentDidMount() {
        AsyncStorageUtil.getItem(stringConstant.EVERIFY_SUPPORT_INFO).then((data) => {
            data = JSON.parse(data);
            this.setState({
                isEVerifySupported: data
            }, () => {
                if (this.state.isEVerifySupported === true) {
                    //Dynamic Flow
                    this.setState({
                        staticFlow: false
                    }, () => {
                        this.dynamicFlowStart();
                    });
                } else {
                    this.setState({
                        staticFlow: true
                    }, () => {
                        this.staticFlowStart();
                    });
                }
            });
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

    staticFlowStart = () => {
        AsyncStorageUtil.getItem(stringConstant.SAVE_USER_INFO).then((data) => {
            data = JSON.parse(data);
            if (data) {
                let userInfoFromStorage = new UserResponseModel();
                userInfoFromStorage = data.User;
                let userFieldArray = [
                    {
                        "Name": "FirstName",
                        "DisplayName": "First Name",
                        "Category": "PersonInfo",
                        "Required": true,
                        "Hint": "",
                        "MinLen": 1,
                        "MaxLen": commonConstant.MAX_CHARACTER_DEFAULT,
                        "value": userInfoFromStorage.FirstName
                    },
                    {
                        "Name": "LastName",
                        "DisplayName": "Last Name",
                        "Category": "PersonInfo",
                        "Required": true,
                        "Hint": "",
                        "MinLen": 1,
                        "MaxLen": commonConstant.MAX_CHARACTER_DEFAULT,
                        "value": userInfoFromStorage.LastName
                    }
                ];
                let tempTotalRequiredFields = 2;
                this.setState({
                    userNameFieldsSet: userFieldArray,
                    totalRequiredFields: tempTotalRequiredFields
                }, () => {
                    this.checkIfNextBtnCanBeEnabled();
                });
            }
        });
    }

    checkIfNextBtnCanBeEnabled = () => {
        let enableNextBtn = false;
        let requiredCount = 0;
        this.state.userNameFieldsSet.forEach(element => {
            if (element.Required && element.value) {
                requiredCount++;
            }
        });
        if (requiredCount === this.state.totalRequiredFields) {
            enableNextBtn = true;
        }
        let tempUserNameFieldsSet = this.state.userNameFieldsSet;
        this.setState({
            userNameFieldsSet: tempUserNameFieldsSet,
            enableNextBtn: enableNextBtn
        });
    }

    dynamicFlowStart = () => {
        this.getRegisterUserfieldAPI();
    }

    getRegisterUserfieldAPI = () => {
        this.showLoader(true);

        AsyncStorageUtil.getItem(stringConstant.GET_REGISTER_USER_FIELD_INFO).then((data) => {
            data = JSON.parse(data);
            if (data) {
                let userFieldArray = data;
                //alert(userFieldArray.length+JSON.stringify(userFieldArray));
                var filteredFields = [];
                //alert(JSON.stringify(userFieldArray));
                let tempTotalRequiredFields = 0;
                userFieldArray.forEach(element => {

                    let arrayElement = new RegisterUserFieldArrayResponseModel()
                    arrayElement = element;

                    for (let i = 0; i < RegisterUserFieldConstant.UserNameDynamicFields.length; i++) {
                        if (RegisterUserFieldConstant.UserNameDynamicFields[i] === arrayElement.Name) {
                            arrayElement.MinLen = parseInt(arrayElement.MinLen);
                            arrayElement.MaxLen = parseInt(arrayElement.MaxLen);
                            filteredFields.push(arrayElement);
                            element.isPlotted = true;
                            if (arrayElement.Required) {
                                tempTotalRequiredFields++;
                            }
                        }
                    }
                    // after adding isplotted bit -> save the register user field info
                });
                AsyncStorageUtil.storeItem(stringConstant.GET_REGISTER_USER_FIELD_INFO, userFieldArray);
                this.showLoader(false);
                this.setState({
                    allDynamicFields: userFieldArray,
                    userNameFieldsSet: filteredFields,
                    totalRequiredFields: tempTotalRequiredFields
                }, () => {
                    AsyncStorageUtil.getItem(stringConstant.SAVE_USER_INFO).then((data) => {
                        data = JSON.parse(data);
                        if (data) {
                            let userInfoFromStorage = new UserResponseModel();
                            userInfoFromStorage = data.User;
                            this.state.userNameFieldsSet.forEach(element => {
                                if (element.Name === userNameFields.FirstGivenName) {
                                    element.value = userInfoFromStorage.FirstName;
                                }
                                if (element.Name === userNameFields.FirstSurName) {
                                    element.value = userInfoFromStorage.LastName;
                                }
                            });
                            let tempUserNameFieldsSet = this.state.userNameFieldsSet;
                            this.setState({
                                userNameFieldsSet: tempUserNameFieldsSet
                            }, () => {
                                this.checkIfNextBtnCanBeEnabled();
                            });
                        }
                    });
                });
                //alert(filteredFields.length+JSON.stringify(filteredFields));
                this.showLoader(false);
            }
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
        // locally cache user data based on dynamic/static flow 
        // and redirect to date of birth screen and pass props same as kycaddress screen
        if (this.state.staticFlow) {
            let kycUser = new KycUserStaticLocalModel();
            this.state.userNameFieldsSet.forEach(element => {
                if (element.Name === userNameStaticFields.FirstName) {
                    kycUser.firstName = element.value;
                }
                if (element.Name === userNameStaticFields.LastName) {
                    kycUser.lastName = element.value;
                }
            });
            AsyncStorageUtil.storeItem(stringConstant.STORE_KYC_USER_STATIC_INFO, kycUser).then((success) => {
                //alert("You have reached the end of this feature!");
                //redirect to date of birth screen
                Navigation.push(stackName.GoalScreenStack, {
                    component : {
                        name: screenId.KYCDateOfBirthScreen
                    }
                });
            });
        } else {
            let kycUser = new KycUserDynamicLocalModel();
            this.state.userNameFieldsSet.forEach(element => {
                if (element.Name === userNameFields.FirstGivenName) {
                    kycUser.firstGivenName = element.value;
                }
                if (element.Name === userNameFields.FirstSurName) {
                    kycUser.firstSurName = element.value;
                }
                if (element.Name === userNameFields.MiddleName) {
                    kycUser.middleName = element.value;
                }
                if (element.Name === userNameFields.PersonInfoAdditionalFieldsFullName) {
                    kycUser.personalInfoAdditionalFieldsFullName = element.value;
                }
                if (element.Name === userNameFields.SecondSurname) {
                    kycUser.secondSurname = element.value;
                }
            });
            AsyncStorageUtil.storeItem(stringConstant.STORE_KYC_USER_DYNAMIC_INFO, kycUser).then((success) => {
                //redirect to date of birth screen
                Navigation.push(stackName.GoalScreenStack, {
                    component : {
                        name: screenId.KYCDateOfBirthScreen
                    }
                });
            });
        }
        //alert(this.state.countryCode+this.state.countryName+this.state.isEVerifySupported)
    }

    updateFields = (object, value) => {
        let requiredCount = 0;
        let enableNextBtn = false;
        this.state.userNameFieldsSet.forEach(element => {
            if (element.Name === object.Name) {
                //alert(element.Name);
                element.value = value;
            }
            if (element.Required && element.value) {
                requiredCount++;
            }
        });
        if (requiredCount === this.state.totalRequiredFields) {
            enableNextBtn = true;
        }
        let tempUserNameFieldsSet = this.state.userNameFieldsSet;
        this.setState({
            userNameFieldsSet: tempUserNameFieldsSet,
            enableNextBtn: enableNextBtn
        });
    }

    render() {

        var fields = [];
        for (let i = 0; i < this.state.userNameFieldsSet.length; i++) {
            let iconName = this.mapIconFromTextFields(this.state.userNameFieldsSet[i].Name)
            fields.push(
                <View key={i} style={styles.kycDynamicFieldCoverView}>
                    <Text style={styles.kycHeaderLabel}>{this.state.userNameFieldsSet[i].DisplayName}</Text>
                    <View style={[styles.kycInputFieldCoverView, styles.kycInputFieldBottomBorderLight]}>
                        <Image style={styles.kycIcon} source={iconName} />
                        <TextInput
                            ref={i}
                            value={this.state.userNameFieldsSet[i].value}
                            onChangeText={(value) => this.updateFields(this.state.userNameFieldsSet[i], value)}
                            style={[styles.kycTextInputField]}
                            maxLength={this.state.userNameFieldsSet[i].MaxLen ? this.state.userNameFieldsSet[i].MaxLen : commonConstant.MAX_CHARACTER_DEFAULT}
                            //placeholder={this.state.userNameFieldsSet[i].Hint ? this.state.userNameFieldsSet[i].Hint : ""}
                            returnKeyType='next'
                            onSubmitEditing={() => this.focusNextInputField(this.state.userNameFieldsSet.length > i + 1 ? i + 1 : i)}
                        //onSubmitEditing={() => this.focusNextInputField(i)}                  
                        />
                    </View>
                </View>
            )
        }

        return (
            <View style={commonStyles.kycNameMainContainer}>
                <View style={[styles.kycHeaderSection, { marginTop: 0 }]}>
                    {/* <TouchableOpacity style={[styles.backButton]} onPress={this.backButton}>
                        <Image style={styles.backIcon} source={require("../assets/backArrowWhite.png")} />
                    </TouchableOpacity> */}
                    <Text style={[styles.kycAddressHeader]}>{strings('kycNameScreen.title')}</Text>
                </View>
                <KeyboardAwareScrollView bounces={false} showsVerticalScrollIndicator={false} width={screenWidth} contentContainerStyle={{ alignItems: 'center' }}>
                    <View
                        style={
                            [
                                commonStyles.listViewRowWrapper,
                                commonStyles.alignChildCenter,
                                commonStyles.defaultMarginTopBottom
                            ]
                        }>
                        <Image style={[commonStyles.imageSize112]} source={require("../assets/userKYC.png")} />
                    </View>
                    {fields}
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
                                        this.state.enableNextBtn ?commonStyles.secTextColor:styles.disabledTextColor,
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

        if (objectName === userNameFields.FirstGivenName) {
            return require("../assets/user.png")
        } else if (objectName === userNameFields.FirstSurName) {
            return require("../assets/user.png")
        } else if (objectName === userNameFields.MiddleName) {
            return require("../assets/user.png")
        } else if (objectName === userNameFields.PersonInfoAdditionalFieldsFullName) {
            return require("../assets/user.png")
        } else if (objectName === userNameFields.SecondSurname) {
            return require("../assets/user.png")
        } else {
            return require("../assets/user.png")
        }
    }
}
KYCConfirmNameScreen.propTypes = propTypes;
KYCConfirmNameScreen.defaultProps = defaultProps;