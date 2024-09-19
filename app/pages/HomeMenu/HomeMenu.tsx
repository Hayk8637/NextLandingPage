import AllMenu from '../../../app/components/managment/menuEdit/allMenu/AllMenu'
import Banner from '../../../app/components/managment/menuEdit/banner/Banner'
import Header from '../../../app/components/managment/menuEdit/header/Header'
import './style.css'

const HomeMenu:React.FC = () => {
    return <>
        <div className='home'>
                <Header/>
                <Banner/>
                <AllMenu/>
        </div>
    </>
}

export default HomeMenu