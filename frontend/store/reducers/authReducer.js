import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT } from '../actions/authActions';

// Define the initial state for the authentication slice of the Redux store
const initialState = {
  isLoggingIn: false, // Flag to indicate if a login request is currently in progress
  isAuthenticated: false, // Flag to indicate if the user is currently logged in
  user: null, // Stores user information (like name, email, roles) upon successful login
  error: null, // Stores any error message related to login failure
};

// The reducer function for authentication state
const authReducer = (state = initialState, action) => {
  // Use a switch statement to handle different action types
  switch (action.type) {
    // When a login request starts
    case LOGIN_REQUEST:
      return {
        ...state, // Keep the existing state properties
        isLoggingIn: true, // Set loading flag to true
        error: null, // Clear any previous errors
      };
    // When login is successful
    case LOGIN_SUCCESS:
      return {
        ...state, // Keep the existing state properties
        isLoggingIn: false, // Set loading flag to false
        isAuthenticated: true, // Set authenticated flag to true
        user: action.payload, // Store the user data from the action payload
        error: null, // Clear any previous errors
      };
    // When login fails
    case LOGIN_FAILURE:
      return {
        ...state, // Keep the existing state properties
        isLoggingIn: false, // Set loading flag to false
        isAuthenticated: false, // Ensure authenticated flag is false
        user: null, // Clear any potential user data
        error: action.payload, // Store the error message from the action payload
      };
    // When the user logs out
    case LOGOUT:
      // Reset the state completely to its initial values
      return initialState;
    // If the action type doesn't match any case
    default:
      // Return the current state unchanged
      return state;
  }
};

// Export the reducer function as the default export
export default authReducer;
