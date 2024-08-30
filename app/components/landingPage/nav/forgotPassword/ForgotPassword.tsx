import React, { useState } from 'react';
import { Modal, Input, Button, Form, message } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import Image from 'next/image';
import style from './style.module.css';
import { auth } from '../../../../../firebaseConfig'; 
import { sendPasswordResetEmail } from 'firebase/auth';

interface ForgotPasswordProps {
  isModalVisible: boolean;
  onClose: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ isModalVisible, onClose }) => {
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator

  const handleResetPassword = async (values: any) => {
    const { email } = values;
    setIsLoading(true); // Show loading indicator

    try {
      await sendPasswordResetEmail(auth, email); // Send password reset email
      message.success('Password reset email sent! Please check your inbox.');
      console.log('Password reset email sent to:', email);
      onClose(); // Close the modal
    } catch (error) {
      console.error('Error sending password reset email:', error);
      message.error('Error sending password reset email: ' + error);
    } finally {
      setIsLoading(false); // Hide loading indicator
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
        name="forgotPasswordForm"
        initialValues={{ remember: true }}
        onFinish={handleResetPassword}
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
        <Form.Item className={style.formItem}>
          <Button
            type="primary"
            htmlType="submit"
            className={style.submitButton}
            block
            loading={isLoading} 
          >
            Send Reset Link
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ForgotPassword;
