import React from 'react';
import { Modal, Input, Button, Form } from 'antd';
import style from './style.module.css';

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
      title="Sign In"
      visible={isModalVisible}
      onOk={handleOk}
      onCancel={onClose}
      footer={null}
    >
      <Form
        name="signInForm"
        initialValues={{ remember: true }}
        onFinish={handleOk}
        autoComplete="off"
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Please input your email!' }]}
        >
          <Input type="email" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Sign In
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SignIn;
