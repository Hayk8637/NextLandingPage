import HeaderMenu from '../../../app/components/managment/menuEdit/headerMenu/HeaderMenu'
import MenuCategoryItems from '../../../app/components/managment/menuEdit/menuCategoryItems/MenuCategoryItems'
import MenuCategoryNavigation from '../../../app/components/managment/menuEdit/menuCategoryNavigation/MenuCategoryNavigation'
import './style.css'
const Menu:React.FC = () => {
    return <>
        <div className="menu">
            {/* <div className='header'> */}
                <HeaderMenu/>
                <MenuCategoryNavigation/>
            {/* </div> */}
            
            <MenuCategoryItems />
        </div>
    </>
}
export default Menu