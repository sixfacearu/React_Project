import { createStore, combineReducers } from 'redux';
import countryReducer from './reducers/country.list/country.list.reducer';
import currencyReducer from './reducers/currency.list/currency.list.reducer';
import userInfoReducer from './reducers/userinfo/userinfo.reducer';
import goalDashboardReducer from './reducers/goal.dashboard/goal.dashboard.reducer';
import userAuthorizationReducer from './reducers/user.authorization/user.authorization.reducer';


const rootReducer = combineReducers({
    countryReducer:  countryReducer,
    currencyReducer: currencyReducer,
    userInfoReducer: userInfoReducer,
    goalDashboardReducer: goalDashboardReducer,
    userAuthorizationReducer: userAuthorizationReducer
});

const configureStore = () => {
    return createStore(rootReducer);
}

export default configureStore;