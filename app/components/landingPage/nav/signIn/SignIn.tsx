import React from 'react';
import { Modal, Input, Button, Form } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import style from './style.module.css';
import Image from 'next/image';

interface SignInProps {
  isModalVisible: boolean;
  onClose: () => void;
}

const SignIn: React.FC<SignInProps> = ({ isModalVisible, onClose }) => {
  const handleOk = () => {
    // Handle form submission or login here
    onClose();
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
        onFinish={handleOk}
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
        <Button type="link" icon={<GoogleOutlined />} className={style.googleButton}>
          Log in with Google
        </Button>
      </div>
      <div className={style.forgotPassword}>
        <a href="/forgot-password">Forgot password?</a>
      </div>
    </Modal>
  );
};

export default SignIn;
