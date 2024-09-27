import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Upload, Button, message, Popover, Switch } from 'antd';
import { SmallDashOutlined, UploadOutlined } from '@ant-design/icons';
import { doc, updateDoc, getDoc, deleteField, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../../../../firebaseConfig';
import styles from './style.module.css';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Item from 'antd/es/list/Item';
import defimg from './pngwi.png'
interface MenuCategoryItem {
  id: string;
  name: string;
  img: string | null;
  price: number;
  isVisible: boolean;
}

const MenuCategoryItems: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newItem, setNewItem] = useState<Partial<MenuCategoryItem> & { img?: string | null }>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentEditingId, setCurrentEditingId] = useState<string | null>(null);
  
  const pathname = usePathname() || '';
  const establishmentId = pathname.split('/')[pathname.split('/').length - 2];
  const categoryId = pathname.split('/')[pathname.split('/').length - 1];
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchMenuItems = async () => {
      if (userId && establishmentId) {
        try {
          const docRef = doc(db, 'users', userId, 'establishments', establishmentId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            const menuItems = data.menu?.items ;
            const a = menuItems[categoryId];
            const items: MenuCategoryItem[] = Object.entries(a).map(([id , menuItem]: any) => ({
              id,
              name: menuItem.name,
              img: menuItem.img,
              price: menuItem.price,
              isVisible: menuItem.isVisible ?? true,
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
  }, [userId, establishmentId, categoryId]);

  const handleNewItemSubmit = async () => {
    if (!newItem.name || !newItem.price ) {
      message.error('Please fill all fields');
      return;
    }
    if (!userId || !establishmentId) {
      message.error('Missing user or establishment information');
      return;
    }
    setUploading(true);

    try {
      let imageUrl = null;
      if (imageFile) {
        const imgId = Date.now().toString();
        const storageRef = ref(storage, `establishments/${establishmentId}/items/${imgId}`);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);
        await uploadTask; // Wait for the upload to complete
        imageUrl = await getDownloadURL(storageRef); // Get the download URL
      }
      if(imageUrl == ""){
        imageUrl = './pngwing 1.png'
      }
      const uniqueId = Date.now().toString();
      const docRef = doc(db, 'users' , userId , 'establishments', establishmentId);
      await updateDoc(docRef, {
        [`menu.items.${categoryId}.${uniqueId}`]: {
        name: newItem.name,
        price: newItem.price,
        img: imageUrl,
        isVisible: true}
      });
      message.success('New item added successfully');
      setModalVisible(false);
      setNewItem({});
      setImageFile(null);
    } catch (error) {
      message.error('Failed to add new item');
    } finally {
      setUploading(false);
    }
  };

  const handleEditItemSubmit = async () => {
    if (!currentEditingId || !newItem.name || !newItem.price || !userId || !establishmentId) {
      message.error('Please fill all fields');
      return;
    }
    
    setUploading(true);

    try {
      const updatedData: Partial<MenuCategoryItem> = {
        name: newItem.name,
        price: newItem.price,
      };
      let imageUrl = '';
      if (imageFile) {
        const imgId = Date.now().toString();
        const storageRef = ref(storage, `establishments/${establishmentId}/items/${imgId}`);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);
        await uploadTask;
        imageUrl = await getDownloadURL(storageRef);
        if(imageUrl == ""){
          imageUrl = './pngwing 1.png'
        }
      }
      const docRef = doc(db, 'users', userId, 'establishments', establishmentId);
      await updateDoc(docRef, {
        [`menu.items.${categoryId}.${currentEditingId}`]: {
        name: newItem.name,
        price: newItem.price,
        img: imageUrl,
        isVisible: true}
      });      
      message.success('Item updated successfully');
      setEditModalVisible(false);
      setCurrentEditingId(null);
      setNewItem({});
      setImageFile(null);
    } catch (error) {
      message.error('Failed to update item');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleVisibility = async (id: string, isVisible: boolean) => {
    try {
      const docRef = doc(db, 'establishments', establishmentId, 'categories', categoryId, 'menuItems', id);
      await updateDoc(docRef, { isVisible });
      message.success(`Item visibility updated to ${isVisible ? 'visible' : 'hidden'}`);
    } catch (error) {
      message.error('Failed to update item visibility');
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this item?');
    if (!confirm || !userId || !establishmentId || !categoryId) return;

    try {
      const docRef = doc(db,'users', userId , 'establishments', establishmentId);
      await updateDoc(docRef, {
        [`menu.items.${categoryId}.${id}`]: deleteField(),
      });
      setMenuItems((prev) => prev.filter(item => item.id !== id)); // Remove the item from state
      message.success('Item deleted successfully');
    } catch (error) {
      message.error('Failed to delete item');
    }
  };
  const popoverContent = (item: MenuCategoryItem) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Button 
        onClick={(e) => { 
          e.stopPropagation(); 
          setCurrentEditingId(item.id); 
          setNewItem({
            name: item.name,
            price: item.price,
            img: item.img
          }); // Set the item data to the state
          setEditModalVisible(true); 
        }} 
        style={{ marginBottom: 8 }}>
        Edit
      </Button>
      <div style={{ marginBottom: 8 }}>
        <span>Visibility:</span>
        <Switch 
          checked={item.isVisible} 
          onChange={(checked) => handleToggleVisibility(item.id, checked)} 
        />
      </div>
      <Button 
        onClick={(e) => { 
          e.stopPropagation(); 
          handleDelete(item.id); 
        }}>
        Delete
      </Button>
    </div>
  );
  
  return (
    <div className={styles.menuCategoryItems}>
      <div className={styles.menuCategoryItemsList}>
        {menuItems.length > 0 ? (
            menuItems.map((item) => (
              <div key={item.id} className={styles.menuCategoryItem}>
                <div className={styles.menuCategoryItemCart}>
                  <div className={styles.up}>
                    {/* <a href={`/MENUBYQR/menu/salad/${item.id}`}> */}
                      <div className={styles.itemImg}>
                        <Image
                          src={item.img || defimg}
                          alt={item.name}
                          width={150}
                          height={150}
                        />
                      </div>
                      <div className={styles.itemName}>
                        <span>{item.name}</span>
                      </div>
                      <div className={styles.itemPrice}>
                        <span>{item.price}</span>
                      </div>
                    {/* </a> */}
                  </div>
                  <Popover
                    content={popoverContent(item)}
                    trigger="hover"
                    placement="topRight"
                  >
                    <button className={styles.functions} onClick={(e) => e.stopPropagation()}>
                      <SmallDashOutlined />
                    </button>
                  </Popover>
                </div>
              </div>
            ))
          ) : null}
      </div>
      <Button type="primary" onClick={() => setModalVisible(true)}>
        Create New Item
      </Button>

      <Modal
        title="Create New Item"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleNewItemSubmit}
        confirmLoading={uploading}
      >
        <Input
          placeholder="Item Name"
          value={newItem.name || ''}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          style={{ marginBottom: '10px' }}
        />
        <Input
          type="number"
          placeholder="Price"
          value={newItem.price || ''}
          onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
          style={{ marginBottom: '10px' }}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          style={{ marginBottom: '10px' }}
        />
      </Modal>

      <Modal
        title="Edit Item"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditItemSubmit}
        confirmLoading={uploading}
      >
        <Input
          placeholder="Item Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          style={{ marginBottom: '10px' }}
        />
        <Input
          type="number"
          placeholder="Price"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
          style={{ marginBottom: '10px' }}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          style={{ marginBottom: '10px' }}
        />
      </Modal>
    </div>
  );
};

export default MenuCategoryItems;
