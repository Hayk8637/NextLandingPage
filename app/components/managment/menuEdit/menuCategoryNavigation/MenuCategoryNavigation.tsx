import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import Link from 'next/link';
import styles from './style.module.css';
import { auth, db } from '@/firebaseConfig';
import { usePathname } from 'next/navigation';

interface Category {
  id: string; // category ID
  name: string; // category name
}

interface MenuCategoryItem {
  id: string;
  name: string;
  imgUrl: string | null;
  isVisible: boolean;
  order: number;
}

const MenuCategoryNavigation: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname() || '';
  const currentCategoryName = pathname.split('/').filter(Boolean).pop() || '';
  const establishmentId = pathname.split('/')[pathname.split('/').length - 2] || '';
  const userId = auth.currentUser?.uid;
  
  useEffect(() => {
    const fetchCategories = async () => {
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
                order: category.order,
                imgUrl: category.imgUrl,
                isVisible: category.isVisible ?? true,
              }));
  
              // Sort items by order before setting the state
              items.sort((a, b) => a.order - b.order);
              
              setCategories(items);
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

    fetchCategories();
  }, [userId, establishmentId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.menuCategoryNavigation}>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/profile/establishments/${establishmentId}/${category.id}`} 
          passHref
          className={currentCategoryName === category.id ? styles.activeTab : styles.a}>
          {category.name}
        </Link>
      ))}
    </div>
  );
};

export default MenuCategoryNavigation;
