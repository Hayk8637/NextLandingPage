import React from 'react';
import { Modal, Input, Button, Form } from 'antd';
import style from './style.module.css';

interface SignUpProps {
  isModalVisible: boolean;
  onClose: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ isModalVisible, onClose }) => {
  const handleOk = () => {
    onClose();
  };

  return (
    <Modal
      title="Sign Up"
      visible={isModalVisible}
      onOk={handleOk}
      onCancel={onClose}
      footer={null}
    >
      <Form
        name="signUpForm"
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
        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          rules={[{ required: true, message: 'Please confirm your password!' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Sign Up
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SignUp;
