import React, { Component } from 'react';
import {Platform, StyleSheet, View, Text, Modal, Button, TouchableOpacity, Alert,Image,DeviceEventEmitter} from 'react-native';
import PropTypes from 'prop-types';
import * as _ from 'lodash';

import ModalComponentModel from '../models/modal.component.model';
const propTypes = {modalComponent : PropTypes.object}
const defaultProps = {modalComponent : new ModalComponentModel()}

export default class CommonModal extends Component {
   
    constructor(props){
        super(props)
        this.state = {
            modalComponent : this.props.modalComponent
        }
    }

    componentWillReceiveProps(nextProps){
       if(!_.isEqual(this.props.modalComponent,nextProps.modalComponent)){
            this.setState({
                modalComponent : nextProps.modalComponent
            });
       }
    }

    render(){
        return(
            <Modal
                visible={this.state.modalComponent.shouldVisible}
                transparent={true}
                animationType={"fade"}
                onRequestClose={ () => {
                    //device event emitter
                } } >
                <View style={ styles.mainContainer}>
                    <View style={styles.alertMainView}>
                        <TouchableOpacity onPress={this.state.modalComponent.closeBtnFunction} style={{alignSelf:'flex-end',margin:20, marginBottom:10}}>
                            <Image source={require('../assets/img_close.png')} style={{width : 12, height:12}}></Image>
                        </TouchableOpacity>

                        <View style={ styles.alertTitleWrapper }>
                            {/* <Image source={require('../assets/email.png')} style={{resizeMode:'contain',flex:1.5,backgroundColor:"blue"}}></Image> */}
                            <Text style={ styles.alertTitle } numberOfLines={4} adjustsFontSizeToFit={true} minimumFontScale={0.8}>{this.state.modalComponent.message}</Text>
                        </View>
                    
                        <View style={ styles.buttonMainWrapper }>
                            <TouchableOpacity 
                                onPress={this.state.modalComponent.leftBtnFunction} 
                                style={
                                    [
                                        styles.buttonWrapper,
                                        styles.back_color_E3CE00,
                                        {
                                            borderBottomEndRadius:this.state.modalComponent.showRightBtn ? 0 : 7,
                                            display : this.state.modalComponent.showLeftBtn ? 'flex' : 'none'
                                        }
                                    ]
                                }>
                                <View>
                                    <Text style={styles.buttonText}>{this.state.modalComponent.leftBtnText}</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                onPress={this.state.modalComponent.rightBtnFunction} 
                                style={
                                    [
                                        styles.buttonWrapper,
                                        styles.back_color_00D1CE,
                                        {
                                            borderBottomStartRadius : this.state.modalComponent.showLeftBtn ? 0 : 7,
                                            borderBottomEndRadius: this.state.modalComponent.showLeftBtn ? 7 : 0,
                                            display:this.state.modalComponent.showRightBtn? 'flex' : 'none'
                                        }
                                    ]
                                }>
                                <View>
                                    <Text style={styles.buttonText}>{this.state.modalComponent.rightBtnText}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({

    mainContainer :{
        flex:1, alignItems: 'center', justifyContent: 'center', backgroundColor:"rgba(0, 0, 0, 0.5)"
    },
     
    alertMainView:{
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor : "#ffffff", 
        height: 200 ,
        width: '80%',
        borderWidth: 0,
        borderColor: '#d2d2d2',
        borderRadius:7,
    },
     
    alertTitleWrapper:{
        flexDirection:'row',justifyContent:"center",alignItems:"center",width:"90%",backgroundColor:"transparent",height:80
    },
    
    alertTitle:{
        fontSize:16,textAlign:"center",color:'black'
    },

    buttonMainWrapper: {
        flex: 1, flexDirection: 'row', alignItems:'flex-end',backgroundColor:'transparent'
    },

    buttonWrapper: {
        flex: 1, height: 50,borderBottomStartRadius:7, justifyContent: "center", 
        alignItems: "center",
    },

    back_color_00D1CE: {
        backgroundColor: '#00D1CE'
    },

    back_color_E3CE00: {
        backgroundColor: '#E3CE00'
    },    

    buttonText: {
        color:'#fff',fontSize:16
    }     
});