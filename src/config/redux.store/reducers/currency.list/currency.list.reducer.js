

import { ADD_CURRENCY } from "../../actions/currency.list/currency.list.action.types";
import CurrencyResponseModel from "../../../../models/currency.response.model";

const initialState = {
    currencyResponse: new CurrencyResponseModel()
};

const currencyReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_CURRENCY:
            return {
                ...state,
                currencyResponse: action.currencyResponse
            }
            break;
    
        default: return state;
            break;
    }
}

export default currencyReducer;