import React, { Component } from 'react';
import {
    View, Text, Picker, TextInput,
    TouchableOpacity, TouchableHighlight, ListView,
    Alert, Keyboard, NativeModules, Platform, Dimensions
} from 'react-native';
import { Navigation } from 'react-native-navigation';

import { strings } from '../config/i18/i18n';
import commonStyles from '../styles/common.style';
import fontFamilyStyles from '../styles/font.style';
import commonConstant from '../constants/common.constant';
import LoaderComponent from '../components/loader.component';
import styles from '../styles/form.style';
import Image from 'react-native-remote-svg'
import AsyncStorageUtil from '../utils/asyncstorage.util';
import httpResponseModel from '../models/httpresponse.model';
import B21ResponseModel from '../models/b21.response.model';
import stringConstant from '../constants/string.constant';
import stackName from '../constants/stack.name.enum';
import screenId from '../constants/screen.id.enum';
import PropTypes from 'prop-types';

import KYCInterface from '../interfaces/kyc.interface';

import UserAuthenticationModel from '../models/user.authentication.model';
import GetSourceOfFundResponseModel from '../models/get.source.of.fund.response.model';
import GetSourceOfFundsLocalModel from '../models/get.source.of.funds.local.model';
import SetSourceOfFundsRequestModel from '../models/set.source.of.funds.request.model';

import ModalComponentModel from '../models/modal.component.model';
import CommonModal from '../components/common.modal';
import commonUtil from '../utils/common.util';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

export default class KYCSourceOfFundsScreen extends Component {
    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            enableNextBtn: false,
            getSourceOfFundsDataList : [],
            dataAdapter : ds,
            getSelectedSourceOfFund : "",
            sourceOfFundStorageModel: new GetSourceOfFundsLocalModel(),
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

