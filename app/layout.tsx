import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import Providers from "../components/Providers";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./globals.css";
import { GoogleOAuthProvider } from '@react-oauth/google';

// إعداد خط Cairo ليكون متناسقاً مع التصميم الحديث
const cairo = Cairo({ 
  subsets: ["arabic"], 
  variable: "--font-cairo",
  display: 'swap',
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'], // دعم كافة الأوزان للتصميم
});

export const metadata: Metadata = {
  title: "ELIA STORE | عالم الموضة في العراق", 
  description: "أرقى الملابس العصرية مع ميزة المقاس الذكي والدفع عند الاستلام",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth" data-scroll-behavior="smooth">
      <body
        className={`${cairo.variable} font-sans subpixel-antialiased bg-[#f8fafc] text-[#0f172a] selection:bg-indigo-100 selection:text-indigo-900`}
      >
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
          {/* Providers يحتوي على CartProvider + Header + Footer */}
          <Providers>
            {children}
          </Providers>

          {/* نظام التنبيهات بتصميم متناسق مع الواجهة العربية */}
          <ToastContainer
              position="top-center" // الموقع المركزي أفضل للهواتف في العراق
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              rtl={true}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored" // ثيم ملون ليتناسب مع كروت الداشبورد
              toastStyle={{ borderRadius: '20px', fontFamily: 'var(--font-cairo)', fontWeight: 'bold' }}
            />
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}