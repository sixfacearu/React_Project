//Please add an common utility methods here
import { Navigation } from 'react-native-navigation';
import React, { Component } from 'react';
import {Linking,Alert} from 'react-native';

import HttpUrlConstant from '../constants/http.constant';
import commonConstant from '../constants/common.constant';
import ModalComponentModel from '../models/modal.component.model';

const commonUtil = {
  
    navigationEventHandler : (event,props) => {
        const { unselectedTabIndex, selectedTabIndex } = event
        const sid = props
        if (selectedTabIndex === 0) {
           // setTimeout( this.redirectToB21Life(this.redirectToB21Life.bind(this,cid)), commonConstant.B21LIFE_APP_REDIRECTION_TIME);
           //redirectToB21Life(cid)
          // setTimeout( this.redirectToB21Life.bind(this,screenId), commonConstant.B21LIFE_APP_REDIRECTION_TIME);
          alert(sid)
        }
    },

    setAlertComponent : (visible, message, leftBtnText, rightButtonText, showLeftBtn, showRightButton,leftBtnFunction,rightBtnFunction,closeBtnFunction) => {
        let modalComponent = new ModalComponentModel();
        modalComponent.message = message;
        modalComponent.leftBtnText = leftBtnText;
        modalComponent.rightBtnText = rightButtonText;
        modalComponent.shouldVisible = visible;
        modalComponent.showLeftBtn = showLeftBtn;
        modalComponent.showRightBtn = showRightButton;
        modalComponent.leftBtnFunction = leftBtnFunction;
        modalComponent.rightBtnFunction = rightBtnFunction;
        modalComponent.closeBtnFunction = closeBtnFunction;
        return modalComponent;
    },

    validateNumericFields : (value) => {
        if(value.indexOf(" ") > -1 || value.indexOf(",") > -1 
        || value.indexOf("-") > -1 || value.indexOf(".") > -1) {
            let tempVal = [];
            if(value.indexOf(" ") > -1) {
                tempVal = value.split(" ");
                value = "";
                tempVal.forEach(element => {
                    value += element;
                });
            } else if(value.indexOf(",") > -1) {
                tempVal = value.split(",");
                value = "";
                tempVal.forEach(element => {
                    value += element;
                });
            } else if(value.indexOf("-") > -1) {
                tempVal = value.split("-");
                value = "";
                tempVal.forEach(element => {
                    value += element;
                });
            } else if(value.indexOf(".") > -1) {
                tempVal = value.split(".");
                value = "";
                tempVal.forEach(element => {
                    value += element;
                });
            }
        }
        return value;
    }
}

redirectToB21Life = (component_Id) => {
  Linking.openURL(HttpUrlConstant.B21_LIFE_SMART_URL).catch(err => console.error('An error occurred', err));
  Navigation.mergeOptions(component_Id, {
      bottomTabs: {
      currentTabIndex: 1
      }
  });
}




export default commonUtil;