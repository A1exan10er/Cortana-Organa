const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
require('dotenv').config();

// Use built-in fetch (Node.js 18+) or fallback to node-fetch
const fetch = globalThis.fetch || require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'your_unique_verify_token_12345';
const APP_SECRET = process.env.META_APP_SECRET;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'Meta Webhook Server is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      webhook_verification: 'GET /webhook',
      webhook_events: 'POST /webhook',
      test_whatsapp: 'POST /test-whatsapp'
    },
    environment: {
      hasWhatsAppToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
      hasPhoneNumberId: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
      hasAppSecret: !!process.env.META_APP_SECRET
    }
  });
});

// Test endpoint for WhatsApp functionality
app.post('/test-whatsapp', (req, res) => {
  console.log('=== TESTING WHATSAPP FUNCTIONALITY ===');
  
  const testMessage = {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'test-entry',
      changes: [{
        field: 'messages',
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '1234567890',
            phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID || 'test-phone-id'
          },
          messages: [{
            from: '1234567890',
            id: 'test-message-id',
            timestamp: Date.now().toString(),
            text: {
              body: req.body.message || 'Hello, this is a test message!'
            },
            type: 'text'
          }]
        }
      }]
    }]
  };
  
  console.log('Simulating WhatsApp webhook with test data:', JSON.stringify(testMessage, null, 2));
  
  // Process the test message
  testMessage.entry.forEach(entry => {
    entry.changes.forEach(change => {
      if (change.field === 'messages') {
        handleWhatsAppEvent(change.value);
      }
    });
  });
  
  res.json({
    status: 'Test message processed',
    message: 'Check logs for WhatsApp processing details'
  });
});

// Webhook verification (GET)
app.get('/webhook', (req, res) => {
  console.log('Webhook verification request received');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  console.log('Full query object:', req.query);
  console.log('Raw query string:', req.url.split('?')[1] || 'No query string');
  
  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
  
  console.log('Parsed verification details:', { mode, token, challenge });
  
  // If no query parameters, this might be a health check
  if (!req.url.includes('?')) {
    console.log('No query parameters - likely a health check request');
    return res.status(200).json({
      status: 'Webhook endpoint is ready for verification',
      message: 'Send GET request with hub.mode, hub.verify_token, and hub.challenge parameters'
    });
  }
  
  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Respond with 200 OK and challenge token from the request
      console.log('Webhook verified successfully');
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      console.log('Webhook verification failed - token mismatch');
      res.sendStatus(403);
    }
  } else {
    console.log('Webhook verification failed - missing parameters');
    res.sendStatus(400);
  }
});

