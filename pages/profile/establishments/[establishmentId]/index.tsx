// pages/profile/establishments/[establishmentId].tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../../../firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';
import HomeMenu from "@/app/pages/HomeMenu/HomeMenu";
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';

interface EstablishmentData {
  id: string;
  name: string;
}

interface EstablishmentDetailsProps {
  establishmentData: EstablishmentData;
}

const EstablishmentDetails: React.FC<EstablishmentDetailsProps> = ({ establishmentData }) => {
  const router = useRouter();
  const { establishmentId } = router.query; 
  const [loading, setLoading] = useState<boolean>(true); 
  const [user, setUser] = useState<any>(null); 
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

    return () => unsubscribe(); 
  }, [router]);

  useEffect(() => {
    if(user){
      getStaticPaths(user.uid)
    }
    if (!establishmentId) return;
    setLoading(false); 
  }, [establishmentId, user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <HomeMenu />
    </div>
  );
};

async function getStaticPaths(userId: string) {
  if(userId){
    const paths = await fetchEstablishmentIds(userId); 
  console.log(paths)
    return {
    paths: paths.map(id => ({ params: { establishmentId: id } })),
    fallback: 'blocking', 
  };
  }
}

async function fetchEstablishmentIds(userId: string) {
  const db = getFirestore();
  let ids: string[] = []; 
  if (userId) {
    const q = query(collection(db, 'users', userId, 'establishments'), where('uid', '==', userId));
    try {
      const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
        ids.push(doc.id); 
      });
    } catch (error) {
      console.error('Error fetching establishment IDs:', error); 
    }
  }

  return ids; 
}

export default EstablishmentDetails;
