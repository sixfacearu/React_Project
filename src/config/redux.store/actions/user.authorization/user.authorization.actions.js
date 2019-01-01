import { ADD_USER_AUTHORIZATION } from "./user.authorization.action.types";

export const addUserAuthorization = (userAuthorizationResponse) => {
    return {
        type: ADD_USER_AUTHORIZATION,
        userAuthorizationResponse: userAuthorizationResponse
    }
}