import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity,TouchableHighlight,ListView,WebView, Alert, Platform } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Switch } from 'react-native-switch';

import { strings } from '../config/i18/i18n';
import commonStyles from '../styles/common.style';
import fontFamilyStyles from '../styles/font.style';

import LoaderComponent from '../components/loader.component';
import styles from '../styles/form.style';
import commonTheme from '../themes/common.theme';

// FOR API INTEGRATION
import HttpUrlConstant from '../constants/http.constant';
import AuthInterface from '../interfaces/auth.interface';
import UserAuthenticationModel from '../models/user.authentication.model';
import UserRequestModel from '../models/user.request.model';
import AsyncStorageUtil from '../utils/asyncstorage.util';
import httpResponseModel from '../models/httpresponse.model';
import TearmsAndConditionsRequestModel from '../models/termsandconditions.request.model';
import TermsAndConditionsResponseModel from '../models/termsandconditions.response.model';
import commonConstant from '../constants/common.constant';
import stackName from '../constants/stack.name.enum';
import screenId from '../constants/screen.id.enum';
import UserRegistrationResponseModel from '../models/userregistration.model';

import ModalComponentModel from '../models/modal.component.model';
import CommonModal from '../components/common.modal';
import commonUtil from '../utils/common.util';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

export default class TermsAndConditionsScreen extends Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            showActivityIndicator: false,
            acceptButtonEnabled: false,
            doneButtonEnabled: false,
            webViewVisible: false,
            selectedWebURL:'',
            tncStaticData:initialData,
            tncList:ds,
            modalComponent : {}
            /////dataSource: ds.cloneWithRows(data)
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

    componentDidMount () {
        this.setState({
            tncList: this.state.tncList.cloneWithRows(this.state.tncStaticData)
        });
        this.getTermsAndConditionsList();
    }

    getTermsAndConditionsList = () => {
        AsyncStorageUtil.getItem('signup.userInfo').then( (data) => {
            let userAuthentication = new UserAuthenticationModel();
            data = JSON.parse(data);
            if(data) {
                userAuthentication = data.AuthenticationToken;
                console.log(userAuthentication);
                let tearmsAndConditionsRequestData = new TearmsAndConditionsRequestModel();
                tearmsAndConditionsRequestData.AuthenticationToken = userAuthentication.Token;
                this.showLoader(true);
                AuthInterface.getTermsAndConditions(tearmsAndConditionsRequestData).then( (response) => {
                    this.showLoader(false);
                    console.log(response,'TERMS AND CONDITIONS data');
                    let res = new httpResponseModel();
                    res = response;
                    if(res.ErrorCode == "0") {
                        let responseData = new TermsAndConditionsResponseModel();
                        responseData = res.Result;
                        console.log(responseData,'TERMS AND CONDITIONS response array');
                        
                        this.setState({
                            tncList: this.state.tncList.cloneWithRows(responseData.TermsAndConditionsInfo)
                        });
                    } else {
                        this.showCustomAlert(true,res.ErrorMsg)
                    }
                });
            }
        });
    }

    // Loader enable / Disable
    showLoader = (bit) => { // call this function to show/hide the loader
        this.setState({
          showActivityIndicator: bit
        });
    }

    // Back Button Action
    _backButton(){
        Navigation.pop('Authentication');
    }

    // Close Web View
    closeWebView = () => {
        this.setState({webViewVisible: false});
    }

    // Toggle 'Accept' switch button
    toggleAcceptSwitch = () => {
        
        if(this.state.acceptButtonEnabled) {
            this.setState({acceptButtonEnabled: false,doneButtonEnabled:false});

        } else {
            this.setState({acceptButtonEnabled: true, doneButtonEnabled:true});

        }
    }

    // Next Button Action
    _onNextButton = () => {
        //add and alert by checking 'signup.contactInfo' for everifysupported and signupsupported from asyncstorage

        AsyncStorageUtil.getItem('signup.userInfo').then( (data) => {
            let userAuthentication = new UserAuthenticationModel();
            data = JSON.parse(data);
            if(data && !this.state.showActivityIndicator) {
                userAuthentication = data.AuthenticationToken;
                console.log(userAuthentication);
                let termsAndConditionsRequestData = new TearmsAndConditionsRequestModel();
                termsAndConditionsRequestData.AuthenticationToken = userAuthentication.Token;
                this.showLoader(true);
                AuthInterface.acceptTermsAndConditions(termsAndConditionsRequestData).then( (response) => {
                    this.showLoader(false);
                    console.log(response,'user data');
                    let res = new httpResponseModel();
                    res = response;
                    if(res.ErrorCode == "0") {
                        
                        // IF SIGN UP SUPPORTED 'Y'
                        // WelcomeOneScreen, if code is not merged.
                        // Navigation.setStackRoot('Authentication', {
                        //     component: {
                        //         name: 'B21.WelcomeScreen'
                        //     }
                        // });
                        // IF SIGN UP SUPPORTED 'N'
                        // Country not supported screen
                        let userRegistrationModel = new UserRegistrationResponseModel();
                        userRegistrationModel = res.Result.UserSignupRegistrationInfo;
                        if(userRegistrationModel.PhoneCountryCodeSignupSupported == "F") {
                            Navigation.setStackRoot(stackName.AuthenticationStack, {
                                component: {
                                    name: screenId.CountryNotSupportedScreen
                                }
                            });
                        } else if(userRegistrationModel.PhoneCountryCodeSignupSupported == "T") {
                            Navigation.setStackRoot(stackName.AuthenticationStack, {
                                component: {
                                    name: screenId.WelcomeScreen
                                }
                            });
                        }

                    } else if(res.ErrorCode == commonConstant.USER_DOES_NOT_EXIST) {
                            // NAVIGATE TO LOGIN
                            Navigation.push('Authentication', {
                                component: {
                                name: 'B21.LoginScreen',
                                passProps : {
                                    text: "passed into step two"
                                }
                                }
                            });
                    }else {
                        this.showCustomAlert(true,res.ErrorMsg)
                    }
                }, (err) => {
                    this.showLoader(false);
                    this.showCustomAlert(true,strings('common.api_failure'));
                });
            }
        });
    }

    // On clicking a Row Item
    _onRowItemPressed = (data) => {
        console.log(data,'_onRowItemPressed');

        this.setState({
            webViewVisible: true,
            selectedWebURL:data.FullDocURL,
        });
    }

    // Row UI
    renderRowView = (data) => {
        return (
            <TouchableOpacity style={styles.termsConditionsRowcontainer} onPress={this._onRowItemPressed.bind(this,data)}>
                <Text style={styles.termsConditionsText}>
                    <Text style={styles.boldTitle}>{`${data.Title} - `}</Text>
                    <Text>{data.ShortDescription}</Text>
                </Text>
            </TouchableOpacity>
        );
    }

    render() {
        return (
          <View style={{flex:1}}>
            <View style={{flex:7.5}}>
              <View style={styles.container}>
                <Text style={styles.leftHeaderWithoutBackBtn}>{ strings('signup.terms_and_condition') }</Text>
                <ListView
                    style={styles.termsConditionsListView} 
                    dataSource={this.state.tncList} 
                    renderRow={(data) => this.renderRowView(data) }
                />
              </View>
          </View>
          <View style={styles.agreeTermsConditionsSection}>
            <Switch
                    value={this.state.acceptButtonEnabled}
                    onValueChange={this.toggleAcceptSwitch}
                    circleSize={30}
                    circleBorderWidth={0}
                    backgroundActive={commonTheme.PRIMARY_BTN_BACKGROUND_COLOR}
                    backgroundInactive={commonTheme.INPUT_FIELD_BORDER_COLOR}
                    changeValueImmediately={true}
                />
                <Text style={styles.agreeTermsConditionsText}>{ strings('signup.agree_terms_and_condition') }</Text>
          </View>
          <View style={{flex:1}}>
            <TouchableHighlight disabled={this.state.doneButtonEnabled?false:true} style={styles.fullSize} onPress={this._onNextButton} underlayColor="white">
                  <View style={[this.state.doneButtonEnabled?styles.primaryYellowButton:styles.primaryDisableButton, 
                    styles.fullSize]}>
                    <Text style={styles.buttonTextWhite}>{ strings('common.done_btn') }</Text>
                  </View>
              </TouchableHighlight>
          </View>
          <View style={[styles.floatView, this.state.webViewVisible?styles.webViewShow:styles.webViewHide]}>
                <View style={styles.closeWebViewBtn}>
                    <TouchableOpacity style={styles.backButton} onPress={this.closeWebView}>
                        <Image style={styles.backIcon} source={require("../assets/close.png")}/>
                    </TouchableOpacity>
                </View>
                <View style={styles.webViewPopup}>
                    <WebView
                        source={{uri: this.state.selectedWebURL}}
                        style={styles.webViewStyle} scalesPageToFit={false} 
                        automaticallyAdjustContentInsets={false}
                    />
                </View>
          </View>
          <LoaderComponent showLoader = { this.state.showActivityIndicator }/>
          <CommonModal modalComponent = {this.state.modalComponent}/>
        </View>
        );
      }
}

onItemPressed = (item) => {
    console.log(item);
}

const Row = (props) => (

    <TouchableOpacity style={styles.termsConditionsRowcontainer} onPress={this.onItemPressed(props)}>
        <Text style={styles.termsConditionsText}>
          <Text style={styles.boldTitle}>{`${props.Title} - `}</Text>
          <Text>{props.ShortDescription}</Text>
        </Text>
      </TouchableOpacity>
);


const initialData = [];