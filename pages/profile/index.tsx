import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';

const Profile: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/');
      } else {
        setLoading(false); 
      }
    });

    return () => unsubscribe(); 
  }, [router]);

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <div>
      
    </div>
  );
};

export default Profile;