    componentDidMount() {
        AsyncStorageUtil.getItem(stringConstant.SAVE_USER_INFO).then((userData) => {
            AsyncStorageUtil.getItem(stringConstant.SAVE_SOURCE_OF_FUND_INFO).then( (sourceOfFundData) => {
                let userAuthentication = new UserAuthenticationModel();
                userData = JSON.parse(userData);
                userAuthentication = userData.AuthenticationToken;
                if(userData && !this.state.showActivityIndicator){
                    let requestModel = new B21ResponseModel();
                    requestModel.AuthenticationToken = userAuthentication.Token;
                    this.showLoader(true);
                    KYCInterface.getSourceOfFunds(requestModel).then( (response) => {
                        let res = new B21ResponseModel();
                        res = response;
                        if(res.ErrorCode == commonConstant.SUCCESS_CODE){
                        let getSourceOfFundsResponse = new GetSourceOfFundResponseModel();
                        getSourceOfFundsResponse = res.Result;
                        let getTempArray = [];
                        let tempIndex = 0;
                        sourceOfFundData = JSON.parse(sourceOfFundData);
                        let sourceOfFundFromStrorage = new GetSourceOfFundsLocalModel();
                        sourceOfFundFromStrorage = sourceOfFundData;
                        getSourceOfFundsResponse.SourceOfFunds.forEach(element => {
                            let getTempDataObj = new GetSourceOfFundsLocalModel();
                            getTempDataObj.id = tempIndex;
                            getTempDataObj.value = element;
                            if(sourceOfFundFromStrorage) {
                                if(sourceOfFundFromStrorage.id == tempIndex 
                                    && sourceOfFundFromStrorage.value == element) {
                                    getTempDataObj.showItem = true;
                                    this.setState({
                                        enableNextBtn : true,
                                        getSelectedSourceOfFund: element
                                    });
                                }
                            } else {
                                getTempDataObj.showItem = false;
                            }

                            getTempArray.push(getTempDataObj);
                            tempIndex++;
                        });
                        this.setState({
                            getSourceOfFundsDataList : getTempArray,
                            dataAdapter : this.state.dataAdapter.cloneWithRows(getTempArray)
                        });
                        }else if(res.ErrorCode == commonConstant.ACCESS_DENIED_ERROR_CODE) {
                            //Navigate to login screen
                            this.showCustomAlertForLoginScreenRedirection(true,res.ErrorMsg)
                        } else {
                            this.showCustomAlert(true,res.ErrorMsg)
                        }
                        this.showLoader(false);
                    }, (err) => {
                        this.showLoader(false);
                        this.showCustomAlert(true,strings('common.api_failure'));
                    });
                } 
            });
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

    updateSelectedSourceOfFunds = () => {
        AsyncStorageUtil.getItem(stringConstant.SAVE_USER_INFO).then((userData) => {
            let userAuthentication = new UserAuthenticationModel();
            userData = JSON.parse(userData);
            userAuthentication = userData.AuthenticationToken;
            if(userData && !this.state.showActivityIndicator){
                let requestSourceOfFundData = new SetSourceOfFundsRequestModel();
                requestSourceOfFundData.AuthenticationToken = userAuthentication.Token;
                requestSourceOfFundData.SourceOfFunds = this.state.getSelectedSourceOfFund;
                this.showLoader(true);
                KYCInterface.updateSourceOfFunds(requestSourceOfFundData).then( (response) => {
                    let res = new B21ResponseModel();
                    res = response;
                    if(res.ErrorCode == commonConstant.SUCCESS_CODE){
                        //Navigate to next screen
                        //alert(JSON.stringify(response));
                        //Alert.alert("Source of funds updated!","you have reached the end of this feature!");
                        AsyncStorageUtil.storeItem(stringConstant.SAVE_SOURCE_OF_FUND_INFO,this.state.sourceOfFundStorageModel).then( () => {
                            Navigation.push(stackName.GoalScreenStack, {
                                component : {
                                    name: screenId.KYCDocumentUploadScreen
                                }
                            });
                        });
                    }else if(res.ErrorCode == commonConstant.ACCESS_DENIED_ERROR_CODE) {
                        //Navigate to login screen
                        this.showCustomAlertForLoginScreenRedirection(true,res.ErrorMsg)
                    } else {
                        this.showCustomAlert(true,res.ErrorMsg)
                    }
                    this.showLoader(false);
                }, (err) => {
                    this.showLoader(false);
                    this.showCustomAlert(true,strings('common.api_failure'));
                });
            }
        });
    }

    onDataItemClicked = (data) =>{
       //Alert.alert("Data Clicked "+data)
       let tempDataObj = new GetSourceOfFundsLocalModel();
       tempDataObj = data;
       this.state.getSourceOfFundsDataList.forEach(element => {
           if(element.id == tempDataObj.id){
               element.showItem = true;
               //fetch the value and enable the next button on any item selection
               this.setState({
                    getSelectedSourceOfFund : element.value,
                    enableNextBtn : true,
                    sourceOfFundStorageModel: element
               });
           }else{
               element.showItem = false;
           }
       });
       let tempGetDataListFromAPI = this.state.getSourceOfFundsDataList;
       this.setState({
            getSourceOfFundsDataList : tempGetDataListFromAPI,
            dataAdapter : this.state.dataAdapter.cloneWithRows([])
       }, () => {
        this.setState({
            dataAdapter : this.state.dataAdapter.cloneWithRows(tempGetDataListFromAPI)
          });
       });
    }

    renderDataList = (data) => {
        return(
          <View style={{borderBottomColor : '#d2d2d2',borderBottomWidth : 1}}>
          <TouchableOpacity style={commonStyles.kycSourceOfFundsRow} onPress={this.onDataItemClicked.bind(this,data)}>
          <Text style = { [commonStyles.kycSourceOfFundsRowText,fontFamilyStyles.robotoRegular,{color : data.showItem ? 'white' : 'black'}] }>{data.value}</Text>
          <Image style={[commonStyles.kycSourceOfFundSelected,{display : data.showItem ? 'flex' : 'none'}]} source={require('../assets/kyc_source_of_fund_selected.png')}></Image>
      </TouchableOpacity>
      </View>
        );
      }

    render() {

        return (
            <View style={[commonStyles.kycSourceOfFundMainContainer]}>
                <View style={styles.kycCountryHeaderSection}>
                    <View style={[styles.kycHeaderSection,{marginTop:0}]}>
                        <TouchableOpacity style={[styles.backButton]} onPress={this.backButton}>
                            <Image style={styles.backIcon} source={require("../assets/backArrowWhite.png")}/>
                        </TouchableOpacity>
                        <Text style={[styles.kycAddressHeader]}>{ strings('kycSourceOfFundsScreen.title') }</Text>
                    </View>  
                </View>

                <View style={[{marginTop : 50,maxHeight : screenHeight-350},commonStyles.alignChildCenter]}>
                <ListView style={commonStyles.kycSourceOfFundList} 
                        dataSource={this.state.dataAdapter.cloneWithRows(this.state.getSourceOfFundsDataList)}
                        renderRow={(data) => this.renderDataList(data) }
                        enableEmptySections = {true}/>
                </View>

                <View style={styles.kycCountryFieldAndButtonSection}>
                    <TouchableOpacity
                        activeOpacity={1}
                        disabled={!this.state.enableNextBtn}
                        style = {[styles.kycNextButton,
                            this.state.enableNextBtn ?styles.kycNextButton:styles.kycNextButtonDisabled
                        ]}
                        onPress = { this.updateSelectedSourceOfFunds }>
                        <Text style = { [commonStyles.fontSizeLarge, 
                            this.state.enableNextBtn ?commonStyles.secTextColor:styles.disabledTextColor,
                            commonStyles.textAlignCenter] } >
                            { strings('common.next_btn') } 
                        </Text>
                    </TouchableOpacity>
                </View>

               

                <LoaderComponent showLoader = { this.state.showActivityIndicator }/>
                <CommonModal modalComponent = {this.state.modalComponent}/>
            </View>
        );
    }
}