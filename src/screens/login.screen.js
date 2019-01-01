import React, { Component } from 'react';
import {
  TextInput, Alert, FlatList,
  SectionList, ActivityIndicator, ScrollView,
  View, Text, Button, AppRegistry, Image,
  Platform, TouchableHighlight, TouchableOpacity,
  TouchableNativeFeedback, TouchableWithoutFeedback, DeviceEventEmitter
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { connect } from 'react-redux';
import { addUserInfo,addGoalDashboard, addUserAuthorization } from "../config/redux.store/actions/index";
import { strings } from '../config/i18/i18n';
import commonStyles from '../styles/common.style';
import LoaderComponent from '../components/loader.component';
import styles from '../styles/form.style';
import stackName from '../constants/stack.name.enum';
import screenId from '../constants/screen.id.enum';
import commonConstant from '../constants/common.constant';
import UserRequestModel from '../models/user.request.model';
import AuthInterface from '../interfaces/auth.interface';
import httpResponseModel from '../models/httpresponse.model';
import UserResponseModel from '../models/user.response.model';
import fontFamilyStyles from '../styles/font.style';
import UserRegistrationResponseModel from '../models/userregistration.model';
import NavigationUtil from '../utils/navigation.util';
import stringConstant from '../constants/string.constant';
import AsyncStorageUtil from '../utils/asyncstorage.util';

import ModalComponentModel from '../models/modal.component.model';
import CommonModal from '../components/common.modal';
import commonUtil from '../utils/common.util';
import GoalDashboardResponseModel from '../models/goal.dashboard.response.model';
import UserAuthenticationModel from '../models/user.authentication.model';
// Login Screen 
class LoginScreen extends Component {

  constructor(props) {
    super(props);
    Navigation.events().bindComponent(this);

    this.state = {
      showActivityIndicator: false,
      userName: "",
      password: "",
      enableLoginBtn: false,
      modalComponent : {}
    };

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

  signUpButtonPressed = () => {
    Navigation.push(stackName.AuthenticationStack, {
      component: {
        name: screenId.SignUpScreen,
      }
    });
  }

  _onLoginButtonPressed = () => {
    if (!commonConstant.EMAIL_REGEX.test(this.state.userName)) {
      //alert("Please enter a valid email address");
      this.showCustomAlert(true,strings('signin.please_enter_valid_email'))
    } else {
      let userInfoModel = new UserRequestModel();
      userInfoModel.Username = this.state.userName;
      userInfoModel.Password = this.state.password;

      this.showLoader(true);
      AuthInterface.authAndGetUserInfo(userInfoModel).then( (response) => {
        var res = new httpResponseModel();
        res = response;
        if (res.ErrorCode == commonConstant.SUCCESS_CODE) {
          let userResponseModel = new UserResponseModel();
          let userRegistrationModel = new UserRegistrationResponseModel();
          let tempGoalDashboardModel = new GoalDashboardResponseModel();
          let tempUserAuthenticationModel = new UserAuthenticationModel();
          tempGoalDashboardModel = res.Result.GoalDashboard;
          userResponseModel = res.Result.User;
          userRegistrationModel = res.Result.UserSignupRegistrationInfo;
          tempUserAuthenticationModel = res.Result.AuthenticationToken;
          this.props.addUserAuthorization(tempUserAuthenticationModel);
          // alert(JSON.stringify(res.Result));
          let goalDashboardModel = new GoalDashboardResponseModel();
          goalDashboardModel.GoalCurrencyCode = tempGoalDashboardModel.GoalCurrencyCode;
          this.props.addGoalDashboard(goalDashboardModel);
          AsyncStorageUtil.storeItem(stringConstant.SAVE_USER_INFO, res.Result).then((success) => {
            if(userRegistrationModel.PhoneCountryCodeSignupSupported == "F") {
              //redirect to country not supported screen
              Navigation.setStackRoot(stackName.AuthenticationStack, {
                component: {
                    name: screenId.CountryNotSupportedScreen
                }
              });
            } else {
              //modify based on further comments on #993
              NavigationUtil.setDynamicBottomTabsForGoal(screenId.GoalDashboardScreen,tempGoalDashboardModel)
            }
          });
          this.props.addUserInfo(userResponseModel);
        } else {
          this.showCustomAlert(true,res.ErrorMsg);
        }
        this.showLoader(false);
      }, (err) => {
        this.showLoader(false);
        this.showCustomAlert(true,strings('common.api_failure'));
      });
    }
  }

  _onForgotPasswordButtonClicked = () => {
    //alert("This feature is not available right now!");
    this.showCustomAlert(true,"This feature is not available right now!");
  }

  focusNextInputField = (nextField) => {
    this.refs[nextField].focus();
  }

  checkIfFieldsAreNotEmpty = (type, value) => {
    if (type == "userName") {
      this.setState({
        userName: value
      }, () => {
        if(this.state.userName.length >= 6) {
          this.changeLoginBtnState();
        } else {
          this.setState({
            enableLoginBtn: false
          });
        }
      });
    }
    if (type == "password") {
      this.setState({
        password: value
      }, () => {
        this.changeLoginBtnState();
      });
    }
  }

  changeLoginBtnState = () => {
    if (this.state.userName && this.state.userName.length >= 6 && this.state.password) {
      this.setState({
        enableLoginBtn: true
      });
    } else {
      this.setState({
        enableLoginBtn: false
      });
    }
  }

  componentDidAppear() {

  }

  render() {
    return (
      <KeyboardAwareScrollView>
        <View style={styles.container}>
          <Text style={[styles.header, styles.reducedHeaderMargin]}>{strings('signin.login_title')}</Text>
          <Image style={styles.logo} source={require("../assets/B21Logo.png")} />
          <View style={styles.formView}>
            <View style={styles.elementBox1}>
              <Text style={styles.headerLabel}>{strings('signin.email')}</Text>
              <View style={[styles.inputFieldCoverView, styles.authInputFieldBottomBorder]}>
                <Image style={styles.icon} source={require("../assets/email.png")} />
                <TextInput
                  ref='0'
                  value={this.state.userName}
                  maxLength={commonConstant.MAX_CHARACTER_EMAIL}
                  style={styles.textInputView}
                  placeholder={strings('signin.email_placeholder')}
                  returnKeyType='next'
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onSubmitEditing={() => this.focusNextInputField('1')}
                  onChangeText={(userName) => this.checkIfFieldsAreNotEmpty('userName', userName)}
                />
              </View>
              {/* <View style={styles.lineView} /> */}
            </View>
            <View style={styles.elementBox2}>
              <Text style={styles.headerLabel}>{strings('signin.password')}</Text>
              <View style={[styles.inputFieldCoverView, styles.authInputFieldBottomBorder]}>
                <Image style={styles.icon} source={require("../assets/password.png")} />
                <TextInput
                  ref='1'
                  maxLength={commonConstant.MAX_CHARACTER_PASSWORD}
                  value={this.state.password}
                  style={styles.textInputView}
                  placeholder={strings('signin.password_placeholder')}
                  returnKeyType='default'
                  autoCapitalize="none"
                  secureTextEntry={true}
                  onChangeText={(password) => this.checkIfFieldsAreNotEmpty('password', password)}
                />
              </View>
              {/* <View style={styles.lineView} /> */}
            </View>
            <View style={styles.elementBox3}>
              <TouchableHighlight 
                style={styles.fullWidth} 
                onPress={this._onLoginButtonPressed}
                disabled={!this.state.enableLoginBtn} 
                underlayColor="white">
                <View 
                  style = {
                    [
                      this.state.enableLoginBtn ? styles.primaryYellowButton : styles.primaryDisableButton,
                      styles.buttonRadius
                    ]
                  }>
                  <Text 
                    style={
                      [
                        styles.buttonTextWhite,
                        fontFamilyStyles.robotoRegular,
                        this.state.enableLoginBtn ?commonStyles.secTextColor:styles.disabledTextColor,
                      ]
                    }>
                    {strings('signin.login_button')}</Text>
                </View>
              </TouchableHighlight>
            </View>
          </View>
          <TouchableHighlight style={{ alignItems: 'center' }} onPress={this._onForgotPasswordButtonClicked} underlayColor="white">
            <View style={styles.secondaryTransparentButton}>
              <Text style={styles.buttonTextYellow}>{strings('signin.forgot_password')}</Text>
            </View>
          </TouchableHighlight>
          <View style={styles.signupView}>
            <Text style={styles.signupLabel}>{strings('signin.dont_have_account')}</Text>
            <TouchableHighlight style={{ alignItems: 'center' }} onPress={this.signUpButtonPressed} underlayColor="transparent">
              <View style={styles.secondaryTransparentButton}>
                <Text style={styles.buttonTextBlue}>{strings('signin.signup_button')}</Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
        <LoaderComponent showLoader={this.state.showActivityIndicator} />
        <CommonModal modalComponent = {this.state.modalComponent}/>
      </KeyboardAwareScrollView>
    );
  }
}

const mapStateToProps = state => {
  return {
    UserResponseModel: state.userInfoReducer.userResponse,
    goalDashboardResponse: state.goalDashboardReducer.goalDashboardResponse,
    userAuthorizationResponse: state.userAuthorizationReducer.userAuthorizationResponse
  };
}

const mapDispatchToProps = dispatch => {
  return {
    addUserInfo: (UserResponseModel) => dispatch(addUserInfo(UserResponseModel)),
    addGoalDashboard: (goalDashboardResponse) => dispatch(addGoalDashboard(goalDashboardResponse)),
    addUserAuthorization: (userAuthorizationResponse) => dispatch(addUserAuthorization(userAuthorizationResponse))
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(LoginScreen);