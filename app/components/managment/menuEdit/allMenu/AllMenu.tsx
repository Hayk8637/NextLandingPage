import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Upload, Button, message, Popover, Switch } from 'antd';
import { SmallDashOutlined, UploadOutlined } from '@ant-design/icons';
import { doc, updateDoc, getDoc, deleteField } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../../../../firebaseConfig';
import style from './style.module.css';
import { usePathname } from 'next/navigation';

interface MenuCategoryItem {
  id: string;
  name: string;
  imgUrl: string | null;
  isVisible: boolean;
}

const AllMenu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState<{ name: string, imgUrl: string | null }>({ name: '', imgUrl: null });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentEditingId, setCurrentEditingId] = useState<string | null>(null);

  const pathname = usePathname() || '';
  const establishmentId = pathname.split('/').filter(Boolean).pop() || '';
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchMenuItems = async () => {
      if (userId && establishmentId) {
        try {
          const docRef = doc(db, 'users', userId, 'establishments', establishmentId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            const categories = data.menu?.categories || {};

            const items: MenuCategoryItem[] = Object.entries(categories).map(([id, category]: any) => ({
              id,
              name: category.name,
              imgUrl: category.imgUrl,
              isVisible: category.isVisible ?? true,
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

  const showEditModal = (item: MenuCategoryItem) => {
    setNewCategory({ name: item.name, imgUrl: item.imgUrl });
    setCurrentEditingId(item.id);
    setIsEditModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setNewCategory({ name: '', imgUrl: null });
    setImageFile(null);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setNewCategory({ name: '', imgUrl: null });
    setCurrentEditingId(null);
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

      const uniqueId = Date.now().toString();
      const docRef = doc(db, 'users', userId, 'establishments', establishmentId);
      await updateDoc(docRef, {
        [`menu.categories.${uniqueId}`]: {
          name: newCategory.name,
          imgUrl: imgUrl || null,
          isVisible: true,
        },
      });

      setMenuItems((prev) => [...prev, { id: uniqueId, name: newCategory.name, imgUrl, isVisible: true }]);
      message.success('Category created successfully');
      handleCancel();
    } catch (error) {
      message.error(`Error creating category: ${error}`);
    } finally {
      setUploading(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!newCategory.name) {
      message.error('Category name is required');
      return;
    }

    if (!userId || !establishmentId || !currentEditingId) {
      message.error('Missing user or establishment information');
      return;
    }

    setUploading(true);
    try {
      const docRef = doc(db, 'users', userId, 'establishments', establishmentId);
      await updateDoc(docRef, {
        [`menu.categories.${currentEditingId}`]: {
          name: newCategory.name,
          imgUrl: newCategory.imgUrl,
          isVisible: true,
        },
      });

      const updatedItems = menuItems.map(item => 
        item.id === currentEditingId ? { ...item, name: newCategory.name, imgUrl: newCategory.imgUrl } : item
      );
      setMenuItems(updatedItems);
      message.success('Category updated successfully');
      handleEditCancel();
    } catch (error) {
      message.error(`Error updating category: ${error}`);
    } finally {
      setUploading(false);
    }
  };

  const handleToggleVisibility = async (id: string, isVisible: boolean) => {
    if (userId && establishmentId) {
      try {
        const updatedItems = menuItems.map(item => 
          item.id === id ? { ...item, isVisible } : item
        );
        setMenuItems(updatedItems);

        const categoryRef = doc(db, 'users', userId, 'establishments', establishmentId);
        await updateDoc(categoryRef, {
          [`menu.categories.${id}.isVisible`]: isVisible,
        });
        message.info(`Visibility toggled for category ${id} to ${isVisible ? 'ON' : 'OFF'}`);
      } catch (error) {
        message.error(`Error toggling visibility: ${error}`);
      }
    } else {
      message.error('User ID or establishment ID is missing');
    }
  };

  const handleDelete = async (id: string) => {
    if (userId && establishmentId) {
      try {
        const updatedItems = menuItems.filter(item => item.id !== id);
        setMenuItems(updatedItems);

        const categoryRef = doc(db, 'users', userId, 'establishments', establishmentId);
        await updateDoc(categoryRef, {
          [`menu.categories.${id}`]: deleteField(),
        });

        message.success(`Category ${id} deleted successfully`);
      } catch (error) {
        message.error(`Error deleting category: ${error}`);
      }
    } else {
      message.error('User ID or establishment ID is missing');
    }
  };

  const popoverContent = (item: MenuCategoryItem) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Button onClick={(e) => { e.stopPropagation(); showEditModal(item); }} style={{ marginBottom: 8 }}>Edit</Button>
      <div style={{ marginBottom: 8 }}>
        <span>Visibility:</span>
        <Switch checked={item.isVisible} onChange={(checked) => handleToggleVisibility(item.id, checked)} />
      </div>
      <Button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}>Delete</Button>
    </div>
  );

  return (
    <div className={style.allMenu}>
      <div className={style.menuCategories}>
      {menuItems.map(item => (
      <button
        key={item.id}
        className={style.menuCategoryItem}
        style={{ backgroundImage: `url(${item.imgUrl || ''})` }}
        onClick={(e) => {
          // Check if the click event originated from this button
          if (e.currentTarget === e.target) {
            window.location.href = `/MENUBYQR/menu/${item.name}`;
          }
        }}
      >
        <span>{item.name}</span>
        <Popover
          content={popoverContent(item)}
          trigger="hover"
          placement="topRight"
        >
          <button className={style.functions} onClick={(e) => e.stopPropagation()}>
            <SmallDashOutlined />
          </button>
        </Popover>
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
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item label="Category Name" required>
            <Input
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Image Upload">
            <Upload beforeUpload={handleImageUpload} showUploadList={false}>
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" loading={uploading} onClick={handleSubmit}>
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Category"
        visible={isEditModalVisible}
        onCancel={handleEditCancel}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item label="Category Name" required>
            <Input
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Image Upload">
            <Upload beforeUpload={handleImageUpload} showUploadList={false}>
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" loading={uploading} onClick={handleEditSubmit}>
              Update
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AllMenu;
