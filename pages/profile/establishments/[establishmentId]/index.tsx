// pages/profile/establishments/[establishmentId].tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../../../firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';
import HomeMenu from "@/app/pages/HomeMenu/HomeMenu";

// Define the shape of your establishment data
interface EstablishmentData {
  id: string;
  name: string;
}

// Define the props for the component
interface EstablishmentDetailsProps {
  establishmentData: EstablishmentData;
}

const EstablishmentDetails: React.FC<EstablishmentDetailsProps> = ({ establishmentData }) => {
  const router = useRouter();
  const { establishmentId } = router.query; // Get establishmentId from the route
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

  useEffect(() => {
    // Check if the establishmentId is available
    if (!establishmentId) return;
    
    // If you need to fetch additional data based on establishmentId, do it here
    console.log("Establishment ID:", establishmentId);
    setLoading(false); // Set loading to false after fetching data
  }, [establishmentId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <HomeMenu />
    </div>
  );
};

// Fetch the paths for dynamic routes
export async function getStaticPaths() {
  const paths = await fetchEstablishmentIds(); // Assume this function is implemented
  return {
    paths: paths.map(id => ({ params: { establishmentId: id } })),
    fallback: 'blocking', // Use 'blocking' to ensure SSR for not-yet-generated pages
  };
}

// Fetch establishment data for a specific ID
export async function getStaticProps({ params }: { params: { establishmentId: string } }) {
  const establishmentData = await fetchEstablishmentData(params.establishmentId); // Assume this function is implemented
  return {
    props: {
      establishmentData,
    },
  };
}

// Example function to fetch establishment IDs (mock implementation)
async function fetchEstablishmentIds() {
  // Replace with your logic to fetch IDs from your database or API
  return ['6DX3a7MtJXeKeuq26N9v', 'anotherId']; // Example IDs
}

// Example function to fetch establishment details by ID (mock implementation)
async function fetchEstablishmentData(establishmentId: string) {
  // Replace with your logic to fetch establishment data from your database or API
  return { id: establishmentId, name: 'Example Establishment' }; // Example data
}

export default EstablishmentDetails;
