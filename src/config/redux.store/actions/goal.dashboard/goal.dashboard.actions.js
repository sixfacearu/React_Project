import { ADD_GOAL_DASHBOARD } from "./goal.dashboard.action.types";

export const addGoalDashboard = (goalDashboardResponse) => {
    return {
        type: ADD_GOAL_DASHBOARD,
        goalDashboardResponse: goalDashboardResponse
    }
}