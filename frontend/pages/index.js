import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { GoogleLogin } from '@react-oauth/google';
import { login } from '../store/actions/authActions';
import styles from '../styles/Home.module.css';

// Main component for the home/login page
export default function Home() {
  const dispatch = useDispatch(); // Get the dispatch function to send actions to Redux
  const router = useRouter(); // Get the router object for navigation

  // Select authentication status and any login errors from the Redux store
  const { isAuthenticated, error } = useSelector((state) => state.auth);

  // Effect hook to redirect the user if they are already authenticated
  useEffect(() => {
    // If the user is logged in
    if (isAuthenticated) {
      // Redirect them to the '/users' page
      router.push('/users');
    }
    // This effect runs when isAuthenticated or router changes
  }, [isAuthenticated, router]);

  // Callback function triggered on successful Google login
  const handleLoginSuccess = (credentialResponse) => {
    // Check if the credential (JWT token) exists in the response
    if (credentialResponse.credential) {
      // Log success for debugging
      console.log('Login Success:', credentialResponse);
      // Dispatch the login action with the received credential token
      dispatch(login(credentialResponse.credential));
    } else {
      // Log an error if the credential is unexpectedly missing
      console.error('Credential not found:', credentialResponse);
    }
  };

  // Callback function triggered if Google login fails
  const handleLoginError = () => {
    // Log the failure for debugging
    console.error('Authentication failed');
  };

  // If the user is already authenticated, don't render the login page content
  if (isAuthenticated) { return null; }

  // Render the login page UI
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to Zurich Company Portal</h1>

        <p className={styles.description}>
          Please sign in with your Google account to continue
        </p>

        {/* Render the Google Login button component */}
        <GoogleLogin
          onSuccess={handleLoginSuccess} // Function to call on successful login
          onError={handleLoginError} // Function to call on login error
        />

        {/* Display any login error message from the Redux store */}
        {error && <p className={styles.error}>Error: {error}</p>}
      </main>
    </div>
  );
}
