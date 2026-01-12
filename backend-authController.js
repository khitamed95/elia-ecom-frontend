// يرجى إنشاء هذا الملف في Backend: C:\Users\E-Tech\elia-ecom-backend\controllers\authController.js

import axios from 'axios';
import prisma from '../config/db.js';
import { generateToken } from '../utils/generateToken.js';

// @desc    تسجيل الدخول/التسجيل عبر Google
// @route   POST /api/users/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
    try {
        const { accessToken } = req.body;

        if (!accessToken) {
            return res.status(400).json({ message: 'Access token مطلوب' });
        }

        // الحصول على معلومات المستخدم من Google
        const response = await axios.get(
            `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
        );

        const { email, name, picture } = response.data;

        if (!email) {
            return res.status(400).json({ message: 'لم نتمكن من الحصول على البريد الإلكتروني' });
        }

        // البحث عن المستخدم أو إنشاؤه
        let user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            // إنشاء مستخدم جديد
            user = await prisma.user.create({
                data: {
                    name: name,
                    email: email,
                    avatar: picture,
                    password: null, // لا توجد كلمة مرور للمستخدمين من Google
                    isAdmin: false
                }
            });
        }

        // إنشاء JWT token
        const token = generateToken(user.id);

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            avatar: user.avatar,
            token: token,
            accessToken: token
        });

    } catch (error) {
        console.error('Google Auth Error:', error.response?.data || error.message);
        res.status(401).json({ 
            message: 'فشلت عملية المصادقة عبر Google',
            error: error.response?.data?.error_description || error.message
        });
    }
};
