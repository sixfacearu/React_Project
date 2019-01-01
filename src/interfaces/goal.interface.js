import HttpUrlConstant from '../constants/http.constant';
import HttpInterface from './http.interface';

export default class GoalInterface {

    static getCurrency(currencyObj) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL + HttpUrlConstant.GET_CURRENCIES, '', currencyObj);
    }

    static createGoal(goalObj) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL + HttpUrlConstant.CREATE_GOAL, '', goalObj);
    }

    static createGoalAllocation(goalAllocationObj) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL + HttpUrlConstant.CREATE_GOAL_ALLOCATION, '', goalAllocationObj);
    }

    static updateGoalAllocation(goalAllocationObj) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL + HttpUrlConstant.UPDATE_GOAL_ALLOCATION, '', goalAllocationObj);
    }

    static getGoalDashboard(goalDashboardObj) {
        return HttpInterface.post(HttpUrlConstant.BASE_URL + HttpUrlConstant.GET_GOAL_DASHBOARD, '', goalDashboardObj);
    }
}