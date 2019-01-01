import GoalDashboardResponseModel from "../../../../models/goal.dashboard.response.model";
import { ADD_GOAL_DASHBOARD } from "../../actions/goal.dashboard/goal.dashboard.action.types";




const initialState = {
    goalDashboardResponse: new GoalDashboardResponseModel()
};

const goalDashboardReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_GOAL_DASHBOARD:
            return {
                ...state,
                goalDashboardResponse: action.goalDashboardResponse
            }
            break;
    
        default: return state;
            break;
    }
}

export default goalDashboardReducer;