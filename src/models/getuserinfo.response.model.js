import UserResponseModel from './user.response.model';
import UserRegistrationResponseModel from './userregistration.model';

export default class GetUserInfoResponseModel {
    User: UserResponseModel;
    UserSignupRegistrationInfo: UserRegistrationResponseModel;
}