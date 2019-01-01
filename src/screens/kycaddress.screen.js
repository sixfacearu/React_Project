import React, { Component } from 'react';
import { View, Text, Picker, TextInput,TouchableOpacity,TouchableHighlight, ListView, Alert,Keyboard ,NativeModules, Platform, Dimensions } from 'react-native';
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
import RegisterUserFieldArrayResponseModel from '../models/registerUserField.response.array.model';
import RegisterUserFieldLocalArrayModel from '../models/registerUserField.local.array.model';
import addressFieldType from '../constants/addressFields.type.enum';
import StateResponseModel from '../models/state.response.model';
import AddressMainRequestModel from '../models/address.main.request.model';
import AddressRequestModel from '../models/address.request.model';

import RegisterUserFieldConstant from '../constants/registerUserField.constant.keys';

import ModalComponentModel from '../models/modal.component.model';
import CommonModal from '../components/common.modal';
import commonUtil from '../utils/common.util';

const screenWidth = Dimensions.get('window').width;
const screenHeight= Dimensions.get('window').height;

var sortJsonArray = require('sort-json-array');
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

const propTypes = { countryCode : PropTypes.string, countryName:PropTypes.string, eVerifySupport:PropTypes.bool };
const defaultProps = { countryCode: "", countryName:"", eVerifySupport:false };
let arrayLength = 5;

