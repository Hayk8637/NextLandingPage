"use client"; // Ensure this is at the top

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import style from './style.module.css';

const logoSrc = '/logo/logo.png';
const instaSrc = '/logo/instagram.png';
const tiktokSrc = '/logo/tiktok.png';

const Footer: React.FC = () => {
  const { i18n, t } = useTranslation("global");
  const [socialLinks, setSocialLinks] = useState<{ [key: string]: string }>({});

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
        const response = await axios.get('https://menubyqr-default-rtdb.firebaseio.com/social.json');
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
              <li><a href='#'>{t("About")}</a></li>
              <li><a href='mailto:sargsyan1998hayk@gmail.com?subject=For Support team.&body=Please write your text !!!'>{t("Support")}</a></li>
            </ul>
          </div>
        </div>
        <div className={style.down}>
          <div className={style.socialPages}>
            <ul>
              <li><a href={socialLinks.instagram || '#'}><Image src={instaSrc} alt="Instagram" width={24} height={24} /></a></li>
              <li><a href={socialLinks.tiktok || '#'}><Image src={tiktokSrc} alt="TikTok" width={24} height={24} /></a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
