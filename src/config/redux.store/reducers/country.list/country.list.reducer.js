import { ADD_COUNTRY  } from "../../actions/country.list/country.list.action.types";
import CountryResponseModel from "../../../../models/country.response.model";

const initialState = {
    countriesResponse: new CountryResponseModel()
};

const countryReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_COUNTRY:
            return {
                ...state,
                countriesResponse: action.countriesResponse
            }
            break;
    
        default: return state;
            break;
    }
}

export default countryReducer;