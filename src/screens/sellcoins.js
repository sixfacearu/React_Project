import React,{Component} from 'react';
import {
    View, Text, TouchableOpacity,
    ScrollView, TextInput, Dimensions, StyleSheet,
    Alert, TouchableHighlight, Linking, Platform,
    ListView,Image

} from 'react-native';
import theme from '../themes/common.theme';
import { Navigation } from 'react-native-navigation';

import { Switch } from 'react-native-switch';
import commonConstant from '../constants/common.constant';
import NavigationUtil from '../utils/navigation.util';

import fontFamilyStyles from '../styles/font.style';
import { strings } from '../config/i18/i18n';
import commonTheme from '../themes/common.theme';
import commonStyles from '../styles/common.style';
import styles from '../styles/form.style';
 import renderIf from './renderif'

class SellCoins extends Component{
   
    state={
        acceptButtonEnabled: false,
      
        titleBar: {},

    }
  
    toggleAcceptSwitch = () => {
        
        if(this.state.acceptButtonEnabled) {
            this.setState({acceptButtonEnabled: false,doneButtonEnabled:false});
    
        } else {
            this.setState({acceptButtonEnabled: true, doneButtonEnabled:true});
    
        }
    }
    funcal=()=>{
        this.setState({enableNextBtn:true})
    }

    render(){
       
        return(
           
            <View style={[commonStyles.commonScreenContainer]}>
                <View style={[styles.kycHeaderSection,{marginTop:0}]}>
                    <TouchableOpacity style={[styles.backButton]} onPress={this.backButton}>
                        <Image style={styles.backIcon} source={require("../assets/backIcon.png")}/>
                    </TouchableOpacity>
                    <Text 
                        style = {
                            [
                                fontFamilyStyles.robotoRegular,
                                commonStyles.fontSize20,
                                commonStyles.primaryTextColorLight
                            ]
                        }>
                        Sell Coins
                    </Text>
                </View> 
                <Image style={{ height: 80, width: 80,  marginBottom: 30,}}  source={ require('../assets/pink-bitcoin.png') }/>
               
                   
  
                    <View style={{height:60,width:'100%',marginBottom:20,backgroundColor:'#E0E0E0'}}>
                  <View style={{flex: 1.5, flexDirection: 'row',marginBottom:20}}>
                  <Text style={{marginRight:'25%',marginLeft:10,marginTop:15,fontSize:13}}>Sell Number of Coins</Text>
                    <View  style={{marginTop:15}}>
            <Switch
                   
                    value={this.state.acceptButtonEnabled}
                    onValueChange={this.toggleAcceptSwitch}
                    
                />
                </View>
          </View>
          </View>
          <Text style={{color:'#13f7ed',marginRight:220}}>Max $8250.00</Text>
        
          <View style={{height:60,width:'100%',backgroundColor:'#b92e11 '}} hidden={this.state.acceptButtonEnabled} >
          {renderIf(!this.state.acceptButtonEnabled, 
                  <View style={{flex: 1.5, flexDirection: 'row'}}>
                  <Text style={{marginRight:'20%',marginLeft:13,marginTop:15}}>Amt to Sell</Text>
                    <View  style={{marginTop:15}}>
            <Text style={{marginLeft:70}}>Coin QTY</Text>
                </View>
          </View>
               )}
                 {renderIf(this.state.acceptButtonEnabled, 
                  <View style={{flex: 1.5, flexDirection: 'row'}}>
                  <Text style={{marginRight:'20%',marginLeft:13,marginTop:15}}>Coin Quality</Text>
                    <View  style={{marginTop:15}}>
            <Text style={{marginLeft:70}}>Amount</Text>
                </View>
          </View>
               )}
          </View>
        
   
          <View style={styles.elementBox21}>
          {renderIf(!this.state.acceptButtonEnabled,
              <View style={[styles.inputFieldCoverView1, styles.authInputFieldBottomBorder1]}>
                
                <TextInput
                  ref='1'
                  maxLength={commonConstant.MAX_CHARACTER_PASSWORD}
                  value={this.state.password}
                  style={styles.textInputView1}
                  placeholder='$ Enter amount'
                  returnKeyType='default'
                  autoCapitalize="none"
                  onChangeText={this.funcal}
                />
                 <View  style={{marginRight:30}}>
              <TextInput
                  ref='1'
                  maxLength={commonConstant.MAX_CHARACTER_PASSWORD}
                  value={this.state.password}
                  style={{marginRight:50}}
                  style={styles.textInputView2}
                  placeholder='0.00'
                  returnKeyType='default'
                  autoCapitalize="none"
                />
                </View> 
              </View>
          )}
         
          {renderIf(this.state.acceptButtonEnabled,
              <View style={[styles.inputFieldCoverView1, styles.authInputFieldBottomBorder1]}>
                
                <TextInput
                  ref='1'
                  maxLength={commonConstant.MAX_CHARACTER_PASSWORD}
                  value={this.state.password}
                  style={styles.textInputView1}
                  placeholder='Enter amount'
                  returnKeyType='default'
                  autoCapitalize="none"
                  onChangeText={this.funcal}
                />
                 <View  style={{marginRight:30}}>
              <TextInput
                  ref='1'
                  maxLength={commonConstant.MAX_CHARACTER_PASSWORD}
                  value={this.state.password}
                  style={{marginRight:50}}
                  style={{height: '100%',
                  fontSize: theme.FONT_SIZE_INPUT_FIELD,
                  width:'100%',
                  marginRight:30,
                  fontFamily: theme.ROBOTO_LIGHT,}}
                  placeholder='0.00'
                  returnKeyType='default'
                  autoCapitalize="none"
                />
                </View> 
              </View>

          )}
         <Text style={{fontSize:10,color:'red'}}>you are trying to sell more coins then you have!</Text>

            </View>
        
            <TouchableOpacity
                    activeOpacity={1}
                    // disabled={!this.state.enableNextBtn}
                    style = {
                        [
                            commonStyles.floatingNextButton1,
                             this.state.enableNextBtn ? commonStyles.btnActivebackgroundColor : ''
                        ]
                    }
                    // onPress = { this.onNextButtonPressed }>
                    >
                    <Text style = { [
                        fontFamilyStyles.robotoRegular, commonStyles.fontSize19, commonStyles.textAlignCenter,
                         this.state.enableNextBtn ?commonStyles.secTextColor:styles.disabledTextColor,
                        ] } >
                        { strings('common.next_btn') } 
                    </Text>
                </TouchableOpacity>
          </View>
         
 

              
       
        )
    }
}
export default SellCoins;