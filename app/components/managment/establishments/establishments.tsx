import React, { useState, useEffect } from 'react';
import { Form, Input, Button, notification, Modal, Popconfirm } from 'antd';
import { FileAddOutlined, DeleteOutlined } from '@ant-design/icons';
import { getFirestore, collection, addDoc, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Image from 'next/image';
import styles from './style.module.css';

interface Establishment {
  id?: string;
  info: {
    name: string;
    wifiname?: string;
    wifipass?: string;
    address?: string;
    logoUrl?: string;
    currency?: string;
  };
  menu: {
    categories?: any[];
    items?: any[];
  };
  uid: string;
}

const Establishments: React.FC = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchEstablishments = async () => {
      const user = auth.currentUser;
      if (user) {
        const q = query(collection(db, 'users', user.uid, 'establishments'), where('uid', '==', user.uid));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const items: Establishment[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as Establishment;
            items.push({ ...data, id: doc.id });
          });
          setEstablishments(items);
        });
        return () => unsubscribe();
      } else {
        notification.error({
          message: 'Error',
          description: 'User is not authenticated.',
        });
      }
    };
    fetchEstablishments();
  }, [auth, db]);

  const handleAddEstablishment = async (values: any) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const establishmentData: Establishment = {
          info: {
            name: values.name,
            wifiname: values.wifiname || '',
            wifipass: values.wifipass || '',
            address: values.address || '',
            logoUrl: values.logoUrl || 'default-logo.png',
            currency: values.currency || '',
          },
          menu: {
            categories: [],
            items: [],
          },
          uid: user.uid,
        };

        await addDoc(collection(db, 'users', user.uid, 'establishments'), establishmentData);
        notification.success({
          message: 'Establishment Added',
        });
        form.resetFields();
        handleModalClose();
      } else {
        notification.error({
          message: 'Error',
          description: 'User is not authenticated.',
        });
      }
    } catch (error: any) {
      notification.error({
        message: 'Error Adding Establishment',
        description: error.message || 'An unexpected error occurred.',
      });
    }
  };

  const handleDeleteEstablishment = async (id: string) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid, 'establishments', id);
        await deleteDoc(docRef);
        notification.success({
          message: 'Establishment Deleted',
        });
      } else {
        notification.error({
          message: 'Error',
          description: 'User is not authenticated.',
        });
      }
    } catch (error: any) {
      notification.error({
        message: 'Error Deleting Establishment',
        description: error.message || 'An unexpected error occurred.',
      });
    }
  };

  const handleModalOpen = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <div className={styles.main}>
      <div className={styles.items}>
        {establishments.map((establishment) => (
          <div className={styles.establishmentContainer} key={establishment.id}>
            <Button className={styles.establishmentButton}>
              <span>
                <Image
                  src={establishment.info.logoUrl || '/default-logo.png'}
                  alt="Establishment Logo"
                  className={styles.logoImage}
                  width={100}
                  height={100}
                  objectFit="contain"
                />
              </span>
            </Button>
            <Popconfirm
              title="Are you sure you want to delete this establishment?"
              onConfirm={() => handleDeleteEstablishment(establishment.id!)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                danger
                type="link"
                icon={<DeleteOutlined />}
                className={styles.editButton}
              >
              </Button>
            </Popconfirm>
          </div>
        ))}

        <Button className={styles.addEstablishments} onClick={handleModalOpen}>
          <div className={styles.content}>
            <FileAddOutlined className={styles.icons} />
            <p>Add Establishment</p>
          </div>
        </Button>
      </div>

      <Modal
        title="Add Establishment"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddEstablishment}
        >
          <Form.Item
            label="Establishment Name"
            name="name"
            rules={[{ required: true, message: 'Please input the name of the establishment!' }]}
          >
            <Input placeholder="Enter establishment name" />
          </Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            Add Establishment
          </Button>

          <Button
            style={{ marginTop: '10px', width: '100%' }}
            onClick={handleModalClose}
          >
            Cancel
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default Establishments;
