import axios from 'axios';

// Define action type constants for Redux actions related to authentication
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT = 'LOGOUT';

// Action creators
const loginRequest = () => ({ type: LOGIN_REQUEST });
const loginSuccess = (user) => ({ type: LOGIN_SUCCESS, payload: user });
const loginFailure = (error) => ({ type: LOGIN_FAILURE, payload: error });

// Updated login function to send Google credential token to backend
export const login = (googleCredentialToken) => async (dispatch) => {
  dispatch(loginRequest());
  try {
    // Construct the backend auth URL
    const baseApiUrl = (process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3000/billing').replace('/billing', '');
    const backendAuthUrl = `${baseApiUrl}/auth/google`;

    console.log(`Sending Google credential to backend: ${backendAuthUrl}`);

    // Send the Google credential token to backend API
    const response = await axios.post(backendAuthUrl, {
      token: googleCredentialToken, // Send the Google ID token
    });

    if (response.data && response.data.user && response.data.token) {
      // Store the application token received 
      localStorage.setItem('authToken', response.data.token);
      // Dispatch success with user data
      dispatch(loginSuccess(response.data.user));
      console.log('Backend login successful:', response.data.user);
    } else {
      // Handle unexpected backend response
      console.error('Unexpected backend response:', response.data);
      throw new Error('Invalid response format from server');
    }

  } catch (error) {
    // Handle errors during the API call
    console.error('Backend login failed:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Login failed';
    dispatch(loginFailure(errorMessage));
  }
};

// Action creator for handling the logout flow
export const logout = () => (dispatch) => {
  localStorage.removeItem('authToken');
  dispatch({ type: LOGOUT });
};
