import React from 'react';
import { Modal, Input, Button, Form } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import Image from 'next/image';
import style from './style.module.css';

interface SignUpProps {
  isModalVisible: boolean;
  onClose: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ isModalVisible, onClose }) => {
  const handleOk = () => {
    // Handle form submission or sign-up here
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
        name="signUpForm"
        initialValues={{ remember: true }}
        onFinish={handleOk}
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
          rules={[{ required: true, message: 'Please confirm your password!' }]}
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
        <Button type="link" icon={<GoogleOutlined />} className={style.googleButton}>
          Sign up with Google
        </Button>
      </div>
    </Modal>
  );
};

export default SignUp;
