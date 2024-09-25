import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from './style.module.css'; // Assuming you're using CSS Modules

interface MenuCategoryItem {
  id: number;
  name: string;
  img: string;
  price: number;
  currency: string;
  category: string;
}

const MenuCategoryItems: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { category } = router.query; 

  useEffect(() => {
    if (!category) return; // Wait until the category is available from the router

    const url = `https://menubyqr-default-rtdb.firebaseio.com/MENUBYQR/${category}.json`;

    axios
      .get(url)
      .then((response) => {
        const data = response.data;

        const isValidItem = (item: any) => item?.name && item?.price && item?.currency && item?.img;

        const parsedItems = Array.isArray(data)
          ? data
              .map((item: any, index: number) => ({
                id: index,
                name: item?.name || '',
                price: item?.price || 0,
                currency: item?.currency || '$',
                img: item?.img || '',
                category: category as string,
              }))
              .filter(isValidItem)
          : Object.keys(data)
              .map((key: string, index: number) => ({
                id: index,
                name: data[key]?.name || '',
                price: data[key]?.price || 0,
                currency: data[key]?.currency || '$',
                img: data[key]?.img || '',
                category: category as string,
              }))
              .filter(isValidItem);

        setMenuItems(parsedItems);
        setLoading(false);
      })
      .catch((error) => {
        setError('Failed to fetch menu items');
        setLoading(false);
      });
  }, [category]);


  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ marginTop: '200px' }}>Error: {error}</div>;

  return (
    <div className={styles.menuCategoryItems}>
      <div className={styles.menuCategoryItemsList}>
        {menuItems.length > 0 ? (
          menuItems.map((item) => (
            <div key={item.id} className={styles.menuCategoryItem}>
              <div className={styles.menuCategoryItemCart}>
                <div className={styles.up}>
                  <a href={`/MENUBYQR/menu/${category}/${item.id}`}>
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
    </div>
  );
};

export default MenuCategoryItems;
