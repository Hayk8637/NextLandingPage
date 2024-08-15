import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Menu } from 'antd';
import SignIn from './signIn/SignIn';
import SignUp from './signUp/SignUp';
import ForgotPassword from './forgotPassword/ForgotPassword';
import style from './style.module.css';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '../../../../firebaseConfig';
import { UserOutlined } from '@ant-design/icons';

const Nav: React.FC = () => {
  const { i18n } = useTranslation();
  const [isSignInModalVisible, setIsSignInModalVisible] = useState(false);
  const [isSignUpModalVisible, setIsSignUpModalVisible] = useState(false);
  const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);

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

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update state with the current user
    });

    return () => unsubscribe(); // Cleanup subscription on component unmount
  }, []);

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

  const showForgotPasswordModal = () => {
    setIsForgotPasswordModalVisible(true);
  };

  const handleForgotPasswordModalClose = () => {
    setIsForgotPasswordModalVisible(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null); // Clear user state after sign out
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleMenuClick = (e: { key: string }) => {
    if (e.key === 'logout') {
      handleSignOut();
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="personal-account">
        Personal Account
      </Menu.Item>
      <Menu.Item key="account-settings">
        Account Settings
      </Menu.Item>
      <Menu.Item key="logout">
        Log Out
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <nav className={style.nav}>
        <div className={style.left}>
          <a href='#'><Image src="/logo/logo.png" alt='logo' width={150} height={50} /></a>
        </div>
        <div className={style.right}>
          {user ? (<>
            <Dropdown
              overlay={menu}
              trigger={['click']}
            >
              <Button type="primary" color='#ff7700' className={style.userEmail}>
                {user.email}
              </Button>
            </Dropdown>
            <Dropdown
            overlay={menu}
            trigger={['click']}
          >
            <Button type="link" color='#ff7700' className={style.userIcon}>
            <UserOutlined color='#ff7700' />
            </Button>
          </Dropdown>
          </>
          ) : (
            <div className={style.authButtons}>
              <Button type="link" onClick={showSignInModal} className={style.signIn}>
                Sign In
              </Button>
              <Button type="primary" onClick={showSignUpModal} className={style.signUp}>
                Sign Up
              </Button>
            </div>
          )}
          <select onChange={(e) => changeLanguage(e.target.value)} value={i18n.language}>
            <option value="en">EN</option>
            <option value="ru">RU</option>
            <option value="am">AM</option>
          </select>
        </div>
      </nav>
      <SignIn
        isModalVisible={isSignInModalVisible}
        onClose={handleSignInModalClose}
        onForgotPassword={showForgotPasswordModal}
      />
      <SignUp isModalVisible={isSignUpModalVisible} onClose={handleSignUpModalClose} />
      <ForgotPassword isModalVisible={isForgotPasswordModalVisible} onClose={handleForgotPasswordModalClose} />
    </>
  );
};

export default Nav;
