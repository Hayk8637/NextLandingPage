import Banner from '@/app/components/banner/Banner';
import ContactUs from '@/app/components/contactUs/ContactUs';
import Footer from '@/app/components/footer/Footer';
import Nav from '@/app/components/nav/nav';
import Partners from '@/app/components/partners/Partners';

import style from './style.module.css'
import AboutC from '../components/aboutC/AboutC';
import Faq from '../components/faq/Faq';
const HomeC: React.FC = () => {
    return <>
        <div className={style.main}>
        <Nav/>
        <Banner/>
        <AboutC/>
        <Partners/>
        <Faq/>
        <ContactUs/>
        </div>
        <Footer/>
        </>
}

export default HomeC;
