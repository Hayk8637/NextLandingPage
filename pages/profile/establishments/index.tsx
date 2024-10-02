import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../../firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';
import Establishments from '@/app/pages/Establishments/Establishments';

const Estiblishments: React.FC = () => {
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
      <Establishments />
    </div>
  );
};

export default Estiblishments;
