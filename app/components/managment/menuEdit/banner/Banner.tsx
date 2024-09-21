import React, { useEffect, useState } from 'react';
import styles from './style.module.css';
import { Carousel, Button, Modal, Upload, notification } from 'antd';
import { EditOutlined, UploadOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { RcFile } from 'antd/lib/upload/interface';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { usePathname } from 'next/navigation';

interface BannerImage {
  id: string;
  url: string;
}

const contentStyle: React.CSSProperties = {
  height: '184px',
  color: '#fff',
  textAlign: 'center',
  borderRadius: '22px',
};

const Banner: React.FC = () => {
  const [bannerImages, setBannerImages] = useState<BannerImage[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingImage, setEditingImage] = useState<BannerImage | null>(null);
  const [fileList, setFileList] = useState<RcFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const pathname = usePathname() || '';
  const establishmentId = pathname.split('/').filter(Boolean).pop() || '';

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  const showModal = (image: BannerImage | null = null) => {
    setEditingImage(image);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingImage(null);
    setFileList([]);
  };

  useEffect(() => {
    const fetchBanners = async () => {
      if (!userId || !establishmentId) {
        notification.error({ message: 'Error', description: 'User ID or Establishment ID is missing.' });
        return;
      }

      try {
        const docRef = doc(getFirestore(), 'users', userId, 'establishments', establishmentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data?.info?.bannerUrls) {
            const parsedItems = Object.keys(data.info.bannerUrls).map((key) => ({
              id: key,
              url: data.info.bannerUrls[key],
            }));
            setBannerImages(parsedItems);
          }
        } else {
          notification.error({ message: 'Error', description: 'Failed to fetch banners.' });
        }
      } catch (error) {
        notification.error({ message: 'Error', description: `Error fetching banner images: ${error}` });
      }
    };

    fetchBanners();
  }, [userId, establishmentId]);

  const handleUpload = (file: RcFile) => {
    if (!file) {
      notification.error({ message: 'Error', description: 'No file selected for upload' });
      return;
    }

    setUploading(true);
    const storage = getStorage();
    const storageRef = ref(storage, `establishments/${establishmentId}/banners/${file.name}`);
    const metadata = {
      customMetadata: {
        userId: userId || '', 
      },
    };
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Handle upload progress if needed
      },
      (error) => {
        notification.error({ message: 'Upload Failed', description: error.message });
        setUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          if (editingImage) {
            const oldBannerRef = ref(storage, `establishments/${establishmentId}/banners/${editingImage.id}`);
            await deleteObject(oldBannerRef);
          }

          if (userId) {
            const docRef = doc(getFirestore(), 'users', userId, 'establishments', establishmentId);
            await updateDoc(docRef, {
              [`info.bannerUrls.${editingImage ? editingImage.id : file.name}`]: downloadURL,
            });

            setBannerImages((prev) => [
              ...prev.filter(banner => banner.id !== (editingImage ? editingImage.id : '')),
              { id: editingImage ? editingImage.id : file.name, url: downloadURL },
            ]);

            notification.success({ message: 'Success', description: 'Banner uploaded successfully.' });
          }
        } catch (error) {
          notification.error({
            message: 'Update Failed',
            description: `Failed to update banner URL in Firestore: ${error}`,
          });
        } finally {
          setUploading(false);
          handleCancel();
        }
      }
    );
  };

  const handleDelete = async (id: string) => {
    const user = auth.currentUser;

    if (!user || !establishmentId) {
      notification.error({ message: 'Error', description: 'User is not authenticated or Establishment ID is missing.' });
      return;
    }

    try {
      const bannerRef = ref(getStorage(), `establishments/${establishmentId}/banners/${id}`);
      await deleteObject(bannerRef);

      const docRef = doc(getFirestore(), 'users', user.uid, 'establishments', establishmentId);
      await updateDoc(docRef, {
        [`info.bannerUrls.${id}`]: null,
      });

      setBannerImages((prev) => prev.filter((banner) => banner.id !== id));

      notification.success({ message: 'Success', description: 'Banner deleted successfully.' });
    } catch (error) {
      notification.error({
        message: 'Error',
        description: `Failed to delete banner: ${error}`,
      });
    }
  };

  return (
    <div className={styles.banner}>
      {bannerImages.length === 0 ? (
        <div style={{ backgroundColor: '#ffbf87', height: '184px', width: '100%', borderRadius: '22px', margin: 'auto' }}>
          <Button type="link" onClick={() => showModal(null)} className={styles.editButton}>
            <EditOutlined />
          </Button>
        </div>
      ) : (
        <Carousel autoplay autoplaySpeed={4000} speed={1000} className={styles.bannerCarousel}>
          {bannerImages.map((image) => (
            <div key={image.id}>
              <div style={{ ...contentStyle, backgroundSize: 'cover', backgroundPosition: 'center' }} className={styles.carouselItem}>
                <Image src={image.url} alt={`Banner image ${image.id}`} layout="fill" objectFit="cover" className={styles.carouselImage} />
                <Button type="primary" onClick={() => showModal(image)} className={styles.editButton}>
                  Edit
                </Button>
                <Button type="link" danger onClick={() => handleDelete(image.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </Carousel>
      )}

      <Modal title={editingImage ? "Edit Banner" : "Upload New Banner"} visible={isModalVisible} onCancel={handleCancel} footer={null}>
        <Upload beforeUpload={(file) => { setFileList([file]); return false; }} fileList={fileList} showUploadList={false}>
          <Button icon={<UploadOutlined />}>Select File</Button>
        </Upload>
        <Button type="primary" onClick={() => handleUpload(fileList[0])} loading={uploading} disabled={fileList.length === 0}>
          {editingImage ? "Update" : "Upload"}
        </Button>
      </Modal>
    </div>
  );
};

export default Banner;
