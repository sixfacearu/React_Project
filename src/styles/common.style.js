import { StyleSheet, Platform } from 'react-native';
import theme from '../themes/common.theme';

import Dimensions from 'Dimensions';
const { width, height } = Dimensions.get('window');

const commonStyles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: theme.TERTIARY_BACKGROUND_COLOR
    },
    subContainer: {
        flex: 1,
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'flex-start',
    },
    rowWrapper: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
    },
    rowContainerFullWidth: {
        width: "100%", flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap"
    },
    alignChildCenter: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    justifyContentCenter: {
        justifyContent: 'center',
    },
    flexDirectionRow: {
        flexDirection: 'row',
    },
    flexDirectionColumn: {
        flexDirection: 'column',
    },
    imageSize112: {
        width: 112,
        height: 112
    },
    widHei28:{
        width:28,height:28
    },
    primaryTextColorLight: {
        color: theme.PRIMARY_TEXT_COLOR_LIGHT
    },
    primaryErrorTextColor: {
        color: theme.PRIMARY_ERROR_TEXT_COLOR
    },
    fontSize20: {
        fontSize: theme.FONT_SIZE_20
    },
    fontSize23: {
        fontSize: theme.FONT_SIZE_23
    },
    fontSize18: {
        fontSize: 18
    },
    fontSize16: {
        fontSize: 16
    },
    fontSize17: {
        fontSize: 17
    },
    fontSize14: {
        fontSize: 14
    },
    fontSize15: {
        fontSize: 15
    },
    fontSize11: {
        fontSize: 11
    },
    fontSize13: {
        fontSize: 13
    },
    fontSize19: {
        fontSize: 19
    },
    topGoalNameStyle: {
        fontFamily: theme.ROBOTO_LIGHT,
        color: theme.PRIMARY_TEXT_COLOR_DARK,
        marginTop: 15,
        // marginBottom: 15,
        width: '100%',
        height: 40,
        textAlign: 'center'
    },
    HeaderSectionWrapper: {
        flex:1,
        width:"100%",
        alignItems:"center",
        justifyContent:'flex-start'
    },
    HeaderSectionContentWrapper:{
        width:'90%', 
        height:100, 
        paddingTop:20
      },
    titleHeaderWrapper: {
        width: width,
        paddingLeft: width * 0.5 / 10,
        paddingRight: width * 0.5 / 10,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    goalHeaderWrapper: {
        width: width,
        height: 52
    },
    paddingTop52: {
        paddingTop: 52
    },
    // goalHeaderWrapper: {
    //     width: width * 9 / 10,
    //     marginTop: 30,
    //     marginBottom: 14,
    //     flex: 1,
    //     flexDirection: 'row',
    //     justifyContent: 'flex-start',
    //     // position:'absolute',
    //     // left:width * 0.5/10,
    //     // top: 30,
    // },
    touchableBackButtonImageWrapper: {
        width: '10%'
    },
    headerWithLeftBackButton: {
        fontSize: 18,
        fontFamily: theme.ROBOTO_REGULAR,
        color: theme.TERTIARY_BACKGROUND_COLOR,
        width: '80%',
        // paddingRight: '10%',
        textAlign: 'center'
    },
    topTouchableBackButtonImage: {
        top: 2
    },
    currencyDropdownView: {
        width: '45%',
        height: 100,
    },
    currencyDropDrownWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 5,
        width: '45%',
        height: 42,
    },
    currencyFlagCoverView: {
        flex: 4,
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 40,
        marginBottom: 0,
        paddingRight: 0,
    },
    currencyCodeInputViewWrapper: {
        height: 40,
        marginLeft: 0,
        fontSize: theme.FONT_SIZE_INPUT_FIELD,
        flex: 6,
        paddingLeft: 10,
        fontFamily: theme.ROBOTO_LIGHT,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    currencyPickerImage: {
        height: 40,
        width: 40,
        flex: 4
    },
    squareImageMedium: {
        width: 50,
        height: 50,
        borderRadius: 50
    },
    borderRadius5: {
        borderRadius: 5
    },
    borderRadius8: {
        borderRadius: 8
    },
    borderTopBottomRightRadius8: {
        borderTopRightRadius:8,
        borderBottomRightRadius:8
    },
    borderTopLeftRadius8: {
        borderTopLeftRadius: 8
    },
    currencyPickerText: {
        marginLeft: 12,
        fontSize: theme.FONT_SIZE_MEDIUM,
        flex: 6,
    },
    dashboardSmallIconStyle: {
        width: 75,
        height: 75,
        marginTop: theme.DEFAULT_SMALL_MARGIN,
        marginBottom: theme.DEFAULT_SMALL_MARGIN,
    },
    width90pc: {
        width: '90%'
    },
    width85pc: {
        width: '85%'
    },
    width80pc: {
        width: '80%'
    },
    width75pc: {
        width: '75%'
    },
    width70pc: {
        width: '70%'
    },
    width40pc: {
        width: '40%'
    },
    width45pc: {
        width: '45%'
    },
    width35pc: {
        width: '35%'
    },
    width30pc: {
        width: '30%'
    },
    width60pc: {
        width: "60%"
    },
    width65pc: {
        width: "65%"
    },
    width20pc: {
        width: "20%"
    },
    width15pc: {
        width: "15%"
    },
    width10pc: {
        width: "10%"
    },
    dashboardTextInputView: {
        height: 64,
        fontSize: 20,
        width: '90%',
        //backgroundColor:'blue',
        fontFamily: theme.ROBOTO_LIGHT,
        borderColor: theme.INPUT_FIELD_BORDER_COLOR,
        borderBottomWidth: 1,
        borderTopWidth: 1,
    },
    dashboardDummyTextInputView: {
        fontSize: 20,
        fontFamily: theme.ROBOTO_LIGHT
    },
    dashboardTextInputTouchableView: {
        height: 64,
        width: '90%',
        borderColor: theme.INPUT_FIELD_BORDER_COLOR,
        borderBottomWidth: 1,
        borderTopWidth: 1,
        justifyContent: 'center',
    },
    default5PaddingLeft: {
        paddingLeft: 5
    },
    paddingLeft10: {
        paddingLeft: 10
    },
    paddingTop8: {
        paddingTop: 8
    },
    fontSizeLarge: {
        fontSize: theme.FONT_SIZE_LARGE
    },
    fontSizeExtraLarge: {
        fontSize: theme.FONT_SIZE_EXTRA_LARGE
    },
    fullWidth: {
        width: '100%'
    },
    fontSizeMedium: {
        fontSize: theme.FONT_SIZE_MEDIUM
    },
    textAlignLeft: {
        textAlign: 'left'
    },
    margintp10: {
        marginTop: 10
    },
    defaultMarginTopBottom: {
        marginTop: theme.DEFAULT_MARGIN,
        marginBottom: theme.DEFAULT_MARGIN
    },
    defaultMarginBottom: {
        marginBottom: theme.DEFAULT_MARGIN
    },
    cryptoCardViewContainer: {
        width: "30%",
        borderWidth: 1,
        borderRadius: 2,
        // shadowOpacity: 4,
        backgroundColor: "#fff",
        borderColor: "#eaeaea",
        // shadowColor: "#eaeaea",
        // shadowOffset: { width: 1, height: 1 },
        marginBottom: 15,
        // elevation: 3,
    },
    cryptoCardViewDefaultContainer: {
        // width: "100%",
        borderWidth: 1,
        borderRadius: 2,
        // shadowOpacity: 4,
        backgroundColor: "#fff",
        borderColor: "#eaeaea",
        // shadowColor: "#eaeaea",
        // shadowOffset: { width: 1, height: 1 },
        marginBottom: 15,
        // elevation: 3,
    },
    summaryScreenCryptoCardViewContainer: {
        marginBottom: 20,
    },
    cryptoCoinSelectedStyle: {
        position: 'absolute', left: 0, top: 0, height: 40, width: 40
    },
    cryptoCoinImageMargins: {
        marginBottom: 15
    },
    cryptoCardViewContentWrapper: {
        marginTop: 15, marginBottom: 15, width: "100%", alignItems: "center"
    },
    defaultLargeMarginBottom: {
        marginBottom: theme.DEFAULT_LARGE_MARGIN
    },
    largeMarginTopBottom: {
        marginTop: 50,
        marginBottom: 50
    },
    margin15TopBottom: {
        marginTop: 15,
        marginBottom: 15
    },
    margin40Top: {
        marginTop: 40
    },
    margin40Bottom: {
        marginBottom: 40
    },
    borderRight979797: {
        borderRightWidth: 1, borderRightColor: "#979797"
    },
    defaultPaddingLeftRight: {
        paddingLeft: theme.DEFAULT_PADDING,
        paddingRight: theme.DEFAULT_PADDING
    },
    default15PaddingLeftRight: {
        paddingLeft: 15,
        paddingRight: 15
    },
    default15PaddingTopBottom: {
        paddingTop: 15,
        paddingBottom: 15
    },
    padding24TopBottom: {
        paddingTop: 24,
        paddingBottom: 24
    },
    padding28TopBottom: {
        paddingTop: 28,
        paddingBottom: 28
    },
    default15PaddingBottom: {
        paddingBottom: 15
    },
    default20PaddingBottom: {
        paddingBottom: theme.DEFAULT_PADDING
    },
    defaultPaddingTopBottom10: {
        paddingBottom:10,
        paddingTop: 10
    },
    marginLeft5: {
        marginLeft: 5
    },
    marginLeft15: {
        marginLeft: 15
    },
    marginTop5: {
        marginTop: 5
    },
    marginBottom25: {
        marginBottom: 25
    },
    textAlignCenter: {
        textAlign: 'center'
    },
    textAlignLeft: {
        textAlign: 'left'
    },
    textAlignRight: {
        textAlign: 'right'
    },
    alignItemsCenter: {
        alignItems: 'center'
    },
    alignItemsFlexEnd: {
        alignItems: 'flex-end'
    },
    bottomStickyBtn: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
        alignItems: 'center',
        padding: theme.DEFAULT_PADDING_BTN
    },
    btnLarge: {
        width: '80%',
        padding: theme.DEFAULT_PADDING_BTN
    },
    defaultSmallPaddingBtn: {
        padding: theme.DEFAULT_PADDING_BTN
    },
    btnBackColorTerriary: {
        backgroundColor: theme.TERTIARY_BTN_BACKGROUND_COLOR
    },
    btnActivebackgroundColor: {
        backgroundColor: theme.PRIMARY_BTN_BACKGROUND_COLOR
    },
    btnDisabledbackgroundColor: {
        backgroundColor: theme.DISABLED_BTN_BACKGROUND_COLOR
    },
    btnActiveSecBackgroundColor: {
        backgroundColor: theme.SECONDARY_BACKGROUND_COLOR
    },
    secTextColor: {
        color: theme.SECONDARY_TEXT_COLOR_LIGHT
    },
    secTextColorDark: {
        color: theme.SECONDARY_TEXT_COLOR_DARK
    },
    textColorDisabled: {
        color: theme.DISABLED_BTN_BACKGROUND_COLOR
    },
    inputField: {
        borderBottomWidth: 1,
        borderColor: theme.INPUT_FIELD_BORDER_COLOR
    },
    lightBlueBackground: {
        backgroundColor: theme.PRIMARY_BACKGROUND_COLOR
    },
    lightyellowBackground: {
        backgroundColor: theme.SECONDARY_BACKGROUND_COLOR
    },
    smallCircle: {
        width: 10,
        height: 10,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: theme.QUATERNARY_BACKGROUND_COLOR
    },
    tertiaryBackgroundColor: {
        backgroundColor: theme.TERTIARY_BACKGROUND_COLOR
    },
    quarternaryBackgroundColor: {
        backgroundColor: theme.QUATERNARY_BACKGROUND_COLOR
    },
    mobileCountryPrefix: {
        height: '100%',
        fontSize: theme.FONT_SIZE_INPUT_FIELD,
        justifyContent: 'center',
        alignItems: 'center'

    },
    paddingForCountryPrefix: {
        paddingLeft: 40
    },
    listViewRowWrapper: {
        flexDirection: "row", justifyContent: "flex-start", flexWrap: "wrap"
    },
    defaultPaddingBottom: {
        paddingBottom: theme.DEFAULT_PADDING
    },
    defaultPaddingTop: {
        paddingTop: theme.DEFAULT_PADDING
    },
    paddignTp40: {
        paddingTop: 40
    },
    lockUnlockBtnWrapper: {
        position: 'absolute', left: 0, top: 0
    },
    lockUnlockImage: {
        width: 20, height: 28
    },
    customizeCurrencyIcon: {
        width: 40, height: 40, borderRadius: 50
    },
    customizeCurrencyIconWithoutBorderRadius: {
        width: 35, height: 35
    },
    icon23X14: {
        width: 23,
        height:14
    },
    icon9X15: {
        width: 9,
        height:15
    },
    font40: {
        fontSize: 40
    },
    columnContainer: {
        alignItems: "flex-end",
        flexWrap: "wrap",
        flexDirection: 'column'
    },
    borderBottomwidth2e4e4e4: {
        borderBottomColor: "#e4e4e4", borderBottomWidth: 2
    },
    borderBottomwidth1e4e4e4: {
        borderBottomColor: "#e4e4e4", borderBottomWidth: 1
    },
    borderBottomwidth979797: {
        borderBottomColor: "#979797", borderBottomWidth: 1
    },
    kycFloatingNextButton: {
        width: '80%',
        backgroundColor: theme.TERTIARY_BTN_BACKGROUND_COLOR,
        borderRadius: 5,
        overflow: 'hidden',
        marginTop: 30,
        marginBottom: Platform.OS === 'ios' ? 50 : 90
    },
    kycNameMainContainer: {
        flex: 1,
        backgroundColor: '#00CCCC',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 20 : 0
    },
    kycAdditionalInfoMainContainer: {
        flex: 1,
        backgroundColor: '#1999FF',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 20 : 0
    },
    kycUniqueIdentificationMainContainer: {
        flex: 1,
        backgroundColor: '#00CCCC',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 20 : 0
    },
    kycFormView: {
        height: 70,
        justifyContent: 'space-between',
        marginTop: 0,
        //backgroundColor:'blue'
      },
    kycDOBMainContainer: {
        flex: 1,
        backgroundColor: '#ff8754',
        // alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 20 : 0
    },
    kycConfirmEmailMainContainer: {
        flex: 1,
        backgroundColor: '#C0D72F',
        // alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 20 : 0
    },
    commonScreenContainer: {
        flex: 1,
        // backgroundColor: '#fff',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 20 : 0
    },
    dynamicHeaderLabel: {
        fontSize: theme.FONT_SIZE_MEDIUM,
        fontFamily: theme.ROBOTO_LIGHT,
        textAlign: 'center'
    },
    inputFieldBottomBorderc7c7c7: {
        borderBottomWidth: 1,
        borderColor: theme.COLOR_C7C7C7
    },
    DarkHeader:{
        fontSize: theme.FONT_SIZE_EXTRA_LARGE,
        fontFamily:theme.ROBOTO_MEDIUM,
        textAlign: 'left',
        color: theme.SECONDARY_TEXT_COLOR_DARK,
        marginTop:0,
    },
    dateTouchableViewFlatStyle: {
        height: 64,
        borderColor: theme.INPUT_FIELD_BORDER_COLOR,
        borderBottomWidth: 1,
        borderTopWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
     //left aligned date
    dateSelectorFieldLeft:{
        //backgroundColor:'red',
        textAlign:'left',
        fontSize:theme.FONT_SIZE_20,    
        fontFamily: theme.ROBOTO_LIGHT,
        color:theme.PRIMARY_TEXT_COLOR_DARK,
    },
    dateTouchableViewFlatStyleBottomOnly: {
        height: 64,
        borderColor: theme.INPUT_FIELD_BORDER_COLOR,
        borderBottomWidth: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    agreeConsentSection:{
        // flex:1, 
        width:"80%",
        //backgroundColor:'blue',
        flexDirection:'row',
        flexWrap: "wrap",
        alignItems:'flex-start',
        justifyContent:'flex-start',
    },
    agreeConsentText:{
        fontSize: 20,
        fontFamily: theme.ROBOTO_LIGHT,
        color:theme.PRIMARY_TEXT_COLOR_DARK,
        textAlign:'left',
        marginLeft:15
    },
    buttonTextWhite: {
        color: theme.SECONDARY_TEXT_COLOR_LIGHT,
        fontFamily: theme.ROBOTO_REGULAR,
        fontSize: 18,
        textDecorationLine: 'underline'
    },
    kycSourceOfFundMainContainer: {
        flex: 1,
        backgroundColor: '#7A8CFF',
        // alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 20 : 0
    },
    kycSourceOfFundList: {
      width: '85%'
    },
    kycSourceOfFundsRow: {
      flex: 1,
      padding: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:'center'
    },
    kycSourceOfFundsRowText: {
      fontSize: theme.FONT_SIZE_MEDIUM,
      flex:8,
    },
    kycSourceOfFundSelected : {
        width : 20,
        height : 20
    },
    flex1: {
        flex: 1
    },
    flex5: {
        flex: 5
    },
    flex3: {
        flex: 3
    },
    flex6: {
        flex: 6
    },
    flex4: {
        flex: 4
    },
    flex7: {
        flex: 7
    },
    flex8: {
        flex: 8
    },
    flex2: {
        flex: 2
    },
    congratulationsMainContainer:{
        backgroundColor:theme.SECONDARY_BACKGROUND_COLOR,
        flex: 1, justifyContent: 'center', alignItems: 'center'
    },
    congratulationsNextButton:{
        width: '90%',
        padding: theme.DEFAULT_PADDING_BTN,
        backgroundColor : theme.TERTIARY_BTN_BACKGROUND_COLOR,
        borderRadius: 5,
        overflow:'hidden'
    },
    footerPosition:{
      flex:1,
      justifyContent:'flex-end',
      alignItems : 'center',
      marginBottom:Platform.OS==='ios'?30:85,
    },
    roundedContainer: {
        width:width*9/10,
        //height:screenHeight*8/10, //comment this for dynamic height
        backgroundColor:'white',
        borderTopLeftRadius:14,
        borderTopRightRadius:14,
        overflow:"hidden",
        alignItems:'center'
    },
    floatingNextButton: {
        width: '80%',
        padding: theme.DEFAULT_PADDING_BTN,
        backgroundColor: theme.TERTIARY_BTN_BACKGROUND_COLOR,
        borderRadius: 5,
        overflow: 'hidden',
        //bottom:50
        position: 'absolute', bottom: Platform.OS === 'ios' ? 30 : 70
    },
    floatingNextButton1: {
        width: '80%',
        height:40,
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom:5,
        backgroundColor:'#757575',
        //bottom:50
        position: 'absolute', bottom: Platform.OS === 'ios' ? 30 : 70
    },

    backgroundColorF1F1F1: {
        backgroundColor: theme.BACKGROUND_COLOR_F1F1F1
    }
});

export default commonStyles;