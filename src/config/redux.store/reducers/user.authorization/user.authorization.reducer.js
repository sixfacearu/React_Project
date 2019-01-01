import UserAuthenticationModel from "../../../../models/user.authentication.model";
import { ADD_USER_AUTHORIZATION } from "../../actions/user.authorization/user.authorization.action.types";


const initialState = {
    userAuthorizationResponse: new UserAuthenticationModel()
};

const userAuthorizationReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_USER_AUTHORIZATION:
            return {
                ...state,
                userAuthorizationResponse: action.userAuthorizationResponse
            }
            break;
    
        default: return state;
            break;
    }
}

export default userAuthorizationReducer;