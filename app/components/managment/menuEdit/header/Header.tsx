import React, { useState, useEffect, use } from 'react';
import Image from 'next/image';
import { InfoCircleOutlined, EditOutlined, UploadOutlined, CopyOutlined, WifiOutlined, PhoneOutlined, LockOutlined, EnvironmentOutlined, PlusCircleTwoTone, LeftOutlined } from '@ant-design/icons';
import { Button, Modal, Form, Input, Upload, notification, Popover, FloatButton } from 'antd';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import styles from './style.module.css';
import { usePathname } from 'next/navigation';
import { auth } from '@/firebaseConfig';
import defLogo from './MBQR Label-03.png'
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
  const currentPath = usePathname() || '';
  const returnBack = currentPath.split('/').slice(0, currentPath.split('/').length - 2).join('/');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const establishmentId = currentPath.split('/').filter(Boolean).pop() || '';
  const userId = auth.currentUser?.uid;
  const [popoverData, setPopoverData] = useState<FormValues>({
    wifiname: '',
    wifipass: '',
    address: '',
    phone: '',
    currency: '',
  });

  useEffect(() => {
        if (userId && establishmentId) {
          const fetchEstablishmentData = async () => {
            try {

                if (!userId) {
                    notification.error({ message: 'Error', description: 'User is not authenticated' });
                    return;
                }

                const db = getFirestore();
                const docRef = doc(db, 'users', userId, 'establishments', establishmentId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as Establishment;
                    setLogoUrl(data.info?.logoUrl || '/default-logo.png'); // Use a fallback logo here
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
        }
        fetchEstablishmentData();
        };

    }, [establishmentId, form, userId]);

  const openModal = () => {
    
        form.setFieldsValue({
          wifiname: popoverData.wifiname || '',
          wifipass: popoverData.wifipass || '',
          address: popoverData.address || '',
          currency: popoverData.currency || '',
          phone: popoverData.phone || '',
        });
    setIsModalOpen(true)};
  const closeModal = () => {
    setIsModalOpen(false);
    form.resetFields(); // Reset the form fields when closing the modal
  };

  const handleFormSubmit = async (values: FormValues) => {
    if (!establishmentId) {
      notification.error({ message: 'Error', description: 'Establishment ID is not set' });
      return;
    }

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
      'info.logoUrl': logoUrl || null,
    });

    notification.success({ message: 'Success', description: 'Details updated successfully' });
    closeModal();
  };

  const handleLogoUpload = (file: File) => {
    if (!file) {
      notification.error({ message: 'Error', description: 'No file selected for upload' });
      return false; // Prevent the default upload behavior
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
            await deleteObject(oldLogoRef).catch((error) => {
              if (error.code !== 'storage/object-not-found') {
                notification.error({ message: 'Deletion Failed', description: 'Failed to delete old logo.' });
              }
            });
          }

          setLogoUrl(downloadURL);

          const auth = getAuth();
          const user = auth.currentUser;
          const db = getFirestore();
          if (user) {
            const docRef = doc(db, 'users', user.uid, 'establishments', establishmentId);
            await updateDoc(docRef, {
              'info.logoUrl': downloadURL,
            });

            notification.success({ message: 'Logo Uploaded', description: 'Your logo has been successfully uploaded.' });
          }
        } catch (error) {
          notification.error({ message: 'Update Failed', description: 'Failed to update logo URL in Firestore.' });
        } finally {
          setUploading(false);
        }
      }
    );
    return false; // Prevent the default upload behavior
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
        { icon: <PhoneOutlined />, label: 'Phone', value: popoverData.phone },
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
      <FloatButton style={{ top: 30, left: 40 }} icon={<LeftOutlined />} href={returnBack} />
      <div className={styles.header}>
        <div className={styles.leftRight}>
          <div className={styles.left}>
            <div className={styles.logoWrapper}>
            <Image
              src={logoUrl || './MBQR Label-03.png'}
              alt="logo"
              style={{ objectFit: 'contain' }} // Set the style directly
              priority
              fill // This prop enables the fill layout
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

      <Modal title="Edit Establishment Info" open={isModalOpen} onCancel={closeModal} footer={null}>
        <Form form={form} onFinish={handleFormSubmit} layout="vertical">
          <Form.Item label="WiFi Name" name="wifiname" rules={[{ required: true, message: 'Please input WiFi name!' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="WiFi Password" name="wifipass" rules={[{ required: true, message: 'Please input WiFi password!' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Address" name="address" rules={[{ required: true, message: 'Please input address!' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Currency" name="currency" rules={[{ required: true, message: 'Please input currency!' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Phone" name="phone" rules={[{ required: true, message: 'Please input phone number!' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Upload Logo">
            <Upload beforeUpload={handleLogoUpload} showUploadList={false}>
              <Button icon={<UploadOutlined />} loading={uploading}>
                Click to upload
              </Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={uploading}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Header;
