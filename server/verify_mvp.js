const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function verify() {
  console.log('Starting verification...');
  
  try {
    // 1. Health check
    const health = await axios.get('http://localhost:5000/health');
    console.log('Health check:', health.data);

    // 2. Register User 1
    const u1 = await axios.post(`${BASE_URL}/auth/register`, {
      email: `user1_${Date.now()}@example.com`,
      password: 'password123'
    });
    const t1 = u1.data.tokens.accessToken;
    console.log('User 1 registered.');

    // 3. Complete Profile 1
    await axios.put(`${BASE_URL}/profile/basic-info`, {
      name: 'User One',
      gender: 'female',
      city: 'Paris'
    }, { headers: { Authorization: `Bearer ${t1}` } });
    console.log('Profile 1 updated.');

    // 4. Register User 2
    const u2 = await axios.post(`${BASE_URL}/auth/register`, {
      email: `user2_${Date.now()}@example.com`,
      password: 'password123'
    });
    const t2 = u2.data.tokens.accessToken;
    console.log('User 2 registered.');

    // 5. Complete Profile 2
    await axios.put(`${BASE_URL}/profile/basic-info`, {
      name: 'User Two',
      gender: 'male',
      city: 'Paris'
    }, { headers: { Authorization: `Bearer ${t2}` } });
    console.log('Profile 2 updated.');

    console.log('Verification steps 1-5 passed.');
  } catch (error) {
    console.error('Verification failed:', error.response?.data || error.message);
  }
}

// Note: This requires the server to be running.
// verify();
