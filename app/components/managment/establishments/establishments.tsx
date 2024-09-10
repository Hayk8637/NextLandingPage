import React, { useState, useEffect } from 'react';
import { Form, Input, Button, notification, Modal, Popconfirm, Upload } from 'antd';
import { FileAddOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { getFirestore, collection, addDoc, query, where, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from 'next/image'; // Make sure to use the Next.js Image component
import styles from './style.module.css';

interface Establishment {
  id?: string;
  name: string;
  logo?: string;
  wifiName?: string;
  wifiPassword?: string;
  address?: string;
  phoneNumber?: string;
  uid: string;
}

const Establishments: React.FC = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editingEstablishment, setEditingEstablishment] = useState<Establishment | null>(null);
  const [file, setFile] = useState<File | null>(null); // State to handle file upload

  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    const fetchEstablishments = async () => {
      const user = auth.currentUser;
      if (user) {
        const q = query(collection(db, 'establishments'), where('uid', '==', user.uid));
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
  }, [auth, db]);

  const handleAddOrEditEstablishment = async (values: any) => {
    try {
      const user = auth.currentUser;
      if (user) {
        let logoUrl = editingEstablishment?.logo || '';

        // If a file is selected, upload it to Firebase Storage
        if (file) {
          const storageRef = ref(storage, `logos/${user.uid}/${file.name}`);
          await uploadBytes(storageRef, file);
          logoUrl = await getDownloadURL(storageRef); // Get the download URL after the upload
        }

        const establishmentData: Partial<Establishment> = {
          ...values,
          uid: user.uid,
          logo: logoUrl, // Save the logo URL
        };

        // Remove undefined fields
        Object.keys(establishmentData).forEach((key) => {
          if (establishmentData[key as keyof Partial<Establishment>] === undefined) {
            delete establishmentData[key as keyof Partial<Establishment>];
          }
        });

        if (isEdit && editingEstablishment?.id) {
          const docRef = doc(db, 'establishments', editingEstablishment.id);
          await updateDoc(docRef, establishmentData);
        } else {
          await addDoc(collection(db, 'establishments'), establishmentData);
        }

        notification.success({
          message: isEdit ? 'Establishment Edited' : 'Establishment Added',
        });
        form.resetFields();
        setFile(null); // Clear file state
        handleModalClose();
      }
    } catch (error: any) {
      notification.error({
        message: 'Error',
        description: error.message || 'An unexpected error occurred.',
      });
    }
  };

  const handleDeleteEstablishment = async (id: string) => {
    try {
      const docRef = doc(db, 'establishments', id);
      await deleteDoc(docRef);
      notification.success({
        message: 'Establishment Deleted',
      });
    } catch (error: any) {
      notification.error({
        message: 'Error Deleting Establishment',
        description: error.message || 'An unexpected error occurred.',
      });
    }
  };

  const handleModalOpen = () => {
    setIsEdit(false);
    setEditingEstablishment(null);
    form.resetFields();
    setFile(null);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleEditClick = (establishment: Establishment) => {
    setIsEdit(true);
    setEditingEstablishment(establishment);
    form.setFieldsValue(establishment);
    setIsModalVisible(true);
  };

  const beforeUpload = (file: File) => {
    setFile(file); // Set the selected file to state
    return false; // Prevent automatic upload
  };

  return (
    <div className={styles.main}>
      <div className={styles.items}>
        {establishments.map((establishment) => (
          <div className={styles.establishmentContainer} key={establishment.id}>
            <Button className={styles.establishmentButton}>
              <span>
                <Image
                  src={establishment.logo || '/default-logo.png'} // Dynamic logo or default image
                  alt="Establishment Logo"
                  className={styles.logoImage}
                  width={100}  // Specify the width of the image
                  height={100} // Specify the height of the image
                  objectFit="contain" // Adjust how the image fits in the given dimensions
                />
              </span>
            </Button>
            <Button
              className={styles.editButton}
              icon={<EditOutlined />}
              onClick={() => handleEditClick(establishment)}
            />
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
        title={isEdit ? 'Edit Establishment' : 'Add Establishment'}
        open={isModalVisible} // Changed visible to open (Ant Design v4+)
        onCancel={handleModalClose}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddOrEditEstablishment}
        >
          <Form.Item
            label="Establishment Name"
            name="name"
            rules={[{ required: true, message: 'Please input the name of the establishment!' }]}
          >
            <Input placeholder="Enter establishment name" />
          </Form.Item>

          <Form.Item
            label="Wi-Fi Name"
            name="wifiName"
          >
            <Input placeholder="Enter Wi-Fi name" />
          </Form.Item>

          <Form.Item
            label="Wi-Fi Password"
            name="wifiPassword"
          >
            <Input placeholder="Enter Wi-Fi password" />
          </Form.Item>

          <Form.Item
            label="Address"
            name="address"
          >
            <Input placeholder="Enter address" />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            name="phoneNumber"
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item label="Logo">
            <Upload
              beforeUpload={beforeUpload}
              showUploadList={true}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>

          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            {isEdit ? 'Save' : 'Add Establishment'}
          </Button>

          <Button
            style={{ marginTop: '10px', width: '100%' }}
            onClick={handleModalClose}
          >
            Cancel
          </Button>

          {isEdit && editingEstablishment && (
            <Popconfirm
              title="Are you sure you want to delete this establishment?"
              onConfirm={() => handleDeleteEstablishment(editingEstablishment.id!)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                danger
                type="primary"
                icon={<DeleteOutlined />}
                style={{ marginTop: '10px', width: '100%' }}
              >
                Delete Establishment
              </Button>
            </Popconfirm>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Establishments;
