import CurrencyArrayResponseModel from "./currency.response.array.model";

export default class CurrencyResponseModel {
    CurrencyImageBaseURL: string;
    Currencies: Array<CurrencyArrayResponseModel>;
}