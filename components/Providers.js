// elia-ecom-frontend/components/Providers.js
'use client'; 
import React, { useEffect } from 'react';
import { CartProvider } from '@/context/CartContext';
import Header from './Header'; 
import { usePathname } from 'next/navigation';
import '@/lib/auth-debug';

export default function Providers({ children }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  return (
    // 1. Context Provider
    <CartProvider>
      {/* 2. الـ Layout المدمج: Header, Main, Footer */}
      <div className="min-h-screen flex flex-col bg-gray-50"> 
        
        <Header /> 
        
        <main className={isHomePage ? '' : 'flex-grow container mx-auto px-6 lg:px-12 py-10'}>
          {children} {/* محتوى الصفحة الفعلي */}
        </main>
        
        <footer className="bg-gray-900 text-gray-400 p-6 text-center text-sm">
          حقوق النشر &copy; ELIA ECOM - جميع الحقوق محفوظة
        </footer>
        
      </div>
    </CartProvider>
  );
}