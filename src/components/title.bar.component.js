import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Image, Platform, DeviceEventEmitter } from 'react-native';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import { Navigation } from 'react-native-navigation';

import { strings } from '../config/i18/i18n';
import commonStyles from '../styles/common.style';
import TitleBarModel from '../models/title.bar.model';
import styles from '../styles/form.style';
import commonTheme from '../themes/common.theme';

const propTypes = { titleBar: PropTypes.object };
const defaultProps = { titleBar: new TitleBarModel() };

export default class TitleBarComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            titleBar: this.props.titleBar
        };
    }

    componentWillReceiveProps(nextProps) {
        //console.log(nextProps);
        if (!_.isEqual(this.props.titleBar, nextProps.titleBar)) {
            //alert(JSON.stringify(nextProps));
            this.setState({
                titleBar: nextProps.titleBar
            });
        }
    }

    _onBackButtonPressed = () => {
        //alert(JSON.stringify(this.state.titleBar))
        Navigation.pop(this.state.titleBar.componentId);
        if (this.state.titleBar.eventEmitterName !== "") {
            DeviceEventEmitter.emit(this.state.titleBar.eventEmitterName, {

            });
        }
    }

    render() {
        return (
            <View
                style={
                    [
                        commonStyles.goalHeaderWrapper,
                        {
                            backgroundColor: this.state.titleBar.backgroundColorCode,
                            position: "absolute",
                            top:0,
                            zIndex: 5,
                        }
                    ]
                }>
                <View
                    style={
                        [
                            commonStyles.titleHeaderWrapper,
                            {
                                marginTop: Platform.OS === 'ios' ? commonTheme.DEFAULT_MARGIN : 0,
                                marginBottom: Platform.OS === 'ios' ? 5 : 0
                            }
                        ]
                    } >
                    <TouchableOpacity
                        onPress={this._onBackButtonPressed}
                        disabled={!this.state.titleBar.showBackButton}
                        style={
                            [
                                commonStyles.touchableBackButtonImageWrapper,
                            ]
                        }>
                        <Image
                            style={
                                [
                                    styles.backIcon, commonStyles.topTouchableBackButtonImage,
                                    { display: this.state.titleBar.showBackButton ? "flex" : "none" }
                                ]
                            }
                            source={require('../assets/backicon_white.png')} />
                    </TouchableOpacity>
                    <Text
                        style={
                            [
                                commonStyles.headerWithLeftBackButton,
                                { color: this.state.titleBar.textColorCode }
                            ]
                        }>{this.state.titleBar.title} </Text>
                </View>
            </View>
        );
    }
}