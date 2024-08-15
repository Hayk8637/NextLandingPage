import React, { useState } from 'react';
import { Modal, Input, Button, Form, message } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import Image from 'next/image';
import style from './style.module.css';
import { auth } from '../../../../../firebaseConfig'; 
import { createUserWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface SignUpProps {
  isModalVisible: boolean;
  onClose: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ isModalVisible, onClose }) => {
  const [isLoading, setIsLoading] = useState(false); // Состояние для индикатора загрузки

  const handleEmailSignUp = async (values: any) => {
    const { email, password } = values;
    setIsLoading(true); // Показать индикатор загрузки

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User created:', user);

      await sendEmailVerification(user); // Отправить письмо для подтверждения
      message.success('Registration successful! Please check your email to verify your account.');
      console.log('Verification email sent to:', user.email);
      onClose(); // Закрыть модальное окно
    } catch (error) {
      console.error('Error creating user:', error);
      message.error('Error creating user: ' + error);
    } finally {
      setIsLoading(false); // Скрыть индикатор загрузки
    }
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('User signed up with Google:', user);
      message.success('Signed up successfully with Google!');
      onClose();
    } catch (error) {
      console.error('Error signing up with Google:', error);
      message.error('Error signing up with Google: ' + error);
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
        name="signUpForm"
        initialValues={{ remember: true }}
        onFinish={handleEmailSignUp}
        autoComplete="off"
        className={style.form}
      >
        <Form.Item
          name="email"
          rules={[{ required: true, message: 'Please input your email!' }]}
          className={style.formItem}
        >
          <Input placeholder="Email" className={style.input} />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
          className={style.formItem}
        >
          <Input.Password placeholder="Password" className={style.input} />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords do not match!'));
              },
            }),
          ]}
          className={style.formItem}
        >
          <Input.Password placeholder="Confirm Password" className={style.input} />
        </Form.Item>
        <Form.Item className={style.formItem}>
          <Button
            type="primary"
            htmlType="submit"
            className={style.submitButton}
            block
            loading={isLoading} // Показать индикатор загрузки на кнопке
          >
            Sign Up
          </Button>
        </Form.Item>
      </Form>
      <div className={style.orDivider}>
        <div className={style.line}></div>
        <span className={style.orText}>OR</span>
        <div className={style.line}></div>
      </div>
      <div className={style.googleLogin}>
        <Button 
          type="link" 
          icon={<GoogleOutlined />} 
          className={style.googleButton}
          onClick={handleGoogleSignUp}
        >
          Sign up with Google
        </Button>
      </div>
    </Modal>
  );
};

export default SignUp;
