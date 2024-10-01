// pages/CategoryItems.tsx (or wherever this component is located)
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../../../../firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';
import Menu from "@/app/pages/menu/Menu";

const CategoryItems: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/'); // Redirect to homepage if not authenticated
      } else {
        setLoading(false); // Stop loading if user is authenticated
      }
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [router]);

  if (loading) {
    // Show a spinner while checking auth state
    return (
      null
    );
  }

  // Render the Menu component if the user is authenticated
  return (
    <div>
      <Menu />
    </div>
  );
};

export default CategoryItems;
