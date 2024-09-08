import Nav from '@/app/components/landingPage/nav/Nav'
import Establishments from '@/app/components/managment/establishments/establishments'
import React from 'react'
import style from './style.module.css'
import Footer from '@/app/components/landingPage/footer/Footer'
const establishments:React.FC = () => {
  return (
    <>
    <div className={style.main}>
      <Nav/>
      <Establishments/>
    </div>
    <Footer/>
    </>
  )
}

export default establishments
