import LandingPage from "../src/components/reactPages/landingpage/LandingPage";
import {
  getThirdPartyAuthInfo,
  AuthInfo,
} from '../src/utils/auth/authHelper';
import Head from 'next/head';
// todo: authinfoprops type


const Home = (props: { authInfo: AuthInfo; }) => {

  return (
    <>
      <Head>
        <meta property="og:title" content="Housewell" />
        <meta property="og:description" content="Sell your house, pay almost nothing in fees" />
        <meta property="og:image" content="https://housewell.com/header2.jpg" />
        <meta property="og:url" content="https://housewell.com" />
        <meta property="og:type" content="website" />


        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Housewell" />
        <meta name="twitter:description" content="Sell your house, pay almost nothing in fees" />
        <meta name="twitter:image" content="https://housewell.com/header.jpg" />

      </Head>
      <LandingPage />
    </>
  )
}

export async function getServerSideProps(context: any) {
  return getThirdPartyAuthInfo(context, "");
}

export default Home;