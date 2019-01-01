import DepositPaymentInstrumentResponseModel from "./deposit.payment.instrument.response";


export default class DepositReponseModel {
    PaymentInstrument: DepositPaymentInstrumentResponseModel;
    PIID: string;
    IsDefaultDepositAccount: boolean;
    IsDefaultWithdrawalAccount: boolean;
    CanDeposit: boolean;
    CanWithdrawal: boolean;
    SupportedCurrencyTypes: Array;
    PaymentInstructions: string;
    BrowserHTML: string;
    DepositTransactionID: string;
}