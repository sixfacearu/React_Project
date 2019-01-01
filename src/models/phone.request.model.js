import B21RequestModel from "./b21.request.model";
import { PhoneRequestObjectModel } from "./phone.request.object.model";

export class PhoneRequestModel extends B21RequestModel {
    VerificationCode: string;
    Phone: PhoneRequestObjectModel;
}