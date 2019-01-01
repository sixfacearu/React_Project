import React, { Component } from 'react';
import {
    View, Text, TouchableOpacity,
    ScrollView, TextInput, Dimensions, StyleSheet,
    Alert, TouchableHighlight, Linking, Platform,
    ListView
} from 'react-native';
import Image from 'react-native-remote-svg';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Navigation } from 'react-native-navigation';
import * as _ from 'lodash';

import { strings } from '../config/i18/i18n';
import commonStyles from '../styles/common.style';
import styles from '../styles/form.style';
import commonTheme from '../themes/common.theme';
import commonConstant from '../constants/common.constant';
import stringConstant from '../constants/string.constant';

import AsyncStorageUtil from '../utils/asyncstorage.util';
import commonUtil from '../utils/common.util';
import stackName from '../constants/stack.name.enum';
import LoaderComponent from '../components/loader.component';
import B21RequestModel from '../models/b21.request.model';
import UserAuthenticationModel from '../models/user.authentication.model';
import httpResponseModel from '../models/httpresponse.model';
import UserResponseModel from '../models/user.response.model';
import fontFamilyStyles from '../styles/font.style';
import ModalComponentModel from '../models/modal.component.model';
import CommonModal from '../components/common.modal';
import PaymentSupportedInstrumentTypesRequestModel from '../models/payment.supported.instrument.types.request.model';
import paymentInstrumentDirection from '../constants/payment.instrument.direction.enum';
import PaymentInterface from '../interfaces/payment.interface';
import PaymentSupportedInstrumentTypesResponseModel from '../models/payment.supported.instrument.types.response.model';
import PaymentSupportedInstrumentTypesModel from '../models/payment.supported.instrument.types.model';
import paymentInstrumentDisplayName from '../constants/payment.instrument.display.name.enum';
import screenId from '../constants/screen.id.enum';
import PropTypes from 'prop-types';
const screenWidth = Dimensions.get('window').width;
const screenHeight= Dimensions.get('window').height;

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
const propTypes = { cashBalance :  PropTypes.string};
const defaultProps = { cashBalance:""};

