import React, { useState, useEffect, use } from 'react';
import { Form, Input, Button, notification, Modal, Popconfirm, Popover } from 'antd';
import { FileAddOutlined, DeleteOutlined, EditOutlined, LinkOutlined, QrcodeOutlined, SkinOutlined } from '@ant-design/icons';
import { getFirestore, collection, addDoc, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './style.module.css';

interface Establishment {
  id?: string;
  info: {
    name: string;
    wifiname?: string;
    wifipass?: string;
    address?: string;
    logoUrl?: string;
    bannerUrls?: string[];
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
  const [isStylesModalVisible, setIsStylesModalVisible] = useState(false);
  const [isQrLinkModalVisible, setIsQrLinkModalVisible] = useState(false);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [bannerFiles, setBannerFiles] = useState<File[]>([]);
  const router = useRouter();

  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchEstablishments = async () => {
      const userId = user?.uid; 
      if (userId) {
        const q = query(collection(db, 'users', userId, 'establishments'), where('uid', '==', userId));
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
        // notification.error({
        //   message: 'Error',
        //   description: 'User is not authenticated.',
        // });
      }
    };
    fetchEstablishments();
  }, [user]);

  const handleAddEstablishment = async (values: any) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const bannerUrls: string[] = [];
        const uploadPromises = bannerFiles.map(async (file) => {
          const storageRef = ref(storage, `banners/${user.uid}/${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          const url = await getDownloadURL(snapshot.ref);
          bannerUrls.push(url);
        });

        await Promise.all(uploadPromises);

        const establishmentData: Establishment = {
          info: {
            name: values.name,
            wifiname: values.wifiname || '',
            wifipass: values.wifipass || '',
            address: values.address || '',
            logoUrl: values.logoUrl || null,
            bannerUrls: bannerUrls,
            currency: values.currency || '',
          },
          menu: {
            categories: [],
            items: [],
          },
          uid: user.uid,
        };
        const docRef = await addDoc(collection(db, 'users', user.uid, 'establishments'), establishmentData);
        notification.success({
          message: 'Establishment Added',
        });
        form.resetFields();
        setBannerFiles([]);
        handleModalClose();
        router.push(`/profile/establishments/${docRef.id}`); // Redirect to the newly created establishment
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
    setIsQrLinkModalVisible(false)
    setIsStylesModalVisible(false);

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

  const handleStylesModalOpen = () => {
    setIsQrLinkModalVisible(false)
    setIsStylesModalVisible(true);
  };

  const handleStylesModalClose = () => {
    setIsStylesModalVisible(false);
  };

  const handleQrLinkModalOpen = () => {
    setIsStylesModalVisible(false);
    setIsQrLinkModalVisible(true);
  };

  const handleQrLinkModalClose = () => {
    setIsQrLinkModalVisible(false);
  };

  const handleBannerChange = (info: any) => {
    if (info.fileList) {
      setBannerFiles(info.fileList.map((file: any) => file.originFileObj));
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.items}>
        {establishments.map((establishment) => (
          <div className={styles.establishmentContainer} key={establishment.id}>
            <Link className={styles.link} href={`/profile/establishments/${establishment.id}`}>
              <Button className={styles.establishmentButton}>
                <span>
                  <Image
                    src={establishment.info.logoUrl || './MBQR Label-03.png'}
                    alt="Establishment Logo"
                    className={styles.logoImage}
                    width={100}
                    height={100}
                    objectFit="contain"
                  />
                </span>
              </Button>
            </Link>

            {/* Popover for Styles, QR or Link, and Delete */}
            <Popover
              content={
                <div>
                  <Button className={styles.editButtons}  onClick={handleStylesModalOpen}>
                    Menu Styles
                  </Button>
                  <Button className={styles.editButtons} icon={<QrcodeOutlined />} onClick={handleQrLinkModalOpen}>
                    QR or Link
                  </Button>
                  <Popconfirm
                    title="Are you sure you want to delete this establishment?"
                    onConfirm={() => handleDeleteEstablishment(establishment.id!)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button className={styles.editButtons} danger icon={<DeleteOutlined />}>
                      Delete
                    </Button>
                  </Popconfirm>
                </div>
              }
              trigger="click"
            >
              <Button
                type="link"
                icon={<EditOutlined />}
                className={styles.editButton}
              />
            </Popover>
          </div>
        ))}

        <Button className={styles.addEstablishments} onClick={handleModalOpen}>
          <div className={styles.content}>
            <FileAddOutlined className={styles.icons} />
            <p>Add Establishment</p>
          </div>
        </Button>
      </div>

      {/* Modal for adding establishment */}
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

      {/* Modal for Styles */}
      <Modal
        title="Edit Styles"
        open={isStylesModalVisible}
        onCancel={handleStylesModalClose}
        footer={null}
      >
        {/* Styles form content */}
        <p>Styles modal content goes here...</p>
      </Modal>

      {/* Modal for QR or Link */}
      <Modal
        title="QR or Link"
        open={isQrLinkModalVisible}
        onCancel={handleQrLinkModalClose}
        footer={null}
      >
        {/* QR or Link form content */}
        <p>QR or Link modal content goes here...</p>
      </Modal>
    </div>
  );
};

export default Establishments;
