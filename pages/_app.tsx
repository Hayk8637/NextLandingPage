import type { AppProps } from 'next/app';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n'; // Adjust the path if necessary
// import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <I18nextProvider i18n={i18n}>
      <Component {...pageProps} />
    </I18nextProvider>
  );
}

export default MyApp;
