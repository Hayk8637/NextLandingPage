import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../../../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import HomeMenu from '@/app/pages/HomeMenu/HomeMenu';

const EstablishmentDetails: React.FC = () => {
  const router = useRouter();
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
      <HomeMenu />
    </div>
  );
};
export default EstablishmentDetails;
