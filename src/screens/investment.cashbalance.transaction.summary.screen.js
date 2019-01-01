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

const propTypes = { tansacationStatus: PropTypes.bool };
const defaultProps = { tansacationStatus: false };

export default class InvestmentCashbalanceTransactionSummaryScreen extends Component {

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);

        this.state = {
            showActivityIndicator: false,
            titleBar: {},
            modalComponent: {},
            tansacationStatus: this.props.tansacationStatus,
            descriptionImage: "",
            buttonText: "",
            enableNextBtn: this.props.tansacationStatus,
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
        this.showCustomAlert(false);
    }

    rightButtonClicked = () => {
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
        // this.state.descriptionImage: this.state.tansacationStatus ? require('../assets/tickmark_circle.png') : require('../assets/transaction_failed_circle.png');
        // this.state.buttonText: this.state.tansacationStatus ? strings('investmentTransactionSummmary.success_button') : strings('investmentTransactionSummmary.failure_button');
        // this.state.enableNextBtn: true;
    }

    showLoader = (bit) => { // call this function to show/hide the loader
        this.setState({
            showActivityIndicator: bit
        });
    }

    onNextButtonPressed = () => {
        Navigation.setStackRoot(stackName.GoalScreenStack, {
            component: {
                name: screenId.GoalDashboardScreen
            }
        });
    }

    render() {
        return (
            <View style={[commonStyles.commonScreenContainer]}>
                <View style={[styles.kycHeaderSection, { marginTop: 0 }]}>
                    <TouchableOpacity style={[styles.backButton]} onPress={this.backButton}>
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
                            this.state.tansacationStatus ? strings('investmentCashBalanceTransactionSummmary.success_title') : strings('investmentCashBalanceTransactionSummmary.failure_title')
                        }
                    </Text>
                </View>
                <KeyboardAwareScrollView bounces={false} extraScrollHeight={30}
                    contentContainerStyle={{ alignItems: "center" }} style={{ width: "100%" }} >
                    <View style={[commonStyles.fullWidth, styles.verticalAlign, commonStyles.alignChildCenter, commonStyles.flex1]}>
                        <Image style={[styles.SelectpaymentInstrumentLogo]} source={this.state.tansacationStatus ? require('../assets/tickmark_circle.png') : require('../assets/transaction_failed_circle.png')} />
                    </View>

                    <View style={[commonStyles.fullWidth, commonStyles.flex1, commonStyles.alignItemsCenter, { flex: 1, paddingBottom: 100 }]}>
                        <View style={[commonStyles.width70pc]}>
                            <Text
                                style={
                                    [
                                        {marginTop:30},
                                        fontFamilyStyles.robotoLight,
                                        commonStyles.fontSize18,
                                        commonStyles.textAlignCenter,
                                        commonStyles.primaryTextColorLight
                                    ]
                                }>
                                {
                                    this.state.tansacationStatus ? strings('investmentCashBalanceTransactionSummmary.success_desc') : strings('investmentCashBalanceTransactionSummmary.failure_desc')
                                }
                            </Text>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
                <TouchableOpacity
                    activeOpacity={1}
                    style={
                        [
                            commonStyles.floatingNextButton,
                            commonStyles.btnActivebackgroundColor 
                        ]
                    }
                    onPress={this.onNextButtonPressed}>
                    <Text style={[
                        fontFamilyStyles.robotoRegular, commonStyles.fontSize19, commonStyles.textAlignCenter,
                        commonStyles.secTextColor 
                    ]} >
                        {this.state.tansacationStatus ? strings('investmentTransactionSummmary.success_button') : strings('investmentCashBalanceTransactionSummmary.failure_button')}
                    </Text>
                </TouchableOpacity>
                
                <LoaderComponent showLoader={this.state.showActivityIndicator} />
                <CommonModal modalComponent={this.state.modalComponent} />
            </View >
        );
    }
}

InvestmentCashbalanceTransactionSummaryScreen.propTypes = propTypes;
InvestmentCashbalanceTransactionSummaryScreen.defaultProps = defaultProps;