export default class KYCAddressScreen extends Component {
    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);
        
        this.state = {
            countryName:this.props.countryName,
            CountryCode:this.props.countryCode,
            isEVerifySupported: this.props.eVerifySupport,
            addressFieldsSet:[],

            //States data
            statesNameArray:[],
            statesList:ds,
            StateProvinceCode:"",
            selectedStateName:"",
            showPicker: false,

            //Other
            enableNextBtn: false,
            showNextBtn: false,
            LocationAdditionalFieldsAddress1 :"",
            Suburb:"",
            City :"",
            PostalCode :"",
            BuildingNumber :"",
            StreetName :"",
            StreetType :"",
            UnitNumber :"",
            enableScrollViewScroll: true,
            addressType: "Home",

            isLocationField1Available: false,
            modalComponent : {}
        };
    }
    
    componentWillReceiveProps (nextProps) {
        console.log(nextProps);
        if(!_.isEqual(this.props.countryCode,nextProps.countryCode)) {
          this.setState({
            countryName: nextProps.countryName,
            CountryCode: nextProps.countryCode,
            isEVerifySupported: nextProps.eVerifySupport,
          });
        } 
    }

    /**
     * SETUP FOR CUSTOM ALERT
     */
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

    // Alert Type Login Redirection
    redirectToLogin = () => {
        console.log("redirectToLogin");
        this.showCustomAlert(false);
    }
    showCustomAlertForLoginScreenRedirection= (visible, message) => {
        this.setState({
            modalComponent : commonUtil.setAlertComponent(visible,message,strings('common.okay'),"",true,false,() => this.redirectToLogin(), () => this.rightButtonClicked(),() => this.closeButtonClicked())
        });
    }

    // Alert Type Retry States List Loading
    reloadStatesList = () => {
        console.log("reloadStatesList");
        this.showCustomAlert(false);
        this.getStateSListAPICall();
    }
    showCustomAlertForRetryStatesLoading = (visible, message) => {
        this.setState({
            modalComponent : commonUtil.setAlertComponent(visible,message,strings('common.retry'),"",true,false,() => this.reloadStatesList(), () => this.rightButtonClicked(),() => this.closeButtonClicked())
        });
    }
    /**
     * SETUP FOR CUSTOM ALERT END
     */

    componentDidMount () {

        this.setState({
            statesList: this.state.statesList.cloneWithRows(this.state.statesNameArray)
        });
        this.decideDynamicOrStaticFlow();
    }
    
    /**
     * DECISION ON DYNAMIC OR STATIC FLOW BASED ON COUNTRY SELECTION IN PREVIOUS SCREEN
     */
    decideDynamicOrStaticFlow = () => {

        if(this.state.isEVerifySupported === true) { // i.e dynamic flow //
            this.getRegisterUserfieldAPI();
        
        } else { // i.e static flow //
            AsyncStorageUtil.removeItem(stringConstant.GET_REGISTER_USER_FIELD_INFO);
            AsyncStorageUtil.removeItem(stringConstant.GET_REGISTER_NATIONAL_ID_INFO);
            AsyncStorageUtil.removeItem(stringConstant.GET_REGISTER_CONSENTS_INFO);
            
            this.setState({
                addressFieldsSet:RegisterUserFieldConstant.addressFieldStaticArray,
                showNextBtn: true
            })
            this.getStateSListAPICall();
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
     * SYNCHRONIZES SCROLLVIEWS OF MAIN SCROLLVIEW AND STATE PICKERS' SCROLLVIEW BY ENABLE/DISABLE
     */
    customEnableScrollView = (isEnable) => {
        this.setState({ enableScrollViewScroll: isEnable });
    }

    /**
     * SHOW/HIDE STATE PICKER & IF THERE IS NO DATA IN STATE PICKER THEN IT WILL PROMPT TO RETRY
     */
    openStateSelector = () => {
        if(this.state.statesNameArray.length > 0) {
            if(this.state.showPicker) {
                this.setState({
                    showPicker: false,
                    enableScrollViewScroll: true
                });
            } else {
                this.setState({
                    showPicker: true,
                });
    
            }
        } else {
            /*
            Alert.alert(
                '',
                strings('kycAddressScreen.retry_states_list_loading'),
                [
                  {text: 'Retry', onPress: () => {
                    this.getStateSListAPICall();
                    }},
                ],
                { cancelable: false }
              )
            */
            this.showCustomAlertForRetryStatesLoading(true,strings('kycAddressScreen.retry_states_list_loading'))
        }
    }

    /**
     * STATE PICKER LIST CELL
     */
    renderStateView = (data) => {
        return (
            <TouchableOpacity style={styles.pickerRowcontainer} onPress={this._onStateItemPressed.bind(this,data)}>
                <Text style = { styles.statePickerText }>
                    { data.StateName }
                </Text>
            </TouchableOpacity>
        );
    }

    /**
     * ON CLICKING A STATE FROM STATE PICKER
     */
    _onStateItemPressed = (data) => {
        console.log(data,'_onStateItemPressed');
        this.setState({
            selectedStateName:data.StateName,
            StateProvinceCode:data.StateCode
        }, () => {
            this.openStateSelector();
            this.changeNextBtnState();
        });

    }

    /**
     * AUTO FOCUS ON NEXT INPUT-FIELD WHILE BYPASSING THE STATE SELECTOR FIELD
     */
    focusNextInputField = (nextField) => {
        
        if(this.state.addressFieldsSet[nextField].Name !== addressFieldType.StateProvinceCode) {
            this.refs[nextField].focus();
        } else if(this.state.addressFieldsSet.length>nextField+1){
            this.refs[nextField+1].focus();
        }
    }

    /**
     * SETS VALUE OF INPUT FIELDS IN ACCESSIBLE VARIABLES AND CHECK FOR NEXT BUTTON STATUS
     */
    checkIfFieldsAreNotEmpty = (type, value) => {

        if (type == addressFieldType.LocationAdditionalFieldsAddress1) {
            this.setState({
                LocationAdditionalFieldsAddress1: value
            }, 
            () => {
                this.changeNextBtnState();
            });
        }
        else if (type == addressFieldType.Suburb) {
            this.setState({
                Suburb: value
            }, () => {
                this.changeNextBtnState();
            });
        }
        else if (type == addressFieldType.City) {
            this.setState({
                City: value
            }, () => {
                this.changeNextBtnState();
            });
        }
        else if (type == addressFieldType.PostalCode) {
            this.setState({
                PostalCode: value
            }, () => {
              this.changeNextBtnState();
            });
        }
        else if (type == addressFieldType.BuildingNumber) {
            this.setState({
                BuildingNumber: value
            }, () => {
              this.changeNextBtnState();
            });
        }
        else if (type == addressFieldType.StreetName) {
            this.setState({
                StreetName: value
            }, () => {
              this.changeNextBtnState();
            });
          }
        else if (type == addressFieldType.StreetType) {
            this.setState({
            StreetType: value
            }, () => {
            this.changeNextBtnState();
            });
        }
        else if (type == addressFieldType.UnitNumber) {
            this.setState({
            UnitNumber: value
            }, () => {
            this.changeNextBtnState();
            });
        }
    }
    
    /**
     * ENABLE/DISABLE NEXT BUTTON BASED ON MINIMUM LENGTH AND REQUIRED/OPTIONAL FIELDS
     */
    changeNextBtnState = () => {
        
        for(let i = 0; i < this.state.addressFieldsSet.length; i++){

            let varName = this.state.addressFieldsSet[i].Name;
            let value = this.state[`${varName}`];

            let isRequired = this.state.addressFieldsSet[i].Required;

            //Add for required and min length
            if( (isRequired && value.length >= Number(this.state.addressFieldsSet[i].MinLen)) || (!isRequired)) {
                this.setState({
                    enableNextBtn: true
                });
            } else {
                this.setState({
                    enableNextBtn: false
                });
                break;
            }
        }
        
    }
    
    /**
     * ON NEXT BUTTONS' ACTION
     */
    addAddressAndSaveData = () => {
        
        this.addAddressAPI();
    }

    /**
     * LAYOUT RENDERING
     */
    render() {

        var fields = [];
        var fieldCount = 1; // for keyboard dismiss on last field
        for(let i = 0; i < this.state.addressFieldsSet.length; i++){
            let iconName = this.mapIconFromTextFields(this.state.addressFieldsSet[i].Name)

            if(this.state.addressFieldsSet[i].Name === addressFieldType.StateProvinceCode) {
                fields.push(
                    <View key={i}>
                        <View style={styles.kycDynamicFieldCoverView}>
                            <Text style={styles.kycHeaderLabel}>{this.state.addressFieldsSet[i].DisplayName}</Text>
                            <TouchableHighlight underlayColor='transparent' onPress = { this.openStateSelector }>
                            <View style={[styles.kycInputFieldCoverView,styles.kycInputFieldBottomBorderLight]}>
                                <Image style={styles.kycIcon} source={iconName} />
                                <Text style={[styles.kycTextStateField]}>{this.state.selectedStateName}</Text>
                            </View>
                            </TouchableHighlight>
                        </View>
                        <View style={[styles.stateDropdownView, 
                                    {display:this.state.showPicker? 'flex':'none'}]}
                                    onStartShouldSetResponderCapture={() =>this.customEnableScrollView(false)}
                                    >
                            <ListView
                            style={{flex:1}} 
                            dataSource={this.state.statesList} 
                            renderRow={(data) => this.renderStateView(data) }
                            />
                        </View>
                        
                    </View>
                    
                )
            } else {
                fields.push(
                    <View key={i} style={styles.kycDynamicFieldCoverView} onStartShouldSetResponderCapture={() =>this.customEnableScrollView(true)}>
                        <Text style={styles.kycHeaderLabel}>{this.state.addressFieldsSet[i].DisplayName}</Text>
                        <View style={[styles.kycInputFieldCoverView,styles.kycInputFieldBottomBorderLight]}>
                            <Image style={styles.kycIcon} source={iconName} />
                            <TextInput
                            ref={i}
                            style={[styles.kycTextInputField]}
                            //placeholder={this.state.addressFieldsSet[i].Hint}
                            maxLength={Number(this.state.addressFieldsSet[i].MaxLen)}
                            returnKeyType='next'
                            onSubmitEditing={() => this.focusNextInputField(this.state.addressFieldsSet.length>i+1?i+1:i)}  
                            onChangeText={(fieldValue) => this.checkIfFieldsAreNotEmpty(this.state.addressFieldsSet[i].Name, fieldValue)}   
                            //blurOnSubmit={this.state.addressFieldsSet.length-1 === fieldCount? true:false }               
                            />
                        </View>
                    </View>
                )
                fieldCount++;
            }
            
        }
        
        return (
        <View style={styles.kycAddressMainContainer} 
        onStartShouldSetResponderCapture={() => this.customEnableScrollView(true)}>

            <View style={[styles.kycHeaderSection,{marginTop:0}]}>
                <TouchableOpacity style={[styles.backButton]} onPress={this.backButton}>
                     <Image style={styles.backIcon} source={require("../assets/backArrowWhite.png")}/>
                </TouchableOpacity>
                <Text style={[styles.kycAddressHeader]}>{ strings('kycAddressScreen.title') }</Text>
            </View>   
            <KeyboardAwareScrollView  
            scrollEnabled={this.state.enableScrollViewScroll}
            onStartShouldSetResponderCapture={() =>this.customEnableScrollView(true)}
            bounces={false} showsVerticalScrollIndicator={false} width={screenWidth} contentContainerStyle={{alignItems:'center'}}>
                {fields}
                <TouchableOpacity
                            disabled={!this.state.enableNextBtn}
                            activeOpacity = { 1 }
                            style = {[
                                {display:this.state.showNextBtn?"flex":"none"},
                                this.state.enableNextBtn ?styles.kycFloatingNextButton:styles.kycFloatingDisabledNextButton]}
                            onPress = { this.addAddressAndSaveData }>
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
     * ICON MAPPING WITH INPUT FIELDS
     */
    mapIconFromTextFields = (objectName) => {

        if(objectName === addressFieldType.LocationAdditionalFieldsAddress1) {
            return require("../assets/kyc_location_icon.png")
        } else if(objectName === addressFieldType.Suburb) {
            return require("../assets/kyc_suburb_icon.png")
        } else if(objectName === addressFieldType.City) {
            return require("../assets/kyc_city_icon.png")
        } else if(objectName === addressFieldType.StateProvinceCode) {
            return require("../assets/kyc_state_icon.png")
        } else if(objectName === addressFieldType.PostalCode) {
            return require("../assets/kyc_postal_code_icon.png")
        } else if(objectName === addressFieldType.CountryCode) {
            return require("../assets/kyc_street_name_icon.png")
        } else if(objectName === addressFieldType.BuildingNumber) {
            return require("../assets/kyc_building_icon.png")
        } else if(objectName === addressFieldType.StreetName) {
            return require("../assets/kyc_street_name_icon.png")
        } else if(objectName === addressFieldType.StreetType) {
            return require("../assets/kyc_street_type_icon.png")
        } else if(objectName === addressFieldType.UnitNumber) {
            return require("../assets/kyc_unit_no_icon.png")
        } else {
            return require("../assets/kyc_street_name_icon.png")
        }
    }

    /**
     * GET LIST OF DYNAMIC FIELDS: getRegisterUserfieldRequirements API CALL
     */
    getRegisterUserfieldAPI = () => {
        this.showLoader(true);
        AsyncStorageUtil.getItem(stringConstant.SAVE_USER_INFO).then( (data) => {
            let userAuthentication = new UserAuthenticationModel();
            data = JSON.parse(data);
            if(data) {    
                userAuthentication = data.AuthenticationToken;
                console.log(userAuthentication);
                let requestData = new registerUserFieldRequestModel();
                requestData.AuthenticationToken = userAuthentication.Token;
                requestData.CountryCode = this.state.CountryCode;
                
                KYCInterface.getRegisterUserFieldRequirements(requestData).then( (response) => {
                    let res = new httpResponseModel();
                    res = response;
                    console.log(JSON.stringify(res.Result))
                    if(res.ErrorCode == "0") {
                        let userFieldResponse = new RegisterUserFieldResponseModel();
                        userFieldResponse = res.Result;

                        let userFieldArray = userFieldResponse.CreateUserFieldRequirements;
                        
                        this.showLoader(false);

                        var filteredFields = [];
                        var flaggedFields = [];
                        userFieldArray.forEach(element => {
                            
                            let arrayElement = new RegisterUserFieldArrayResponseModel()
                            arrayElement = element;
                            
                            let arrayElementWithPlottingFlag = new RegisterUserFieldLocalArrayModel()
                            arrayElementWithPlottingFlag.Name = element.Name;
                            arrayElementWithPlottingFlag.DisplayName = element.DisplayName;
                            arrayElementWithPlottingFlag.Category = element.Category;
                            arrayElementWithPlottingFlag.Hint = element.Hint;
                            arrayElementWithPlottingFlag.MinLen = element.MinLen;
                            arrayElementWithPlottingFlag.MaxLen = element.MaxLen;
                            arrayElementWithPlottingFlag.Required = element.Required;
                            arrayElementWithPlottingFlag.isPlotted = false;
                            if(element.Name === addressFieldType.CountryCode) {
                                arrayElementWithPlottingFlag.isPlotted = true;
                            }

                            if(element.Name === addressFieldType.LocationAdditionalFieldsAddress1) { // To check if LocationAdditionalFieldsAddress1 is coming from API
                                this.setState({
                                    isLocationField1Available:true
                                })
                            }

                            for(let i = 0; i < RegisterUserFieldConstant.AddressDynamicFields.length; i++){
                                if(RegisterUserFieldConstant.AddressDynamicFields[i] === arrayElement.Name) {
                                    filteredFields.push(arrayElement);
                                    arrayElementWithPlottingFlag.isPlotted = true;
                                }
                            }
                            flaggedFields.push(arrayElementWithPlottingFlag);
                        })
                        
                        // STORE GET REGISTER USER FIELD INFO: USERFIELDS, NATIONAL IDs, CONSENTS
                        AsyncStorageUtil.storeItem(stringConstant.GET_REGISTER_USER_FIELD_INFO, flaggedFields);
                        AsyncStorageUtil.storeItem(stringConstant.GET_REGISTER_NATIONAL_ID_INFO, userFieldResponse.NationalIDs);
                        AsyncStorageUtil.storeItem(stringConstant.GET_REGISTER_CONSENTS_INFO, userFieldResponse.Consents);
                        console.log("getRegisterUserFieldRequirements",JSON.stringify(flaggedFields));
                        this.setState({
                            addressFieldsSet:filteredFields,
                            showNextBtn: true
                        })
                        this.getStateSListAPICall();
                        //console.log(flaggedFields.length+JSON.stringify(flaggedFields));

                    } else if (res.ErrorCode === commonConstant.ACCESS_DENIED_ERROR_CODE) {
                        /*
                        Alert.alert(
                            '',
                            res.ErrorMsg,
                            [
                              {text: 'OK', onPress: () => {
                                    //redirect to login screen
                                }},
                            ],
                            { cancelable: false }
                          )
                            */
                          this.showCustomAlertForLoginScreenRedirection(true,res.ErrorMsg);
                        
                    } else {
                        this.showCustomAlert(true,res.ErrorMsg)
                    }
                    setTimeout(() => {
                        this.showLoader(false);
                    },1000);
                },(err) => {
                    this.showLoader(false);
                    this.showCustomAlert(true,strings('common.api_failure'));
                });
            } 
        }, (err) => {
            this.showLoader(false);
        });
    }

    /**
     * GET LIST OF STATES BASED ON COUNTRY SELECTION IN PREVIOUS SCREEN: getCountryStates API CALL
     */
    getStateSListAPICall = () => {
        this.showLoader(true);
        AsyncStorageUtil.getItem(stringConstant.SAVE_USER_INFO).then( (data) => {
            let userAuthentication = new UserAuthenticationModel();
            data = JSON.parse(data);
            if(data) {    
                userAuthentication = data.AuthenticationToken;
                console.log(userAuthentication);
                let requestData = new registerUserFieldRequestModel();
                requestData.AuthenticationToken = userAuthentication.Token;
                requestData.CountryCode = this.state.CountryCode;
                
                KYCInterface.getCountryStates(requestData).then( (response) => {
                    let res = new httpResponseModel();
                    res = response;
                    if(res.ErrorCode == "0") {
                        let stateResponse = new StateResponseModel();
                        stateResponse = res.Result;

                        //sorting logic for States based on State Name in ascending order.

                        let statesArray = stateResponse.States;
                        statesArray = sortJsonArray(statesArray,"StateName")

                        this.setState({
                            statesList: this.state.statesList.cloneWithRows(statesArray),
                            statesNameArray: statesArray
                        });

                        if(statesArray.length > 0) {
                            this.setState({
                                selectedStateName:statesArray[0].StateName,
                                StateProvinceCode:statesArray[0].StateCode
                            }, () => {
                                this.changeNextBtnState();
                            })
                        }
                        //console.log(statesArray.length+JSON.stringify(statesArray));


                    } else if (res.ErrorCode === commonConstant.ACCESS_DENIED_ERROR_CODE) {
                        /*
                        Alert.alert(
                            '',
                            res.ErrorMsg,
                            [
                              {text: 'OK', onPress: () => {
                                    //redirect to login screen
                                }},
                            ],
                            { cancelable: false }
                          )
                        */
                       this.showCustomAlertForLoginScreenRedirection(true,res.ErrorMsg);

                    } else {
                        this.showCustomAlert(true,res.ErrorMsg)
                    }
                    setTimeout(() => {
                        this.showLoader(false);
                    },1000);
                },(err) => {
                    this.showLoader(false);
                    this.showCustomAlert(true,strings('common.api_failure'));
                });
            } 
        }, (err) => {
            this.showLoader(false);
        });
    }

    /**
     * ADD ADDRESS API CALL
     */
    addAddressAPI = () => {
        this.showLoader(true);
        AsyncStorageUtil.getItem(stringConstant.SAVE_USER_INFO).then( (data) => {
            let userAuthentication = new UserAuthenticationModel();
            data = JSON.parse(data);
            if(data) {    
                userAuthentication = data.AuthenticationToken;
                console.log(userAuthentication);

                let CapturedAddress = new AddressRequestModel()
                
                CapturedAddress.City = this.state.City;
                CapturedAddress.StateCode = this.state.StateProvinceCode;
                CapturedAddress.PostalCode = this.state.PostalCode;
                CapturedAddress.CountryCode = this.state.CountryCode;
                CapturedAddress.AddressType = this.state.addressType;

                if(this.state.isEVerifySupported === true) { ////Dynamic Flow

                    if(this.state.isLocationField1Available === true) {
                        CapturedAddress.Address1 = this.state.LocationAdditionalFieldsAddress1;
                    } else {
                        CapturedAddress.Address1 = `${this.state.BuildingNumber};${this.state.StreetName};${this.state.StreetType};${this.state.UnitNumber}`;
                    }
                    CapturedAddress.Suburb = this.state.Suburb;
                } else {
                    CapturedAddress.Address1 = this.state.LocationAdditionalFieldsAddress1;
                }

                let requestData = new AddressMainRequestModel()
                requestData.AuthenticationToken = userAuthentication.Token;
                requestData.Address = CapturedAddress;
                
                let storedAddressInfo = {};
                this.state.addressFieldsSet.forEach(element => {
                    if(element.Name === addressFieldType.BuildingNumber) {
                        storedAddressInfo[addressFieldType.BuildingNumber] = this.state.BuildingNumber;
                    }
                    if(element.Name === addressFieldType.City) {
                        storedAddressInfo[addressFieldType.City] = this.state.City;
                    }
                    if(element.Name === addressFieldType.LocationAdditionalFieldsAddress1) {
                        storedAddressInfo[addressFieldType.LocationAdditionalFieldsAddress1] = this.state.LocationAdditionalFieldsAddress1;
                    }
                    if(element.Name === addressFieldType.PostalCode) {
                        storedAddressInfo[addressFieldType.PostalCode] = this.state.PostalCode;
                    }
                    if(element.Name === addressFieldType.StateProvinceCode) {
                        storedAddressInfo[addressFieldType.StateProvinceCode] = this.state.StateProvinceCode;
                    }
                    if(element.Name === addressFieldType.StreetName) {
                        storedAddressInfo[addressFieldType.StreetName] = this.state.StreetName;
                    }
                    if(element.Name === addressFieldType.StreetType) {
                        storedAddressInfo[addressFieldType.StreetType] = this.state.StreetType;
                    }
                    if(element.Name === addressFieldType.Suburb) {
                        storedAddressInfo[addressFieldType.Suburb] = this.state.Suburb;
                    }
                    if(element.Name === addressFieldType.UnitNumber) {
                        storedAddressInfo[addressFieldType.UnitNumber] = this.state.UnitNumber;
                    }
                    //if(element.Name === addressFieldType.CountryCode) {
                        storedAddressInfo[addressFieldType.CountryCode] = this.state.CountryCode;
                    //}
                });
                console.log("add address request data",JSON.stringify(requestData));
                KYCInterface.addAddress(requestData).then( (response) => {
                    let res = new httpResponseModel();
                    res = response;
                    this.showLoader(false);
                    console.log("add address response data",JSON.stringify(res));
                    if(res.ErrorCode == "0") {
                        
                        //save users address in case of eVerifySupported
                        
                        if(this.state.isEVerifySupported === true) {
                            AsyncStorageUtil.storeItem(stringConstant.STORE_KYC_USER_ADDRESS_INFO, CapturedAddress).then((success) => {
                                AsyncStorageUtil.storeItem(stringConstant.STORE_KYC_USER_ADDRESS_INFO_KEY_VALUE, storedAddressInfo).then((success) => {    
                                    Navigation.setStackRoot(stackName.GoalScreenStack, {
                                        component : {
                                            name: screenId.KYCConfirmNameScreen
                                        }
                                    });
                                });
                            });
                        } else {
                            Navigation.setStackRoot(stackName.GoalScreenStack, {
                                component : {
                                    name: screenId.KYCConfirmNameScreen
                                }
                            });
                        }

                    } else if (res.ErrorCode === commonConstant.ACCESS_DENIED_ERROR_CODE) {
                        /*
                        Alert.alert(
                            '',
                            res.ErrorMsg,
                            [
                              {text: 'OK', onPress: () => {
                                    //redirect to login screen
                                }},
                            ],
                            { cancelable: false }
                          )
                          */
                         this.showCustomAlertForLoginScreenRedirection(true,res.ErrorMsg);
                        
                    } else {
                        this.showCustomAlert(true,res.ErrorMsg)
                    }
                    setTimeout(() => {
                        this.showLoader(false);
                    },1000);
                },(err) => {
                    this.showLoader(false);
                    this.showCustomAlert(true,strings('common.api_failure'));
                });
            } 
        }, (err) => {
            this.showLoader(false);
        });
    }
    /**** END ****/
}
KYCAddressScreen.propTypes = propTypes;
KYCAddressScreen.defaultProps = defaultProps;