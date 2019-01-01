import PropTypes from 'prop-types';

export default class ModalComponentModel{
    message : string;
    leftBtnText : string;
    rightBtnText : string;
    shouldVisible : boolean;
    showLeftBtn : boolean;
    showRightBtn: boolean;
    leftBtnFunction: PropTypes.func;
    rightBtnFunction: PropTypes.func;
    closeBtnFunction: PropTypes.func;
 }