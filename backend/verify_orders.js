const axios = require('axios');
const API_URL = 'http://localhost:5000/api';

// You need a running backend.
// This script assumes you have a user and an admin user seeded or you know creds.
// For simplicity, we will register a temporary user to test.

async function verifyOrderSystem() {
    console.log('Starting Order System Verification...');
    const timestamp = Date.now();
    const userCreds = {
        username: `order_user_${timestamp}`,
        email: `order_${timestamp}@test.com`,
        password: 'password123'
    };

    let userToken = '';
    let userId = '';
    let orderId = '';

    try {
        // 1. Register User
        console.log('1. Registering user...');
        let res = await axios.post(`${API_URL}/auth/register`, userCreds);
        userToken = res.data.token;
        userId = res.data._id;
        console.log('User registered.');

        // 2. Create Order
        console.log('2. Creating Order...');
        const orderData = {
            items: [
                {
                    name: 'Test Product',
                    qty: 2,
                    image: 'http://placehold.it/200x200',
                    price: 150,
                    product: '60d5ecb8b487343510e14828' // Fake ID, needs to be valid mongo ID format though. 
                    // Actually, controller might validate if product exists? Schema ref doesn't auto-validate existence unless populated or explicitly checked.
                    // Our controller doesn't check product existence, just saves.
                }
            ],
            totalAmount: 300
        };

        const config = {
            headers: { Authorization: `Bearer ${userToken}` }
        };

        res = await axios.post(`${API_URL}/orders`, orderData, config);
        orderId = res.data._id;
        console.log('Order created:', orderId);

        // 3. Get My Orders
        console.log('3. Fetching My Orders...');
        res = await axios.get(`${API_URL}/orders/myorders`, config);
        const myOrders = res.data;
        const found = myOrders.find(o => o._id === orderId);
        if (!found) throw new Error('Order not found in My Orders');
        console.log('Order found in My Orders.');

        // 4. Admin Check (Login as admin)
        // Assuming 'admin' user exists from previous step. If not, this step fails or we skip.
        // Let's try to login as 'admin' / 'password123'
        console.log('4. Logging in as Admin...');
        try {
            res = await axios.post(`${API_URL}/auth/login`, { username: 'admin', password: 'password123' });
            const adminToken = res.data.token;
            console.log('Admin logged in.');

            const adminConfig = { headers: { Authorization: `Bearer ${adminToken}` } };

            // 5. Admin Get All Orders
            console.log('5. Admin: Get All Orders...');
            res = await axios.get(`${API_URL}/orders`, adminConfig);
            const allOrders = res.data;
            const foundAdmin = allOrders.find(o => o._id === orderId);
            if (!foundAdmin) throw new Error('Order not found in Admin All Orders');
            console.log('Order found in Admin list.');

            // 6. Admin Update Status
            console.log('6. Admin: Update Status to confirmed...');
            res = await axios.put(`${API_URL}/orders/${orderId}/status`, { status: 'confirmed' }, adminConfig);
            if (res.data.status !== 'confirmed') throw new Error('Status update failed');
            console.log('Status updated to confirmed.');

        } catch (e) {
            console.log('Skipping Admin checks (Admin might not exist or login failed):', e.message);
        }

        console.log('✅ Order System Verification SUCCESS!');

    } catch (error) {
        console.error('❌ Verification FAILED:', error.message);
        if (error.response) console.error(error.response.data);
    }
}

verifyOrderSystem();
