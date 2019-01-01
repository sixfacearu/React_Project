
import { ADD_USER_INFO } from "../../actions/userinfo/userinfo.types";
import UserResponseModel from "../../../../models/user.response.model";

const initialState = {
    userResponse: new UserResponseModel()
};

const userInfoReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_USER_INFO:
            return {
                ...state,
                userResponse: action.userResponse
            }
            break;

        default: return state;
            break;
    }
}

export default userInfoReducer;