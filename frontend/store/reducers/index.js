import { combineReducers } from 'redux';
import authReducer from './authReducer';

// Combine all individual reducers into a single root reducer
const rootReducer = combineReducers({
  // The 'auth' slice of the state will be managed by the authReducer
  auth: authReducer,
});

// Export the combined root reducer
export default rootReducer;
