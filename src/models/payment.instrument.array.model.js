
import SupportedCurrencyTypesArrayModel from './payment.supported.currency.array.model';
export default class PaymentInstrumentArrayModel {
    InvestmentAmount:string;
    AcctDisplayName: string;
    PIType: string;
    PIID: string;
    IsDefaultDepositAccount: boolean;
    IsDefaultWIthdrawalAccount: boolean;
    CanDeposit: boolean;
    CanWithdrawal: boolean;
    SupportedCurrencyTypes: Array<SupportedCurrencyTypesArrayModel>
}