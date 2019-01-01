import PaymentSupportedInstrumentTypesModel from "./payment.supported.instrument.types.model";
import PaymentFieldsRequirementModel from "./payment.fields.requirement.model";

export default class PaymentInstrumentRequirementResponseModel {
    PIType: PaymentSupportedInstrumentTypesModel;
    CreatePaymentInstrumentRequired: boolean;
    TransactionWithCreateAndUpdatePaymentInstrumentRequired: boolean;
    IsUpdatePaymentInstrumentAllowed: boolean;
    BankOrLocationListRequired: boolean;
    CreatePIFieldRequirements: Array<PaymentFieldsRequirementModel>;
    DepositFundsPIFieldRequirements: Array<PaymentFieldsRequirementModel>;
    PITransferServiceTypes: string;
    PIFieldRequirements: string;
}