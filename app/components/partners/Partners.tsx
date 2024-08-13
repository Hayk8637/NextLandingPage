import React from 'react';
import Slider from 'react-slick';
import Image from 'next/image';
import style from './style.module.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const logos = [
  '/img/image 54.png',
  '/img/image 54.png',
  '/img/image 54.png',
  '/img/image 54.png',
  '/img/image 54.png',
  '/img/image 54.png',
  '/img/image 54.png',
  '/img/image 54.png',
];

const Partners: React.FC = () => {
  const settings = {
    infinite: true,
    speed: 5000,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    cssEase: 'linear',
    pauseOnHover: true,
  };

  return (
    <div className={style.carouselContainer}>
        <h1>partners</h1>
      <Slider {...settings}>
        {logos.map((logo, index) => (
          <div key={index} className={style.logoContainer}>
            <Image
              src={logo}
              alt={`Partner logo ${index + 1}`}
              width={150}
              height={100}
              className={style.logo}
              objectFit="contain"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Partners;