export default class ChooseInvestmentMethodScreen extends Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            showActivityIndicator: false,
            titleBar: {},
            paymentInstrumentTypesList: ds,
            userInfoFromStorage: new UserResponseModel(),
            userAuthenticationFromStorage: new UserAuthenticationModel(),
            modalComponent : {},
            supportedPITypeArr: [],
            cashBalance: this.props.cashBalance
        };
    }

    initializeModalComponent = () => {
        let initialModalComponent = new ModalComponentModel();
        initialModalComponent.shouldVisible = false;
        this.setState({
          modalComponent : initialModalComponent
        })
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

    componentDidMount() {
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
                    this._fetchPaymentInstrumentsFromAPI();
                });
            }
        });
    }

    showLoader = (bit) => { // call this function to show/hide the loader
        this.setState({
            showActivityIndicator: bit
        });
    }

    backButton = () => {
        Navigation.pop(this.props.componentId);
    }

    renderPaymentInstrumentView = (data) => {
        let tempData = new PaymentSupportedInstrumentTypesModel();
        tempData = data;
        tempData.ImageURL = this.mapIconFromFields(tempData.PITypeDisplayName);
        return (
            <TouchableOpacity 
                style = { [ commonStyles.fullWidth,commonStyles.flex1,commonStyles.flexDirectionColumn ] }
                disabled = { !tempData.isActive }
                onPress={this._onPaymentMethodRowPressed.bind(this, tempData)}>
                <View style = { [ commonStyles.fullWidth,commonStyles.flex1,commonStyles.flexDirectionRow ] }>    
                    <View 
                        style = {
                            [
                                commonStyles.width15pc,
                                commonStyles.justifyContentCenter
                            ]
                        }>
                        <Image
                            style = {
                                [
                                    commonStyles.icon23X14
                                ]
                            }
                            source = { tempData.ImageURL }/>
                    </View>
                    <View
                        style = {
                            [
                                commonStyles.width85pc,
                                commonStyles.justifyContentCenter,
                                commonStyles.flex1,
                                commonStyles.flexDirectionRow
                            ]
                        }>
                        <View
                            style = {
                                [
                                    commonStyles.width90pc
                                ]
                            }>
                            <Text
                                style = {
                                    [
                                        commonStyles.fontSize18,
                                        fontFamilyStyles.robotoLight,
                                        commonStyles.primaryTextColorLight
                                    ]
                                }>
                                {tempData.PITypeDisplayName}
                            </Text>
                        </View>
                        <View
                            style = {
                                [
                                    commonStyles.width10pc,
                                    commonStyles.alignItemsFlexEnd,
                                    commonStyles.justifyContentCenter
                                ]
                            }>
                            <Image
                                style = {
                                    [
                                        commonStyles.icon9X15,
                                        {
                                            tintColor: tempData.isActive?commonTheme.PRIMARY_BTN_BACKGROUND_COLOR:"#4a4a4a"
                                        }
                                    ]
                                }
                                source = { require("../assets/next_arrow_blue.png") }/>
                        </View>
                    </View>
                </View>
                {this.returnSeparator()}
            </TouchableOpacity>
        );
    }

    /**
     * ICON MAPPING WITH FIELDS
     */
    mapIconFromFields = (objectName) => {

        if(objectName === paymentInstrumentDisplayName.CashBalance) {
            return require("../assets/cash_green_icon.png");
        } else if(objectName === paymentInstrumentDisplayName.Card) {
            return require("../assets/id_card.png");
        } else {
            return require("../assets/id_card.png");
        }
    }

    _fetchPaymentInstrumentsFromAPI = () => {
        let userInfoModel = new UserResponseModel();
        let userAuthentication = new UserAuthenticationModel();
        userInfoModel = this.state.userInfoFromStorage;
        userAuthentication = this.state.userAuthenticationFromStorage;
        if (!_.isEmpty(userInfoModel)) {
            this.showLoader(true);
            let requestModel = new PaymentSupportedInstrumentTypesRequestModel();
            requestModel.AuthenticationToken = userAuthentication.Token;
            requestModel.Direction = paymentInstrumentDirection.Deposit;
            PaymentInterface.getSupportedPaymentInstrumentTypes(requestModel).then( (response) => {
                let res = new httpResponseModel();
                res = response;
                console.log(res);
                if (res.ErrorCode === commonConstant.SUCCESS_CODE) {
                    let supportedPITypeResponse = new PaymentSupportedInstrumentTypesResponseModel();
                    supportedPITypeResponse = res.Result;
                    supportedPITypeResponse.SupportedPITypes.forEach(element => {
                        let tempElement = new PaymentSupportedInstrumentTypesModel();
                        tempElement = element;
                        tempElement.isActive = true;
                        element = tempElement;
                    });
                    // hard coded cash balance 
                    let tempPaymentModel = new PaymentSupportedInstrumentTypesModel();
                    tempPaymentModel.PITypeDisplayName = paymentInstrumentDisplayName.CashBalance;
                    tempPaymentModel.PITypeName = paymentInstrumentDisplayName.CashBalance;
                    tempPaymentModel.PITypeID = "0";
                    tempPaymentModel.isActive = this.state.cashBalance > 0 ? true : false;
                    supportedPITypeResponse.SupportedPITypes.push(tempPaymentModel);
                    this.setState({
                        supportedPITypeArr: supportedPITypeResponse.SupportedPITypes
                    }, () => {
                        this.setState({
                            paymentInstrumentTypesList: this.state.paymentInstrumentTypesList.cloneWithRows(this.state.supportedPITypeArr)
                        });
                    });
                } else if (res.ErrorCode === commonConstant.ACCESS_DENIED_ERROR_CODE) {
                    //redirect to login
                    this.showCustomAlert(true,res.ErrorMsg);
                } else {
                    this.showCustomAlert(true,res.ErrorMsg);
                }
                this.showLoader(false);
            }, (error) => {
                this.showLoader(false);
                this.showCustomAlert(true,strings('common.api_failure'));
            });
        }
    }

    _onPaymentMethodRowPressed = (data) => {
        let tempPaymentInstrumentData = new PaymentSupportedInstrumentTypesModel();
        tempPaymentInstrumentData = data;
        this.setState({
            showActivityIndicator: true
        });
        if(tempPaymentInstrumentData.PITypeDisplayName === paymentInstrumentDisplayName.Card) {
            Navigation.push(stackName.GoalScreenStack, {
                component : {
                    name: screenId.DebitCardSelectPaymentInstrumentScreen,
                    passProps : {
                        paymentInstrumentType : tempPaymentInstrumentData
                    }
                }
            }).then( () => {
                this.setState({
                    showActivityIndicator: false
                });
            });
        } else if(tempPaymentInstrumentData.PITypeDisplayName === paymentInstrumentDisplayName.CashBalance) {
            // modify code after user story is finalized.
            Navigation.push(stackName.GoalScreenStack, {
                component : {
                    name: screenId.InvestmentCashBalanceAmountScreen,
                    passProps : {
                        cashBalance : this.state.cashBalance
                    }
                }
            }).then( () => {
                this.setState({
                    showActivityIndicator: false
                });
            });
        }
    }

    returnSeparator = () => {
        return (
            <View
                style={
                    [
                        commonStyles.fullWidth,
                        commonStyles.alignItemsCenter,
                        commonStyles.defaultPaddingTop,
                        commonStyles.defaultPaddingBottom
                    ]
                }>
                <View
                    style={
                        [
                            commonStyles.fullWidth,
                            commonStyles.default15PaddingLeftRight,
                            commonStyles.borderBottomwidth979797
                        ]
                    }>
                </View>
            </View>
        )
    }

    render() {        
        return (
            <View style={[commonStyles.commonScreenContainer]}>
                <View style={[styles.kycHeaderSection,{marginTop:0}]}>
                    <TouchableOpacity style={[styles.backButton]} onPress={this.backButton}>
                        <Image style={styles.backIcon} source={require("../assets/backIcon.png")}/>
                    </TouchableOpacity>
                    <Text 
                        style = {
                            [
                                fontFamilyStyles.robotoRegular,
                                commonStyles.fontSize23,
                                commonStyles.primaryTextColorLight
                            ]
                        }>
                        { strings('chooseInvestmentMethod.title') }
                    </Text>
                </View>  
                <KeyboardAwareScrollView
                scrollEnabled={true}
                bounces={false} showsVerticalScrollIndicator={false} width={screenWidth} contentContainerStyle={{alignItems:'center'}}>
                    <Image style={[styles.kycLogo]} source={ require('../assets/dollar_yellow_circle.png') }/>
                    <View 
                        style = {
                            [
                                commonStyles.fullWidth,commonStyles.margin40Top, commonStyles.alignItemsCenter,
                                {
                                    marginBottom: Platform.OS === 'ios'? 0:55
                                }
                            ]
                        }>
                        <View style={[commonStyles.width80pc]}>
                            {/* list view */}
                            <ListView
                                // style={{ display: !this.state.toggleListDonutViewstate ? 'flex' : 'none' }}
                                dataSource={this.state.paymentInstrumentTypesList}
                                renderRow={(data) => this.renderPaymentInstrumentView(data)} />
                        </View>
                    </View>
                </KeyboardAwareScrollView>
                <LoaderComponent showLoader = { this.state.showActivityIndicator }/>
                <CommonModal modalComponent = {this.state.modalComponent}/>
            </View>
        );
    }
}