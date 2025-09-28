# Meta Webhook Server

A Node.js Express server for handling Meta (Facebook, Instagram, WhatsApp) webhook events.

## 🚀 Quick Start

### For Meta App Configuration:

1. **Callback URL**: `https://your-deployed-app-domain.com/webhook`
2. **Verify Token**: `your_unique_verify_token_12345` (or your custom token)

### Deploy to Online Platform

Choose one of these platforms for free hosting:

- **Railway**: [Deploy to Railway](https://railway.app)
- **Render**: [Deploy to Render](https://render.com)
- **Heroku**: [Deploy to Heroku](https://heroku.com)
- **Vercel**: [Deploy to Vercel](https://vercel.com)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📋 Meta App Setup

1. Go to [Facebook Developer Console](https://developers.facebook.com/)
2. Select your app
3. Go to "Webhooks" section
4. Click "Add Callback URL"
5. Enter:
   - **Callback URL**: `https://your-app-name.platform.com/webhook`
   - **Verify Token**: `your_unique_verify_token_12345`
6. Subscribe to the events you need (messages, feed, comments, etc.)

## 🛡️ Security Features

- Webhook signature verification using Meta App Secret
- Token-based webhook verification
- Request validation and error handling
- Comprehensive logging for debugging

## 📦 What's Included

- ✅ Webhook verification endpoint (GET /webhook)
- ✅ Webhook event handler (POST /webhook)
- ✅ Facebook Messenger support
- ✅ Instagram webhook support
- ✅ Facebook Page webhook support
- ✅ WhatsApp webhook support
- ✅ Signature verification
- ✅ Error handling and logging
- ✅ Health check endpoint
- ✅ Ready for production deployment

## 🔧 Local Development

1. Clone this repository
2. Copy `.env.example` to `.env` and fill in your values
3. Run `npm install`
4. Run `npm run dev`
5. Use ngrok for local testing: `npx ngrok http 3000`

## 📝 Environment Variables

```env
VERIFY_TOKEN=your_unique_verify_token_12345
META_APP_SECRET=your_meta_app_secret
PORT=3000
NODE_ENV=production
```

## 🔄 Supported Webhook Events

- **Messenger**: Messages, postbacks, delivery receipts
- **Instagram**: Comments, mentions, story mentions
- **Facebook Pages**: Posts, comments, reactions
- **WhatsApp**: Messages, status updates

## 📞 Support

For Meta webhook documentation, visit: [Meta for Developers - Webhooks](https://developers.facebook.com/docs/webhooks/)

## 📄 License

MIT License - feel free to use this for your projects!