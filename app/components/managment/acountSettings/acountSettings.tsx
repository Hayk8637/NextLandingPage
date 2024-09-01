import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Col, Row, Typography, notification } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { getAuth, sendEmailVerification, updatePassword } from 'firebase/auth';
import style from './style.module.css';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

const AccountSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [email, setEmail] = useState('');

  const auth = getAuth();
  const user = auth.currentUser;
  const { t, i18n } = useTranslation("global");

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && i18n.changeLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setEmailVerified(user.emailVerified);
    }
  }, [user]);

  const reloadUser = async () => {
    if (user) {
      await user.reload();
      setEmailVerified(user.emailVerified);
    }
  };

  const handleVerifyEmail = async () => {
    setLoading(true);
    try {
      if (user) {
        await sendEmailVerification(user);
        notification.success({
          message: 'Verification Email Sent',
          description: 'Please check your email for the verification link.',
        });

        setTimeout(async () => {
          await reloadUser();
          if (user && user.emailVerified) {
            notification.success({
              message: 'Email Verified',
              description: 'Your email has been successfully verified.',
            });
          }
        }, 3000);
      }
    } catch (error: any) {
      notification.error({
        message: 'Error Sending Email',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: any) => {
    setLoading(true);
    try {
      if (user) {
        await updatePassword(user, values.newPassword);
        notification.success({
          message: 'Password Updated',
          description: 'Your password has been successfully updated.',
        });

        form.resetFields();
      }
    } catch (error: any) {
      notification.error({
        message: 'Error Updating Password',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.accountSettings}>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <div className={style.left}>
            <h3 className={style.h3}>Данные пользователя</h3>
            <Form layout="vertical">
              <Form.Item label="Почта">
                <Input value={email} disabled />
              </Form.Item>
              <Form.Item>
                {emailVerified ? (
                  <Text type="success">
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    Почта подтверждена
                  </Text>
                ) : (
                  <Button className={style.primaryButton} onClick={handleVerifyEmail} loading={loading}>
                    <ExclamationCircleOutlined style={{ marginRight: 8 }} />
                    Подтвердить почту
                  </Button>
                )}
              </Form.Item>
            </Form>
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div className={style.right}>
            <h3 className={style.h3}>Изменить пароль</h3>
            <Form form={form} onFinish={handleChangePassword} layout="vertical">
              <Form.Item
                label="Новый пароль"
                name="newPassword"
                rules={[{ required: true, message: 'Введите новый пароль' }]}
              >
                <Input.Password placeholder="6+ символов" className={style.input} />
              </Form.Item>
              <Form.Item
                label="Новый пароль повторно"
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Введите пароль повторно' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Пароли не совпадают!'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="6+ символов" className={style.input} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} className={style.changeButton}>
                  Изменить пароль
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AccountSettings;
