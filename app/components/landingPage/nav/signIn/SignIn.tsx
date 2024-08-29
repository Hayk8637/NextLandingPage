import React from 'react';
import { Modal, Input, Button, Form, message } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import Image from 'next/image';
import style from './style.module.css';
import { auth, googleProvider } from '../../../../../firebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/router';

interface SignInProps {
  isModalVisible: boolean;
  onClose: () => void;
  onForgotPassword: () => void;
}

const SignIn: React.FC<SignInProps> = ({ isModalVisible, onClose, onForgotPassword }) => {
  const router = useRouter();

  const handleSignIn = async (values: any) => {
    const { email, password } = values;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      message.success('Sign in successful');
      onClose();
      router.push('/profile');
    } catch (error) {
      console.error('Sign in error:', error);
      message.error('Sign in failed: ' + error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      message.success('Signed in with Google');
      onClose();
      router.push('/profile');
    } catch (error) {
      console.error('Google sign-in error:', error);
      message.error('Google sign-in failed: ' + error);
    }
  };

  return (
    <Modal
      visible={isModalVisible}
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
          rules={[{ required: true, message: 'Please input your email or username!' }]}
          className={style.formItem}
        >
          <Input placeholder="Phone number, username, or email" className={style.input} />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
          className={style.formItem}
        >
          <Input.Password placeholder="Password" className={style.input} />
        </Form.Item>
        <Form.Item className={style.formItem}>
          <Button
            type="primary"
            htmlType="submit"
            className={style.submitButton}
            block
          >
            Log In
          </Button>
        </Form.Item>
      </Form>
      <div className={style.orDivider}>
        <div className={style.line}></div>
        <span className={style.orText}>OR</span>
        <div className={style.line}></div>
      </div>
      <div className={style.googleLogin}>
        <Button type="link" icon={<GoogleOutlined />} className={style.googleButton} onClick={handleGoogleSignIn}>
          Log in with Google
        </Button>
      </div>
      <div className={style.forgotPassword}>
        <a onClick={() => { onClose(); onForgotPassword(); }}>Forgot password?</a>
      </div>
    </Modal>
  );
};

export default SignIn;
