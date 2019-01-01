import React, { Component } from 'react';
import { View, Text, Picker, TextInput,TouchableOpacity, ListView, Alert, NativeModules } from 'react-native';
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
import ModalComponentModel from '../models/modal.component.model';
import commonUtil from '../utils/common.util';
import CommonModal from '../components/common.modal';
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

export default class AddMobileNumberScreen extends Component {
    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);
        
        this.state = {
            countryStaticData : country,
            showActivityIndicator: false,
            enableNextBtn: false,
            countries: ds,
            showPicker: false,
            baseCountryFlagUrl: "http://mobapp.assets.b21.io/countries/",
            selectedCountryCode: "",
            selectedCountryFlagUrl:"http://mobapp.assets.b21.io/countries/US/flag.svg",
            selectedCountryPrefix: "+1",
            selectedCountryName: "",
            selectedCountryEverifySupported: false,
            selectedCountrySignupSupported: false,
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
    
    componentDidMount () {
        this.setState({
            countries: this.state.countries.cloneWithRows(this.state.countryStaticData)
        });
        this.getAllCountriesList();
    }
    showLoader = (bit) => { // call this function to show/hide the loader
        this.setState({
          showActivityIndicator: bit
        });
    }

    pressRow = (rowData) => {
        console.log(rowData);
    }

    openCountrySelector = () => {
        if(this.state.showPicker) {
            this.setState({showPicker: false});

        } else {
            this.setState({showPicker: true});

        }
    }

    getAllCountriesList = () => {
        AsyncStorageUtil.getItem(stringConstant.SAVE_USER_INFO).then( (data) => {
            let userAuthentication = new UserAuthenticationModel();
            data = JSON.parse(data);
            if(data && !this.state.showActivityIndicator) {
                this.showLoader(true);
                userAuthentication = data.AuthenticationToken;
                console.log(userAuthentication);
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
                        //this.showCustomAlert(true,"success");
                        console.log(countryResponseData,'country response array');
                        //TODO: would be later used for getting geolocation information
                        // console.log(navigator);
                        // navigator.geolocation.requestAuthorization( (success) => {
                        //     alert(success,'permission granted');
                        //     navigator.geolocation.getCurrentPosition( (success) => {
                        //         alert(success,'current pos');
                        //     });
                        // }, (error) => {
                        //     console.log(error,'permission not granted');
                        // });
                        //Check for the current device location and set it as default.
                        // if( NativeModules.I18nManager ){
                        //     alert(JSON.stringify(NativeModules.RNI18n.getCurrentLocale()));
                        // }

                        //sorting logic for countries based on prefix in ascending order.
                        let tempAllcountriesArr = countryResponseData.Countries;
                        tempAllcountriesArr.sort( (a,b) => {
                            return (a.PhonePrefixes[0] - b.PhonePrefixes[0]);
                        });
                        this.setState({
                            selectedCountryFlagUrl: countryResponseData.CountryFlagBaseURL + countryResponseData.Countries[0].CountryCode + "/flag.svg",
                            selectedCountryCode : countryResponseData.Countries[0].CountryCode,
                            selectedCountryPrefix: countryResponseData.Countries[0].PhonePrefixes[0],
                            baseCountryFlagUrl: countryResponseData.CountryFlagBaseURL,
                            selectedCountryName: countryResponseData.Countries[0].CountryName,
                            selectedCountryEverifySupported: countryResponseData.Countries[0].EVerifySupported,
                            selectedCountrySignupSupported: countryResponseData.Countries[0].SignupSupported,
                            countries: this.state.countries.cloneWithRows(tempAllcountriesArr)
                        });
                    } else {
                        this.showCustomAlert(true,res.ErrorMsg);
                    }
                }, (err) => {
                    this.showLoader(false);
                    this.showCustomAlert(true,strings('common.api_failure'));
                });
            }
        });
    }
    _onCountryItemPressed = (data) => {
        console.log(data,'_onCountryItemPressed');
        this.setState({
            selectedCountryFlagUrl : this.state.baseCountryFlagUrl + data.CountryCode + "/flag.svg",
            selectedCountryCode : data.CountryCode,
            selectedCountryPrefix: data.PhonePrefixes[0],
            selectedCountryEverifySupported: data.EVerifySupported,
            selectedCountrySignupSupported: data.SignupSupported,
            selectedCountryName: data.CountryName,
        }, () => {
            this.openCountrySelector();
        });

    }
    renderCountryView = (data) => {
        return (
            <TouchableOpacity style={styles.pickerRowcontainer} onPress={this._onCountryItemPressed.bind(this,data)}>
                <Image source={{ uri:`${this.state.baseCountryFlagUrl}${data.CountryCode}/flag.svg`}} style={styles.pickerImage} />
                <Text style = { styles.pickerText }>
                    { data.PhonePrefixes[0] }
                </Text>
                {/* { data.CountryCode } ( */}
            </TouchableOpacity>
        );
    }

    verifyMobileNumber = () => {
        //API call to trigger text to entered mobile number
        this.showLoader(true);
        this.setState({
            enableNextBtn: true
        }, () => {
            AsyncStorageUtil.getItem(stringConstant.SAVE_USER_INFO).then( (data) => {
                let userAuthentication = new UserAuthenticationModel();
                data = JSON.parse(data);
                if(data) {    
                    userAuthentication = data.AuthenticationToken;
                    console.log(userAuthentication);
                    let mobileData = new UserRequestModel();
                    mobileData.AuthenticationToken = userAuthentication.Token;
                    mobileData.MobilePhone = this.state.selectedCountryPrefix + this.state.mobileNumber;
                    mobileData.CountryCode = this.state.selectedCountryCode;
                    console.log(mobileData);
                    AuthInterface.sendMobileNumberVerificationCode(mobileData).then( (response) => {
                        let res = new B21ResponseModel();
                        res = response;
                        if(res.ErrorCode == "0") {
                            console.log(res);
                            let phoneNumberRequest = new PhoneRequestObjectModel();
                            phoneNumberRequest.PhoneNumber = mobileData.MobilePhone;
                            phoneNumberRequest.PhoneNumberWithOutPrefix = this.state.mobileNumber;
                            phoneNumberRequest.PhoneType = "Mobile";
                            phoneNumberRequest.CountryCode = mobileData.CountryCode;
                            phoneNumberRequest.EVerifySupported = this.state.selectedCountryEverifySupported;
                            phoneNumberRequest.SignupSupported =  this.state.selectedCountrySignupSupported;
                            phoneNumberRequest.CountryName = this.state.selectedCountryName;
                            Navigation.push(stackName.AuthenticationStack, {
                                component: {
                                  name: screenId.VerifyMobileNumberScreen,
                                  passProps : {
                                      Phone : phoneNumberRequest
                                  }
                                }
                            });
                        } else if(res.ErrorCode == "58") {
                            this.showCustomAlert(true,res.ErrorMsg);
                        } else if(res.ErrorCode == "57") {
                            this.showCustomAlert(true,res.ErrorMsg);
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
        });
    }

    
    render() {
        return (
          <View style={{flex:1}}>
            <View style={{flex:9}}>
            <KeyboardAwareScrollView>
              <View style={styles.container}>
                <Text style={[styles.header, styles.reducedHeaderMargin]}>{ strings('signup.add_mobile_number_header') }</Text>
                <Image style={styles.logo} source={ require('../assets/mobileCircle.png') }/>
                <Text style={styles.descriptionText}>{ strings('signup.add_mobile_number_description') }</Text>
                <View style={styles.addMobileNumberformView}>
                  <View style={styles.elementBox2}>
                    <Text style={styles.headerLabel}>{ strings('common.phone_number') }</Text>
                    <View style={styles.addPhoneInputFieldCoverView}>
                        <TouchableOpacity 
                            style = { 
                                [
                                    styles.flagCoverView,
                                    commonStyles.inputField,
                                    styles.fullHeight
                                ]
                            } 
                            onPress = { this.openCountrySelector }>
                            <View style={styles.flagImgView}>
                                <Image style={styles.flagIcon} source={{ uri:this.state.selectedCountryFlagUrl}}/> 
                                <Image style={styles.downArrow} source={require("../assets/dropBtnSolid.png")}/> 
                            </View>
                            {/* <View style={styles.lineView}/>   */}
                        </TouchableOpacity>
                        
                        <View style={[styles.addPhoneTextInputView,{flexDirection:'row'}]}>
                            <View style= {[{flex:2}]}>
                                <TextInput 
                                editable = { false }
                                style = { 
                                    [ 
                                        commonStyles.mobileCountryPrefix,
                                        fontFamilyStyles.robotoLight,
                                        commonStyles.primaryTextColorLight,
                                        commonStyles.inputField 
                                    ] 
                                }
                                value = { this.state.selectedCountryPrefix }/>
                            </View>
                            <View style= {{flex:8}}>
                            <TextInput
                                style = { 
                                    [
                                        styles.mobileNumberField, 
                                        commonStyles.inputField,
                                        commonStyles.primaryTextColorLight 
                                    ]
                                }
                                keyboardType='phone-pad'
                                returnKeyType='done'
                                onChangeText={ (mobNumber) => {
                                    this.setState({mobileNumber:mobNumber});
                                    if(mobNumber.length >= commonConstant.MIN_MOBILE_NUMBER){
                                        this.setState({enableNextBtn:true});
                                    } else {
                                        this.setState({enableNextBtn:false});
                                    }
                                }}
                                maxLength = { commonConstant.MAX_MOBILE_NUMBER }
                                value = { this.state.mobileNumber }
                            />
                            </View>
                            
                        </View>
                    </View>
                  </View>
                </View>
                <ListView
                style={[styles.countryDropdownView, 
                        {display:this.state.showPicker? 'flex':'none'}]} 
                dataSource={this.state.countries} 
                renderRow={(data) => this.renderCountryView(data) }
                />

              </View>
              </KeyboardAwareScrollView>
          </View>
          <View style={{flex:1}}>
            <TouchableOpacity style={styles.fullSize}
            disabled = { !this.state.enableNextBtn }
            activeOpacity = { 1 }
            style = { 
                [ styles.primaryBlueButton,styles.fullSize,
                  this.state.enableNextBtn ? commonStyles.btnActivebackgroundColor:commonStyles.btnDisabledbackgroundColor 
                ] 
            }
            onPress = { this.verifyMobileNumber }>
                    <Text style={styles.buttonTextWhite}>{ strings('common.next_btn') }</Text>
              </TouchableOpacity> 
          </View>
          <LoaderComponent showLoader = { this.state.showActivityIndicator }/>
          <CommonModal modalComponent = {this.state.modalComponent}/>
        </View>
        );
    }
}
