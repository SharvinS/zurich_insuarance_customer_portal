// Define action type constants for Redux actions related to authentication
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT = 'LOGOUT';

// Action creator function for LOGIN_REQUEST
// Returns a plain action object to signal the start of login
const loginRequest = () => ({
  type: LOGIN_REQUEST,
});

// Action creator function for LOGIN_SUCCESS
// Returns an action object containing the user data payload
const loginSuccess = (user) => ({
  type: LOGIN_SUCCESS,
  payload: user, // The user details received upon successful login
});

// Action creator function for LOGIN_FAILURE
// Returns an action object containing the error payload
const loginFailure = (error) => ({
  type: LOGIN_FAILURE,
  payload: error, // The error message or details
});

// Asynchronous action creator for handling the login flow
export const login = () => async (dispatch) => {
  dispatch(loginRequest());
  try {
    console.log("Simulating backend call with mock data");
    const response = {
      data: {
        user: {
          name: 'Admin User', // Example user name
          email: 'test@example.com', // Example user email
          roles: ['admin'], // Example roles, ensure 'admin' is included for non-GET API
        },
        token: 'fake_token', // Example session token
      },
    };

    // Store the token in local storage for persistence
    localStorage.setItem('authToken', response.data.token);
    // Dispatch the success action with the user data from the response
    dispatch(loginSuccess(response.data.user));
  } catch (error) {
    // Dispatch the failure action with the error message
    dispatch(loginFailure(error.message || 'Login failed'));
  }
};

// Action creator for handling the logout flow
export const logout = () => (dispatch) => {
  // Remove the authentication token from local storage
  localStorage.removeItem('authToken');
  // Dispatch the LOGOUT action to reset the authentication state in Redux
  dispatch({ type: LOGOUT });
};
