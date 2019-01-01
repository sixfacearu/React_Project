import React, { Component } from 'react';
import { Platform, View, StyleSheet } from 'react-native';

import Dimensions from 'Dimensions';
import theme from '../themes/common.theme';
import PropTypes from 'prop-types';

import Svg,{ Circle, G,Text, Image  } from 'react-native-svg';
import { PieChart } from 'react-native-svg-charts';

const propTypes = { currenciesData: PropTypes.array };
const defaultProps = { currenciesData: [] };


export default class DonutChartComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            donutData: this.props.currenciesData
        }
    }

    componentWillMount () {
        this.setState({
            donutData: this.props.currenciesData
        });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            donutData: nextProps.currenciesData
        });
    }
    render() {

        let iteratedData = [];
        let count = 1;
        this.state.donutData.forEach(element => {
            let coinSet = {
                key:count,
                amount :  element.percentage,
                svg : {fill:element.hexCode},
                url : `${element.flagURL}${element.currencyCode}/symbol.png`,
                currCode:element.currencyCode
            }
            iteratedData.push(coinSet);
            count++;
        })

        const Labels = ({ slices, height, width }) => {
            return slices.map((slice, index) => {
                const { labelCentroid, pieCentroid, data } = slice;
                if(data.amount >= 10){
                
                    return (
                        <G
                            key={index}
                            x={labelCentroid[ 0 ]}
                            y={labelCentroid[ 1 ]}
                            >
                            
                            {/* IMAGES AND TEXT */}
                            <Image
                                x={-15} //-10
                                y={ Platform.OS === 'ios' ? 15 : -15 } //10,-10
                                width={30} //20
                                height={30} //20
                                preserveAspectRatio="xMidYMid slice"
                                opacity="1"
                                href={{uri: data.url}} //TODO: Remove hardcoded image when remote image available //{require("../assets/btc.png")}//
                            />
                            <Text 
                                fill={'white'}
                                fontSize={theme.FONT_SIZE_SMALL}
                                //x={Platform.OS === 'ios'?-10:0}
                                textAnchor={'middle'}
                                y={25}
                                >{data.amount+'%'}
                            </Text>

                            {/* TWO TEXTS */}
                            {/* <Text 
                                fill={'white'}
                                textAnchor={'middle'}
                                alignmentBaseline={'middle'}
                                fontSize={theme.FONT_SIZE_MEDIUM}
                                >{data.currCode}
                            </Text>
                            <Text 
                                fill={'white'}
                                fontSize={theme.FONT_SIZE_MEDIUM}
                                textAnchor={'middle'}
                                alignmentBaseline={'middle'}
                                //x={-10}
                                y={30}
                                >{data.amount+'%'}
                            </Text> */}

                            
                        </G>
                    )
                } else if(data.amount <= 9 && data.amount >= 7){
                    return (
                        <G
                            key={index}
                            x={labelCentroid[ 0 ]}
                            y={labelCentroid[ 1 ]}
                            >
                            <Image
                                x={-15}
                                y={ Platform.OS === 'ios' ? 15 : -15 }
                                width={30}
                                height={30}
                                preserveAspectRatio="xMidYMid slice"
                                opacity="1"
                                href={{uri: data.url}}
                            />
                        </G>
                    );
                } else {
                    return(
                        <G
                        key={index}
                        x={labelCentroid[ 0 ]}
                        y={labelCentroid[ 1 ]}
                        ></G>
                    )
                }
            })
        }
        return (
            <PieChart
              style={style.donutStyle}
              valueAccessor={({ item }) => item.amount}
              data={iteratedData}
              spacing={0}
              outerRadius={'100%'}
              innerRadius={'30%'}
              padAngle={0}
            >
              <Labels/>
          </PieChart>
        )
    }
}

DonutChartComponent.propTypes = propTypes;
DonutChartComponent.defaultProps = defaultProps;

const style = StyleSheet.create({
    donutStyle: { 
        height: 240,//250
        /*
        shadowOffset:{width:-5,height:0},
        shadowColor:'black',
        shadowOpacity:0.3,
        shadowRadius:5 */ // SHADOW REMOVED 
    }
});
// remomve it after data integration
const data = [
    {
        key: 1,
        amount: 16.66,
        svg: { fill: '#600080' },
        url:"https://facebook.github.io/react-native/docs/assets/favicon.png",
        currCode:"BTC"
    },
    {
        key: 2,
        amount: 16.66,
        svg: { fill: '#9900cc' },
        url:"https://facebook.github.io/react-native/docs/assets/favicon.png",
        currCode:"LTC"
    },
    {
        key: 3,
        amount: 16.66,
        svg: { fill: '#c61aff' },
        url:"https://facebook.github.io/react-native/docs/assets/favicon.png",
        currCode:"NEO"
    },
    {
        key: 4,
        amount: 16.66,
        svg: { fill: '#d966ff' },
        url:"https://facebook.github.io/react-native/docs/assets/favicon.png",
        currCode:"LEO"
    },
    {
        key: 5,
        amount: 16.66,
        svg: { fill: '#ecb3ff' },
        url:"https://facebook.github.io/react-native/docs/assets/favicon.png",
        currCode:"XYZ"
    },
    {
        key: 6,
        amount: 16.66,
        svg: { fill: '#d966ff' },
        url:"https://facebook.github.io/react-native/docs/assets/favicon.png",
        currCode:"LEO"
    },
    {
        key: 7,
        amount: 16.66,
        svg: { fill: '#ecb3ff' },
        url:"https://facebook.github.io/react-native/docs/assets/favicon.png",
        currCode:"XYZ"
    }
]

const currencyData = [
    {
        "id": "0",
        "flagURL": "http://mobapp.assets.b21.io/currencies/",
        "percentage": "1",
        "currencyId": "1",
        "currencyName": "Bitcoin",
        "currencyCode": "BTC",
        "currencyCategoryDisplayName": "crypto",
        "hexCode": "#EEEEEE",
        "minGoalAmount": "",
        "maxGoalAmount": "",
        "minWithdrawalAmount": "",
        "maxWithdrawalAmount": "",
        "minSellAmount": "",
        "maxSellAmount": "",
        "minBuyAmount": "",
        "maxBuyAmount": ""
    },
    {
        "id": "0",
        "flagURL": "http://mobapp.assets.b21.io/currencies/",
        "percentage": "1",
        "currencyId": "1",
        "currencyName": "Bitcoin",
        "currencyCode": "BTC",
        "currencyCategoryDisplayName": "crypto",
        "hexCode": "#ecb3ff",
        "minGoalAmount": "",
        "maxGoalAmount": "",
        "minWithdrawalAmount": "",
        "maxWithdrawalAmount": "",
        "minSellAmount": "",
        "maxSellAmount": "",
        "minBuyAmount": "",
        "maxBuyAmount": ""
    },
    {
        "id": "0",
        "flagURL": "http://mobapp.assets.b21.io/currencies/",
        "percentage": "1",
        "currencyId": "1",
        "currencyName": "Bitcoin",
        "currencyCode": "BTC",
        "currencyCategoryDisplayName": "crypto",
        "hexCode": "#d966ff",
        "minGoalAmount": "",
        "maxGoalAmount": "",
        "minWithdrawalAmount": "",
        "maxWithdrawalAmount": "",
        "minSellAmount": "",
        "maxSellAmount": "",
        "minBuyAmount": "",
        "maxBuyAmount": ""
    }
]