import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../../firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';
import Establishments from '@/app/pages/Establishments/Establishments';

const Estiblishments: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true); // Loading state to delay render
  const [user, setUser] = useState<any>(null); // User state to store the auth user

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setLoading(false); 
      } else {
        setLoading(false); 
        router.push('/'); 
      }
    });

    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, [router]);

  if (loading) {
    // While Firebase checks auth state, render nothing or a loading spinner
    return null; // Or return a loading indicator like a spinner
  }

  // If user is authenticated, render the Establishments component
  return (
    <div>
      <Establishments />
    </div>
  );
};

export default Estiblishments;
