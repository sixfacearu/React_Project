import B21RequestModel from './b21.request.model';

export default class UpdatePersonRequestModel extends B21RequestModel {
    FirstName: string;
    LastName: string;
    SecondLastName: string;
    FullName: string;
    DayOfBirth: string;
    MonthOfBirth: string;
    YearOfBirth: string;
}