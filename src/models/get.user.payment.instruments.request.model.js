import B21RequestModel from "./b21.request.model";

export default class GetUserPaymentInstrumentsRequestModel extends B21RequestModel {
    Direction: string;
    PITypeName: string;
}