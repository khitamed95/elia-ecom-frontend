import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.158:5000/api';

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, phone, subject, message } = body;

        // التحقق من البيانات
        if (!name || !phone || !subject || !message) {
            return Response.json(
                { error: 'جميع الحقول مطلوبة' },
                { status: 400 }
            );
        }

        // إرسال الرسالة إلى السيرفر
        const response = await axios.post(`${BACKEND_URL}/contact`, {
            name,
            phone,
            subject,
            message
        });

        return Response.json(response.data, { status: 201 });
    } catch (error) {
        console.error('❌ خطأ في Contact API:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: `${BACKEND_URL}/contact`
        });
        return Response.json(
            { error: error.response?.data?.message || 'خطأ في حفظ الرسالة' },
            { status: error.response?.status || 500 }
        );
    }
}

export async function GET(request) {
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return Response.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const response = await axios.get(`${BACKEND_URL}/contact`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return Response.json(response.data, { status: 200 });
    } catch (error) {
        console.error('❌ خطأ في جلب الرسائل:', error.message);
        return Response.json(
            { error: error.response?.data?.message || 'خطأ في جلب الرسائل' },
            { status: error.response?.status || 500 }
        );
    }
}
