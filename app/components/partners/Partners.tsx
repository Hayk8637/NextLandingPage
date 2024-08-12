// Partners.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import style from './style.module.css';
import Image from 'next/image';

const logos = [
  '/path/to/logo1.png',
  '/path/to/logo2.png',
  '/path/to/logo3.png',
  '/path/to/logo4.png',
  '/path/to/logo5.png',
  '/path/to/logo6.png',
  '/path/to/logo7.png',
];

const Partners: React.FC = () => {
  const { t } = useTranslation("global");

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className={style.partnersContainer}>
      <h2>{t('partners.title')}</h2>
      <Slider {...settings}>
        {logos.map((logo, index) => (
          <div key={index} className={style.logoSlide}>
            <Image src={logo} alt={t('partners.logoAlt', { index: index + 1 })} layout="responsive" width={150} height={100} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Partners;
