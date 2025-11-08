# Vercel Deployment Guide

## Prerequisites

1. Install Vercel CLI globally:

   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

## Environment Variables

Before deploying, you need to set up your environment variables in Vercel. You'll need:

- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Your JWT secret key
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `FRONTEND_URL` - Your frontend URL (for CORS)
- `NODE_ENV` - Set to "production"

### Add Environment Variables via CLI:

```bash
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_PUBLISHABLE_KEY
vercel env add FRONTEND_URL
```

Or add them via the Vercel Dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable for Production, Preview, and Development

## Deployment Steps

### First Deployment:

```bash
# Navigate to project directory
cd c:\Users\Favour Olaleru\Desktop\SWE\merrytext-backend

# Deploy to Vercel
vercel
```

Follow the prompts:

- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N** (first time)
- Project name? Press enter or type a name
- In which directory is your code located? **.**
- Want to override settings? **N**

### Production Deployment:

```bash
vercel --prod
```

## After Deployment

1. **Get your deployment URL**: Vercel will provide a URL like `https://your-project.vercel.app`

2. **Update Frontend**: Update your frontend to use the new API URL

3. **Test the API**:

   ```bash
   curl https://your-project.vercel.app/
   ```

4. **Check Logs**:
   ```bash
   vercel logs
   ```

## Important Notes

### MongoDB Connection

- Make sure your MongoDB Atlas allows connections from anywhere (0.0.0.0/0) or add Vercel's IP ranges
- In MongoDB Atlas: Network Access → Add IP Address → Allow Access from Anywhere

### Serverless Function Limitations

- Maximum execution time: 10 seconds (Hobby plan) / 60 seconds (Pro plan)
- Each request is a separate serverless function invocation
- Database connections are managed per request

### CORS Configuration

- Update your `FRONTEND_URL` environment variable to match your frontend domain
- For multiple origins, you may need to modify the CORS configuration

## Continuous Deployment

Vercel automatically deploys when you push to your Git repository:

1. **Connect Git Repository**:

   - Go to Vercel Dashboard
   - Import your GitHub/GitLab/Bitbucket repository
   - Select the branch to deploy (express)

2. **Auto-Deploy**:
   - Push to your repository
   - Vercel automatically builds and deploys

## Troubleshooting

### Check Logs:

```bash
vercel logs --follow
```

### Local Testing with Vercel Environment:

```bash
vercel dev
```

### Redeploy:

```bash
vercel --prod --force
```

## Useful Commands

- `vercel` - Deploy to preview
- `vercel --prod` - Deploy to production
- `vercel logs` - View deployment logs
- `vercel env ls` - List environment variables
- `vercel env pull` - Pull environment variables locally
- `vercel domains` - Manage custom domains
- `vercel alias` - Manage deployment aliases

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel

## Performance Tips

1. **Database Connection Pooling**: Already handled by Mongoose
2. **Environment Variables**: Keep sensitive data in Vercel environment variables
3. **Cold Starts**: First request may be slower; consider using a keep-alive service
4. **Caching**: Implement caching strategies for frequently accessed data

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
