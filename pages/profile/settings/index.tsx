// pages/index.tsx (or wherever the Settings index file is located)
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../../firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';
import SettingsP from '@/app/pages/Settings/Settings';

const Settings: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true); 
  const [user, setUser] = useState<any>(null); // User state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // Set user object if authenticated
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
    return (
     null
    );
  }  // If the user is authenticated, render the Settings component
  return (
    <div>
      <SettingsP />
    </div>
  );
};

export default Settings;
