import StateArrayResponseModel from './state.response.array.model';

export default class StateResponseModel {
    CountryCode: string;
    CountryName:string;
    States : Array<StateArrayResponseModel>;
}