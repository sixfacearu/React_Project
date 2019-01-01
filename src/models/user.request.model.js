import B21RequestModel from './b21.request.model';

export default class UserRequestModel implements B21RequestModel {
    FirstName: string;
    LastName: string;
    EmailAddress: string;
    Username: string;
    Password: string;
    MobilePhone: string;
    CountryCode: string;
}