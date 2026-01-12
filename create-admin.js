#!/usr/bin/env node

/**
 * سكريبت لإنشاء حساب admin تجريبي
 * استخدام: node create-admin.js
 */

const axios = require('axios');

const API_URL = 'http://192.168.1.158:5000/api';

const adminData = {
    name: 'Admin User',
    email: 'admin@elia-store.com',
    password: 'Admin@123456',
    phoneNumber: '07700000000',
    isAdmin: true,
    role: 'admin'
};

async function createAdmin() {
    try {
        console.log('🔄 جاري إنشاء حساب Admin...\n');
        console.log('البيانات:');
        console.log(`  📧 البريد: ${adminData.email}`);
        console.log(`  🔑 كلمة المرور: ${adminData.password}`);
        console.log(`  👤 الاسم: ${adminData.name}`);
        console.log(`  📱 الهاتف: ${adminData.phoneNumber}\n`);

        const response = await axios.post(`${API_URL}/users/register`, adminData);

        console.log('✅ تم إنشاء حساب Admin بنجاح!\n');
        console.log('معلومات الحساب:');
        console.log(JSON.stringify(response.data, null, 2));
        
        console.log('\n🎯 استخدم هذه البيانات للدخول:');
        console.log(`   البريد: ${adminData.email}`);
        console.log(`   كلمة المرور: ${adminData.password}`);
        
        process.exit(0);
    } catch (error) {
        if (error.response) {
            console.error('❌ خطأ من السيرفر:');
            console.error(`   الحالة: ${error.response.status}`);
            console.error(`   الرسالة: ${error.response.data?.message || 'خطأ غير معروف'}`);
            console.error(`   التفاصيل:`, error.response.data);
        } else if (error.code === 'ECONNREFUSED') {
            console.error('❌ لا يمكن الاتصال بالسيرفر');
            console.error(`   تأكد من تشغيل Backend على: ${API_URL}`);
        } else {
            console.error('❌ خطأ:', error.message);
        }
        process.exit(1);
    }
}

createAdmin();
