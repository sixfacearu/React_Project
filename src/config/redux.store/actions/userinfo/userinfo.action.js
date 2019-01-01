import { ADD_USER_INFO } from "./userinfo.types";

export const addUserInfo = (userResponse) => {
    return {
        type: ADD_USER_INFO,
        userResponse: userResponse
    }
}