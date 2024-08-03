"use client";

import React, { useState, useRef, useEffect } from 'react';
import emailjs from 'emailjs-com';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import style from './style.module.css';

const ContactUs: React.FC = () => {
  const [email, setEmail] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const { i18n, t } = useTranslation("global"); // Ensure useTranslation is used correctly

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (formRef.current) {
      emailjs.sendForm('service_hm3uuxh', 'template_o114h4j', formRef.current, 'F7Bl8FFoHdgF9koa-')
        .then((result) => {
          alert('Email sent successfully!');
          setEmail('');  // Reset the email state
        }, (error) => {
          alert('Failed to send email.');
        });
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

  return (
    <div className={style.contactUs}>
      <div className={style.a}></div>
      <div className={style.left}>
        <Image src='/logo/logo2.png' className={style.img} alt='logo' width={420} height={420} />
      </div>
      <div className={style.right}>
        <h1>{t("BECOMEAPartner")}</h1>
        <span>{t("Pleasewriteyouremail")}</span>
        <form className={style.input} ref={formRef} onSubmit={sendEmail}>
          <input
            type="text"
            name="user_email"
            placeholder={t("Enteryouremail")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">{t("Send")}</button>
        </form>
      </div>
    </div>
  );
}
export default ContactUs;