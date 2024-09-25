
import Image from 'next/image';
import style from './style.module.css';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

const AboutApp: React.FC = () => {
    const { i18n } = useTranslation("global");
    const { t } = useTranslation("global");

    useEffect(() => {
        const savedLanguage = localStorage.getItem('language'); 
        if (savedLanguage) {
            i18n.changeLanguage(savedLanguage); 
        }
    }, [i18n]);

    const aboutTextsArray = Object.values(t('AboutApp', { returnObjects: true })) as Array<string | Record<string, string>>;

    return (
        <div className={style.about}>
            <div className={style.left}>
                <Image 
                    className={style.img} 
                    src="/img/photo_2024-07-28_21-33-23.jpg" 
                    width={500} 
                    height={500} 
                    alt='img'
                />
            </div>
            <div className={style.right}>
                <div className={style.aboutData}>
                    <h2 className={style.aboutTitle}>{t("aboutTitle")}</h2>
                    {aboutTextsArray.map((text, index) => (
                        typeof text === 'string' ? (
                            <p className={style.aboutParagraph} key={index}>{text}</p>
                        ) : (
                            <div key={index}>
                                {Object.entries(text).map(([key, value]) => (
                                    <p className={style.aboutParagraph} key={key}> {value} </p>
                                ))}
                            </div>
                        )
                    ))}      
                </div>
            </div>
        </div>
    );
}

export default AboutApp;
