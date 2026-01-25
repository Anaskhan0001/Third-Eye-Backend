#!/usr/bin/env node

/**
 * Test Login with Email and Phone
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
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body,
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
  console.log('\n🧪 Email & Phone Login Test\n');
  console.log('═════════════════════════════════════════\n');

  try {
    // Test 1: Register a test user
    console.log('1️⃣  REGISTERING TEST USER...');
    const testEmail = `user${Date.now()}@test.com`;
    const testPhone = '9876543210';
    const testPassword = 'TestPass@123';

    const registerRes = await makeRequest('POST', '/api/auth/register', {
      name: 'Test User',
      email: testEmail,
      phone: testPhone,
      password: testPassword,
    });

    if (registerRes.status !== 201) {
      console.log(`❌ Registration failed: ${registerRes.data.message}`);
      return;
    }
    console.log(`✅ User registered: ${testEmail} (Phone: ${testPhone})\n`);

    // Test 2: Login with Email
    console.log('2️⃣  LOGIN WITH EMAIL...');
    const emailLoginRes = await makeRequest('POST', '/api/auth/login', {
      identifier: testEmail,
      password: testPassword,
      loginType: 'email',
    });

    if (emailLoginRes.status === 200) {
      console.log(`✅ Email login successful!`);
      console.log(`   User: ${emailLoginRes.data.user.email}`);
      console.log(`   Token received: ${emailLoginRes.data.token ? 'Yes' : 'No'}\n`);
    } else {
      console.log(`❌ Email login failed: ${emailLoginRes.data.message}\n`);
    }

    // Test 3: Login with Phone
    console.log('3️⃣  LOGIN WITH PHONE...');
    const phoneLoginRes = await makeRequest('POST', '/api/auth/login', {
      identifier: testPhone,
      password: testPassword,
      loginType: 'phone',
    });

    if (phoneLoginRes.status === 200) {
      console.log(`✅ Phone login successful!`);
      console.log(`   User: ${phoneLoginRes.data.user.email}`);
      console.log(`   Token received: ${phoneLoginRes.data.token ? 'Yes' : 'No'}\n`);
    } else {
      console.log(`❌ Phone login failed: ${phoneLoginRes.data.message}\n`);
    }

    // Test 4: Wrong Password
    console.log('4️⃣  TEST WRONG PASSWORD...');
    const wrongPassRes = await makeRequest('POST', '/api/auth/login', {
      identifier: testEmail,
      password: 'WrongPassword123',
      loginType: 'email',
    });

    if (wrongPassRes.status !== 200) {
      console.log(`✅ Correctly rejected: ${wrongPassRes.data.message}\n`);
    } else {
      console.log(`❌ Should have rejected wrong password\n`);
    }

    // Test 5: Non-existent Account
    console.log('5️⃣  TEST NON-EXISTENT ACCOUNT...');
    const notFoundRes = await makeRequest('POST', '/api/auth/login', {
      identifier: 'doesnotexist@test.com',
      password: 'AnyPassword123',
      loginType: 'email',
    });

    if (notFoundRes.status !== 200) {
      console.log(`✅ Correctly rejected: ${notFoundRes.data.message}\n`);
    } else {
      console.log(`❌ Should have rejected non-existent account\n`);
    }

    // Test 6: Admin Login (unchanged)
    console.log('6️⃣  TEST ADMIN LOGIN...');
    const adminLoginRes = await makeRequest('POST', '/api/auth/admin/login', {
      email: 'admin@thirdeye.com',
      password: 'Admin@123',
    });

    if (adminLoginRes.status === 200) {
      console.log(`✅ Admin login successful!`);
      console.log(`   User: ${adminLoginRes.data.user.email}\n`);
    } else {
      console.log(`❌ Admin login failed: ${adminLoginRes.data.message}\n`);
    }

    console.log('═════════════════════════════════════════');
    console.log('✅ All tests completed!\n');
  } catch (error) {
    console.log(`\n❌ Error: ${error.message}\n`);
    console.log('Make sure backend is running: npm start\n');
  }

  process.exit(0);
};

test();
