import React, { Component } from 'react';
import {
    View, Text, TouchableOpacity,
    ScrollView, TextInput, Dimensions, StyleSheet,
    Alert, TouchableHighlight, Linking, Platform,
    ListView
} from 'react-native';
import Image from 'react-native-remote-svg';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import PropTypes from 'prop-types';
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
import fontFamilyStyles from '../styles/font.style';
import ModalComponentModel from '../models/modal.component.model';
import CommonModal from '../components/common.modal';
import screenId from '../constants/screen.id.enum';
import NavigationUtil from '../utils/navigation.util';

const propTypes = { transactionProcess: PropTypes.bool, transactionID: PropTypes.string, transactionMessage: PropTypes.string };
const defaultProps = { transactionProcess: false, transactionID: "", transactionMessage: "" };

export default class InvestmentTransactionSummaryScreen extends Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            showActivityIndicator: false,
            titleBar: {},
            modalComponent: {},
            transactionID: "",
            transactionProcess: false,
            descriptionImage: "",
            buttonText: "",
            enableNextBtn: false,
            transactionMessage: ""
        };
    }

    initializeModalComponent = () => {
        let initialModalComponent = new ModalComponentModel();
        initialModalComponent.shouldVisible = false;
        this.setState({
            modalComponent: initialModalComponent
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

    showCustomAlert = (visible, message) => {
        this.setState({
            modalComponent: commonUtil.setAlertComponent(visible, message, strings('common.okay'), "", true, false, () => this.leftButtonClicked(), () => this.rightButtonClicked(), () => this.closeButtonClicked())
        });
    }

    componentWillMount() {
        this.initializeModalComponent();
    }

    componentDidMount() {
        //initialize props here
        this.setState({
            transactionID: this.props.transactionID,
            transactionProcess: this.props.transactionProcess,
            transactionMessage: this.props.transactionMessage !== null || this.props.transactionMessage !== "" ?this.props.transactionMessage:strings('investmentTransactionSummmary.failure_desc')
        }, () => {
            this.setState({
                descriptionImage: this.state.transactionProcess ? require('../assets/tickmark_circle.png') : require('../assets/transaction_failed_circle.png'),
                buttonText: this.state.transactionProcess ? strings('investmentTransactionSummmary.success_button') : strings('investmentTransactionSummmary.failure_button'),
                enableNextBtn: true
            });
        });
    }

    showLoader = (bit) => { // call this function to show/hide the loader
        this.setState({
            showActivityIndicator: bit
        });
    }

    onNextButtonPressed = () => {
        Navigation.setStackRoot(stackName.GoalScreenStack, {
            component : {
                name: screenId.GoalDashboardScreen
            }
        });
    }

    render() {
        return (
            <View style={[commonStyles.commonScreenContainer]}>
                <View style={[styles.kycHeaderSection, { marginTop: 0}]}>
                    <TouchableOpacity style={[styles.backButton]} onPress={this.backButton}>
                        {/* <Image style={styles.backIcon} source={require("../assets/backIcon.png")} /> */}
                    </TouchableOpacity>
                    <Text
                        style={
                            [
                                fontFamilyStyles.robotoRegular,
                                commonStyles.fontSize23,
                                commonStyles.primaryTextColorLight,
                                commonStyles.textAlignCenter
                            ]
                        }>
                        { 
                            this.state.transactionProcess ? strings('investmentTransactionSummmary.success_title'):strings('investmentTransactionSummmary.failure_title') 
                        }
                    </Text>
                </View>
                <KeyboardAwareScrollView bounces={false} extraScrollHeight={30}
                    contentContainerStyle={{ alignItems: "center" }} style={{ width: "100%" }} >
                    <View style={[commonStyles.fullWidth, styles.verticalAlign, commonStyles.alignChildCenter,commonStyles.flex1]}>
                        <Image style={[styles.SelectpaymentInstrumentLogo]} source={this.state.descriptionImage} />
                    </View>
                    <View 
                        style = {
                            [
                                commonStyles.fullWidth, commonStyles.alignChildCenter,
                                commonStyles.flex1, commonStyles.backgroundColorF1F1F1,
                                styles.margin15Top,
                                {
                                    display: this.state.transactionID?"flex":"none"
                                }
                            ]
                        }>
                        <View style = { [ commonStyles.width80pc ] }>
                            <Text
                                style={
                                    [
                                        styles.margin15Top,
                                        fontFamilyStyles.robotoRegular,
                                        commonStyles.fontSize16,
                                        commonStyles.textAlignCenter,
                                        commonStyles.primaryTextColorLight
                                    ]
                                }>
                                {strings('investmentTransactionSummmary.transaction_ref_id')}
                            </Text>

                            <Text
                                style={
                                    [
                                        styles.margin15Top,
                                        styles.margin15Bottom,
                                        fontFamilyStyles.robotoLight,
                                        commonStyles.fontSize18,
                                        commonStyles.textAlignCenter,
                                        commonStyles.primaryTextColorLight
                                    ]
                                }>
                                {this.state.transactionID}
                            </Text>
                        </View>
                    </View>
                    <View style={[commonStyles.fullWidth,commonStyles.flex1, commonStyles.alignItemsCenter,{flex:1,paddingBottom:100}]}>
                        <View style = { [ commonStyles.width80pc ] }>
                            <Text
                                style={
                                    [
                                        styles.margin25Top,
                                        fontFamilyStyles.robotoLight,
                                        commonStyles.fontSize18,
                                        commonStyles.textAlignCenter,
                                        commonStyles.primaryTextColorLight
                                    ]
                                }>
                                {
                                    this.state.transactionProcess ? strings('investmentTransactionSummmary.success_desc'):this.state.transactionMessage
                                }
                            </Text>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
                <TouchableOpacity
                            activeOpacity={1}
                            disabled={!this.state.enableNextBtn}
                            style = {
                                [
                                    commonStyles.floatingNextButton,
                                    this.state.enableNextBtn ? commonStyles.btnActivebackgroundColor : commonStyles.btnDisabledbackgroundColor
                                ]
                            }
                            onPress = { this.onNextButtonPressed }>
                            <Text style = { [
                                fontFamilyStyles.robotoRegular, commonStyles.fontSize19, commonStyles.textAlignCenter,
                                this.state.enableNextBtn ?commonStyles.secTextColor:styles.disabledTextColor,
                                ] } >
                                { this.state.buttonText } 
                            </Text>
                        </TouchableOpacity>
                <LoaderComponent showLoader={this.state.showActivityIndicator} />
                <CommonModal modalComponent={this.state.modalComponent} />
            </View >
        );
    }
}

InvestmentTransactionSummaryScreen.propTypes = propTypes;
InvestmentTransactionSummaryScreen.defaultProps = defaultProps;