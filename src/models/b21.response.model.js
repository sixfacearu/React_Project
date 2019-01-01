import B21SMIModel from "./b21.smi.model";

export default class B21ResponseModel {
    ErrorCode: string;
    ErrorMsg: string;
    ErrorMsgDebug: string;
    SMI: B21SMIModel;
}