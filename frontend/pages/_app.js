import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import store from '../store';
import '../styles/global.css';

// Grab the Google Client ID from environment variables
const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Main App component that Next.js uses to initialize pages
function MyApp({ Component, pageProps }) {
  // Make sure the Google Client ID is actually set
  if (!clientId) {
    console.error("Error: NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined in environment variables");
  }

  // Render the application structure
  return (
    // Wrap everything with the Google OAuth provider
    // This initializes the Google Sign-In functionality
    <GoogleOAuthProvider clientId={clientId || ""}>
      {/* Wrap the app with the Redux Provider */}
      <Provider store={store}>
        {/* Render the actual page component that the user navigated to */}
        <Component {...pageProps} />
      </Provider>
    </GoogleOAuthProvider>
  );
}

// Export the custom App component
export default MyApp;
