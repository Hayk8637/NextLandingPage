
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import style from './style.module.css';
import { InstagramOutlined, TikTokOutlined } from '@ant-design/icons';

const logoSrc = '/logo/logo.png';

const Footer: React.FC = () => {
  const { i18n, t } = useTranslation("global");
  const [socialLinks, setSocialLinks] = useState<{ [key: string]: string }>({});
  const changeLanguage = (language: string) => {
    if (i18n && i18n.changeLanguage) {
      i18n.changeLanguage(language);
      localStorage.setItem('language', language);
    } else {
      console.error('i18n.changeLanguage is not available');
    }
  };
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language'); 
    if (savedLanguage) {
      if (i18n && i18n.changeLanguage) {
        i18n.changeLanguage(savedLanguage); 
      } else {
        console.error('i18n.changeLanguage is not available');
      }
    }
  }, [i18n]);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const response = await axios.get('https://menubyqr-default-rtdb.firebaseio.com/LANDING/socialPages.json');
        setSocialLinks(response.data);
      } catch (error) {
        console.error('Error fetching social links:', error);
      }
    };
    fetchSocialLinks();
  }, []);

  return (
    <div className={style.footer}>
      <div className={style.footer0}>
        <div className={style.up}>
          <div className={style.left}>
            <Image src={logoSrc} alt='logo' width={150} height={50} />
          </div>
          <div className={style.right}>
            <ul>
              <li>
                <select onChange={(e) => changeLanguage(e.target.value)} value={i18n.language} className={style.lang}>
                  <option value="en">EN</option>
                  <option value="ru">RU</option>
                  <option value="am">AM</option>
                </select>
              </li>
              {/* <li><a href='#'>{t("About")}</a></li> */}
              <li><a href={`mailto:${socialLinks['support email']}?subject=For Support team.&body=Please write your text !!!`}> {socialLinks['support email']}</a></li>
            </ul>
          </div>
        </div>
        <div className={style.down}>
          <div className={style.socialPages}>
            <ul>
              {socialLinks.instagram && (
                <li><a href={socialLinks.instagram}><InstagramOutlined style={{color: 'black'}}/></a></li>
              )}
              {socialLinks['tik-tok'] && (
                <li><a href={socialLinks['tik-tok']}><TikTokOutlined style={{color: 'black'}}/></a></li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
