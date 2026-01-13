// Debug configuration for CORS and API testing
// This file is for local development only - do NOT commit to production

console.log('=== ELIA Frontend Environment Debug ===');
console.log('Node Env:', process.env.NODE_ENV);
console.log('API URL (Dev):', process.env.NEXT_PUBLIC_API_URL);
console.log('API URL (Prod):', process.env.NEXT_PUBLIC_API_URL);
console.log('Google Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.substring(0, 20) + '...');

// Expected configuration:
// Development: http://192.168.1.158:5000 (NO /api at the end - axios interceptor handles it)
// Production: https://elia-ecom-backend.onrender.com/api (WITH /api at the end)

export {};
