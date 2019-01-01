import React, { Component } from 'react';
import {
  View, Text, TextInput, Button, Alert,
  ScrollView, FlatList, SectionList, ActivityIndicator,
  AppRegistry, Image, Platform, TouchableHighlight,
  TouchableOpacity, TouchableNativeFeedback, TouchableWithoutFeedback, Dimensions
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import PropTypes from 'prop-types';
import * as _ from 'lodash';

import styles from '../styles/form.style';
import commonStyles from '../styles/common.style';
import { strings } from '../config/i18/i18n';
import commonConstant from '../constants/common.constant';
import LoaderComponent from '../components/loader.component';
import httpResponseModel from '../models/httpresponse.model';
import UserRequestModel from '../models/user.request.model';
import AsyncStorageUtil from '../utils/asyncstorage.util';
import SoftSignUpInterface from '../interfaces/auth.interface';
import UserModel from '../models/user.model';
import stringConstant from '../constants/string.constant';
import stackName from '../constants/stack.name.enum';
import screenId from '../constants/screen.id.enum';
import { connect } from 'react-redux';
import { addUserInfo } from "../config/redux.store/actions/index";
import UserResponseModel from '../models/user.response.model';

import ModalComponentModel from '../models/modal.component.model';
import CommonModal from '../components/common.modal';
import commonUtil from '../utils/common.util';

const propTypes = { user: PropTypes.object };
const defaultProps = { user: new UserModel() };

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

// Sign up class
class SetPasswordScreen extends Component {


  constructor(props) {
    super(props);
    Navigation.events().bindComponent(this);
    this.state = {
      enableNextBtn: false,
      showActivityIndicator: false,
      user: this.props.user,
      ConfirmPassword: "",
      passwordStrength: 0,
      showPasswordStrengthBar: false,
      modalComponent : {}
    };
    console.log(this.props.user);
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
  // Actions
  _backButton = () => {
    Navigation.pop(this.props.componentId);
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
    if (!_.isEqual(this.props.user, nextProps.user)) {
      this.setState({
        user: nextProps.user
      });
    }
  }

  showLoader = (bit) => { // call this function to show/hide the loader
    this.setState({
      showActivityIndicator: bit
    });
  }

  _onNextButtonClicked = () => {
    console.log('btn clicked');
    if (!this.state.showActivityIndicator) {
      if (this.state.Password === this.state.ConfirmPassword) {
        AsyncStorageUtil.getItem(stringConstant.SPECIAL_USER_TOKEN).then((specialToken) => {
          
          if (specialToken) {
            let userInfo = new UserRequestModel();
            userInfo.FirstName = this.state.user.firstName;
            userInfo.LastName = this.state.user.lastName;
            userInfo.EmailAddress = this.state.user.emailAddress;
            userInfo.Password = this.state.Password;
            userInfo.AuthenticationToken = JSON.parse(specialToken);

            this.showLoader(true);
            SoftSignUpInterface.createUser(userInfo).then((response) => {
              var res = new httpResponseModel();
              res = response;
              console.log(res);
              this.showLoader(false);
              if (res.ErrorCode == commonConstant.SUCCESS_CODE) {
                console.log(res.Result.User);//
                let userResponseModel = new UserResponseModel();
                userResponseModel = res.Result.User;
                this.props.addUserInfo(userResponseModel);
                AsyncStorageUtil.removeItem(stringConstant.ALL_CURRENCY_INFO);
                AsyncStorageUtil.removeItem(stringConstant.ALL_CRPTO_CURRENCIES);
                AsyncStorageUtil.removeItem(stringConstant.STORE_KYC_USER_STATIC_INFO);
                AsyncStorageUtil.removeItem(stringConstant.STORE_KYC_USER_DYNAMIC_INFO);
                AsyncStorageUtil.removeItem(stringConstant.STORE_KYC_USER_ADDRESS_INFO);
                AsyncStorageUtil.removeItem(stringConstant.STORE_KYC_ADDITIONAL_INFO);
                AsyncStorageUtil.removeItem(stringConstant.STORE_KYC_ADDITIONAL_INFO_KEY_VALUE);
                AsyncStorageUtil.removeItem(stringConstant.STORE_KYC_NATIONAL_INFO);
                AsyncStorageUtil.removeItem(stringConstant.STORE_KYC_NATIONAL_INFO_KEY_VALUE);
                AsyncStorageUtil.removeItem(stringConstant.STORE_KYC_USER_DOB);
                AsyncStorageUtil.removeItem(stringConstant.EVERIFY_SUPPORT_INFO);
                AsyncStorageUtil.removeItem(stringConstant.GET_REGISTER_USER_FIELD_INFO);
                AsyncStorageUtil.removeItem(stringConstant.GET_REGISTER_NATIONAL_ID_INFO);
                AsyncStorageUtil.removeItem(stringConstant.GET_REGISTER_CONSENTS_INFO);
                AsyncStorageUtil.removeItem(stringConstant.STORE_KYC_USER_ADDRESS_INFO_KEY_VALUE);
                AsyncStorageUtil.removeItem(stringConstant.STORE_KYC_DATA_WITH_DOCUMENT_DYNAMIC_INFO);
                AsyncStorageUtil.removeItem(stringConstant.STORE_KYC_DOCUMENT_STATIC_INFO);
                AsyncStorageUtil.removeItem(stringConstant.STORE_KYC_USER_DYNAMIC_INFO_FOR_DOCUMENT_UPLOAD);
                AsyncStorageUtil.removeItem(stringConstant.SAVE_SOURCE_OF_FUND_INFO);
                AsyncStorageUtil.removeItem(stringConstant.GOAL_INFO_STORAGE_KEY);
                AsyncStorageUtil.removeItem(stringConstant.CRYPTO_CURRENCY_INFO);
                AsyncStorageUtil.removeItem(stringConstant.GOAL_ALLOCATION_INFO);
                AsyncStorageUtil.removeItem(stringConstant.USER_CONTACT_INFO);
                AsyncStorageUtil.removeItem(stringConstant.SAVE_GOAL_CURRENCY_INFO);
                AsyncStorageUtil.removeItem(stringConstant.SAVE_USER_INFO).then((success) => {
                  AsyncStorageUtil.storeItem(stringConstant.SAVE_USER_INFO, res.Result).then((success) => {
                    Navigation.setStackRoot(stackName.AuthenticationStack, {
                      component: {
                        name: screenId.AddMobileNumberScreen
                      }
                    });
                  });
                });
              } if (res.ErrorCode == commonConstant.INVALID_PASSWORD) {
                this.showCustomAlert(true,res.ErrorMsg)
              } else if (res.ErrorCode == commonConstant.ACCESS_DENIED_ERROR_CODE) {
                Navigation.popToRoot(stackName.AuthenticationStack);
              }
            }, (err) => {
              this.showLoader(false);
              this.showCustomAlert(true,strings('common.api_failure'));
            });
          }
        });
      }
    }
  }

  checkPasswordStrength = () => {
    var passwordStrength = 0;
    if (commonConstant.LOWERCASE_CHARACTER_REGEX.test(this.state.Password)) {
      passwordStrength++;
    }
    if (commonConstant.UPPERCASE_CHARACTER_REGEX.test(this.state.Password)) {
      passwordStrength++;
    }
    if (commonConstant.NUMBER_REGEX.test(this.state.Password)) {
      passwordStrength++;
    }
    if (commonConstant.SPECIAL_CHARACTER_REGEX.test(this.state.Password)) {
      passwordStrength++;
    }
    if (this.state.Password.length >= commonConstant.MIN_CHARACTER_PASSWORD) {
      passwordStrength++;
    }
    if (this.state.Password.indexOf("&") > -1
      || this.state.Password.indexOf("\"") > -1
      || this.state.Password.indexOf("\'") > -1
      || this.state.Password.indexOf("\`") > -1
      || this.state.Password.indexOf("\\") > -1) {
      passwordStrength--;
    } else {
      passwordStrength++;
    }

    this.setState({
      passwordStrength: passwordStrength
    }, () => {
      
      if (this.state.Password.length != 0) {
        this.setState({
          showPasswordStrengthBar: true
        });
      } else {
        this.setState({
          showPasswordStrengthBar: false
        });
      }
    });
  }

  checkIfFieldsAreNotEmpty = (type, value) => {
    if (type == "Password") {
      this.setState({
        Password: value
      }, () => {
        this.checkPasswordStrength();
        this._checkIfPasswordMatches();
      });
    }
    if (type == "ConfirmPassword") {
      this.setState({
        ConfirmPassword: value
      }, () => {
        this._checkIfPasswordMatches();
      });
    }
  }

  _checkIfPasswordMatches = () => {
    if (this.state.Password != "" && this.state.ConfirmPassword != "") {
      if (this.state.Password === this.state.ConfirmPassword) {
        this.setState({ enableNextBtn: true });
      } else {
        this.setState({ enableNextBtn: false });
      }
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
              <Text style={styles.signUpheader}>{strings('setpassword.title')}</Text>
              <Image style={[styles.logo, {marginBottom: screenHeight <= 592 ? 8 : 30,marginTop: screenHeight <= 592 ? 0 : 10}]} source={require("../assets/setPassword.png")} />
              <Text style={styles.descriptionText}>{strings('setpassword.description')}</Text>
              <View style={[styles.setPasswordformView, {marginTop: screenHeight <= 592 ? 22 : 50}]}>
                <View style={styles.elementBox1}>
                  <View style={styles.passwordStrengthCoverView}>
                    <Text style={styles.setPasswordHeaderLabel}>{strings('setpassword.password')}</Text>
                    <View style={styles.passwordStrengthBgView}>
                      <View style={
                        [
                          { display: this.state.showPasswordStrengthBar ? 'flex' : 'none' },
                          this.state.passwordStrength <= 4 ? styles.passwordWeak : "",
                          this.state.passwordStrength == 5 ? styles.passwordMedium : "",
                          this.state.passwordStrength == 6 ? styles.passwordStrong : "",
                        ]
                      }></View>
                    </View>
                  </View>
                  <View style={[styles.inputFieldCoverView,styles.authInputFieldBottomBorder]}>
                    <Image style={[styles.icon]} source={require("../assets/setPassBlackSmall.png")} />
                    <TextInput
                      ref="0"
                      style={styles.textInputView}
                      maxLength={commonConstant.MAX_CHARACTER_PASSWORD}
                      placeholder={strings('setpassword.password_placeholder')}
                      value={this.state.Password}
                      secureTextEntry={true}
                      returnKeyType="next"
                      autoCapitalize="none"
                      onSubmitEditing={() => this.focusNextInputField('1')}
                      onChangeText={(Password) => this.checkIfFieldsAreNotEmpty('Password', Password)}
                    />
                  </View>
                  {/* <View style={styles.lineView} /> */}
                </View>
                <View style={styles.elementBox2}>
                  <Text style={styles.headerLabel}>{strings('setpassword.retype_password')}</Text>
                  <View style={[styles.inputFieldCoverView,styles.authInputFieldBottomBorder]}>
                    <Image style={[styles.icon]} source={require("../assets/setPassBlackSmall.png")} />
                    <TextInput
                      ref="1"
                      style={styles.textInputView}
                      maxLength={commonConstant.MAX_CHARACTER_PASSWORD}
                      placeholder={strings('setpassword.retype_password_placeholder')}
                      value={this.state.ConfirmPassword}
                      secureTextEntry={true}
                      returnKeyType="next"
                      autoCapitalize="none"
                      onChangeText={(ConfirmPassword) => this.checkIfFieldsAreNotEmpty('ConfirmPassword', ConfirmPassword)}
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
            disabled={!this.state.enableNextBtn}>
            <View style={
              [
                styles.primaryBlueButton,
                styles.fullSize,
                this.state.enableNextBtn ? commonStyles.btnActivebackgroundColor : commonStyles.btnDisabledbackgroundColor
              ]}>
              <Text style={styles.buttonTextWhite}>{strings('setpassword.next_btn')}</Text>
            </View>
          </TouchableHighlight>
        </View>
        <LoaderComponent showLoader={this.state.showActivityIndicator} />
        <CommonModal modalComponent = {this.state.modalComponent}/>
      </View>
    );
  }
}

SetPasswordScreen.propTypes = propTypes;
SetPasswordScreen.defaultProps = defaultProps;

const mapStateToProps = state => {
  return {
    UserResponseModel: state.userInfoReducer.userResponse
  };
}

const mapDispatchToProps = dispatch => {
  return {
    addUserInfo: (UserResponseModel) => dispatch(addUserInfo(UserResponseModel))
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(SetPasswordScreen);