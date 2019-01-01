import React, { Component } from 'react';
import { View, Text, Picker, TextInput, TouchableOpacity, TouchableHighlight, ListView, Alert, NativeModules, Platform, Dimensions } from 'react-native';
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
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

var sortJsonArray = require('sort-json-array');

export default class ConfirmYourCountryScreen extends Component {
    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            countryStaticData: country,
            countryDataArray: [],
            showActivityIndicator: false,
            enableNextBtn: false,
            countries: ds,
            showPicker: false,
            baseCountryFlagUrl: "http://mobapp.assets.b21.io/countries/",
            selectedCountryCode: "US",
            selectedCountryFlagUrl: "",//"http://mobapp.assets.b21.io/countries/US/flag.svg",
            selectedCountryPrefix: "+1",
            selectedCountryName: "",
            selectedCountryEverifySupported: false,
            selectedCountrySignupSupported: false,
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

    // Alert Type Retry Country List Loading
    reloadCountryList = () => {
        console.log("reloadStatesList");
        this.showLoader(false);
        this.showCustomAlert(false);
        this.getAllCountriesList();
    }
    showCustomAlertForRetryCountryLoading = (visible, message) => {
        this.setState({
            modalComponent : commonUtil.setAlertComponent(visible,message,strings('common.retry'),"",true,false,() => this.reloadCountryList(), () => this.rightButtonClicked(),() => this.closeButtonClicked())
        });
    }

    componentDidMount() {
        this.setState({
            countries: this.state.countries.cloneWithRows(this.state.countryStaticData)
        });
        this.getContactInfo();
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
        if (this.state.countryDataArray.length > 0) {
            if (this.state.showPicker) {
                this.setState({ showPicker: false });

            } else {
                this.setState({ showPicker: true });

            }
        } else {
            // Alert.alert(
            //     '',
            //     "Could not load countries! \nPlease retry :(",
            //     [
            //       {text: 'Retry', onPress: () => {
            //         this.getAllCountriesList();
            //         }},
            //     ],
            //     { cancelable: false }
            //   )

            this.showCustomAlertForRetryCountryLoading(true,strings('confirmYourCountry.could_not_load_countries_please_retry'));
        }


    }
    getContactInfo = () => {
        AsyncStorageUtil.getItem(stringConstant.USER_CONTACT_INFO).then((data) => {
            data = JSON.parse(data);
            this.setState({
                selectedCountryCode: data.CountryCode,
                selectedCountryFlagUrl: `${this.state.baseCountryFlagUrl}${data.CountryCode}/flag.svg`,
                selectedCountryName: data.CountryName,
                selectedCountryEverifySupported: data.EVerifySupported
            });
        })
    }

    getAllCountriesList = () => {
        
        AsyncStorageUtil.getItem('signup.userInfo').then((data) => {
            let userAuthentication = new UserAuthenticationModel();
            data = JSON.parse(data);
            if (data && !this.state.showActivityIndicator) {
                this.showLoader(true);
                userAuthentication = data.AuthenticationToken;
                console.log(userAuthentication);
                let countryRequestData = new CountryRequestModel();
                countryRequestData.AuthenticationToken = userAuthentication.Token;
                countryRequestData.RetrieveSignupSupportedOnlyCountries = true;
                AuthInterface.getCountries(countryRequestData).then((response) => {
                
                    console.log(response, 'country data');
                    let res = new httpResponseModel();
                    res = response;
                    this.showLoader(false);
                    if (res.ErrorCode === "0") {
                        let countryResponseData = new CountryResponseModel();
                        countryResponseData = res.Result;
                        console.log(countryResponseData, 'country response array');
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
                        tempAllcountriesArr = sortJsonArray(tempAllcountriesArr, "CountryName");

                        this.setState({
                            countries: this.state.countries.cloneWithRows(tempAllcountriesArr),
                            countryDataArray: tempAllcountriesArr
                        });

                        tempAllcountriesArr.forEach(element => {
                            if (element.CountryCode === this.state.selectedCountryCode) {
                                this.setState({
                                    selectedCountryFlagUrl: countryResponseData.CountryFlagBaseURL + element.CountryCode + "/flag.svg",
                                    selectedCountryCode: element.CountryCode,
                                    selectedCountryPrefix: element.PhonePrefixes[0],
                                    baseCountryFlagUrl: countryResponseData.CountryFlagBaseURL,
                                    selectedCountryName: element.CountryName,
                                    selectedCountryEverifySupported: element.EVerifySupported,
                                    selectedCountrySignupSupported: element.SignupSupported
                                });
                            }
                        })



                    } else if (res.ErrorCode === commonConstant.ACCESS_DENIED_ERROR_CODE) {

                        // Alert.alert(
                        //     '',
                        //     res.ErrorMsg,
                        //     [
                        //       {text: 'OK', onPress: () => {
                        //             //redirect to login screen
                        //             //NavigationUtil.authenticationEntry();
                        //             //NavigationUtil.setDefaultOptions();
                        //         }},
                        //     ],
                        //     { cancelable: false }
                        //   )

                        this.showCustomAlert(true, res.ErrorMsg);

                    } else {
                        //v alert(res.ErrorMsg)
                        this.showCustomAlert(true, res.ErrorMsg);
                    }
                }, (err) => {
                    this.showLoader(false);
                    //v  alert("API failure");
                    this.showCustomAlert(true, strings('common.api_failure'));
                });
            }
        });
    }
    _onCountryItemPressed = (data) => {
        console.log(data, '_onCountryItemPressed');
        this.setState({
            selectedCountryFlagUrl: this.state.baseCountryFlagUrl + data.CountryCode + "/flag.svg",
            selectedCountryCode: data.CountryCode,
            selectedCountryPrefix: data.PhonePrefixes[0],
            selectedCountryEverifySupported: data.EVerifySupported,
            selectedCountrySignupSupported: data.SignupSupported,
            selectedCountryName: data.CountryName
        }, () => {
            this.openCountrySelector();
        });

    }
    renderCountryView = (data) => {
        return (
            <TouchableOpacity style={styles.pickerRowcontainer} onPress={this._onCountryItemPressed.bind(this, data)}>
                <Image source={{ uri: `${this.state.baseCountryFlagUrl}${data.CountryCode}/flag.svg` }} style={styles.pickerImage} />
                <Text style={styles.pickerText}>
                    {data.CountryName}
                </Text>
                {/* { data.CountryCode } ( */}
            </TouchableOpacity>
        );
    }

