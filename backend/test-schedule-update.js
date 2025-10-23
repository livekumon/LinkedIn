/**
 * Test script for Schedule Update API
 * 
 * This script tests the update idea endpoint with scheduledFor field
 * to ensure timezone and schedule updates are working correctly.
 */

const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

// IMPORTANT: Replace these with your actual credentials
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';
const TENANT_ID = 'default-tenant';

async function testScheduleUpdate() {
  console.log('🧪 Starting Schedule Update API Test...\n');

  try {
    // Step 1: Login
    console.log('1️⃣  Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      tenantId: TENANT_ID
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Get all ideas
    console.log('2️⃣  Fetching all ideas...');
    const ideasResponse = await axios.get(`${API_URL}/ideas`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const ideas = ideasResponse.data.data.ideas;
    console.log(`✅ Found ${ideas.length} ideas\n`);

    if (ideas.length === 0) {
      console.log('⚠️  No ideas found. Please create an idea first.\n');
      return;
    }

    // Step 3: Pick first idea for testing
    const testIdea = ideas[0];
    console.log(`3️⃣  Testing with idea: "${testIdea.title}"`);
    console.log(`   Current status: ${testIdea.status}`);
    console.log(`   Current scheduledFor: ${testIdea.scheduledFor || 'Not scheduled'}\n`);

    // Step 4: Update schedule - set to 2 hours from now (UTC)
    console.log('4️⃣  Updating schedule to 2 hours from now...');
    const futureTime = new Date();
    futureTime.setHours(futureTime.getHours() + 2);
    const scheduledForUTC = futureTime.toISOString();

    const updateResponse = await axios.put(
      `${API_URL}/ideas/${testIdea._id}`,
      {
        scheduledFor: scheduledForUTC,
        status: 'scheduled'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const updatedIdea = updateResponse.data.data.idea;
    console.log('✅ Schedule updated successfully');
    console.log(`   New status: ${updatedIdea.status}`);
    console.log(`   New scheduledFor (UTC): ${updatedIdea.scheduledFor}`);
    console.log(`   Local time: ${new Date(updatedIdea.scheduledFor).toLocaleString()}\n`);

    // Step 5: Verify the update by fetching the idea again
    console.log('5️⃣  Verifying update by fetching idea again...');
    const verifyResponse = await axios.get(`${API_URL}/ideas/${testIdea._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const verifiedIdea = verifyResponse.data.data.idea;
    console.log('✅ Verification successful');
    console.log(`   Status: ${verifiedIdea.status}`);
    console.log(`   ScheduledFor: ${verifiedIdea.scheduledFor}`);
    console.log(`   Matches update: ${verifiedIdea.scheduledFor === updatedIdea.scheduledFor ? '✅ YES' : '❌ NO'}\n`);

    // Step 6: Test clearing schedule (set to null)
    console.log('6️⃣  Testing schedule removal (set to null)...');
    const clearResponse = await axios.put(
      `${API_URL}/ideas/${testIdea._id}`,
      {
        scheduledFor: null,
        status: 'ai_generated'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const clearedIdea = clearResponse.data.data.idea;
    console.log('✅ Schedule cleared successfully');
    console.log(`   Status: ${clearedIdea.status}`);
    console.log(`   ScheduledFor: ${clearedIdea.scheduledFor || 'null (cleared)'}\n`);

    console.log('🎉 All tests passed! Schedule update API is working correctly.\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

// Run the test
testScheduleUpdate();

