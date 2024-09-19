import React from 'react';
import './style.css';
import { LeftOutlined, ShoppingCartOutlined } from '@ant-design/icons';

const HeaderMenu: React.FC = () => {
    const currentPath = window.location.pathname;
    const centerText = currentPath.split('/')[currentPath.split('/').length-1];
    var returnBack = currentPath.split('/').slice(0,-1).join('/');
    if(centerText === 'cart'){
        returnBack = '/MENUBYQR'
    }
       return (
        <div className="headerMenu">
            <div className="left">
                <a href={returnBack}><LeftOutlined  style={{ color: 'black' }}/></a>
            </div>
            <div className="center">
                <h1>{centerText}</h1>
            </div>
            <div className="right">
                {/* <a className='heart' href="/heart"><img src={heart} alt="" /></a> */}
                <a className='cart' href="/MENUBYQR/cart"><ShoppingCartOutlined  style={{ color: 'black' }} /></a>
            </div>
        </div>
    );
}

export default HeaderMenu;
