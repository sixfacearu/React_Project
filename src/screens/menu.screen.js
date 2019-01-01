import React, { Component } from 'react';
import { View, Text, Image,TouchableOpacity,ScrollView, Dimensions } from 'react-native';
import VersionNumber from 'react-native-version-number';
import { Navigation } from 'react-native-navigation';
import * as _ from 'lodash';

import { strings } from '../config/i18/i18n';
import commonStyles from '../styles/common.style';
import styles from '../styles/form.style';
import commonTheme from '../themes/common.theme';
import { connect } from 'react-redux';
import UserResponseModel from '../models/user.response.model';
import stackName from '../constants/stack.name.enum';
import screenId from '../constants/screen.id.enum';
import B21RequestModel from '../models/b21.request.model';
import B21ResponseModel from '../models/b21.response.model';
import GetUserInfoResponseModel from '../models/getuserinfo.response.model';
import UserAuthenticationModel from '../models/user.authentication.model';
import AsyncStorageUtil from '../utils/asyncstorage.util';
import stringConstant from '../constants/string.constant';
import AuthInterface from '../interfaces/auth.interface';
import commonConstant from '../constants/common.constant';

import ModalComponentModel from '../models/modal.component.model';
import CommonModal from '../components/common.modal';
import commonUtil from '../utils/common.util';

var screen = require('Dimensions').get('window');

