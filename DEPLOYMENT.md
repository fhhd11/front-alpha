# Deployment Guide

This guide will help you deploy the Letta Chatbot to Railway.

## Prerequisites

- GitHub account
- Railway account (free tier available)
- Supabase project
- Backend server with Letta API proxy

## Step 1: Prepare Your Backend

Your backend server should:
- Support Supabase JWT authentication
- Have an endpoint `/api/v1/me` that returns user info including `agents` array
- Proxy all Letta API requests under `/api/v1/letta/{path}` with JWT validation
- Support streaming endpoints for real-time message delivery

## Step 2: Deploy to Railway

### 2.1 Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Sign in with your GitHub account
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your forked repository

### 2.2 Configure Environment Variables

In Railway dashboard, go to your project → Variables tab and add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
```

### 2.3 Deploy

1. Railway will automatically detect the Next.js project
2. It will use the `railway.json` configuration
3. The deployment will start automatically
4. Wait for the build to complete

### 2.4 Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

## Step 3: Verify Deployment

1. Open your Railway app URL
2. Test authentication with Supabase
3. Verify chat functionality
4. Check that reasoning messages display correctly

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Yes |
| `NEXT_PUBLIC_BACKEND_URL` | URL of your backend server | Yes |

## Troubleshooting

### Build Failures
- Check that all environment variables are set
- Verify Node.js version compatibility
- Check build logs in Railway dashboard

### Runtime Errors
- Verify backend server is accessible
- Check Supabase configuration
- Review application logs

### Performance Issues
- Monitor Railway metrics
- Consider upgrading to paid plan for better performance
- Optimize images and assets

## Support

For issues with:
- **Railway**: Check [Railway documentation](https://docs.railway.app)
- **Supabase**: Check [Supabase documentation](https://supabase.com/docs)
- **Letta**: Check [Letta documentation](https://docs.letta.com)
- **This project**: Open an issue on GitHub
