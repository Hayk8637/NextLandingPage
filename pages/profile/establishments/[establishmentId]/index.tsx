// /pages/profile/establishments/[establishmentId].tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import HomeMenu from '@/app/pages/HomeMenu/HomeMenu';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

const EstablishmentDetails: React.FC<{ establishmentId: string; establishmentExists: boolean }> = ({ establishmentId, establishmentExists }) => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/'); // Redirect to home if not authenticated
      } else {
        setUser(user);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Redirect to 404 if the establishment doesn't exist
  useEffect(() => {
    if (user && !establishmentExists) {
      router.push('/404');
    }
  }, [user, establishmentExists, router]);

  return (
    <div>
      <HomeMenu />
      {establishmentExists ? (
        <h1>Establishment ID: {establishmentId}</h1>
      ) : (
        <h1>Establishment Not Found</h1>
      )}
    </div>
  );
};

// Fetch the establishmentId at request time
export const getServerSideProps = async (context: { params: { establishmentId: string } }) => {
  const { establishmentId } = context.params;

  // Check if establishment ID is valid by querying Firestore
  const globalEstablishmentsRef = doc(db, 'paths', 'establishments');
  const globalSnap = await getDoc(globalEstablishmentsRef);
  const establishmentExists = globalSnap.exists() && globalSnap.data().ids.includes(establishmentId);

  return {
    props: {
      establishmentId,
      establishmentExists,
    },
  };
};

export default EstablishmentDetails;
