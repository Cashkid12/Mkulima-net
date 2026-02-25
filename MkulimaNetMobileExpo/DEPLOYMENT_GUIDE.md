# MkulimaNet Mobile PWA Deployment Guide

## 🚀 Deploying to Vercel as a Progressive Web App

### Prerequisites
- Vercel account (https://vercel.com)
- Node.js installed
- Git repository for the project

### Step 1: Prepare Your Project

1. **Navigate to the mobile app directory:**
   ```bash
   cd MkulimaNetMobileExpo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Test the web version locally:**
   ```bash
   npm run web
   ```
   This will start the development server and open the web version in your browser.

### Step 2: Build for Production

1. **Build the static web version:**
   ```bash
   npm run build-web
   ```

2. **This creates a `dist` folder with all static assets ready for deployment**

### Step 3: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from the mobile app directory:**
   ```bash
   cd MkulimaNetMobileExpo
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? (your account)
   - Link to existing project? `N`
   - What's your project's name? `mkulimanet-mobile`
   - In which directory is your code located? `./`
   - Want to override the settings? `N`

#### Option B: Using Git and Vercel Dashboard

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Go to https://vercel.com/dashboard**

3. **Click "New Project"**

4. **Import your repository**

5. **Configure project settings:**
   - Framework Preset: `Other`
   - Root Directory: `MkulimaNetMobileExpo`
   - Build Command: `npm run build-web`
   - Output Directory: `dist`
   - Install Command: `npm install`

6. **Click "Deploy"**

### Step 4: Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add your environment variables:
   ```
   EXPO_PUBLIC_API_URL=your-backend-url
   EXPO_PUBLIC_ENV=production
   ```

### Step 5: PWA Features

Your MkulimaNet mobile app will have the following PWA capabilities:

✅ **Installable** - Users can install it on their devices
✅ **Offline Support** - Works offline with cached assets
✅ **Push Notifications** - Can receive notifications
✅ **App-like Experience** - Standalone display mode
✅ **Fast Loading** - Optimized performance
✅ **Responsive Design** - Works on all device sizes

### Step 6: Testing Your Deployed PWA

1. **Visit your deployed URL**
2. **Test installation:**
   - Chrome: Look for install icon in address bar
   - Mobile: Add to Home Screen option
3. **Test offline functionality**
4. **Verify all features work correctly**

### Custom Domain (Optional)

1. **In Vercel Dashboard:**
   - Go to **Settings** → **Domains**
   - Add your custom domain
   - Follow DNS configuration instructions

### Monitoring and Analytics

Add analytics to track PWA usage:
- Google Analytics
- Vercel Analytics
- Custom event tracking

### Troubleshooting

**Common Issues:**

1. **Build fails:**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check build logs in Vercel dashboard

2. **PWA not installing:**
   - Ensure HTTPS is enabled
   - Check manifest.json is properly generated
   - Verify service worker registration

3. **Performance issues:**
   - Optimize images and assets
   - Enable compression in Vercel settings
   - Use Vercel's Edge Network

### Next Steps

1. **Set up custom domain**
2. **Configure analytics**
3. **Test on multiple devices**
4. **Monitor performance**
5. **Set up CI/CD for automatic deployments**

Your MkulimaNet mobile app is now ready to be deployed as a full-featured Progressive Web App!