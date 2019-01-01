import B21RequestModel from "./b21.request.model";

export default class PaymentInstrumentRequirementRequestModel extends B21RequestModel {
    Direction: string;
    PITypeName: string;
    PIID: string;
    ServiceProviderID: string;
}