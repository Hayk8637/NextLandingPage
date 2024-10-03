// pages/index.tsx (or wherever the Settings index file is located)
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../../firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';
import SettingsP from '@/app/pages/Settings/Settings';

const Settings: React.FC = () => {
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
      <SettingsP />
    </div>
  );
};

export default Settings;
