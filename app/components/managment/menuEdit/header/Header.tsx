import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { InfoCircleOutlined, EditOutlined, UploadOutlined, CopyOutlined, WifiOutlined, PhoneOutlined, LockOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Button, Modal, Form, Input, Upload, notification, Popover } from 'antd';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import styles from './style.module.css';
import { usePathname } from 'next/navigation';

interface FormValues {
  wifiname: string;
  wifipass: string;
  address: string;
  currency: string;
  phone: string;
}

interface Establishment {
  id?: string;
  info: {
    name: string;
    wifiname?: string;
    wifipass?: string;
    address?: string;
    phone?: string;
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

const Header: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const pathname = usePathname() || '';
  const establishmentId = pathname.split('/').filter(Boolean).pop() || '';
  const [popoverData, setPopoverData] = useState<FormValues>({
    wifiname: '',
    wifipass: '',
    address: '',
    phone: '',
    currency: '',
  });

  useEffect(() => {
    if (!establishmentId) {
      notification.error({ message: 'Error', description: 'Establishment ID is not set' });
      return;
    }

    const fetchEstablishmentData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          notification.error({ message: 'Error', description: 'User is not authenticated' });
          return;
        }

        const db = getFirestore();
        const docRef = doc(db, 'users', user.uid, 'establishments', establishmentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Establishment;

          setLogoUrl(data.info?.logoUrl || './MBQR Label-03.png');
          setPopoverData({
            wifiname: data.info?.wifiname || '',
            wifipass: data.info?.wifipass || '',
            address: data.info?.address || '',
            phone: data.info?.phone || '',
            currency: data.info?.currency || '',
          });
          form.setFieldsValue({
            wifiname: data.info?.wifiname || '',
            wifipass: data.info?.wifipass || '',
            address: data.info?.address || '',
            currency: data.info?.currency || '',
            phone: data.info?.phone || '',
          });
        } else {
          notification.error({ message: 'Error', description: 'Document does not exist' });
        }
      } catch (error) {
        notification.error({ message: 'Error', description: 'Failed to fetch establishment data' });
      }
    };

    fetchEstablishmentData();
  }, [establishmentId, form]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleFormSubmit = async (values: FormValues) => {
    if (!establishmentId) {
      notification.error({ message: 'Error', description: 'Establishment ID is not set' });
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        notification.error({ message: 'Error', description: 'User is not authenticated' });
        return;
      }

      const db = getFirestore();
      const docRef = doc(db, 'users', user.uid, 'establishments', establishmentId);

      await updateDoc(docRef, {
        'info.wifiname': values.wifiname,
        'info.wifipass': values.wifipass,
        'info.address': values.address,
        'info.currency': values.currency,
        'info.phone': values.phone,
        'info.logoUrl': logoUrl || '',
      });

      notification.success({ message: 'Success', description: 'Details updated successfully' });
      closeModal();
    } catch (error) {
      notification.error({ message: 'Error', description: 'Failed to update establishment details' });
    }
  };

  const handleLogoUpload = (file: File) => {
    if (!file) {
      notification.error({ message: 'Error', description: 'No file selected for upload' });
      return;
    }

    setUploading(true);

    const storage = getStorage();
    const storageRef = ref(storage, `establishments/${establishmentId}/logo/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {},
      (error) => {
        notification.error({ message: 'Upload Failed', description: error.message });
        setUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          if (logoUrl && logoUrl !== './MBQR Label-03.png') {
            const oldLogoRef = ref(storage, logoUrl);
            try {
              await deleteObject(oldLogoRef);
            } catch (error) {
              if (error === 'storage/object-not-found') {
              } else {
                notification.error({
                  message: 'Deletion Failed',
                  description: 'Failed to delete old logo.',
                });
              }
            }
          }

          setLogoUrl(downloadURL);

          const auth = getAuth();
          const db = getFirestore();
          const user = auth.currentUser;

          if (user) {
            const docRef = doc(db, 'users', user.uid, 'establishments', establishmentId);

            await updateDoc(docRef, {
              'info.logoUrl': downloadURL,
            });

            notification.success({
              message: 'Logo Uploaded',
              description: 'Your logo has been successfully uploaded.',
            });
          }
        } catch (error) {
          notification.error({
            message: 'Update Failed',
            description: 'Failed to update logo URL in Firestore.',
          });
        } finally {
          setUploading(false);
        }
      }
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      notification.success({ message: 'Copied to clipboard', description: text });
    }).catch(() => {
      notification.error({ message: 'Failed to copy', description: 'Unable to copy text' });
    });
  };

  const popoverContent = (
    <div style={{ width: '100%' }}>
      {[
        { icon: <WifiOutlined size={32} />, label: 'WiFi Name', value: popoverData.wifiname },
        { icon: <LockOutlined />, label: 'WiFi Password', value: popoverData.wifipass },
        { icon: <EnvironmentOutlined />, label: 'Address', value: popoverData.address },
        { icon: <PhoneOutlined />, label: 'Phone', value: popoverData.phone }
      ].map(({ icon, label, value }) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p><strong>{icon}: </strong> {value}</p>
          <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(value)}>Copy</Button>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className={styles.header}>
        <div className={styles.leftRight}>
          <div className={styles.left}>
            <div className={styles.logoWrapper}>
              <Image
                src={logoUrl || './MBQR Label-03.png'}
                alt="logo"
                layout="fill"
                objectFit="contain"
                priority
              />
            </div>
          </div>
          <div className={styles.right}>
            <Popover placement="bottomRight" title="Establishment Info" content={popoverContent} arrow>
              <Button type="link" className={styles.info}>
                <InfoCircleOutlined />
              </Button>
            </Popover>
            <Button type="link" className={styles.edit} onClick={openModal}>
              <EditOutlined />
            </Button>
          </div>
        </div>
      </div>

      <Modal
        title="Edit Establishment Details"
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
      >
        <Form form={form} onFinish={handleFormSubmit} layout="vertical" initialValues={popoverData}>
          <Form.Item name="wifiname" label="WiFi Name" rules={[{ required: true, message: 'Please input the WiFi name!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="wifipass" label="WiFi Password" rules={[{ required: true, message: 'Please input the WiFi password!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address" rules={[{ required: true, message: 'Please input the address!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="currency" label="Currency" rules={[{ required: true, message: 'Please select a currency!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true, message: 'Please input the phone number!' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Logo Upload">
            <Upload beforeUpload={handleLogoUpload} showUploadList={false}>
              <Button icon={<UploadOutlined />} loading={uploading}>Upload Logo</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Submit</Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Header;