class MenuScreen extends Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            userResponseModel : new UserResponseModel(),
            showNotificationBadge:false,
            notificationBadgeCount:'07', // Later fetch from notification count
            appVersion: VersionNumber.appVersion,
            userInfoFromStorage: new UserResponseModel(),
            userAuthenticationFromStorage: new UserAuthenticationModel(),
            modalComponent : {}
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

    componentDidMount(){
        AsyncStorageUtil.getItem(stringConstant.SAVE_USER_INFO).then((userData) => {
            userData = JSON.parse(userData);
            let userInfoModel = new UserResponseModel();
            let userAuthentication = new UserAuthenticationModel();
            if(userData) {
                userInfoModel = userData.User;
                userAuthentication = userData.AuthenticationToken;
                //alert(JSON.stringify(userInfoModel));
                this.setState({
                    userInfoFromStorage: userInfoModel,
                    userAuthenticationFromStorage: userAuthentication
                }, () => {
                    let userResponseModel = new UserResponseModel();
                    userResponseModel = this.props.userResponse;
                    if(!_.isEmpty(userResponseModel)) {
                        this.setState({
                            userResponseModel : userResponseModel
                        });
                    } else {
                        this.getUserInfoFromAPI();
                    }
                });
            }
        });
    }

    getUserInfoFromAPI = () => {
        
        let request = new B21RequestModel();
        request.AuthenticationToken = this.state.userAuthenticationFromStorage.Token;
        AuthInterface.getUserInfo(request).then( (response) => {
            let res = new B21ResponseModel();
            res = response;
            console.log(res);
            if(res.ErrorCode == commonConstant.SUCCESS_CODE) {
                //Navigate to source of funds screen user story #735
                let infoResponse = new GetUserInfoResponseModel();
                infoResponse = res.Result;
                let userResponseModel = new UserResponseModel();
                userResponseModel = infoResponse.User;
                this.setState({
                    userResponseModel : userResponseModel
                });
            }
        });
    }

    render() {
        return (
            <View style={styles.menuScreenMainContainer}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.menuView}>
                        {/* My Account */}
                        <Text style={styles.menuSectionText}>{strings('menuScreen.my_account')}</Text>
                        {/* First Row */}
                        <TouchableOpacity style={styles.menuRow} activeOpacity = { 1 } disabled={true} onPress = {() =>this.openRespectiveScreen(screenId.KYCConfirmEmailScreen) }>
                            <Image style={styles.menuIcon} source={require("../assets/menu.notification.icon.png")} />
                            <Text style={[styles.menuText,{flex:7}]}>{strings('menuScreen.notifications')}</Text>
                            <View style={styles.badgeContainer}>
                                <Text style={[styles.notificationBadge,{display:this.state.showNotificationBadge?'flex':'none'}]}>{this.state.notificationBadgeCount}</Text>
                            </View>
                        </TouchableOpacity>
                        {/* Second Row */}
                        <TouchableOpacity style={styles.menuRow} activeOpacity = { 1 } onPress = {() => this.openRespectiveScreen(screenId.KYCConfirmEmailScreen)}>
                            <Image style={styles.menuIcon} source={require("../assets/menu.profile.icon.png")} />
                            <Text style={styles.menuText}>{strings('menuScreen.profile')}</Text>
                        </TouchableOpacity>
                         {/* Third Row */}
                         <TouchableOpacity style={styles.menuRow} activeOpacity = { 1 } disabled={true} onPress = {() => this.openRespectiveScreen(screenId.KYCConfirmEmailScreen)}>
                            <Image style={styles.menuIcon} source={require("../assets/menu.investment.icon.png")} />
                            <Text style={styles.menuText}>{strings('menuScreen.investment_allocation')}</Text>
                        </TouchableOpacity>
                        {/* Fourth Row */}
                        <TouchableOpacity style={styles.menuRow} activeOpacity = { 1 } disabled={true} onPress = {() => this.openRespectiveScreen(screenId.KYCConfirmEmailScreen)}>
                            <Image style={styles.menuIcon} source={require("../assets/menu.fundingmethod.icon.png")} />
                            <Text style={styles.menuText}>{strings('menuScreen.funding_methods')}</Text>
                        </TouchableOpacity>
                        {/* Fifth Row */}
                        <TouchableOpacity style={styles.menuRow} activeOpacity = { 1 } disabled={true} onPress = {() => this.openRespectiveScreen(screenId.KYCConfirmEmailScreen)}>
                            <Image style={styles.menuIcon} source={require("../assets/menu.transectionhistory.icon.png")} />
                            <Text style={styles.menuText}>{strings('menuScreen.transaction_history')}</Text>
                        </TouchableOpacity>
                        {/* Sixth Row */}
                        <TouchableOpacity style={styles.menuRow} activeOpacity = { 1 } disabled={true} onPress = {() => this.openRespectiveScreen(screenId.KYCConfirmEmailScreen)}>
                            <Image style={styles.menuIcon} source={require("../assets/menu.withdraw.icon.png")} />
                            <Text style={styles.menuText}>{strings('menuScreen.withdraw')}</Text>
                        </TouchableOpacity>
                        {/* Seventh Row */}
                        <TouchableOpacity style={styles.menuRow} activeOpacity = { 1 } disabled={true} onPress = {() => this.openRespectiveScreen(screenId.KYCConfirmEmailScreen)}>
                            <Image style={styles.menuIcon} source={require("../assets/menu.security.icon.png")} />
                            <Text style={styles.menuText}>{strings('menuScreen.security')}</Text>
                        </TouchableOpacity>
                        {/* Eighth Row */}
                        <TouchableOpacity style={[styles.menuRow,styles.menuNoBorder]} disabled={true} activeOpacity = { 1 } onPress = {() => this.openRespectiveScreen(screenId.KYCConfirmEmailScreen)}>
                            <Image style={styles.menuIcon} source={require("../assets/menu.changepassword.icon.png")} />
                            <Text style={styles.menuText}>{strings('menuScreen.change_password')}</Text>
                        </TouchableOpacity>
                        
                        {/* App Settings and Version Number */}
                        <View style={styles.menuAppSettingSection}>
                            <Text style={styles.menuAppSettingText}>{strings('menuScreen.app_settings')}</Text>
                            <Text style={styles.menuVersionNumberText}>{strings('menuScreen.version')+this.state.appVersion}</Text>
                        </View>
                        {/* First Row */}
                        <TouchableOpacity style={styles.menuRow} activeOpacity = { 1 } disabled={true} onPress = {() => this.openRespectiveScreen(screenId.KYCConfirmEmailScreen)}>
                            <Image style={styles.menuIcon} source={require("../assets/menu.help.icon.png")} />
                            <Text style={styles.menuText}>{strings('menuScreen.help')}</Text>
                        </TouchableOpacity>
                        {/* Second Row */}
                        <TouchableOpacity style={styles.menuRow} activeOpacity = { 1 } disabled={true} onPress = {() => this.openRespectiveScreen(screenId.KYCConfirmEmailScreen)}>
                            <Image style={styles.menuIcon} source={require("../assets/menu.legal.icon.png")} />
                            <Text style={styles.menuText}>{strings('menuScreen.legal')}</Text>
                        </TouchableOpacity>
                        {/* Third Row */}
                        <TouchableOpacity style={[styles.menuRow,styles.menuNoBorder]} disabled={true} activeOpacity = { 1 } onPress = {() => this.openRespectiveScreen(screenId.KYCConfirmEmailScreen)}>
                            <Image style={styles.menuSignoutIcon} source={require("../assets/menu.signout.icon.png")} />
                            <Text style={styles.menuText}>{strings('menuScreen.sign_out')}</Text>
                        </TouchableOpacity>

                    </View>
                </ScrollView>
                <CommonModal modalComponent = {this.state.modalComponent}/>
            </View>
        );
    }

    /**
     * ACTIONS
     */
    openRespectiveScreen = (screenName) => {
        //alert(screenName)
        if(this.state.userResponseModel.Status == "R"){
            this.showCustomAlert(true,strings('menuScreen.please_complete_kyc_to_continue'));
        } else if(this.state.userResponseModel.Status == "A") {
            Navigation.push(stackName.MenuScreenStack, {
                component: {
                  name: screenName,
                }
            });
        }
    }
}

const mapStateToProps = state => {
    return {
      userResponse: state.userInfoReducer.userResponse
    };
  }
export default connect(mapStateToProps)(MenuScreen);