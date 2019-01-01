import KYCRegisterUserArrayModel from './kyc.registeruser.array.model';
import B21RequestModel from './b21.request.model';

export default class KYCRegisterUserRequestModel extends B21RequestModel {
    UserID: string;
    Consent: boolean;
    DataFields: Array<KYCRegisterUserArrayModel>;
    NationalIDs: Array<KYCRegisterUserArrayModel>;
    Consents: Array<string>;//<KYCRegisterUserArrayModel>
    PassportImage: ByteString;
    UtilityBillImage: ByteString;
}