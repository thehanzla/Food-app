
const positionstackKey = '0b761834ced69a8b332c5deb3860a40a';
const apiipKey = '6c76cf47-193d-496e-bc00-94ecdc1882f1';

async function testApiip() {
  console.log('\n--- Testing Apiip ---');
  try {
    const url = `https://apiip.net/api/check?accessKey=${apiipKey}`;
    console.log(`Fetching: ${url}`);
    const res = await fetch(url);
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Apiip Error:', e.message);
  }
}

async function testPositionstack() {
  console.log('\n--- Testing Positionstack ---');
  try {
    // Positionstack free tier often requires HTTP, not HTTPS
    const url = `http://api.positionstack.com/v1/reverse?access_key=${positionstackKey}&query=40.7128,-74.0060`;
    console.log(`Fetching: ${url}`);
    const res = await fetch(url);
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Positionstack Error:', e.message);
  }
}

async function run() {
  await testApiip();
  await testPositionstack();
}

run();
