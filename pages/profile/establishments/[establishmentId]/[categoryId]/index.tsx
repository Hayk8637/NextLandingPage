import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../../../../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import Menu from "@/app/pages/menu/Menu";

const CategoryItems: React.FC = () => {
  const router = useRouter();
  const { establishmentId, categoryId } = router.query;
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        if (establishmentId && categoryId) {
          setLoading(false);
        }
      } else {
        setLoading(false);
        router.push('/'); // Redirect to home if user is not authenticated
      }
    });

    return () => unsubscribe();
  }, [router, establishmentId, categoryId]);

  useEffect(() => {
    if (establishmentId && categoryId) {
      setLoading(false); // Set loading to false if IDs are available
    }
  }, [establishmentId, categoryId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Menu />
    </div>
  );
};

export async function getStaticPaths() {
  const establishmentIds = await fetchEstablishmentIds(); // Fetch establishment IDs
  const paths: any = [];

  for (const establishmentId of establishmentIds) {
    const categoryIds = await fetchCategoryIds(establishmentId); // Fetch category IDs for each establishment
    categoryIds.forEach((categoryId: string) => {
      paths.push({ params: { establishmentId, categoryId } }); // Generate paths
    });
  }

  console.log("Generated paths:", paths); // Debugging line

  return {
    paths,
    fallback: 'blocking', // Handle dynamic generation on demand
  };
}

export async function getStaticProps({ params }: { params: { establishmentId: string; categoryId: string } }) {
  console.log("getStaticProps params:", params); // Debugging line

  const establishmentData = await fetchEstablishmentData(params.establishmentId); // Fetch establishment data
  const categoryData = await fetchCategoryData(params.categoryId); // Fetch category data

  if (!establishmentData || !categoryData) {
    return {
      notFound: true, // Trigger a 404 if data is missing
    };
  }

  return {
    props: {
      establishmentData,
      categoryData,
    },
    revalidate: 60, // Set revalidation interval (optional)
  };
}

async function fetchEstablishmentIds() {
  // Replace this with actual logic to fetch establishment IDs
  return ['6DX3a7MtJXeKeuq26N9v', 'anotherId']; // Example IDs
}

async function fetchCategoryIds(establishmentId: string) {
  console.log(`Fetching categories for establishmentId: ${establishmentId}`); // Debugging line

  // Fetch category IDs based on the establishment ID
  if (establishmentId === '6DX3a7MtJXeKeuq26N9v') {
    return ['1727426713022', '1727870416269']; // Example category IDs
  } else {
    return ['anotherCategoryId']; // Logic for other establishments
  }
}

async function fetchEstablishmentData(establishmentId: string) {
  // Simulate fetching establishment data - replace with actual logic
  if (establishmentId) {
    return { id: establishmentId, name: 'Main Establishment' }; // Example establishment data
  } else {
    return null; // Return null if establishment ID is not found
  }
}

async function fetchCategoryData(categoryId: string) {
  // Simulate fetching category data - replace with actual logic
  const categoryMap: any = {
    '1727426713022': { id: '1727426713022', name: 'Appetizers' },
    '1727870416269': { id: '1727870416269', name: 'Beverages' },
  };

  return categoryMap[categoryId] || null; // Return category data or null
}

export default CategoryItems;
