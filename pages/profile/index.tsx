// pages/index.tsx
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
        router.push('/'); // Redirect to homepage if not authenticated
      } else {
        setLoading(false); // If user is authenticated, stop loading
      }
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [router]);


  return (
    <div>
      <h1>Welcome to your profile!</h1>
      {/* Add more profile content here */}
    </div>
  );
};

export default Profile;
