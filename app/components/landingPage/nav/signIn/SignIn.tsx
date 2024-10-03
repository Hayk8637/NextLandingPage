import React, { useEffect } from 'react';
import { Modal, Input, Button, Form, message } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import Image from 'next/image';
import style from './style.module.css';
import { auth, googleProvider } from '../../../../../firebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

interface SignInProps {
  isModalVisible: boolean;
  onClose: () => void;
  onForgotPassword: () => void;
}

const SignIn: React.FC<SignInProps> = ({ isModalVisible, onClose, onForgotPassword }) => {
  const router = useRouter();
  const { t, i18n } = useTranslation("global");

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && i18n.changeLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);
  const handleSignIn = async (values: any) => {
    const { email, password } = values;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      message.success(`${t(('Signinsuccessful'))}`);
      onClose();
      router.push('/profile/establishments');
    } catch (error) {
      message.error(`${t(('Signinfailed:'))} ` + error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      message.success(`${t(('SignedinwithGoogle'))}`);
      onClose();
      router.push('/profile/establishments');
    } catch (error) {
      message.error(`${t(('Googlesign-infailed:'))}` + error);
    }
  };

  return (
    <Modal
      open={isModalVisible}
      onCancel={onClose}
      footer={null}
      className={style.modal}
      centered
    >
      <div className={style.logo}>
        <Image src="/logo/logo.png" alt="Logo" width={200} height={50} />
      </div>
      <Form
        name="signInForm"
        initialValues={{ remember: true }}
        onFinish={handleSignIn}
        autoComplete="off"
        className={style.form}
      >
        <Form.Item
          name="email"
          rules={[{ required: true, message: `${t(('Pleaseinputyouremail!'))}` }]}
          className={style.formItem}
        >
          <Input placeholder={t(('Email'))} className={style.input} />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: `${t(('Pleaseinputyourpassword!'))}` }]}
          className={style.formItem}
        >
          <Input.Password placeholder={t(('password '))} className={style.input} />
        </Form.Item>
        <Form.Item className={style.formItem}>
          <Button
            type="primary"
            htmlType="submit"
            className={style.submitButton}
            block
          >
            {t(('signin'))}
          </Button>
        </Form.Item>
      </Form>
      <div className={style.orDivider}>
        <div className={style.line}></div>
        <span className={style.orText}>{t(('or'))}</span>
        <div className={style.line}></div>
      </div>
      <div className={style.googleLogin}>
        <Button type="link" icon={<GoogleOutlined />} className={style.googleButton} onClick={handleGoogleSignIn}>
          {t(('signInWithGoogle'))}
        </Button>
      </div>
      <div className={style.forgotPassword}>
        <a onClick={() => { onClose(); onForgotPassword(); }}>{t(('forgotPassword'))}</a>
      </div>
    </Modal>
  );
};

export default SignIn;
