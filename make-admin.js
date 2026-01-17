/**
 * سكريبت لجعل المستخدم أدمن
 * 
 * الاستخدام:
 * 1. سجل دخول بحسابك أولاً
 * 2. افتح Console في المتصفح (F12)
 * 3. انسخ والصق هذا الكود:
 */

// جعل المستخدم الحالي أدمن
function makeCurrentUserAdmin() {
    console.warn('تم تعطيل دوال جعل الحساب أدمن في هذه البيئة.');
    alert('تم تعطيل خيار جعل الحساب أدمن لحماية النظام.');
}

// جعل مستخدم معين أدمن بالبريد الإلكتروني
function makeUserAdminByEmail(email) {
    console.warn('تم تعطيل دوال جعل الحساب أدمن في هذه البيئة.');
    alert('تم تعطيل خيار جعل الحساب أدمن لحماية النظام.');
}

// عرض معلومات المستخدم الحالي
function showCurrentUser() {
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        
        if (!userInfo) {
            console.log('❌ لا يوجد مستخدم مسجل دخول');
            return;
        }
        
        console.log('👤 معلومات المستخدم الحالي:');
        console.log('الاسم:', userInfo.name);
        console.log('البريد:', userInfo.email);
        console.log('أدمن؟', userInfo.isAdmin ? '✅ نعم' : '❌ لا');
        console.log('ID:', userInfo.id || userInfo._id);
        
    } catch (error) {
        console.error('❌ خطأ:', error);
    }
}

// تصدير الدوال للاستخدام في Console
if (typeof window !== 'undefined') {
    window.makeCurrentUserAdmin = makeCurrentUserAdmin;
    window.makeUserAdminByEmail = makeUserAdminByEmail;
    window.showCurrentUser = showCurrentUser;
    console.log('تم تعطيل أدوات الترقيات الذاتية (أدمن) لحماية النظام.');
}
