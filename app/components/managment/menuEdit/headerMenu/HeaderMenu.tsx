import React, { useEffect, useState } from 'react';
import styles from './style.module.css';
import { CopyOutlined, EnvironmentOutlined, InfoCircleOutlined, LeftOutlined, LockOutlined, PhoneOutlined, WifiOutlined } from '@ant-design/icons';
import { Button, Form, notification, Popover } from 'antd';
import { usePathname } from 'next/navigation';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import Image from 'next/image'; // Import Image from next/image
import { auth } from '@/firebaseConfig';

interface FormValues {
    wifiname: string;
    wifipass: string;
    address: string;
    currency: string;
    phone: string;
}

interface EstablishmentStyles {
    color1: string;
    color2: string;
    color3: string;
    color4: string;
    color5: string;
  }

interface Establishment {
    id?: string;
    styles: EstablishmentStyles;
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
    var currentPath = usePathname() || '';
    const centerText = currentPath.split('/')[currentPath.split('/').length - 2];
    var returnBack = currentPath.split('/').slice(0, currentPath.split('/').length-2).join('/');
    const [form] = Form.useForm();
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const pathname = usePathname() || '';
    const pathArray = pathname.split('/');
    const establishmentId = pathArray[pathArray.length - 3];
    const userId = auth.currentUser?.uid;
    const [establishmentStyles, setEstablishmentStyles] = useState<EstablishmentStyles>();
    const [textColor, setTextColor] = useState(`#${establishmentStyles?.color2 || 'white'}`);


    const [popoverData, setPopoverData] = useState<FormValues>({
        wifiname: '',
        wifipass: '',
        address: '',
        phone: '',
        currency: '',
    });

    useEffect(() => {
        const fetchEstablishmentData = async () => {
            if(userId && establishmentId){
                const db = getFirestore();
                const docRef = doc (db, 'users', userId, 'establishments', establishmentId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as Establishment;
                    setLogoUrl(data.info?.logoUrl || '/default-logo.png');
                    setPopoverData({
                        wifiname: data.info?.wifiname || '',
                        wifipass: data.info?.wifipass || '',
                        address: data.info?.address || '',
                        phone: data.info?.phone || '',
                        currency: data.info?.currency || '',
                    });
                    await setEstablishmentStyles(data.styles);
                }
            };
            }
                

        fetchEstablishmentData();
    }, [establishmentId, form , userId]);

    if (centerText === 'cart') {
        returnBack ;
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
        <div className={styles.headerMenu} style={{backgroundColor: `#${establishmentStyles?.color1}`}}>
            <div className={styles.left}>
                <a href={returnBack}><LeftOutlined  style={{color: `#${establishmentStyles?.color2}`}} /></a>
            </div>
            <div className={styles.center}>
                {logoUrl && (
                    <Image
                        src={logoUrl}
                        alt="Logo"
                        width={120} 
                        height={50} 
                        style={{ objectFit: 'contain' }} 
                        priority 
                    />
                )}
            </div>
            <div className={styles.right}>
                <Popover placement="bottomRight" style={{padding:'15px'}} title="Establishment Info" content={popoverContent} arrow>
                <Button type="link" className={styles.info}
                    style={{ color: textColor }}
                    onMouseEnter={() => setTextColor(`#${establishmentStyles?.color3}`)}
                    onMouseLeave={() => setTextColor(`#${establishmentStyles?.color2}`)}
                    onFocus={() => setTextColor(`#${establishmentStyles?.color3}`)}
                    onBlur={() => setTextColor(`#${establishmentStyles?.color2}`)} 
                    onMouseDown={() => setTextColor(`#${establishmentStyles?.color3}`)} 
                    onMouseUp={() => setTextColor(`#${establishmentStyles?.color3}`)}  >
                <InfoCircleOutlined />
              </Button>
                </Popover>
            </div>
        </div>
    );
};

export default HeaderMenu;
