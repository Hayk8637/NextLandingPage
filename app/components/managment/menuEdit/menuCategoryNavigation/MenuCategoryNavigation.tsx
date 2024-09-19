import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './style.module.css'; // Update the path if needed

interface Categories {
  id: number;
  name: string;
}

const MenuCategoryNavigation: React.FC = () => {
  const [categories, setCategories] = useState<Categories[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    axios
      .get('https://menubyqr-default-rtdb.firebaseio.com/MENUBYQR/category.json')
      .then((response) => {
        const data = response.data;
        const parsedCategories = Object.keys(data).map((key, index) => ({
          id: index,
          name: data[key].name,
        }));
        setCategories(parsedCategories);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const currentPath = router.asPath; // Get current path using useRouter
  const currentCategoryName = currentPath.split('/').pop() || '';

  return (
    <div className={styles.menuCategoryNavigation}>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/MENUBYQR/menu/${category.name}`}
          passHref
          className={currentCategoryName === category.name ? styles.activeTab : styles.link}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
};

export default MenuCategoryNavigation;
