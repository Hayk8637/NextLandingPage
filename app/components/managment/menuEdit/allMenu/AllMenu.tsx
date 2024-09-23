import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { collection, addDoc, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore'; 
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../../../../firebaseConfig'; 
import style from './style.module.css'
import { usePathname } from 'next/navigation';
import { url } from 'inspector';

interface MenuCategoryItem {
  id: string;
  name: string;
  imgUrl: string | null; 
}

const AllMenu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState<{ name: string, imgUrl: string | null }>({ name: '', imgUrl: null });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const pathname = usePathname() || '';
  const establishmentId = pathname.split('/').filter(Boolean).pop() || '';
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchMenuItems = async () => {
      if (userId && establishmentId) {
        try {
          // Get the specific establishment document
          const docRef = doc(db, 'users', userId, 'establishments', establishmentId);
          const docSnap = await getDoc(docRef);
  
          if (docSnap.exists()) {
            const data = docSnap.data();
            const categories = data.menu?.categories || {}; // Retrieve categories from menu
  
            // Convert the categories object into an array of MenuCategoryItem
            const items: MenuCategoryItem[] = Object.entries(categories).map(([id, category]: any) => ({
              id,
              name: category.name,
              imgUrl: category.imgUrl,
            }));
  
            setMenuItems(items);
          } else {
            setError('No categories found');
          }
        } catch (error) {
          setError('Error fetching menu items');
        } finally {
          setLoading(false);
        }
      }
    };
  
    fetchMenuItems();
  }, [userId, establishmentId]);
  

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setNewCategory({ name: '', imgUrl: null });
    setImageFile(null); 
  };

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    return false;
  };

  const handleSubmit = async () => {
    if (!newCategory.name) {
      message.error('Category name is required');
      return;
    }

    if (!userId || !establishmentId) {
      message.error('Missing user or establishment information');
      return;
    }

    setUploading(true);
    try {
      let imgUrl = '';

      if (imageFile) {
        const uniqueId = Date.now().toString();
        const storageRef = ref(storage, `establishments/${establishmentId}/categories/${uniqueId}`);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            () => {},
            (error) => {
              message.error(`Upload failed: ${error.message}`);
              reject(error);
            },
            async () => {
              imgUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }

      const uniqueId = Date.now().toString(); // Generate a unique ID for the new category
      
      // Update the specific document under 'establishments' with the new category data
      const docRef = doc(db, 'users', userId, 'establishments', establishmentId);
      await updateDoc(docRef, {
        [`menu.categories.${uniqueId}`]: {
          name: newCategory.name,
          imgUrl: imgUrl || null,
        },
      });

      // Update local state
      setMenuItems((prev) => [...prev, { id: uniqueId, name: newCategory.name, imgUrl }]);
      message.success('Category created successfully');
      handleCancel();
    } catch (error) {
      message.error(`Error creating category: ${error}`);
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className={style.allMenu}>
      <div className={style.menuCategories}>
        {menuItems.map(item => (
          <button
            key={item.id}
            className={style.menuCategoryItem}
            style={{ backgroundImage: `url(${item.imgUrl || ''})` }}
            onClick={() => window.location.href = `/MENUBYQR/menu/${item.name}`}
          >
            <span>{item.name}</span>
          </button>
        ))}
        
        <button className={style.menuCategoryItem} onClick={showModal}>
          <span>+</span>
        </button>
      </div>

      <Modal
        title="Create New Category"
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleSubmit}
        confirmLoading={uploading}
      >
        <Form layout="vertical">
          <Form.Item label="Category Name" required>
            <Input
              value={newCategory.name}
              onChange={e => setNewCategory({ name: e.target.value, imgUrl: newCategory.imgUrl })}
              placeholder="Enter category name"
            />
          </Form.Item>
          <Form.Item label="Category Image (Optional)">
            <Upload
              beforeUpload={handleImageUpload}
              accept="image/*"
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
            {imageFile && <span>{imageFile.name}</span>}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AllMenu;
