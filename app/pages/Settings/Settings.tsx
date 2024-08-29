import React from 'react'
import style from './style.module.css'
import Nav from '@/app/components/landingPage/nav/Nav'
import Footer from '@/app/components/landingPage/footer/Footer'
import AccountSettings from '@/app/components/managment/acountSettings/acountSettings'
const Settings:React.FC = () => {
  return (
    <>
    <div className={style.main}>
        <Nav/>
        <AccountSettings />
    </div>
    <Footer/>
    </>
  )
}

export default Settings;
