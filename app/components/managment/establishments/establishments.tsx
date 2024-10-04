import React, { useState, useEffect } from 'react';
import { Form, Input, Button, notification, Modal, Popconfirm, Popover, QRCode } from 'antd';
import { FileAddOutlined, DeleteOutlined, EditOutlined, QrcodeOutlined } from '@ant-design/icons';
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
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<string | null>(null);
  const router = useRouter();
  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
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
        }
      };
      fetchEstablishments();
    }
  }, [user, db]);

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
        notification.success({ message: 'Establishment Added' });
        form.resetFields();
        setBannerFiles([]);
        handleModalClose();
        router.push(`/profile/establishments/${docRef.id}`);
      }
    } catch (error) {
      console.error('Error adding establishment:', error);
    }
  };

  const handleCopyLink = () => {
    const linkToCopy = `https://menu.menubyqr.com/${user?.uid}/${selectedEstablishmentId}`;
    navigator.clipboard.writeText(linkToCopy)
      .then(() => {
        notification.success({ message: 'Link copied to clipboard!' });
      })
      .catch((error) => {
        console.error('Failed to copy the link: ', error);
        notification.error({ message: 'Failed to copy the link', description: error.message });
      });
  };
  const handleDeleteEstablishment = async (id: string) => {
    setIsQrLinkModalVisible(false);
    setIsStylesModalVisible(false);
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, 'users', user.uid, 'establishments', id);
      await deleteDoc(docRef);
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
    setIsQrLinkModalVisible(false);
    setIsStylesModalVisible(true);
  };

  const handleStylesModalClose = () => {
    setIsStylesModalVisible(false);
  };

  const handleQrLinkModalOpen = (id: string) => {
    setIsStylesModalVisible(false);
    setIsQrLinkModalVisible(true);
    setSelectedEstablishmentId(id);
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
                    priority
                    width={100}
                    height={100}
                    style={{ objectFit: 'contain' }}
                  />
                </span>
              </Button>
            </Link>
            <Popover
              content={
                <div>
                  <Button className={styles.editButtons} onClick={handleStylesModalOpen}>
                    Menu Styles
                  </Button>
                  <Button className={styles.editButtons} icon={<QrcodeOutlined />} onClick={() => handleQrLinkModalOpen(establishment.id!)}>
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
              <Button type="link" icon={<EditOutlined />} className={styles.editButton} />
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

      <Modal title="Add Establishment" open={isModalVisible} onCancel={handleModalClose} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleAddEstablishment}>
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

          <Button style={{ marginTop: '10px', width: '100%' }} onClick={handleModalClose}>
            Cancel
          </Button>
        </Form>
      </Modal>

      <Modal title="Edit Styles" open={isStylesModalVisible} onCancel={handleStylesModalClose} footer={null}>
          here i must edit my styles 
      </Modal>

   <Modal title="QR or Link" open={isQrLinkModalVisible} onCancel={handleQrLinkModalClose} footer={null}>
  {selectedEstablishmentId && (
    <div className={styles.qrlink}>
      <div className={styles.qr}>
        <QRCode
          className={styles.qrcode}
          errorLevel="H"
          value={`https://menu.menubyqr.com/${user?.uid}/${selectedEstablishmentId}`}/>
      </div>
      <div className={styles.link}>
        <p>QR Link:</p>
        <Link className={styles.linklink} href={`https://menu.menubyqr.com/${user?.uid}/${selectedEstablishmentId}`}>
          {`https://menu.menubyqr.com/${user?.uid}/${selectedEstablishmentId}`}
        </Link>
        <Button type="primary" className={styles.qrlinkbutton} onClick={handleCopyLink}>
          copy menu link
        </Button>
      </div>
    </div>
  )}
</Modal>

    </div>
  );
};

export default Establishments;
