import React, { useState } from 'react';
import { Modal, Input, Button, Form, message } from 'antd';
import { sendSignInLinkToEmail, confirmPasswordReset, isSignInWithEmailLink, getAuth } from 'firebase/auth';
import { auth } from '../../../../../firebaseConfig'; // Ensure the path is correct
import { FirebaseError } from 'firebase/app';
import { useRouter } from 'next/router';

interface SignUpProps {
  isModalVisible: boolean; // Changed from isModalVisible to visible
  onClose: () => void;
}

interface FormValues {
  email: string;
  password?: string;
  confirmPassword?: string;
}

const SignUp: React.FC<SignUpProps> = ({ isModalVisible, onClose }) => {
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleOk = () => {
    onClose();
  };

  const onFinishSignUp = async (values: FormValues) => {
    const { email } = values;

    const actionCodeSettings = {
      url: 'https://your-domain.com/finish-signup', // Replace with your actual URL
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setEmail(email); // Save email for use in password reset
      setIsResettingPassword(true);
      message.success('A confirmation link has been sent to your email! Please check your inbox to set your password.');
    } catch (error) {
      if (error instanceof FirebaseError) {
        const errorCode = error.code;
        const errorMessage = error.message;

        switch (errorCode) {
          case 'auth/invalid-email':
            message.error('Invalid email address. Please enter a valid email.');
            break;
          case 'auth/too-many-requests':
            message.error('Too many requests. Please try again later.');
            break;
          default:
            message.error('Failed to send confirmation link. Please try again.');
            break;
        }
        console.error('Firebase error:', errorMessage);
      } else if (error instanceof Error) {
        message.error('An unexpected error occurred. Please try again.');
        console.error('Unexpected error:', error.message);
      } else {
        message.error('An unexpected error occurred. Please try again.');
        console.error('Unknown error:', error);
      }
    }
  };

  const onFinishResetPassword = async (values: FormValues) => {
    const { password, confirmPassword } = values;

    if (password !== confirmPassword) {
      message.error('Passwords do not match!');
      return;
    }

    const oobCode = router.query.oobCode as string;

    if (!oobCode) {
      message.error('Invalid reset code!');
      return;
    }

    setLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, password as string);
      message.success('Password successfully updated!');
      router.push('/login'); // Redirect to login page after successful password change
    } catch (error) {
      if (error instanceof FirebaseError) {
        const errorCode = error.code;
        const errorMessage = error.message;

        switch (errorCode) {
          case 'auth/expired-action-code':
            message.error('Reset code has expired. Please try again.');
            break;
          case 'auth/invalid-action-code':
            message.error('Invalid reset code.');
            break;
          default:
            message.error('Failed to update password. Please try again.');
            break;
        }
        console.error('Firebase error:', errorMessage);
      } else if (error instanceof Error) {
        message.error('An unexpected error occurred. Please try again.');
        console.error('Unexpected error:', error.message);
      } else {
        message.error('An unexpected error occurred. Please try again.');
        console.error('Unknown error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const isResetPasswordPage = isSignInWithEmailLink(auth, router.asPath);

  return (
    <Modal
      title={isResettingPassword ? 'Set New Password' : 'Sign Up'}
      visible={isModalVisible} // Correct prop for visibility
      onCancel={onClose} // Correct prop for closing
      footer={null}
    >
      <Form
        name={isResettingPassword ? 'resetPasswordForm' : 'signUpForm'}
        initialValues={{ remember: true }}
        onFinish={isResettingPassword ? onFinishResetPassword : onFinishSignUp}
        autoComplete="off"
      >
        {!isResettingPassword ? (
          <>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, type: 'email', message: 'Please enter a valid email address!' }]}
            >
              <Input type="email" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Sign Up
              </Button>
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item
              label="New Password"
              name="password"
              rules={[{ required: true, message: 'Please enter a new password!' }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              rules={[{ required: true, message: 'Please confirm your new password!' }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Set Password
              </Button>
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default SignUp;
