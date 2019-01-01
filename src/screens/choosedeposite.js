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
//  import renderIf from './renderif'

class ChooseDeposite extends Component{
   
    

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
                                commonStyles.fontSize15,
                                commonStyles.primaryTextColorLight
                            ]
                        }>
                        Choose A Deposite Location
                    </Text>
                </View> 
                <Image style={{ height: 80, width: 80,  marginBottom: 30,}}  source={ require('../assets/pink-bitcoin.png') }/>
               
              
             <View>
           <TouchableOpacity style={{marginBottom:20,display:"flex",height:50,flexDirection:'row',  alignItems: 'center',borderColor: theme.INPUT_FIELD_BORDER_COLOR, borderBottomWidth: 1,borderTopWidth: 1}}>
                <Image style={styles.backIcon0} source={require('../assets/menu.investment.icon.png')} />
               <Text style={{marginLeft:10}}>Current Allocation</Text>
               <Image style={styles.backIcon3} source={require("../assets/next_arrow_blue.png")}/>

               </TouchableOpacity>
               <TouchableOpacity style={{marginBottom:20,display:"flex",height:50,flexDirection:'row',alignItems:'center',borderColor: theme.INPUT_FIELD_BORDER_COLOR, borderBottomWidth: 1,borderTopWidth: 1}}>
               <Image style={styles.backIcon0} source={require('../assets/menu.withdraw.icon.png')} />

                <Text style={{marginLeft:10}}>Convert To Cash</Text>
                <Image style={styles.backIcon2} source={require("../assets/next_arrow_blue.png")}/>
 
                </TouchableOpacity>
                <TouchableOpacity style={{marginBottom:20,display:"flex",height:50,flexDirection:'row',alignItems:'center',borderColor: theme.INPUT_FIELD_BORDER_COLOR, borderBottomWidth: 1,borderTopWidth: 1}}>
                <Image style={styles.backIcon0} source={require('../assets/menu.fundingmethod.icon.png')} />

                <Text style={{marginLeft:10}}>Withdraw To My Bank Account</Text>
                <Image style={styles.backIcon1} source={require("../assets/next_arrow_blue.png")}/>
 
                </TouchableOpacity>
             </View>
                  
             

                  
                   </View>
        );
    }
}
    export default ChooseDeposite;
