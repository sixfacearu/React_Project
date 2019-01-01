import B21RequestModel from './b21.request.model';

export default class KYCRegisterUserByDocumentRequestModel extends B21RequestModel {
    PassportImage: ByteString;
    UtilityBillImage: ByteString;
}