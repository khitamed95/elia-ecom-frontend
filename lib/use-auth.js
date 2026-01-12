'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isValidSession, getCurrentUser, getToken } from '@/lib/auth-helper';
import { toast } from 'react-toastify';

/**
 * مكون للحماية من الوصول بدون تسجيل دخول
 * مثال الاستخدام:
 * 
 * export default function ProtectedPage() {
 *   return (
 *     <ProtectRoute requiredRole="admin">
 *       <YourComponent />
 *     </ProtectRoute>
 *   );
 * }
 */
export function ProtectRoute({ children, requiredRole = null }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // التحقق من الجلسة
        if (!isValidSession()) {
            toast.error('يجب تسجيل الدخول أولاً');
            router.push('/login?redirect=' + window.location.pathname);
            return;
        }

        // التحقق من الصلاحيات إذا لزم الأمر
        if (requiredRole) {
            const user = getCurrentUser();
            if (user?.role !== requiredRole) {
                toast.error('ليس لديك صلاحية الوصول لهذه الصفحة');
                router.push('/');
                return;
            }
        }

        setIsAuthorized(true);
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p>جاري التحقق من الجلسة...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return children;
}

/**
 * Hook مخصص للتعامل مع الجلسة
 * مثال الاستخدام:
 * 
 * const { user, token, isLoggedIn, logout } = useAuth();
 * 
 * if (!isLoggedIn) {
 *   return <div>Please login</div>;
 * }
 * 
 * return <div>Welcome {user.email}</div>;
 */
export function useAuth() {
    const [authState, setAuthState] = useState({
        user: null,
        token: null,
        isLoggedIn: false,
        isLoading: true
    });

    useEffect(() => {
        const user = getCurrentUser();
        const token = getToken();
        
        setAuthState({
            user,
            token,
            isLoggedIn: isValidSession(),
            isLoading: false
        });
    }, []);

    const logout = () => {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('cart');
        setAuthState({
            user: null,
            token: null,
            isLoggedIn: false,
            isLoading: false
        });
        window.location.href = '/login';
    };

    return { ...authState, logout };
}

/**
 * مثال كامل لاستخدام Hook:
 * 
 * export default function AdminPage() {
 *   const { user, isLoggedIn, isLoading } = useAuth();
 *   
 *   if (isLoading) return <LoadingSpinner />;
 *   if (!isLoggedIn) return <NotAuthorized />;
 *   
 *   return (
 *     <div>
 *       <h1>مرحباً {user.name}</h1>
 *       <p>البريد: {user.email}</p>
 *     </div>
 *   );
 * }
 */
