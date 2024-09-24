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
          // Reference to the categories document
          const categoriesDocRef = doc(db, 'users', userId, 'establishments', establishmentId);
          const docSnap = await getDoc(categoriesDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data().menu?.categories;
            const categoriesData = data || [];

            // Extracting categories from the document
            const parsedCategories: Category[] = Object.entries(categoriesData).map(([id, category]) => {
              // Type assertion to MenuCategoryItem
              const categoryItem = category as MenuCategoryItem; 
              return {
                id: id,
                name: categoryItem.name,
              };
            });
            
            if (parsedCategories.length > 0) {
              setCategories(parsedCategories);
            } else {
              setError('No categories found');
            }
          } else {
            setError('Categories document does not exist');
          }
        } catch (error) {
          console.error('Error fetching categories:', error);
          setError('Error fetching categories');
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
          href={`/profile/establishments/${establishmentId}/${category.name}`} 
          passHref
          className={currentCategoryName === category.name ? styles.activeTab : styles.a}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
};

export default MenuCategoryNavigation;
