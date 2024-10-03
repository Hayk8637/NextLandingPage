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
import Link from 'next/link';

const Nav: React.FC = () => {
  const { t, i18n } = useTranslation("global");
  const [isSignInModalVisible, setIsSignInModalVisible] = useState(false);
  const [isSignUpModalVisible, setIsSignUpModalVisible] = useState(false);
  const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && i18n.changeLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); 
    });
    return () => unsubscribe(); 
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
      setUser(null); 
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
        <Link href="/profile/establishments">{t('institutions')}</Link>
      </Menu.Item>
      <Menu.Item key="settings">
        <Link href="/profile/settings">{t('settings')}</Link>
      </Menu.Item>
      <Menu.Item key="logout">
        {t('logout')}
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <nav className={style.nav}>
        <div className={style.left}>
          <Link href='/'>
            <Image src="/logo/logo.png" alt={t('logo')} width={150} height={50} />
          </Link>
        </div>
        <div className={style.right}>
          {user ? (
            <>
              <Dropdown overlay={menu} trigger={['click']}>
                <Button type="primary" className={style.userEmail}>
                  {user.email}
                </Button>
              </Dropdown>
              <Dropdown overlay={menu} trigger={['click']}>
                <Button type="link" className={style.userIcon}>
                  <UserOutlined />
                </Button>
              </Dropdown>
            </>
          ) : (
            <div className={style.authButtons}>
              <Button type="link" onClick={showSignUpModal} className={style.signUp}>
                {t(('signup'))}
              </Button>
              <Button type="primary" onClick={showSignInModal} className={style.signIn}>
                {t(('signin'))}
              </Button>
            </div>
          )}
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
