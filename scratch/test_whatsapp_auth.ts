import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Log variables with their lengths and surrounding quotes to check for spaces
console.log('WHATSAPP_ACCESS_TOKEN key exists:', 'WHATSAPP_ACCESS_TOKEN' in process.env);
console.log('WHATSAPP_ACCESS_TOKEN:', JSON.stringify(process.env.WHATSAPP_ACCESS_TOKEN));
console.log('WHATSAPP_PHONE_NUMBER_ID:', JSON.stringify(process.env.WHATSAPP_PHONE_NUMBER_ID));

// Check if keys have trailing spaces in process.env
const keys = Object.keys(process.env);
const whatsappKeys = keys.filter(k => k.toLowerCase().includes('whatsapp'));
console.log('WhatsApp keys in process.env:', whatsappKeys.map(k => JSON.stringify(k)));

async function testAuth() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  
  if (!token || !phoneId) {
    console.log('Missing credentials');
    return;
  }

  const endpoint = `https://graph.facebook.com/v25.0/${phoneId}/messages`;
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: '919999999999', // Dummy number
        type: 'template',
        template: {
          name: 'hello_world',
          language: { code: 'en_US' }
        }
      })
    });
    
    const data = await res.json();
    console.log('Status code:', res.status);
    console.log('Response body:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testAuth();
