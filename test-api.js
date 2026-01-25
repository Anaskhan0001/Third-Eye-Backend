#!/usr/bin/env node

/**
 * API Test - Test Login/Registration via HTTP
 * Make sure backend is running: npm start
 */

const http = require('http');

const API_URL = 'http://localhost:5000';

const makeRequest = (method, path, data = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body),
            headers: res.headers,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body,
            headers: res.headers,
          });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

const test = async () => {
  console.log('\n🧪 API Authentication Test\n');
  console.log('═════════════════════════════════════════\n');

  try {
    // Test 1: Admin Login
    console.log('1️⃣  Testing ADMIN LOGIN...');
    console.log('   Email: admin@thirdeye.com');
    console.log('   Password: Admin@123\n');

    const loginRes = await makeRequest('POST', '/api/auth/admin/login', {
      email: 'admin@thirdeye.com',
      password: 'Admin@123',
    });

    console.log(`   Status: ${loginRes.status}`);
    if (loginRes.status === 200) {
      console.log(`   ✅ Login successful!`);
      console.log(`   Token: ${loginRes.data.token ? loginRes.data.token.substring(0, 30) + '...' : 'N/A'}`);
      console.log(`   User: ${loginRes.data.user?.email}\n`);
    } else {
      console.log(`   ❌ Login failed`);
      console.log(`   Response: ${JSON.stringify(loginRes.data)}\n`);
    }

    // Test 2: User Registration
    console.log('2️⃣  Testing USER REGISTRATION...');
    const testEmail = `testuser${Date.now()}@test.com`;
    console.log(`   Email: ${testEmail}`);
    console.log(`   Name: Test User`);
    console.log(`   Phone: 1234567890`);
    console.log(`   Password: TestPass@123\n`);

    const registerRes = await makeRequest('POST', '/api/auth/register', {
      name: 'Test User',
      email: testEmail,
      phone: '1234567890',
      password: 'TestPass@123',
    });

    console.log(`   Status: ${registerRes.status}`);
    if (registerRes.status === 201) {
      console.log(`   ✅ Registration successful!`);
      console.log(`   User: ${registerRes.data.user?.email}\n`);
    } else {
      console.log(`   ❌ Registration failed`);
      console.log(`   Response: ${JSON.stringify(registerRes.data)}\n`);
    }

    // Test 3: User Login
    if (registerRes.status === 201) {
      console.log('3️⃣  Testing USER LOGIN...');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Password: TestPass@123\n`);

      const userLoginRes = await makeRequest('POST', '/api/auth/login', {
        email: testEmail,
        password: 'TestPass@123',
      });

      console.log(`   Status: ${userLoginRes.status}`);
      if (userLoginRes.status === 200) {
        console.log(`   ✅ Login successful!`);
        console.log(`   Token: ${userLoginRes.data.token ? userLoginRes.data.token.substring(0, 30) + '...' : 'N/A'}\n`);
      } else {
        console.log(`   ❌ Login failed`);
        console.log(`   Response: ${JSON.stringify(userLoginRes.data)}\n`);
      }
    }

    console.log('═════════════════════════════════════════');
    console.log('✅ API tests completed!\n');
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    console.log('Make sure backend is running: npm start\n');
  }

  process.exit(0);
};

test();
