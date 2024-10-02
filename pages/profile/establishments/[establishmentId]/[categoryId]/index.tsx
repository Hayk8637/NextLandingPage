import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../../../../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import Menu from "@/app/pages/menu/Menu";
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from 'firebase/firestore';

const CategoryItems: React.FC = () => {
  const router = useRouter();
  const { establishmentId, categoryId } = router.query;
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        if (establishmentId && categoryId) {
          setLoading(false);
          getStaticPaths(user.uid);
        }
      } else {
        setLoading(false);
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router, establishmentId, categoryId]);

  useEffect(() => {
    if (establishmentId && categoryId) {
      setLoading(false);
    }
  }, [establishmentId, categoryId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Menu />
    </div>
  );
};

async function getStaticPaths(userId: string) {
  const establishmentIds = await fetchEstablishmentIds(userId);
  const paths: any = [];

  for (const establishmentId of establishmentIds) {
    const categoryIds = await fetchCategoryIds(establishmentId, userId);
    categoryIds.forEach((categoryId: string) => {
      paths.push({ params: { establishmentId, categoryId } });
    });
  }

  return {
    paths,
    fallback: 'blocking',
  };
}

async function fetchEstablishmentIds(userId: string) {
  const db = getFirestore();
  let ids: string[] = [];
  if (userId) {
    const q = query(collection(db, 'users', userId, 'establishments'), where('uid', '==', userId));
    try {
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        ids.push(doc.id);
      });
    } catch (error) {
      console.error('Error fetching establishment IDs:', error);
    }
  }
  return ids;
}

async function fetchCategoryIds(establishmentId: string, userId: string) {
  const ids: string[] = [];
  if (userId && establishmentId) {
    const docRef = doc(db, 'users', userId, 'establishments', establishmentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const categories = data.menu?.categories || {};
      Object.keys(categories).forEach((categoryId) => {
        ids.push(categoryId);
      });
    }
  }
  return ids;
}

export default CategoryItems;
