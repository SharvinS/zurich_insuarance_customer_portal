import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { GoogleLogin } from '@react-oauth/google';

import { login } from '../store/actions/authActions';
import styles from '../styles/Home.module.css';

export default function Home() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { isAuthenticated, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/users');
    }
  }, [isAuthenticated, router]);

  const handleLoginSuccess = (credentialResponse) => {
    if (credentialResponse.credential) {
      console.log('Login Success:', credentialResponse);
      dispatch(login(credentialResponse.credential));
    } else {
      console.error('Credential no found:', credentialResponse);
    }
  };

  const handleLoginError = () => {
    console.error('Authentication failed');
  };

  if (isAuthenticated) { return null; }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to Zurich Company Portal</h1>

        <p className={styles.description}>
          Please sign in with your Google account to continue.
        </p>

        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={handleLoginError}
        />

        {error && <p className={styles.error}>Error: {error}</p>}
      </main>
    </div>
  );
}