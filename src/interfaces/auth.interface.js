import HttpUrlConstant from '../constants/http.constant';
import HttpInterface from './http.interface';

export default class AuthInterface  {

    static authenticateSpecialUser (specialUser) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL+HttpUrlConstant.AUTHENTICATE,'',specialUser);
    }

    static checkAvailableEmail (emailData) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL+HttpUrlConstant.CHECK_AVAILABLE_EMAIL,'',emailData);
    }

    static createUser (userData) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL+HttpUrlConstant.CREATE_USER,'',userData);
    }
    
    static getCountries (countryData) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL+HttpUrlConstant.GET_COUNTRIES,'',countryData);
    }

    static sendMobileNumberVerificationCode (mobileData) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL+HttpUrlConstant.SEND_MOBILE_NUMBER_VERIFICATION_CODE,'',mobileData);
    }

    static getTermsAndConditions (userData) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL+HttpUrlConstant.GET_TERMS_AND_CONDITIONS,'',userData);
    }
    static acceptTermsAndConditions (userData) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL+HttpUrlConstant.ACCEPT_TERMS_AND_CONDITIONS,'',userData);
    }

    static verifyOTP (otpData) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL+HttpUrlConstant.ADD_PHONE,'',otpData);
    }

    static getUserInfo (userData) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL+HttpUrlConstant.GET_USER_INFO,'',userData);
    }

    static authAndGetUserInfo (userData) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL+HttpUrlConstant.AUTH_AND_GET_USER_INFO,'',userData);
    }
}