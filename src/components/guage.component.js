import React, { Component } from "react";
import { View,Text } from "react-native";
import * as _ from 'lodash';
import Svg, { G, Circle, Line, Polygon, Use, Defs,RadialGradient, Stop } from "react-native-svg";

const TICK_ID = "tick";

export default class Guage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      guageData : {}
    }
  }

  componentDidMount() {
    this.setState({
      guageData: this.props
    });
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      guageData: nextProps
    });
  }
  
  render() {
    try {
      // alert(JSON.stringify(this.state.guageData));
      if(!_.isEmpty(this.state.guageData)) {
        let opts = Object.assign({}, this.state.guageData);

        let { size, dialWidth } = opts;

        let cX = size / 2;
        let cY = size / 2;
        let radius = (size - 2 * dialWidth) / 2;
        let diameter = 2 * (radius / 1.05);
        let circumference = Math.PI * (radius / 1.25);
        opts = Object.assign(opts, {
          cX,
          cY,
          radius,
          diameter,
          circumference
        });

        renderDial = opts => {
          return (
            <Circle
              cx={opts.cX}
              cy={opts.cY}
              r={opts.radius}
              fill="none"
              stroke="#cdfbf2"//{opts.dialColor}
              strokeWidth={opts.dialWidth}
            />
          );
        };
      
        renderDial1 = opts => {
          return (
            <Circle
              cx={opts.cX}
              cy={opts.cY}
              r={opts.radius/1.14}
              fill="none"
              stroke="#dff8fa"//{opts.dialColor}
              strokeWidth={15}//{opts.dialWidth}
            />
          );
        };
      
        renderDial2 = opts => {
          return (
            <Circle
              cx={opts.cX}
              cy={opts.cY}
              r={opts.radius/1.25}
              fill="none"
              stroke="#bcdcdc"//{opts.dialColor}
              strokeDasharray = {[opts.radius/1.639,3]}
              strokeWidth={10}//{opts.dialWidth}
            />
          );
        };
      
        renderDial3 = opts => {
          return (
            <Circle
              cx={opts.cX}
              cy={opts.cY}
              r={opts.radius/1.35}
              fill="none"
              stroke="#dff8fa"//{opts.dialColor}
              strokeWidth={15}//{opts.dialWidth}
            />
          );
        };
      
        renderDial4 = opts => {
          return (
            <Circle
              cx={opts.cX}
              cy={opts.cY}
              r={opts.radius/1.65}
              fill="none"
              stroke="#9e9e9e"//{opts.dialColor}
              strokeWidth={7}//{opts.dialWidth}
            />
          );
        };
      
        renderDial5 = opts => {
          return (
            <Circle
              cx={opts.cX}
              cy={opts.cY}
              r={opts.radius/2.5}
              // fill="#fff"
              fill = "url(#grad)"
              fillOpacity = {0.9}
              // stroke="#fff"//{opts.dialColor}
              // strokeWidth={10}//{opts.dialWidth}
            />
          );
        };
      
        defineTick = opts => {
          let tX1 =
            opts.cX + opts.radius - Math.max(opts.dialWidth, opts.progressWidth) / 2;
          let tX2 = tX1 - opts.tickLength;
          return (
            <Line
              id={TICK_ID}
              x1={tX1}
              y1={opts.cY}
              x2={tX2}
              y2={opts.cY}
              stroke={opts.tickColor}
              strokeWidth={opts.tickWidth}
            />
          );
        };
      
        renderTicks = opts => {
          let tickAngles = [];
          for (let i = 0; i <= 360; i += opts.tickInterval) {
            tickAngles.push(i);
          }
          return (
            <G className="ticks">
              {tickAngles.map((tickAngle, idx) => {
                return (
                  <Use
                    href={`#${TICK_ID}`}
                    key={`tick-${idx}`}
                    transform={`rotate(${tickAngle} ${opts.cX} ${opts.cY})`}
                  />
                );
              })}
            </G>
          );
        };
      
        renderProgress = opts => {
          let offset = opts.circumference * (1 - opts.currentValue / opts.maximumValue);
      
          return (
            <Circle
              cx={opts.cX}
              cy={opts.cY}
              r={opts.radius/1.25}
              fill="none"
              stroke={opts.progressColor}
              strokeWidth={opts.progressWidth}
              strokeDasharray={opts.circumference}
              strokeDashoffset={offset}
              strokeLinecap={opts.progressRoundedEdge ? "round" : "butt"}
            />
          );
        };
      
        renderNeedle = opts => {
          let x1 = opts.cX,
            y1 = opts.cY - opts.needleWidth / 2,
            x2 = opts.cX,
            y2 = opts.cY + opts.needleWidth / 2,
            x3 = opts.diameter,
            y3 = opts.cY,
            needleAngle = 180 * opts.currentValue / opts.maximumValue;
      
          let needleElm = null;
          if (opts.needleSharp) {
            needleElm = (
              <Polygon
                points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
                fill={opts.needleColor}
              />
            );
          } else {
            needleElm = (
              <Line
                x1={opts.cX}
                y1={opts.cY}
                x2={opts.diameter}
                y2={opts.cY}
                fill="none"
                strokeWidth={opts.needleWidth}
                stroke={opts.needleColor}
              />
            );
          }
      
          return (
            <G className="needle">
              <G transform={`rotate(${needleAngle} ${opts.cX} ${opts.cY})`}>
                {needleElm}
              </G>
              <Circle
                cx={opts.cX}
                cy={opts.cY}
                r={opts.needleBaseSize}
                fill={opts.needleBaseColor}
              />
            </G>
          );
        };
      
        renderText = opts => {
          return (
            <View
              style = {{position:'absolute',top:opts.cX - opts.textViewVerticalOffset,left:0,width:2* opts.cX}}>
              <Text
                style = {
                  { 
                    textAlign:"center",width:"100%",fontSize:opts.textFontSize1,color: opts.textColor1,
                    fontFamily: opts.textFontFamily1
                  }
                }>
                {opts.contentText1}
              </Text>
              <Text
                style = { 
                    { 
                      textAlign:"center",width:"100%",fontSize:opts.textFontSize2,color: opts.textColor2,
                      fontFamily: opts.textFontFamily2
                    } 
                  }>
                {opts.contentText2}
              </Text>
            </View>
          );
        };

        return (
          <View>
            <Svg
              className={opts.className}
              height={size/2}
              width={size}
              viewBox={`0 0 ${size} ${size/2}`}
            >
              <Defs>{defineTick(opts)}</Defs>
              <G transform={`rotate(-180 ${cX} ${cY})`}>
                <RadialGradient id="grad" cx={`${cX}`} cy={`${cY}`} rx={`${radius/2.5}`} ry={`${radius/2.5}`} fx={`${radius/2.5}`} fy={`${radius/2.5}`} gradientUnits="userSpaceOnUse">
                  <Stop
                      offset="0%"
                      stopColor="#fff"
                      stopOpacity="1"
                  />
                  <Stop
                      offset="100%"
                      stopColor="#fff"
                      stopOpacity="0.5"
                  />
                </RadialGradient>
                {renderDial(opts)}
                {renderDial1(opts)}
                {renderDial2(opts)}
                {renderDial3(opts)}
                {renderDial4(opts)}
                {renderNeedle(opts)}
                {renderDial5(opts)}
                {/* {this.renderTicks(opts)} */}
                {renderProgress(opts)}
                {/* {renderText(opts)} */}
              </G>
            </Svg>
            {renderText(opts)}
          </View>
        );
      } else {
        return(
          <View>

          </View>
        )
      }
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }
}

Guage.defaultProps = {
  size: 200,

  dialWidth: 10,
  dialColor: "#eee",

  tickLength: 3,
  tickWidth: 1,
  tickColor: "#cacaca",
  tickInterval: 10,

  maximumValue: 100,
  currentValue: 25,
  progressWidth: 5,
  progressColor: "#3d3d3d",
  progressRoundedEdge: true,
  downProgressColor: "red",
  progressFont: "Serif",
  progressFontSize: "40",

  needle: true,
  needleBaseSize: 5,
  needleBaseColor: "#9d9d9d",
  needleWidth: 2,
  needleSharp: false,
  needleColor: "#8a8a8a",
  
  contentText1: "Current Value",
  contentText2: "$200",
  textColor1: "#000",
  textColor2: "#000",
  textFontSize1: 10,
  textFontSize2: 10,
  textFontFamily1: "",
  textFontFamily2: "",
  textViewVerticalOffset: 10
};