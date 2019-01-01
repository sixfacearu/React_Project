import HttpUrlConstant from '../constants/http.constant';
import HttpInterface from './http.interface';

export default class TransactionInterface {

  
    static buyAssets(obj) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL + HttpUrlConstant.BUY_ASSETS, '', obj);
    }
}