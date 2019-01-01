import HttpUrlConstant from '../constants/http.constant';
import HttpInterface from './http.interface';

export default class KYCInterface {

    static getRegisterUserFieldRequirements(obj) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL + HttpUrlConstant.GET_REGISTER_USERFIELD_REQUIREMENTS, '', obj);
    }

    static getCountryStates(obj) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL + HttpUrlConstant.GET_COUNTRY_STATES, '', obj);
    }

    static addAddress(obj) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL + HttpUrlConstant.ADD_ADDRESS, '', obj);
    }

    static updatePerson(userObj) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL + HttpUrlConstant.UPDATE_PERSON, '', userObj);
    }

    static resendEmailVerification(emailObj) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL + HttpUrlConstant.RESEND_EMAIL_VERIFICATION, '', emailObj);
    }

    static getSourceOfFunds(fundObj){
        return HttpInterface.post(HttpUrlConstant.BASE_URL +  HttpUrlConstant.GET_SOURCE_OF_FUNDS,'',fundObj);
    }

    static updateSourceOfFunds(obj){
        return HttpInterface.post(HttpUrlConstant.BASE_URL +  HttpUrlConstant.SET_SOURCE_OF_FUNDS,'',obj)
    }
    static getUserInfo(obj) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL + HttpUrlConstant.GET_USER_INFO, '', obj);
    }

    static registerUser(obj) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL + HttpUrlConstant.REGISTER_USER, '', obj);
    }
    
    static registerUserByDocument(obj) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL + HttpUrlConstant.REGISTER_USER_BY_DOCUMENT, '', obj);
    }
}