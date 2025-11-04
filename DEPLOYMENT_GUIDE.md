# GitHub Pages Deployment Guide

## Overview
This guide will help you deploy your app to GitHub Pages while keeping sensitive information secure.

## Important Security Notes

### ✅ Firebase Config - Safe to Expose
Your Firebase configuration (API keys, project IDs, etc.) is **safe to be public**. Firebase security comes from:
- Firestore security rules
- Firebase Authentication
- Storage security rules

These are already configured in your `firestore.rules` and `database.rules.json` files.

### ⚠️ Cloudflare Credentials - Keep Secret
Your Cloudflare API tokens and account IDs should NEVER be in the frontend code. These should only be used in:
- Firebase Cloud Functions (backend)
- Server-side operations

## Pre-Deployment Checklist

### 1. Verify Firebase Security Rules
Make sure your `firestore.rules` properly restricts access:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Add other rules as needed
  }
}
```

### 2. Remove Cloudflare Credentials from Frontend
Cloudflare operations should only happen via Firebase Cloud Functions (which you already have set up).

### 3. Set up GitHub Repository
```bash
# Initialize git if not already done
git init

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

## Deployment Steps

### Step 1: Update package.json
Add homepage and deployment scripts to your `package.json`.

### Step 2: Install gh-pages
```bash
npm install --save-dev gh-pages
```

### Step 3: Build and Deploy
```bash
npm run build
npm run deploy
```

### Step 4: Configure GitHub Repository
1. Go to your repository settings
2. Navigate to Pages section
3. Set source to `gh-pages` branch
4. Your site will be available at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## Environment Variables

Since GitHub Pages is static hosting, environment variables are baked into the build. The Firebase config will be visible in your JavaScript bundle - this is normal and safe.

## Post-Deployment Verification

1. ✅ Test authentication flow
2. ✅ Verify Firestore read/write operations
3. ✅ Check that media uploads work (via Cloud Functions)
4. ✅ Confirm no Cloudflare credentials in browser console/network tab

## Troubleshooting

### Issue: Authentication not working
- Check Firebase Console > Authentication > Settings > Authorized domains
- Add your GitHub Pages domain: `YOUR_USERNAME.github.io`

### Issue: Blank page after deployment
- Check browser console for errors
- Verify `homepage` in package.json matches your GitHub Pages URL
- Check that `BrowserRouter` has correct `basename` prop

### Issue: 404 on page refresh
- GitHub Pages doesn't support client-side routing by default
- Add a `404.html` that redirects to `index.html` (handled automatically by this setup)
