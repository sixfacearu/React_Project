
const numberUtil = {
    returnIgnoredRoundedValues : (number,decimalPoints) =>{
        let regex = new RegExp('^-?\\d+(?:\.\\d{0,' + (decimalPoints || -1) + '})?');
        return parseFloat(number.toString().match(regex)[0]);
    }
}

export default numberUtil;