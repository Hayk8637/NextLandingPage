import React, { useEffect, useState } from 'react';
import styles from './style.module.css';
import { CopyOutlined, EnvironmentOutlined, InfoCircleOutlined, LeftOutlined, LockOutlined, PhoneOutlined, WifiOutlined } from '@ant-design/icons';
import { Button, Form, notification, Popover } from 'antd';
import { usePathname } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { auth } from '@/firebaseConfig';
import Image from 'next/image'; // Import Image from next/image

interface FormValues {
    wifiname: string;
    wifipass: string;
    address: string;
    currency: string;
    phone: string;
}

interface Establishment {
    id?: string;
    info: {
        name: string;
        wifiname?: string;
        wifipass?: string;
        address?: string;
        phone?: string;
        logoUrl?: string;
        bannerUrls?: string[];
        currency?: string;
    };
    menu: {
        categories?: any[];
        items?: any[];
    };
    uid: string;
}

const HeaderMenu: React.FC = () => {
    const currentPath = window.location.pathname;
    const centerText = currentPath.split('/')[currentPath.split('/').length - 1];
    var returnBack = currentPath.split('/').slice(0, -1).join('/');
    const [form] = Form.useForm();
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const pathname = usePathname() || '';
    const pathArray = pathname.split('/');
    const establishmentId = pathArray[pathArray.length - 2];
    const [popoverData, setPopoverData] = useState<FormValues>({
        wifiname: '',
        wifipass: '',
        address: '',
        phone: '',
        currency: '',
    });

    useEffect(() => {
        if (!establishmentId) {
            notification.error({ message: 'Error', description: 'Establishment ID is not set' });
            return;
        }
        const fetchEstablishmentData = async () => {
            try {
                const auth = getAuth();
                const user = auth.currentUser;

                if (!user) {
                    notification.error({ message: 'Error', description: 'User is not authenticated' });
                    return;
                }

                const db = getFirestore();
                const docRef = doc(db, 'users', user.uid, 'establishments', establishmentId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as Establishment;
                    setLogoUrl(data.info?.logoUrl || '/default-logo.png'); // Use a fallback logo here
                    setPopoverData({
                        wifiname: data.info?.wifiname || '',
                        wifipass: data.info?.wifipass || '',
                        address: data.info?.address || '',
                        phone: data.info?.phone || '',
                        currency: data.info?.currency || '',
                    });
                    form.setFieldsValue({
                        wifiname: data.info?.wifiname || '',
                        wifipass: data.info?.wifipass || '',
                        address: data.info?.address || '',
                        currency: data.info?.currency || '',
                        phone: data.info?.phone || '',
                    });
                } else {
                    notification.error({ message: 'Error', description: 'Document does not exist' });
                }
            } catch (error) {
                notification.error({ message: 'Error', description: 'Failed to fetch establishment data' });
            }
        };

        fetchEstablishmentData();
    }, [establishmentId, form]);

    if (centerText === 'cart') {
        returnBack = '/MENUBYQR';
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            notification.success({ message: 'Copied to clipboard', description: text });
        }).catch(() => {
            notification.error({ message: 'Failed to copy', description: 'Unable to copy text' });
        });
    };

    const popoverContent = (
        <div style={{ width: 'calc(100% )' }}>
            {[
                { icon: <WifiOutlined size={32} style={{paddingRight: '10px'}}/>, label: 'WiFi Name', value: popoverData.wifiname },
                { icon: <LockOutlined style={{paddingRight: '10px'}}/>, label: 'WiFi Password', value: popoverData.wifipass},
                { icon: <EnvironmentOutlined style={{paddingRight: '10px'}}/>, label: 'Address', value: popoverData.address },
                { icon: <PhoneOutlined style={{paddingRight: '10px'}}/>, label: 'Phone', value: popoverData.phone },
            ].map(({ icon, label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p><strong>{icon}: </strong> {value}</p>
                    <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(value)}>Copy</Button>
                </div>
            ))}
        </div>
    );

    return (
        <div className={styles.headerMenu}>
            <div className={styles.left}>
                <a href={returnBack}><LeftOutlined style={{ color: 'black' }} /></a>
            </div>
            <div className={styles.center}>
                {/* Display the logo using next/image */}
                {logoUrl && (
                    <Image
                        src={logoUrl} // Use the fetched logo URL
                        alt="Logo"
                        width={120} // Set a suitable width
                        height={50} // Set a suitable height
                        objectFit="contain" // Ensure the image fits within the bounds
                    />
                )}
            </div>
            <div className={styles.right}>
                <Popover placement="bottomRight" style={{padding:'15px'}} title="Establishment Info" content={popoverContent} arrow>
                    <Button type="link" className={styles.info}>
                        <InfoCircleOutlined />
                    </Button>
                </Popover>
            </div>
        </div>
    );
};

export default HeaderMenu;
