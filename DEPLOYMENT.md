# Deployment Guide for Meta Webhook Server

## Quick Deploy Options

### 1. Railway (Recommended - Easy and Free)

1. Visit [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "Deploy from GitHub repo"
4. Connect this repository
5. Railway will auto-deploy your app
6. Set environment variables in Railway dashboard:
   - `VERIFY_TOKEN`: `your_unique_verify_token_12345`
   - `META_APP_SECRET`: (your Meta app secret)
7. Your webhook URL will be: `https://your-app-name.railway.app/webhook`

### 2. Render

1. Visit [render.com](https://render.com)
2. Create account and connect GitHub
3. Create new "Web Service"
4. Connect this repository
5. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add environment variables in Render dashboard
7. Your webhook URL will be: `https://your-app-name.onrender.com/webhook`

### 3. Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables:
   ```bash
   heroku config:set VERIFY_TOKEN=your_unique_verify_token_12345
   heroku config:set META_APP_SECRET=your_meta_app_secret
   ```
5. Deploy: `git push heroku main`
6. Your webhook URL will be: `https://your-app-name.herokuapp.com/webhook`

### 4. Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Set environment variables in Vercel dashboard
5. Your webhook URL will be: `https://your-app-name.vercel.app/webhook`

## Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your values:
   ```
   VERIFY_TOKEN=your_unique_verify_token_12345
   META_APP_SECRET=your_meta_app_secret
   PORT=3000
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run in development mode:
   ```bash
   npm run dev
   ```

5. For testing with Meta, use ngrok to expose local server:
   ```bash
   npx ngrok http 3000
   ```
   Then use the ngrok URL as your webhook URL.

## Environment Variables

- `VERIFY_TOKEN`: A secret token you create to verify webhook requests
- `META_APP_SECRET`: Your Meta app's secret key (optional, for signature verification)
- `PORT`: Port number (automatically set by most hosting platforms)
- `NODE_ENV`: Set to "production" for production deployments

## Security Notes

- Always use HTTPS in production (handled automatically by hosting platforms)
- Keep your `VERIFY_TOKEN` and `META_APP_SECRET` secure
- Never commit sensitive data to your repository