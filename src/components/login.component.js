// Currently this component is not being used, please refer this as a basis for creating new component.
/*
    Please keep the following points in mind while creating a new component
    * It doesn't have a dedicated screen.
    * May be required to reuse them
    * They are part of a bigger screen but have have can encapsulate the behaviour and interaction.
    * They have single responsibility and required to communicate with other components as a whole.
    * Wrapped around the third party component to create a boundary around them for limiting the behaviour / interaction with the third party component.

    Few example of the components:
    charts, coin button / info bar, themed input elements etc.
*/

import React, { Component } from 'react';
import { View, Text } from 'react-native';

import { strings } from '../config/i18/i18n';
import commonStyles from '../styles/common.style';

// Login component
export default class LoginComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            welcome_text: "You've reached the end of this feature. We are hard at work, creating the next."
        };
    }

    render() {
        return (
            <View style = { commonStyles.container }>
                <Text style = { commonStyles.header }> { strings('login.welcome') } </Text>
                <Text> { this.state.welcome_text }</Text>
            </View>
        );
    }
}