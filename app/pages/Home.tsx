import Footer from '@/app/components/footer/Footer';
import Partners from '@/app/components/partners/Partners';

import style from './style.module.css'
import AboutC from '../components/aboutApp/AboutApp';
import Faq from '../components/faq/Faq';
import ServiceInclude from '../components/serviceInclude/ServiceInclude';
import Nav from '../components/nav/Nav';
const Home: React.FC = () => {
    return <>
        <div className={style.main}>
        <Nav/>
        <AboutC/>
        <ServiceInclude/>
        <Faq/>
        <Partners/>
        </div>
        <Footer/>
        </>
}

export default Home;
