# 🚀 Deploy SkillBench OTP Backend to Vercel

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally
   ```bash
   npm install -g vercel
   ```

## 🔧 Deployment Steps

### 1. **Login to Vercel**
```bash
vercel login
```

### 2. **Navigate to Backend Directory**
```bash
cd backend-example
```

### 3. **Deploy to Vercel**
```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** → `Y`
- **Which scope?** → Select your account
- **Link to existing project?** → `N`
- **Project name?** → `skillbench-otp-backend` (or your preferred name)
- **In which directory?** → `./` (current directory)
- **Want to override settings?** → `N`

### 4. **Set Environment Variables**

After deployment, set your environment variables:

```bash
# Set your 2Factor.in API key
vercel env add TWOFACTOR_API_KEY

# When prompted, enter: 2cc822c8-dbe3-11ef-8b17-0200cd936042
# Choose: Production, Preview, and Development

# Set allowed origins (replace with your actual frontend URL)
vercel env add ALLOWED_ORIGINS

# Enter: https://your-frontend-domain.vercel.app,http://localhost:5173
```

### 5. **Redeploy with Environment Variables**
```bash
vercel --prod
```

## 🌐 **Get Your Backend URL**

After successful deployment, Vercel will give you URLs like:
- **Production**: `https://skillbench-otp-backend.vercel.app`
- **Preview**: `https://skillbench-otp-backend-git-main-yourusername.vercel.app`

## 🔄 **Update Your React App**

Update your React app's `.env` file with the Vercel URL:

```env
# Replace with your actual Vercel URL
VITE_BACKEND_URL=https://skillbench-otp-backend.vercel.app

# Keep test mode disabled
VITE_FORCE_TEST_MODE=false
```

## ✅ **Test Your Deployed Backend**

```bash
# Health check
curl https://your-vercel-url.vercel.app/health

# API key test
curl https://your-vercel-url.vercel.app/otpget

# Send OTP test
curl -X POST https://your-vercel-url.vercel.app/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'
```

## 🔧 **Troubleshooting**

### Common Issues:

1. **Environment Variables Not Working**
   ```bash
   # List all environment variables
   vercel env ls

   # Remove and re-add if needed
   vercel env rm TWOFACTOR_API_KEY
   vercel env add TWOFACTOR_API_KEY
   ```

2. **CORS Issues**
   - Make sure `ALLOWED_ORIGINS` includes your frontend domain
   - Update after deploying your React app

3. **Build Failures**
   ```bash
   # Check logs
   vercel logs

   # Redeploy
   vercel --prod
   ```

## 💰 **Cost Information**

- **Vercel Hobby Plan**: FREE
  - 100GB bandwidth per month
  - 100 serverless function invocations per day
  - Perfect for small to medium apps

- **Pro Plan**: $20/month (if you need more)
  - Unlimited bandwidth
  - Unlimited function invocations

For OTP authentication, the free plan should be more than sufficient!

## 🔄 **Continuous Deployment**

Connect your GitHub repository for automatic deployments:

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial backend setup"
   git branch -M main
   git remote add origin https://github.com/yourusername/skillbench-backend.git
   git push -u origin main
   ```

2. **Import in Vercel Dashboard**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Import Project"
   - Connect your GitHub repo
   - Vercel will auto-deploy on every push!

## 🎯 **Next Steps**

1. Deploy backend to Vercel
2. Get your Vercel URL
3. Update React app `VITE_BACKEND_URL`
4. Deploy React app (also free on Vercel/Netlify)
5. Update `ALLOWED_ORIGINS` with your React app URL
6. Test complete flow!

Your OTP authentication will be fully hosted and free! 🎉