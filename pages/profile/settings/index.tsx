// pages/index.tsx (or wherever the Settings index file is located)
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../../firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';
import Settings from '@/app/pages/Settings/Settings';

const Index: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null); // User state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // Set the user object if authenticated
      } else {
        router.push('/'); // Redirect to homepage if not authenticated
      }
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [router]);


  // If the user is authenticated, render the Settings component
  return (
    <div>
      <Settings />
    </div>
  );
};

export default Index;
