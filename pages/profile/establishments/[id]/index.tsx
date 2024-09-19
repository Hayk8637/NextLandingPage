// import { useRouter } from 'next/router';
// import React, { useEffect, useState } from 'react';
// import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth';
// import { Form, Input, Button, notification, Upload } from 'antd';
// import Image from 'next/image';
// import { UploadOutlined } from '@ant-design/icons';
// import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';


// interface Establishment {
//   id?: string;
//   info: {
//     name: string;
//     wifiname?: string;
//     wifipass?: string;
//     address?: string;
//     logoUrl?: string;
//     bannerUrls?: string[];
//     currency?: string;
//   };
//   menu: {
//     categories?: any[];
//     items?: any[];
//   };
//   uid: string;
// }

// const EstablishmentDetails: React.FC = () => {
//   const router = useRouter();
//   const { id } = router.query;
//   const [establishment, setEstablishment] = useState<Establishment | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [uploading, setUploading] = useState<boolean>(false);
//   const [form] = Form.useForm();

//   useEffect(() => {
//     const fetchEstablishment = async () => {
//       if (!id) return; // Ensure 'id' exists before fetching
      
//       try {
//         const auth = getAuth();
//         const db = getFirestore();
//         const user = auth.currentUser;

//         if (user) {
//           const docRef = doc(db, 'users', user.uid, 'establishments', id as string);
//           const docSnap = await getDoc(docRef);

//           if (docSnap.exists()) {
//             const establishmentData = docSnap.data() as Establishment;
//             setEstablishment({ ...establishmentData, id: docSnap.id });
//             form.setFieldsValue(establishmentData.info); // Set form values for editing
//           } else {
//             setError('Establishment not found');
//           }
//         } else {
//           setError('User is not authenticated');
//         }
//       } catch (err) {
//         setError('An error occurred while fetching the establishment');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEstablishment();
//   }, [id, form]);

//   const handleUpdateEstablishment = async (values: any) => {
//     try {
//       const auth = getAuth();
//       const db = getFirestore();
//       const user = auth.currentUser;

//       if (user && establishment) {
//         const docRef = doc(db, 'users', user.uid, 'establishments', establishment.id as string);

//         // Update Firestore with new values
//         await updateDoc(docRef, {
//           'info.name': values.name,
//           'info.wifiname': values.wifiname,
//           'info.wifipass': values.wifipass,
//           'info.address': values.address,
//           'info.currency': values.currency,
//         });

//         notification.success({
//           message: 'Establishment Updated',
//           description: 'Your establishment details have been successfully updated.',
//         });

//         router.push(`/profile/establishments/${establishment.id}`);
//       }
//     } catch (err: any) {
//       notification.error({
//         message: 'Error Updating Establishment',
//         description: err.message || 'An error occurred while updating the establishment.',
//       });
//     }
//   };

//   const handleUploadLogo = async (file: File) => {
//     if (!file) return;

//     setUploading(true);
//     const storage = getStorage();
//     const storageRef = ref(storage, `logos/${id}/${file.name}`);

//     const uploadTask = uploadBytesResumable(storageRef, file);

//     uploadTask.on(
//       'state_changed',
//       () => {}, // Handle progress (optional)
//       (error) => {
//         notification.error({
//           message: 'Upload Failed',
//           description: error.message,
//         });
//         setUploading(false);
//       },
//       async () => {
//         const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
//         const auth = getAuth();
//         const db = getFirestore();
//         const user = auth.currentUser;

//         if (user && establishment) {
//           const docRef = doc(db, 'users', user.uid, 'establishments', establishment.id as string);

//           // Update Firestore with the new logo URL
//           await updateDoc(docRef, {
//             'info.logoUrl': downloadURL,
//           });

//           setEstablishment((prev) =>
//             prev ? { ...prev, info: { ...prev.info, logoUrl: downloadURL } } : prev
//           );

//           notification.success({
//             message: 'Logo Uploaded',
//             description: 'Your logo has been successfully uploaded.',
//           });

//           setUploading(false);
//         }
//       }
//     );
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <div>
//       {establishment ? (
//         <div>
//           <h1>Edit Establishment</h1>

//           <Form
//             form={form}
//             layout="vertical"
//             onFinish={handleUpdateEstablishment}
//             initialValues={establishment.info}
//           >
//             <Form.Item
//               label="Establishment Name"
//               name="name"
//               rules={[{ required: true, message: 'Please input the name of the establishment!' }]}
//             >
//               <Input placeholder="Enter establishment name" />
//             </Form.Item>

//             <Form.Item label="Address" name="address">
//               <Input placeholder="Enter establishment address" />
//             </Form.Item>

//             <Form.Item label="WiFi Name" name="wifiname">
//               <Input placeholder="Enter WiFi name" />
//             </Form.Item>

//             <Form.Item label="WiFi Password" name="wifipass">
//               <Input placeholder="Enter WiFi password" />
//             </Form.Item>

//             <Form.Item label="Currency" name="currency">
//               <Input placeholder="Enter currency" />
//             </Form.Item>

//             <Button type="primary" htmlType="submit" style={{ marginTop: '10px' }}>
//               Update Establishment
//             </Button>
//           </Form>

//           <div style={{ marginTop: '20px' }}>
//             <Upload
//               customRequest={({ file }) => handleUploadLogo(file as File)}
//               showUploadList={false}
//               accept="image/*"
//             >
//               <Button icon={<UploadOutlined />} loading={uploading}>
//                 Upload Logo
//               </Button>
//             </Upload>
//           </div>

//           {establishment.info.logoUrl && (
//             <div style={{ width: '100px', height: '100px', position: 'relative', marginTop: '20px' }}>
//               <Image src={establishment.info.logoUrl} alt="Logo" layout="fill" objectFit="contain" />
//             </div>
//           )}

//           {establishment.info.bannerUrls && (
//             <div>
//               {establishment.info.bannerUrls.map((url, index) => (
//                 <div key={index} style={{ width: '600px', height: '200px', margin: '10px 0', position: 'relative' }}>
//                   <Image src={url} alt={`Banner ${index}`} layout="fill" objectFit="cover" />
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       ) : (
//         <div>No establishment details available</div>
//       )}
//     </div>
//   );
// };

// export default EstablishmentDetails;



import HomeMenu from "@/app/pages/HomeMenu/HomeMenu"

const EstablishmentDetails: React.FC = () => {
  return <>
    <HomeMenu />
  </>
}
export default EstablishmentDetails