// Webhook events (POST)
app.post('/webhook', (req, res) => {
  console.log('=== WEBHOOK POST EVENT RECEIVED ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('User-Agent:', req.get('User-Agent'));
  
  // Verify the request signature (if app secret is configured)
  if (APP_SECRET) {
    const signature = req.get('X-Hub-Signature-256');
    if (!signature) {
      console.log('No signature found in request - proceeding without verification');
      console.log('NOTE: Set META_APP_SECRET environment variable for signature verification');
    } else {
      const expectedSignature = crypto
        .createHmac('sha256', APP_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex');
      
      if (signature !== `sha256=${expectedSignature}`) {
        console.log('Invalid signature - rejecting request');
        return res.sendStatus(401);
      } else {
        console.log('Signature verified successfully');
      }
    }
  } else {
    console.log('META_APP_SECRET not configured - skipping signature verification');
  }
  
  let body = req.body;
  console.log('Webhook payload:', JSON.stringify(body, null, 2));
  
  // Check if this is a page subscription
  if (body.object) {
    // Process the webhook payload
    body.entry.forEach(function(entry) {
      console.log('Processing entry:', entry.id);
      
      // Handle different types of webhook events
      if (entry.messaging) {
        // Facebook Messenger
        entry.messaging.forEach(function(event) {
          console.log('Messenger event:', event);
          handleMessengerEvent(event);
        });
      }
      
      if (entry.changes) {
        // Instagram/Facebook Page events or WhatsApp Business API
        entry.changes.forEach(function(change) {
          console.log('Page change event:', change);
          if (change.field === 'messages') {
            // Handle WhatsApp messages
            handleWhatsAppEvent(change.value);
          } else {
            handlePageChangeEvent(change);
          }
        });
      }
    });
    
    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Handle Facebook Messenger events
function handleMessengerEvent(event) {
  const senderId = event.sender.id;
  const recipientId = event.recipient.id;
  const timestamp = event.timestamp;
  
  if (event.message) {
    console.log(`Message from ${senderId}: ${event.message.text}`);
    // Add your message processing logic here
  }
  
  if (event.postback) {
    console.log(`Postback from ${senderId}: ${event.postback.payload}`);
    // Add your postback processing logic here
  }
}

// Handle Page change events (Instagram, Facebook Page)
function handlePageChangeEvent(change) {
  const field = change.field;
  const value = change.value;
  
  console.log(`Page change in field: ${field}`);
  
  switch (field) {
    case 'feed':
      console.log('Feed update:', value);
      break;
    case 'comments':
      console.log('Comment update:', value);
      break;
    case 'messages':
      console.log('Message update:', value);
      break;
    default:
      console.log('Unhandled field:', field, value);
  }
}

// Handle WhatsApp Business API events
async function handleWhatsAppEvent(value) {
  console.log('WhatsApp event received:', JSON.stringify(value, null, 2));
  
  // Check if there are messages in the webhook
  if (value.messages && value.messages.length > 0) {
    const message = value.messages[0];
    const from = message.from; // Phone number of sender
    const messageType = message.type;
    
    console.log(`WhatsApp message from ${from}, type: ${messageType}`);
    
    // Handle different message types
    if (messageType === 'text') {
      const userMessage = message.text.body;
      console.log(`Text message: "${userMessage}"`);
      
      // Generate and send response
      await sendWhatsAppResponse(from, userMessage);
    } else if (messageType === 'image') {
      console.log('Received image message');
      await sendWhatsAppResponse(from, 'Thanks for the image! 📸');
    } else if (messageType === 'document') {
      console.log('Received document message');
      await sendWhatsAppResponse(from, 'Thanks for the document! 📄');
    } else {
      console.log(`Received ${messageType} message`);
      await sendWhatsAppResponse(from, 'Thanks for your message! 👍');
    }
  }
  
  // Handle message status updates (delivered, read, etc.)
  if (value.statuses && value.statuses.length > 0) {
    const status = value.statuses[0];
    console.log(`Message status update: ${status.status} for message ${status.id}`);
  }
}

// Send WhatsApp response message
async function sendWhatsAppResponse(to, userMessage) {
  const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.error('WhatsApp credentials not configured');
    return;
  }
  
  // Generate intelligent response based on user message
  const responseMessage = generateResponse(userMessage);
  
  const messageData = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'text',
    text: {
      body: responseMessage
    }
  };
  
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('WhatsApp message sent successfully:', result);
    } else {
      console.error('Failed to send WhatsApp message:', result);
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
  }
}

// Generate intelligent responses based on user input
function generateResponse(userMessage) {
  const message = userMessage.toLowerCase().trim();
  
  // Greeting responses
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return '👋 Hello! How can I help you today?';
  }
  
  // Help/support requests
  if (message.includes('help') || message.includes('support')) {
    return '🆘 I\'m here to help! You can ask me questions or just chat. What would you like to know?';
  }
  
  // Thank you responses
  if (message.includes('thank') || message.includes('thanks')) {
    return '😊 You\'re welcome! Is there anything else I can help you with?';
  }
  
  // Goodbye responses
  if (message.includes('bye') || message.includes('goodbye') || message.includes('see you')) {
    return '👋 Goodbye! Feel free to message me anytime!';
  }
  
  // Time/date requests
  if (message.includes('time') || message.includes('date')) {
    const now = new Date();
    return `🕒 Current time: ${now.toLocaleString()}`;
  }
  
  // Weather requests (mock response)
  if (message.includes('weather')) {
    return '🌤️ I don\'t have real-time weather data, but I hope it\'s a beautiful day where you are!';
  }
  
  // Business hours
  if (message.includes('hours') || message.includes('open')) {
    return '🕐 We\'re available 24/7 through this WhatsApp bot! How can I assist you?';
  }
  
  // Default response with echo
  return `I received your message: "${userMessage}"\n\n🤖 This is an automated response. How can I help you further?`;
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Meta Webhook Server is running on port ${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`Verify Token: ${VERIFY_TOKEN}`);
  console.log('Make sure to set your environment variables for production!');
});

module.exports = app;