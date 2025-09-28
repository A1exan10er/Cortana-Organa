# WhatsApp Business API Setup Guide

## 🎯 Overview
This guide helps you configure WhatsApp Business API to enable two-way messaging between your bot and WhatsApp users.

## 📋 Prerequisites
1. ✅ Meta Developer Account
2. ✅ Facebook Business Manager Account
3. ✅ WhatsApp Business Account
4. ✅ Webhook server deployed (your Render app)

## 🚀 Step-by-Step Setup

### Step 1: Access WhatsApp Business API
1. Go to [Facebook Developer Console](https://developers.facebook.com/)
2. Select your app
3. In the left sidebar, find **"WhatsApp"** → **"API Setup"**
4. If not available, click **"Add Product"** → **"WhatsApp"** → **"Set up"**

### Step 2: Get Your Access Token
1. In the WhatsApp API Setup page
2. Find **"Temporary access token"** section
3. **Copy the access token** (starts with `EAA...`)
4. **Important**: This is temporary (24 hours), you'll need to create a permanent one later

### Step 3: Get Your Phone Number ID
1. In the same WhatsApp API Setup page
2. Find **"Phone numbers"** section
3. **Copy the Phone Number ID** (long numeric ID, not the actual phone number)

### Step 4: Configure Webhook
1. In WhatsApp API Setup, find **"Webhooks"** section
2. Click **"Configure webhooks"**
3. **Callback URL**: `https://cortana-organa-40e6.onrender.com/webhook`
4. **Verify Token**: `a_unique_verify_token_12345678`
5. **Webhook fields**: Check ✅ **"messages"**
6. Click **"Verify and save"**

### Step 5: Update Environment Variables in Render
1. Go to your Render dashboard
2. Select your `cortana-organa` service
3. Go to **"Environment"** tab
4. Add these variables:
   ```
   WHATSAPP_ACCESS_TOKEN=EAA... (your token from Step 2)
   WHATSAPP_PHONE_NUMBER_ID=123456... (your ID from Step 3)
   ```
5. Click **"Save Changes"** (this will redeploy your app)

### Step 6: Test Your Setup
1. In WhatsApp API Setup page, find **"Send and receive messages"**
2. Use the **"Send a test message"** feature
3. Send a message to the test number provided
4. Check your Render logs to see if the webhook receives the message

## 🔧 Environment Variables Summary

Add these to your Render dashboard:

```env
# Existing variables
VERIFY_TOKEN=a_unique_verify_token_12345678
META_APP_SECRET=your_meta_app_secret

# New WhatsApp variables
WHATSAPP_ACCESS_TOKEN=EAA...your_temporary_or_permanent_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

## 🤖 Bot Features

Your WhatsApp bot now supports:

### Automatic Responses:
- **Greetings**: "Hello", "Hi" → Friendly welcome
- **Help**: "Help", "Support" → Assistance message
- **Thanks**: "Thank you" → Polite acknowledgment
- **Goodbye**: "Bye", "Goodbye" → Farewell message
- **Time**: "What time" → Current timestamp
- **Weather**: "Weather" → Fun weather response
- **Business Hours**: "Hours", "Open" → Availability info
- **Default**: Echo message + helpful response

### Message Types Supported:
- ✅ Text messages
- ✅ Images (with acknowledgment)
- ✅ Documents (with acknowledgment)
- ✅ Other media types (generic response)

## 🔒 Security & Production

### For Production Use:
1. **Create Permanent Access Token**:
   - Go to **Business Manager** → **Business Settings**
   - **Accounts** → **WhatsApp Business Accounts**
   - Select your account → **API Access**
   - Generate permanent token

2. **Verify Your Business**:
   - Complete Meta Business Verification
   - This removes API limitations

3. **Phone Number Verification**:
   - Verify your WhatsApp Business phone number
   - Required for sending messages to users

## 🧪 Testing Flow

1. **Send webhook verification** ✅ (Already done)
2. **Deploy updated code** (happens automatically)
3. **Send test message** from WhatsApp API Setup
4. **Check Render logs** for incoming webhooks
5. **Verify bot responds** to the test number
6. **Test with real WhatsApp** once approved

## 📞 Support

If you encounter issues:
- Check Render logs for errors
- Verify environment variables are set correctly
- Ensure webhook URL is accessible
- Confirm access token hasn't expired

## 📖 Documentation Links
- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Webhook Setup Guide](https://developers.facebook.com/docs/whatsapp/webhooks)
- [Message Templates](https://developers.facebook.com/docs/whatsapp/message-templates)