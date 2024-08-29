import Footer from '@/app/components/landingPage/footer/Footer';
import Partners from '@/app/components/landingPage/partners/Partners';

import style from './style.module.css'
import AboutApp from '../../components/landingPage/aboutApp/AboutApp';
import Faq from '../../components/landingPage/faq/Faq';
import ServiceInclude from '../../components/landingPage/serviceInclude/ServiceInclude';
import Nav from '../../components/landingPage/nav/Nav';
const Home: React.FC = () => {
    return <>
        <div className={style.main}>
        <Nav/>
        <AboutApp/>
        <ServiceInclude/>
        <Faq/>
        <Partners/>
        </div>
        <Footer/>
        </>
}

export default Home;
