import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import store from '../store';
import '../styles/global.css';

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function MyApp({ Component, pageProps }) {
  if (!clientId) {
    console.error("Client ID is missing");
  }

  return (
    <GoogleOAuthProvider clientId={clientId || ""}> { }
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </GoogleOAuthProvider>
  );
}

export default MyApp;
