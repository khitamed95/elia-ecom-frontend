// elia-ecom-frontend/components/Header.js
'use client'; 
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, User, Package, LogOut, Search, Store, Bell, MessageSquare } from 'lucide-react';

const Header = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false); // Track if the component is mounted on the client
  const [unreadCount, setUnreadCount] = useState(0);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.158:5000';

  // استخدام Context لحساب عدد المنتجات
  const { cartItems } = useCart();
  const cartItemsCount = cartItems?.reduce((acc, item) => acc + item.qty, 0) || 0; 

  // Fetch notifications count
  useEffect(() => {
    if (userInfo) {
      fetchNotificationsCount();
    }
    
    // الاستماع لحدث تحديث الإشعارات
    const handleNotificationsUpdate = () => {
      if (userInfo) {
        fetchNotificationsCount();
      }
    };

    window.addEventListener('notificationsUpdated', handleNotificationsUpdate);

    return () => {
      window.removeEventListener('notificationsUpdated', handleNotificationsUpdate);
    };
  }, [userInfo]);

  const fetchNotificationsCount = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${userInfo?.accessToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }; 

  // التحقق من localStorage عند كل render
  useEffect(() => {
    setIsClient(true);
    
    const checkUserInfo = () => {
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        try {
          setUserInfo(JSON.parse(storedUserInfo));
        } catch (error) {
          console.error('Error parsing userInfo:', error);
          setUserInfo(null);
        }
      } else {
        setUserInfo(null);
      }
    };

    // التحقق الفوري
    checkUserInfo();

    // الاستماع لحدث تسجيل الدخول
    const handleStorageChange = () => {
      checkUserInfo();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleStorageChange);
    };
  }, []);

  // إغلاق القائمة المنسدلة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.user-dropdown')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // إغلاق القائمة عند التنقل بين الصفحات
  useEffect(() => {
    setDropdownOpen(false);
  }, [router]);

  const logoutHandler = () => {
    // حذف من localStorage
    localStorage.removeItem('userInfo');
    
    // حذف من Cookies
    document.cookie = 'accessToken=; path=/; max-age=0';
    document.cookie = 'userInfo=; path=/; max-age=0';
    
    setUserInfo(null); 
    setDropdownOpen(false);
    window.dispatchEvent(new CustomEvent('userLogout')); 
    setTimeout(() => {
      router.push('/login');
    }, 50);
  };

    const handleSearch = (e) => {
      e.preventDefault();
      // Add your search logic here, for example:
      if (searchQuery.trim()) {
        router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
      }
    };
  
    return (
      <header className="bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-xl sticky top-0 z-[9999]" suppressHydrationWarning>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          {/* شعار الموقع مع أيقونة المتجر */}
          <Link href="/" passHref>
            <div className="flex items-center gap-2 text-3xl font-black text-gray-900 tracking-wider cursor-pointer">
              <Store size={36} className="text-indigo-700" />
              ELIA STORE
            </div>
          </Link>
          {/* شريط البحث المركزي المتميز */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8 relative group">
            <div className="relative w-full">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-300">
                <i className="fas fa-search text-lg"></i>
              </div>
              <input 
                type="text" 
                placeholder="ابحث فوراً عن منتج، فئة، أو علامة تجارية..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 pl-12 py-4 bg-gradient-to-r from-gray-50 to-indigo-50/30 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-200 hover:bg-white hover:border-indigo-200 transition-all duration-300 ease-in-out text-right font-medium outline-none placeholder:text-gray-400 placeholder:font-normal"
                suppressHydrationWarning
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 hover:scale-110 transition-all duration-200 cursor-pointer"
                >
                  <i className="fas fa-times-circle text-lg"></i>
                </button>
              )}
            </div>
          </form>
          {/* روابط التنقل والمستخدم */}
          <nav className="flex items-center gap-6">
            {/* رابط الإشعارات (Bell Icon) */}
            {userInfo && (
              <Link href="/notifications" passHref>
                <div className="relative text-gray-700 hover:text-indigo-600 transition duration-150 cursor-pointer flex items-center">
                  <Bell size={24} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </Link>
            )}
            {/* رابط السلة (Basket Icon) */}
            <Link href="/cart" passHref>
              <div className="relative text-gray-700 hover:text-indigo-600 transition duration-150 cursor-pointer flex items-center">
                <ShoppingBag size={24} />
                {/* 🟢 عرض عدد المنتجات */}
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {cartItemsCount}
                  </span>
                )}
              </div>
            </Link>
            {/* منطق عرض: اسم المستخدم أو رابط الدخول */}
            {userInfo ? (
              <div className="relative user-dropdown">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition duration-150"
                >
                  {userInfo.avatar ? (
                    <img 
                      src={userInfo.avatar.startsWith('http') ? userInfo.avatar : `${API_URL}${userInfo.avatar}`}
                      alt={userInfo.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-indigo-600"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                      {userInfo.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-gray-800 font-semibold hidden md:block">{userInfo.name.split(' ')[0]}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-30 border border-gray-200 text-right">
                    {userInfo.isAdmin && (
                      <Link href="/admin" passHref>
                        <div 
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-indigo-600 hover:bg-indigo-50 cursor-pointer font-bold border-b border-gray-100"
                        >
                          <i className="fas fa-tachometer-alt ml-2"></i>
                          لوحة التحكم
                        </div>
                      </Link>
                    )}
                    <Link href="/profile" passHref>
                      <div 
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                      >
                        <User size={18} />
                        الملف الشخصي
                      </div>
                    </Link>
                    <Link href="/profile/orders" passHref>
                      <div 
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                      >
                        <Package size={18} />
                        طلباتي
                      </div>
                    </Link>
                    <Link href="/messages" passHref>
                      <div 
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                      >
                        <MessageSquare size={18} />
                        رسائلي
                      </div>
                    </Link>
                    <button
                      onClick={logoutHandler}
                      className="w-full text-right block px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <LogOut size={18} />
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              isClient && (
                <Link href="/login" passHref>
                  <div className="bg-indigo-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-indigo-700 transition duration-150 cursor-pointer shadow-md">
                    تسجيل الدخول
                  </div>
                </Link>
              )
            )}
          </nav>
        </div>
      </header>
    );
  };
  
  export default Header;