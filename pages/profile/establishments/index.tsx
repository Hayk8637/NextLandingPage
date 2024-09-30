// pages/index.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../../firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';
import Establishments from '@/app/pages/Establishments/Establishments';

const Index: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true); 
  const [user, setUser] = useState<any>(null); // User state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log(user)
      if (user) {
        setUser(user); // Set the user object if authenticated
        setLoading(false); // Stop loading
      } else {
        setLoading(false); // Stop loading
        router.push('/'); // Redirect to homepage if not authenticated
      }
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [router]);

  if (loading) {
    // Show loading spinner while checking auth state
    return (null
    );
  }

  // If the user is authenticated, render the Establishments component
  return (
    <div>
      <Establishments />
    </div>
  );
};

export default Index;
