import Banner from '@/app/components/banner/Banner';
import Footer from '@/app/components/footer/Footer';
import Nav from '@/app/components/nav/nav';
import Partners from '@/app/components/partners/Partners';

import style from './style.module.css'
import AboutC from '../components/aboutApp/AboutApp';
import Faq from '../components/faq/Faq';
import ServiceInclude from '../components/serviceInclude/ServiceInclude';
const Home: React.FC = () => {
    return <>
        <div className={style.main}>
        <Nav/>
        <Banner/>
        <AboutC/>
        <Partners/>
        <ServiceInclude/>
        <Faq/>
        </div>
        <Footer/>
        </>
}

export default Home;
