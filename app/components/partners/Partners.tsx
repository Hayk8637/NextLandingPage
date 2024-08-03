import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import style from './style.module.css'; // Import the CSS Module

const Partners: React.FC = () => {
  const { t } = useTranslation("global");

  return (
    <div className={style.partners}>
      <h1>{t("PARTNERS")}</h1>
      <h2>{t("MostPopularItems")}</h2>
      <div className={style.partnerCards}>
        {[...Array(8)].map((_, index) => (
          <div className={style.partnerCard} key={index}>
            <div className={style.partnerImage}>
              <Image
                src='/img/image 54.png'
                layout="responsive"
                className={style.img} 
                alt='Image'
                width={100}
                height={100}/>
            </div>
            <div className={style.partnerName}>
              <h2>Name</h2>
              <button>{t("GOTOMENU")}</button>
            </div>
          </div>
        ))}
        <button className={style.showMore}>{t("Showmore")}</button>
      </div>
    </div>
  );
}

export default Partners;
