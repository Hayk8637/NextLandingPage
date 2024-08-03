// pages/about.tsx

import Image from 'next/image';
import style from './style.module.css';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

const AboutC: React.FC = () => {
    const { i18n } = useTranslation("global");
    const { t } = useTranslation("global");

    useEffect(() => {
        const savedLanguage = localStorage.getItem('language'); 
        if (savedLanguage) {
          i18n.changeLanguage(savedLanguage); 
        }
      }, [i18n]);
      const aboutTexts = t('about', { returnObjects: true });
    return<>
    <div className={style.about}>
    <div className={style.left}>
        <Image className={style.img} src="/img/photo_2024-07-28_21-33-23.jpg" width={10000} height={10000} alt='img'/>
    </div>
    <div className={style.right}>
        <div className={style.aboutData}>
            <h2 className={style.aboutTitle}>{t("aboutTitle")}</h2>
                {Object.values(aboutTexts).map((text, index) => (
                    <p className={style.aboutParagraph} key={index}>{text}</p>
                ))}      
        </div>
    </div>
    </div>
      
    </>
}

export default AboutC;
