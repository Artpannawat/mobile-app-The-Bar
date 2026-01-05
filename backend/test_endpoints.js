const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';
let TOKEN = '';
let PRODUCT_ID = '';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    console.log('Creating uploads directory...');
    fs.mkdirSync(uploadDir);
}

// Helper to create a multipart request body manually since we don't have form-data package
async function createMultipartBody(fields, files) {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const lineBreak = '\r\n';
    const chunks = [];

    for (const [key, value] of Object.entries(fields)) {
        chunks.push(`--${boundary}${lineBreak}`);
        chunks.push(`Content-Disposition: form-data; name="${key}"${lineBreak}${lineBreak}`);
        chunks.push(`${value}${lineBreak}`);
    }

    for (const [key, filepath] of Object.entries(files)) {
        const filename = path.basename(filepath);
        const fileContent = fs.readFileSync(filepath);
        chunks.push(`--${boundary}${lineBreak}`);
        chunks.push(`Content-Disposition: form-data; name="${key}"; filename="${filename}"${lineBreak}`);
        chunks.push(`Content-Type: image/jpeg${lineBreak}${lineBreak}`);
        chunks.push(fileContent);
        chunks.push(lineBreak);
    }

    chunks.push(`--${boundary}--${lineBreak}`);

    const buffer = Buffer.concat(chunks.map(c => (typeof c === 'string' ? Buffer.from(c) : c)));
    return { body: buffer, contentType: `multipart/form-data; boundary=${boundary}` };
}

async function request(method, endpoint, data = null, isMultipart = false) {
    console.log(`\n--- ${method} ${endpoint} ---`);

    const headers = {};
    if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;

    let body = undefined;

    if (data) {
        if (isMultipart) {
            const { body: multipartBody, contentType } = await createMultipartBody(data.fields || {}, data.files || {});
            body = multipartBody;
            headers['Content-Type'] = contentType;
        } else {
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify(data);
        }
    }

    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            method,
            headers,
            body
        });

        const text = await res.text();
        let json;
        try {
            json = JSON.parse(text);
        } catch (e) {
            json = text;
        }

        console.log(`Status: ${res.status}`);
        // console.log('Response:', JSON.stringify(json, null, 2));

        if (!res.ok) {
            console.error('Error Response:', json);
        } else {
            console.log('Success!');
        }

        return { status: res.status, data: json };
    } catch (err) {
        console.error('Request Failed:', err.message);
        return { status: 500, error: err };
    }
}

async function runTests() {
    console.log('Starting API Tests...');

    // 1. Register
    const uniqueUser = `user_${Date.now()}`;
    await request('POST', '/auth/register', {
        username: uniqueUser,
        email: `${uniqueUser}@example.com`,
        password: 'password123'
    });

    // 2. Login
    const loginRes = await request('POST', '/auth/login', {
        username: uniqueUser,
        password: 'password123'
    });

    if (loginRes.data && loginRes.data.token) {
        TOKEN = loginRes.data.token;
        console.log('Token acquired.');
    } else {
        console.error('Login failed, stopping tests.');
        return;
    }

    // 3. Get Profile
    await request('GET', '/auth/profile');

    // 4. Update Profile with Image
    await request('PUT', '/auth/profile', {
        fields: { username: `${uniqueUser}_updated` },
        files: { profileImage: path.join(__dirname, 'test_image.jpg') }
    }, true);

    // 5. Create Product with Image
    const createRes = await request('POST', '/products', {
        fields: {
            name: 'Test Product',
            price: '99',
            description: 'A test product description',
            stock: '10'
        },
        files: { imageUrl: path.join(__dirname, 'test_image.jpg') }
    }, true);

    if (createRes.data && createRes.data._id) {
        PRODUCT_ID = createRes.data._id;
        console.log('Product Created with ID:', PRODUCT_ID);
    }

    // 6. Get All Products
    await request('GET', '/products');

    // 7. Get Single Product
    if (PRODUCT_ID) {
        await request('GET', `/products/${PRODUCT_ID}`);
    }

    // 8. Update Product
    if (PRODUCT_ID) {
        await request('PUT', `/products/${PRODUCT_ID}`, {
            fields: { price: '150', name: 'Updated Product Name' }
            // files: { imageUrl: ... } // Optional
        }, true);
    }

    // 9. Delete Product
    if (PRODUCT_ID) {
        await request('DELETE', `/products/${PRODUCT_ID}`);
    }

    console.log('\nAll Tests Completed.');
}

runTests();
