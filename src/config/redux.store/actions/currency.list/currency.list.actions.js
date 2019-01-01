
import { ADD_CURRENCY } from "./currency.list.action.types";

export const addCurrency = (currencyResponse) => {
    return {
        type: ADD_CURRENCY,
        currencyResponse: currencyResponse
    }
}