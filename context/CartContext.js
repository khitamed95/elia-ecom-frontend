'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();
const MAX_QTY = 10; 

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);

    // دالة مساعدة لمعالجة روابط الصور داخل السلة لضمان ظهورها
    const getCartImageUrl = (path) => {
        if (!path) return "/placeholder.png";
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        return `http://192.168.1.158:5000${path.startsWith('/') ? '' : '/'}${path}`;
    };

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const parsed = JSON.parse(userInfo);
                setCurrentUserId(parsed.id || parsed.email);
            } catch (err) {
                setCurrentUserId(null);
            }
        }

        const handleUserLogout = () => {
            setCurrentUserId(null);
            clearCart(); 
        };

        window.addEventListener('userLogout', handleUserLogout);
        return () => window.removeEventListener('userLogout', handleUserLogout);
    }, []);

    // تحميل السلة عند تغيير المستخدم
    useEffect(() => {
        if (!currentUserId) {
            setCartItems([]);
            return;
        }

        const savedCart = localStorage.getItem('elia_cart');
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                if (parsed.userId === currentUserId && Array.isArray(parsed.items)) {
                    setCartItems(parsed.items);
                }
            } catch (err) {
                setCartItems([]);
            }
        }
    }, [currentUserId]);

    // حفظ السلة تلقائياً عند أي تغيير
    useEffect(() => {
        if (currentUserId) {
            localStorage.setItem('elia_cart', JSON.stringify({
                userId: currentUserId,
                items: cartItems
            }));
        }
    }, [cartItems, currentUserId]);

    const addToCart = (product, qty = 1, selectedSize = null, selectedColor = null) => {
        const productId = product._id || product.id;
        const sizeKey = selectedSize || 'N/A';
        const colorKey = selectedColor || 'Standard';
        
        // مفتاح فريد يجمع بين الهوية والقياس واللون لضمان عدم تداخل الأصناف
        const cartKey = `${productId}-${sizeKey}-${colorKey}`;
        
        const existItem = cartItems.find((x) => x.cartKey === cartKey);

        if (existItem) {
            const nextQty = existItem.qty + Number(qty);
            if (nextQty > MAX_QTY) {
                toast.warning(`الحد الأقصى ${MAX_QTY} قطع للموديل الواحد`);
                return false;
            }
            setCartItems(cartItems.map((x) => x.cartKey === cartKey ? { ...existItem, qty: nextQty } : x));
            toast.info('تم تحديث الكمية في السلة');
        } else {
            setCartItems([...cartItems, {
                id: productId,
                name: product.name,
                image: getCartImageUrl(product.image), // حفظ الرابط المطلق أو معالجته
                price: Number(product.price),
                qty: Math.max(1, Math.min(Number(qty), MAX_QTY)),
                size: sizeKey,
                color: colorKey,
                cartKey: cartKey
            }]);
            toast.success('تمت الإضافة للسلة ✨');
        }
        return true;
    };

    const removeFromCart = (cartKey) => {
        setCartItems(cartItems.filter((x) => x.cartKey !== cartKey));
        toast.info('تمت الإزالة من السلة');
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('elia_cart');
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, getCartImageUrl }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);