import React, { Component } from 'react';
import {
  View, Text, TextInput, Button,
  Alert, ScrollView, FlatList, SectionList,
  ActivityIndicatorPlatform, TouchableHighlight,
  TouchableOpacity, TouchableNativeFeedback,
  TouchableWithoutFeedback, AppRegistry, Image, DeviceEventEmitter
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import styles from '../styles/form.style';
import commonStyles from '../styles/common.style';
import { strings } from '../config/i18/i18n';
import specialUserModel from '../models/specialuser.model';
import httpResponseModel from '../models/httpresponse.model';
import AsyncStorageUtil from '../utils/asyncstorage.util';
import LoaderComponent from '../components/loader.component';
import commonConstant from '../constants/common.constant';
import AuthInterface from '../interfaces/auth.interface';
import UserResponseModel from '../models/user.model';
import UserModel from '../models/user.model';
import stackName from '../constants/stack.name.enum';
import screenId from '../constants/screen.id.enum';
import stringConstant from '../constants/string.constant';

import ModalComponentModel from '../models/modal.component.model';
import CommonModal from '../components/common.modal';
import commonUtil from '../utils/common.util';

// Sign up class
export default class SignUpScreen extends Component {


  constructor(props) {
    super(props);
    Navigation.events().bindComponent(this);
    this.state = {
      enableNextBtn: false,
      showActivityIndicator: false,
      FirstName: "",
      LastName: "",
      EmailAddress: "",
      AuthenticationToken: "",
      modalComponent : {}
    };
    //Bind all the function here
    this._onNextButtonClicked = this._onNextButtonClicked.bind(this);
    this.leftButtonClicked = this.leftButtonClicked.bind(this);
    this.rightButtonClicked = this.rightButtonClicked.bind(this);
    
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
    this.callSpecialUserAuthentication();
  }

  componentWillUnmount() {
   //DeviceEventEmitter.removeAllListeners();
  }

  componentDidMount(){
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

  callSpecialUserAuthentication = () => {
    let specialuser = new specialUserModel("", "");
    specialuser.Username = "B21CryptoWalletApi@Bank21.com";
    specialuser.Password = "@12Bank21CryptoTest34#";
    this.showLoader(true);
    AuthInterface.authenticateSpecialUser(specialuser).then((response) => {
      let res = new httpResponseModel();
      res = response;
      if (res.ErrorCode == "0") {
        this.setState({
          AuthenticationToken: res.Result.Token
        });
        AsyncStorageUtil.storeItem(stringConstant.SPECIAL_USER_TOKEN, res.Result.Token).then((success) => {
          this.showLoader(false);
        });
      } else {
        //incase if api returns other code, check username and password for special user.
        this.showLoader(false);
      }
    }, (err) => {
      this.showCustomAlert(true,strings('signup.authentication_api_failure'));
      //alert('Authenticate API failure!', JSON.stringify(err));
      this.showLoader(false);
    });
  }

  // Actions
  _backButton() {
    Navigation.popToRoot(stackName.AuthenticationStack);
    ///
  }

  _onNextButtonClicked = () => {
    this.showLoader(true);
    if (!this.state.showActivityIndicator) {
      if (!commonConstant.EMAIL_REGEX.test(this.state.EmailAddress)) {
        this.showLoader(false);
        this.showCustomAlert(true,strings('signin.please_enter_valid_email'))
      } else {
        var checkEmaildata = {
          AuthenticationToken: this.state.AuthenticationToken,
          Email: this.state.EmailAddress
        }

        AuthInterface.checkAvailableEmail(checkEmaildata).then((response) => {
          var res = new httpResponseModel();
          res = response;
          if (res.ErrorCode == commonConstant.SUCCESS_CODE) {
            if (res.Result) {
              let userProp = new UserModel();
              userProp.firstName = this.state.FirstName;
              userProp.lastName = this.state.LastName;
              userProp.emailAddress = this.state.EmailAddress;
              Navigation.push(stackName.AuthenticationStack, {
                component: {
                  name: screenId.SetPasswordScreen,
                  passProps: {
                    user: userProp
                  }
                },
              });
            } else {
              //alert(res.ErrorMsg); TODO: require an error message
              this.showCustomAlert(true,strings('signin.email_already_registered'))
            }
            this.showLoader(false);
          }
        }, (err) => {
          this.showLoader(false);
          this.showCustomAlert(true,strings('common.api_failure'));
        });
      }
    }
  }

  checkIfFieldsAreNotEmpty = (type, value) => {
    if (type == "firstName") {
      this.setState({
        FirstName: value
      }, () => {
        this.changeNextBtnState();
      });
    }
    if (type == "lastName") {
      this.setState({
        LastName: value
      }, () => {
        this.changeNextBtnState();
      });
    }
    if (type == "EmailAddress") {
      this.setState({
        EmailAddress: value
      }, () => {
        this.changeNextBtnState();
      });
    }
  }

  changeNextBtnState = () => {
    if (this.state.FirstName && this.state.LastName && this.state.EmailAddress) {
      this.setState({
        enableNextBtn: true
      });
    } else {
      this.setState({
        enableNextBtn: false
      });
    }
  }

  focusNextInputField = (nextField) => {
    this.refs[nextField].focus();
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 9 }}>
          <KeyboardAwareScrollView>
            <View style={styles.container}>
              <View style={styles.backIconView}>
                <TouchableOpacity style={styles.backButton} onPress={this._backButton}>
                  <Image style={styles.backIcon} source={require("../assets/backIcon.png")} />
                </TouchableOpacity>
              </View>
              <Text style={styles.signUpheader}>{strings('signup.signup_title')}</Text>
              <Image style={styles.logo} source={require("../assets/signUpIcon.png")} />
              <View style={styles.signUpformView}>
                <View style={styles.elementBox1}>
                  <Text style={styles.headerLabel}>{strings('signup.first_name')}</Text>
                  <View style={[styles.inputFieldCoverView, styles.authInputFieldBottomBorder]}>
                    <Image style={styles.icon} source={require("../assets/user.png")} />
                    <TextInput
                      ref="0"
                      style={styles.textInputView}
                      maxLength={commonConstant.MAX_CHARACTER_DEFAULT}
                      value={this.state.FirstName}
                      placeholder={strings('signup.first_name_placeholder')}
                      returnKeyType="next"
                      onSubmitEditing={() => this.focusNextInputField('1')}
                      onChangeText={(firstName) => this.checkIfFieldsAreNotEmpty('firstName', firstName)}
                    />
                  </View>
                  {/* <View style={styles.lineView} /> */}
                </View>
                <View style={styles.elementBox2}>
                  <Text style={styles.headerLabel}>{strings('signup.last_name')}</Text>
                  <View style={[styles.inputFieldCoverView, styles.authInputFieldBottomBorder]}>
                    <Image style={styles.icon} source={require("../assets/user.png")} />
                    <TextInput
                      ref="1"
                      style={styles.textInputView}
                      maxLength={commonConstant.MAX_CHARACTER_DEFAULT}
                      value={this.state.LastName}
                      returnKeyType="next"
                      onSubmitEditing={() => this.focusNextInputField('2')}
                      placeholder={strings('signup.last_name_placeholder')}
                      onChangeText={(lastName) => this.checkIfFieldsAreNotEmpty('lastName', lastName)}
                    />
                  </View>
                  {/* <View style={styles.lineView} /> */}
                </View>
                <View style={styles.elementBox1}>
                  <Text style={styles.headerLabel}>{strings('signup.email')}</Text>
                  <View style={[styles.inputFieldCoverView, styles.authInputFieldBottomBorder]}>
                    <Image style={styles.icon} source={require("../assets/email.png")} />
                    <TextInput
                      ref="2"
                      style={styles.textInputView}
                      maxLength={commonConstant.MAX_CHARACTER_EMAIL}
                      value={this.state.EmailAddress}
                      returnKeyType="next"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      placeholder={strings('signup.email_placeholder')}
                      onChangeText={(emailAddress) => this.checkIfFieldsAreNotEmpty('EmailAddress', emailAddress)}
                    />
                  </View>
                  {/* <View style={styles.lineView} /> */}
                </View>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </View>
        <View style={{ flex: 1 }}>
          <TouchableHighlight
            style={[
              styles.fullSize
            ]}
            onPress={this._onNextButtonClicked}
            underlayColor="white"
            disabled={!this.state.enableNextBtn}
          >
            <View style={[
              styles.primaryBlueButton,
              styles.fullSize,
              this.state.enableNextBtn ? commonStyles.btnActivebackgroundColor : commonStyles.btnDisabledbackgroundColor]}>
              <Text style={styles.buttonTextWhite}>{strings('signup.next_btn')}</Text>
            </View>
          </TouchableHighlight>
        </View>
        <LoaderComponent showLoader={this.state.showActivityIndicator} />
        <CommonModal modalComponent = {this.state.modalComponent}/>
      </View>
    );
  }
}
