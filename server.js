const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
require('dotenv').config();

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
      webhook_events: 'POST /webhook'
    }
  });
});

// Webhook verification (GET)
app.get('/webhook', (req, res) => {
  console.log('Webhook verification request received');
  console.log('Full query object:', req.query);
  console.log('Request URL:', req.url);
  
  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
  
  console.log('Verification details:', { mode, token, challenge });
  
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
  console.log('Webhook event received');
  
  // Verify the request signature (if app secret is configured)
  if (APP_SECRET) {
    const signature = req.get('X-Hub-Signature-256');
    if (!signature) {
      console.log('No signature found in request');
      return res.sendStatus(401);
    }
    
    const expectedSignature = crypto
      .createHmac('sha256', APP_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    if (signature !== `sha256=${expectedSignature}`) {
      console.log('Invalid signature');
      return res.sendStatus(401);
    }
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
        // Instagram/Facebook Page events
        entry.changes.forEach(function(change) {
          console.log('Page change event:', change);
          handlePageChangeEvent(change);
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