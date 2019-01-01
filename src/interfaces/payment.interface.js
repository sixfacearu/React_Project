import HttpUrlConstant from '../constants/http.constant';
import HttpInterface from './http.interface';

export default class PaymentInterface {

    static getSupportedPaymentInstrumentTypes(obj) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL + HttpUrlConstant.GET_SUPPORTED_PAYMENT_INSTRUMENT_TYPES, '', obj);
    }

    static getUserPaymentInstruments(obj) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL + HttpUrlConstant.GET_USER_PAYMENT_INSTRUMENTS, '', obj);
    }

    static getPaymentInstrumentRequirements(obj) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL + HttpUrlConstant.GET_PAYMENT_INSTRUMENT_REQUIREMENTS, '', obj);
    }

    static deposit(obj) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL + HttpUrlConstant.DEPOSIT, '', obj);
    }
}