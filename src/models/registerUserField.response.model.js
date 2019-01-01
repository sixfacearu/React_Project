import RegisterUserFieldArrayResponseModel from "./registerUserField.response.array.model";

export default class RegisterUserFieldResponseModel {
    CreateUserFieldRequirements: Array<RegisterUserFieldArrayResponseModel>;
    NationalIDs: Array<RegisterUserFieldArrayResponseModel>;
    Consents: Array<string>;
}