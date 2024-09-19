import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './style.css';

interface MenuCategoryItem {
    id: number;
    img: string;
    name: string;
}

const AllMenu: React.FC = () => {
    const [menuItems, setMenuItems] = useState<MenuCategoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        axios.get('https://menubyqr-default-rtdb.firebaseio.com/MENUBYQR/category.json')
            .then(response => {
                const data = response.data;
                const parsedItems = Object.keys(data).map((key, index) => ({
                    id: index,
                    img: data[key].img,
                    name: data[key].name,
                }));
                setMenuItems(parsedItems);
                setLoading(false);
            })
            .catch(error => {
                setError(error.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="allMenu">
            <h1>All Menu</h1>
            <div className="menuCategories">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        className="menuCategoryItem"
                        style={{
                            backgroundImage: `url(${item.img})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                        onClick={() => window.location.href = `/MENUBYQR/menu/${item.name}`}
                    >
                        <span>{item.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default AllMenu;
