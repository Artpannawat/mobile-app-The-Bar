const http = require('http');

const data = JSON.stringify({
    username: `init_user_${Date.now()}`,
    email: `init_${Date.now()}@example.com`,
    password: 'password123'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let responseBody = '';

    console.log(`StatusCode: ${res.statusCode}`);

    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        console.log('Response:', responseBody);
        if (res.statusCode === 201 || res.statusCode === 200) {
            console.log('Database initialized successfully (User created).');
        } else {
            console.error('Failed to initialize database.');
        }
    });
});

req.on('error', (error) => {
    console.error('Error hitting API:', error);
});

req.write(data);
req.end();
