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
    // Set up the Firebase authentication listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If user is authenticated
        setUser(user);
        setLoading(false); // Stop loading
      } else {
        // If user is not authenticated, redirect to the login page (or any desired route)
        setLoading(false); // Stop loading
        router.push('/profile/establishments'); // Ensure this path exists in your app
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
