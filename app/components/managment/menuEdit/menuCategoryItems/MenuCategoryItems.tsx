import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './style.module.css';
import { usePathname } from 'next/navigation';
import { getDoc, doc, setDoc } from 'firebase/firestore'; // Added setDoc for creating new items
import { db, auth } from '../../../../../firebaseConfig';
import { Modal, Button, Input, message } from 'antd'; // Ant Design components

interface MenuCategoryItem {
  id: string;
  name: string;
  img: string;
  price: number;
  order: number;
  currency: string;
  category: string;
}

const MenuCategoryItems: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newItem, setNewItem] = useState<Partial<MenuCategoryItem>>({});
  const pathname = usePathname() || '';
  const establishmentId = pathname.split('/')[pathname.split('/').length - 2] || '';
  const userId = auth.currentUser?.uid;
  const categoryName = pathname.split('/').pop();

  useEffect(() => {
    const fetchMenuItems = async () => {``
      if (userId && establishmentId) {
        try {
          const menuDocRef = doc(db, 'users', userId, 'establishments', establishmentId, 'menu', 'items');
          const docSnap = await getDoc(menuDocRef);

          if (docSnap.exists()) {
            const data = docSnap.data().items;
            const parsedItems: MenuCategoryItem[] = Object.entries(data || {}).map(([id, item]) => {
              const menuItem = item as Omit<MenuCategoryItem, 'id'>;
              return {
                id,
                ...menuItem,
              };
            }).filter((item) => item.category === categoryName);

            if (parsedItems.length > 0) {
              setMenuItems(parsedItems);
            } else {
              setError(`No items found for category "${categoryName}"`);
            }
          } else {
            setError('Menu document does not exist');
          }
        } catch (error) {
          console.error('Error fetching menu items:', error);
          setError('Error fetching menu items');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchMenuItems();
  }, [userId, establishmentId, categoryName]);

  const handleNewItemSubmit = async () => {
    if (userId && establishmentId && newItem.name && newItem.price && newItem.category) {
      try {
        const newItemId = new Date().toISOString();
        const menuDocRef = doc(db, 'users', userId, 'establishments', establishmentId, 'menu', 'items');
        const menuDocSnap = await getDoc(menuDocRef);

        const existingItems = menuDocSnap.exists() ? menuDocSnap.data().items || {} : {};

        await setDoc(menuDocRef, {
          items: {
            ...existingItems,
            [newItemId]: newItem
          }
        });

        setMenuItems((prev) => [...prev, { id: newItemId, ...newItem } as MenuCategoryItem]);
        setModalVisible(false);
        message.success('New item created successfully!');
      } catch (error) {
        console.error('Error creating new item:', error);
        setError('Error creating new item');
      }
    } else {
      setError('Please fill in all required fields');
      message.error('Please fill in all required fields');
    }
  };


  return (
    <div className={styles.menuCategoryItems}>
      <div className={styles.menuCategoryItemsList}>
        {menuItems.length > 0 ? (
          menuItems.map((item) => (
            <div key={item.id} className={styles.menuCategoryItem}>
              <div className={styles.menuCategoryItemCart}>
                <div className={styles.up}>
                  <a href={`/MENUBYQR/menu/salad/${item.id}`}>
                    <div className={styles.itemImg}>
                      <Image
                        src={item.img}
                        alt={item.name}
                        width={300}
                        height={300}
                        placeholder="blur"
                      />
                    </div>
                    <div className={styles.itemName}>
                      <span>{item.name}</span>
                    </div>
                    <div className={styles.itemPrice}>
                      <span>{item.currency}{item.price}</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div>No items available</div>
        )}
      </div>
      <Button type="primary" onClick={() => setModalVisible(true)}>
        Create New Item
      </Button>

      <Modal
        title="Create New Item"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleNewItemSubmit}
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
        <Input
          placeholder="Currency"
          value={newItem.currency || ''}
          onChange={(e) => setNewItem({ ...newItem, currency: e.target.value })}
          style={{ marginBottom: '10px' }}
        />
        <Input
          placeholder="Image URL"
          value={newItem.img || ''}
          onChange={(e) => setNewItem({ ...newItem, img: e.target.value })}
          style={{ marginBottom: '10px' }}
        />
      </Modal>
    </div>
  );
};

export default MenuCategoryItems;
