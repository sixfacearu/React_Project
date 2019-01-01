import { ADD_COUNTRY } from "./country.list.action.types";

export const addCountry = (countriesResponse) => {
    return {
        type: ADD_COUNTRY,
        countriesResponse: countriesResponse
    }
}