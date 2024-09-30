// _app.tsx
import type { AppProps } from 'next/app';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n'; 
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig'; 


function MyApp({ Component, pageProps }: AppProps) {
  const [user, loading] = useAuthState(auth);

  return (
    <I18nextProvider i18n={i18n}>
      <Component {...pageProps} />
    </I18nextProvider>
  );
}

export default MyApp;