    decideEVerifySupport = () => {
        AsyncStorageUtil.storeItem(stringConstant.EVERIFY_SUPPORT_INFO, this.state.selectedCountryEverifySupported).then(() => {
            //alert('to be implemented')
            Navigation.push(stackName.GoalScreenStack, {
                component: {
                    name: screenId.KYCAddressScreen,
                    passProps: {
                        countryName: this.state.selectedCountryName,
                        countryCode: this.state.selectedCountryCode,
                        eVerifySupport: this.state.selectedCountryEverifySupported
                    }
                }
            });
        });
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#7A8CFF', paddingTop: Platform.OS === 'ios' ? 20 : 0 }}>
                <View style={styles.kycCountryHeaderSection}>
                    {/* <KeyboardAwareScrollView bounces={false}> */}
                    <Text style={[styles.kycHeader]}>{strings('confirmYourCountry.title')}</Text>
                    <Image style={styles.kycLogo} source={require('../assets/kyc_globe_icon.png')} />
                    {/* </KeyboardAwareScrollView> */}
                </View>
                <View style={styles.kycCountryFieldAndButtonSection}>
                    <View style={[styles.kycFormView]}>
                        <View style={styles.elementBox2}>
                            <Text style={styles.kycHeaderLabel}>{strings('confirmYourCountry.country')}</Text>
                            <TouchableHighlight underlayColor='transparent' onPress={this.openCountrySelector}>{/* Touchable whole field */}
                                <View style={[styles.kycCountryInputFieldCoverView]}>
                                    <View
                                        style={
                                            [
                                                styles.flagCoverView,
                                                styles.kycInputFieldBottomBorder
                                            ]
                                        }
                                    >
                                        <View style={styles.flagImgView}>
                                            <Image style={styles.flagIcon} source={{ uri: this.state.selectedCountryFlagUrl }} />
                                            <Image style={styles.downArrow} source={require("../assets/dropBtnSolid.png")} />
                                        </View>
                                        <View style={styles.kycBottomBorder} />
                                    </View>

                                    <View style={[styles.kycTextInputView]}>
                                        <View style={[styles.fullHeight, styles.kycInputFieldBottomBorder, styles.verticalAlign]}>
                                            <Text style={[styles.kycInputField]}>{this.state.selectedCountryName}</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableHighlight>{/* Touchable whole field */}
                        </View>
                    </View>
                    <ListView
                        style={[styles.countryDropdownView,
                        { display: this.state.showPicker ? 'flex' : 'none', maxHeight: screenHeight <= 592 ? 100 : 175 }]}//for less than 4.5 inch screen size support 
                        dataSource={this.state.countries}
                        renderRow={(data) => this.renderCountryView(data)}
                    />
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.kycNextButton}
                        onPress={this.decideEVerifySupport}>
                        <Text style={[commonStyles.fontSizeLarge, commonStyles.secTextColor, commonStyles.textAlignCenter]} >
                            {strings('common.next_btn')}
                        </Text>
                    </TouchableOpacity>
                </View>
                <LoaderComponent showLoader={this.state.showActivityIndicator} />
                <CommonModal modalComponent={this.state.modalComponent} />
            </View>
        );
    }
}
