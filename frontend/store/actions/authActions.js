import axios from 'axios';

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT = 'LOGOUT';

const loginRequest = () => ({
  type: LOGIN_REQUEST,
});

const loginSuccess = (user) => ({
  type: LOGIN_SUCCESS,
  payload: user,
});

const loginFailure = (error) => ({
  type: LOGIN_FAILURE,
  payload: error,
});

export const login = (tokenId) => async (dispatch) => {
  dispatch(loginRequest());
  try {
    const response = {
      data: {
        user: {
          name: 'Admin User',
          email: 'test@example.com',
          roles: ['admin'],
        },
        token: 'fake_token',
      },
    };

    localStorage.setItem('authToken', response.data.token);
    dispatch(loginSuccess(response.data.user));
  } catch (error) {
    dispatch(loginFailure(error.message || 'Login failed'));
  }
};

export const logout = () => (dispatch) => {
  localStorage.removeItem('authToken');
  dispatch({ type: LOGOUT });
};