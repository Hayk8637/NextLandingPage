import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './style.css';
import { Carousel } from 'antd';

interface BannerImage {
    id: number;
    url: string;
}

const contentStyle: React.CSSProperties = {
    height: '184px',
    color: '#fff',
    textAlign: 'center',
    background: '#364d79',
    borderRadius: '22px',
};

const Banner: React.FC = () => {
    const [bannerImages, setBannerImages] = useState<BannerImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        axios.get('https://menubyqr-default-rtdb.firebaseio.com/MENUBYQR/banner.json')
            .then(response => {
                const data = response.data;
                const parsedItems = data.map((item: { img: string }, index: number) => ({
                    id: index + 1,
                    url: item.img,
                }));
                setBannerImages(parsedItems);
                setLoading(false);
            })
            .catch(error => {
                setError(error.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className='banner'>
            <Carousel autoplay autoplaySpeed={4000} speed={1000} className='bannerCarousel'>
                {bannerImages.map(image => (
                    <div key={image.id}>
                        <div style={{ ...contentStyle, backgroundImage: `url(${image.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                            {/* <h3>{image.id}</h3> */}
                        </div>
                    </div>
                ))}
            </Carousel>
        </div>
    );
}

export default Banner;
