import React, { Component } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import Dimensions from 'Dimensions';
import theme from '../themes/common.theme';
import PropTypes from 'prop-types';

const { width, height } = Dimensions.get('window');
const propTypes = { showLoader: PropTypes.bool };
const defaultProps = { showLoader: false };

export default class LoaderComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showLoader: false
        }
    }

    componentWillMount () {
        this.setState({
            showLoader: false
        });
    }

    componentWillReceiveProps(nextProps) {
        //console.log(nextProps);
        if (this.state.showLoader !== nextProps.showLoader) {
            this.setState({
                showLoader: nextProps.showLoader
            });
        }
    }
    render() {
        return (
            <ActivityIndicator 
                size="large" 
                color={theme.PRIMARY_BTN_BACKGROUND_COLOR}
                style = { this.state.showLoader? styles.centering:styles.hideLoader } />
        )
    }
}

LoaderComponent.propTypes = propTypes;
LoaderComponent.defaultProps = defaultProps;

const styles = StyleSheet.create({
    centering: {
        flex: 1,
        position:'absolute',
        top:0,right:0,left:0,bottom:0,
        zIndex:20,
        backgroundColor:'transparent'
    },
    hideLoader: {
        display:'none'
    }
});