import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { InfoCircleOutlined, EditOutlined, UploadOutlined, CopyOutlined } from '@ant-design/icons';
import { Button, Modal, Form, Input, Upload, notification, Popover } from 'antd';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import styles from './style.module.css';
import { usePathname } from 'next/dist/client/components/navigation';

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
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [popoverData, setPopoverData] = useState({
    wifiname: '',
    wifipass: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    if (!establishmentId) {
      notification.error({ message: 'Error', description: 'Establishment ID is not set' });
      return;
    }

    const fetchLogo = async () => {
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
          const data = docSnap.data();

          setLogoUrl(data.info?.logoUrl || '/pngwing-1.png');
          setPopoverData({
            wifiname: data.info?.wifiname || '',
            wifipass: data.info?.wifipass || '',
            address: data.info?.address || '',
            phone: data.info?.phone || ''
          });
          form.setFieldsValue({
            wifiname: data.info?.wifiname || '',
            wifipass: data.info?.wifipass || '',
            address: data.info?.address || '',
            currency: data.info?.currency || '',
            phone: data.info?.phone || ''
          });
        } else {
          notification.error({ message: 'Error', description: 'Document does not exist' });
        }
      } catch (error) {
        notification.error({ message: 'Error', description: 'Failed to fetch logo' });
      }
    };

    fetchLogo();
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
    const storageRef = ref(storage, `${establishmentId}/logo/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
      },
      (error) => {
        notification.error({ message: 'Upload Failed', description: error.message });
        setUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const auth = getAuth();
          const db = getFirestore();
          const user = auth.currentUser;

          if (user) {
            const docRef = doc(db, 'users', user.uid, 'establishments', establishmentId);

            await updateDoc(docRef, {
              'info.logoUrl': downloadURL,
            });

            setLogoUrl(downloadURL);

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
    <div>
      <p><strong>WiFi Name:</strong> {popoverData.wifiname} <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(popoverData.wifiname)}>Copy</Button></p>
      <p><strong>WiFi Password:</strong> {popoverData.wifipass} <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(popoverData.wifipass)}>Copy</Button></p>
      <p><strong>Address:</strong> {popoverData.address} <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(popoverData.address)}>Copy</Button></p>
      <p><strong>Phone:</strong> {popoverData.phone} <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(popoverData.phone)}>Copy</Button></p>
    </div>
  );

  return (
    <>
      <div className={styles.header}>
        <div className={styles.leftRight}>
          <div className={styles.left}>
            <Image
              src={logoUrl || '/pngwing-1.png'}
              alt="logo"
              width={150}
              height={50}
              priority
            />
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
        visible={isModalOpen}
        onCancel={closeModal}
        onOk={form.submit}
        okText="Save"
        confirmLoading={uploading}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item
            label="WiFi Name"
            name="wifiname"
            rules={[{ required: true, message: 'Please enter WiFi name' }]}
          >
            <Input placeholder="Enter WiFi name" />
          </Form.Item>

          <Form.Item
            label="WiFi Password"
            name="wifipass"
            rules={[{ required: true, message: 'Please enter WiFi password' }]}
          >
            <Input placeholder="Enter WiFi password" />
          </Form.Item>

          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: 'Please enter address' }]}
          >
            <Input placeholder="Enter address" />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ required: true, message: 'Please enter phone number' }]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item
            label="Currency"
            name="currency"
          >
            <Input placeholder="Enter currency" />
          </Form.Item>

          <Form.Item label="Upload Logo" name="logo">
            <Upload
              beforeUpload={file => {
                handleLogoUpload(file);
                return false;
              }}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />} loading={uploading}>Upload Logo</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Header;
