import Nav from '@/app/components/landingPage/nav/Nav'
import Institutions from '@/app/components/managment/institutions/Institutions'
import React from 'react'
import style from './style.module.css'
import Footer from '@/app/components/landingPage/footer/Footer'
const institutions:React.FC = () => {
  return (
    <>
    <div className={style.main}>
      <Nav/>
      <Institutions/>
    </div>
    <Footer/>
    </>
  )
}

export default institutions
