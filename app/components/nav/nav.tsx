"use client";
import React, { useEffect } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import style from './style.module.css';

const logoSrc = '/logo/logo.png';

const Nav: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    if (i18n && i18n.changeLanguage) {
      i18n.changeLanguage(language);
      localStorage.setItem('language', language);
      
    } else {
      console.error('i18n.changeLanguage is not available');
    }
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      if (i18n && i18n.changeLanguage) {
        i18n.changeLanguage(savedLanguage);
      }
    }
  }, [i18n]);

  return (
    <nav className={style.nav}>
      <div className={style.left}>
        <a href='#'><Image src={logoSrc} alt='logo' width={150} height={50} /></a>
      </div>
      <div className={style.right}>
        <select onChange={(e) => changeLanguage(e.target.value)} value={i18n.language}>
          <option value="en">EN</option>
          <option value="ru">RU</option>
          <option value="am">AM</option>
        </select>
      </div>
    </nav>
  );
}

export default Nav;
