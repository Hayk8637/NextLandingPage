"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import SignIn from './signIn/SignIn';
import SignUp from './signUp/SignUp';
import style from './style.module.css';

const Nav: React.FC = () => {
  const { i18n } = useTranslation();
  const [isSignInModalVisible, setIsSignInModalVisible] = useState(false);
  const [isSignUpModalVisible, setIsSignUpModalVisible] = useState(false);

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

  const showSignInModal = () => {
    setIsSignInModalVisible(true);
  };

  const handleSignInModalClose = () => {
    setIsSignInModalVisible(false);
  };

  const showSignUpModal = () => {
    setIsSignUpModalVisible(true);
  };

  const handleSignUpModalClose = () => {
    setIsSignUpModalVisible(false);
  };

  return (
    <>
      <nav className={style.nav}>
        <div className={style.left}>
          <a href='#'><Image src="/logo/logo.png" alt='logo' width={150} height={50} /></a>
        </div>
        <div className={style.right}>
          <div className={style.authButtons}>
            <Button type="link" onClick={showSignInModal} className={style.signIn}>Sign In</Button>
            <Button type="link" onClick={showSignUpModal} className={style.signUp}>Sign Up</Button>
          </div>
          <select onChange={(e) => changeLanguage(e.target.value)} value={i18n.language}>
            <option value="en">EN</option>
            <option value="ru">RU</option>
            <option value="am">AM</option>
          </select>
        </div>
      </nav>
      <SignIn isModalVisible={isSignInModalVisible} onClose={handleSignInModalClose} />
      <SignUp isModalVisible={isSignUpModalVisible} onClose={handleSignUpModalClose} />
    </>
  );
};

export default Nav;
