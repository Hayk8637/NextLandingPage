import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import HomeC from '@/app/pages/Home/Home';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>MENUBYQR</title>
      </Head>
      <HomeC />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
};

export default Home;
