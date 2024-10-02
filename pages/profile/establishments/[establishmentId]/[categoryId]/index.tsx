import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../../../../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import Menu from "@/app/pages/menu/Menu";

const CategoryItems: React.FC = () => {
  const router = useRouter();
  const { establishmentId, categoryId } = router.query;
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div>
      <Menu />
    </div>
  );
};
export default CategoryItems;
