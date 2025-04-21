import { createStore, applyMiddleware } from 'redux';
import {thunk} from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from './reducers';

// Define the middleware to be applied to the Redux store
const middleware = [thunk];

// Create the Redux store instance
const store = createStore(
  rootReducer, // Pass the combined root reducer
  // composeWithDevTools wraps applyMiddleware to enable the browser extension
  composeWithDevTools(applyMiddleware(...middleware))
);

// Export the configured Redux store
export default store;
