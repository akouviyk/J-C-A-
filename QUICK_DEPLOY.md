# 🚀 Quick Deployment Steps

## Before You Start

### 1. Update package.json Homepage
Open `package.json` and replace this line:
```json
"homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME",
```

With your actual GitHub details, for example:
```json
"homepage": "https://akouvi.github.io/jack-portfolio",
```

### 2. Create GitHub Repository
1. Go to https://github.com/new
2. Create a new repository (e.g., `jack-portfolio`)
3. **DO NOT** initialize with README, .gitignore, or license
4. Copy the repository URL

## Deployment Commands

Run these commands in your terminal from the project directory:

```bash
# 1. Install gh-pages if not already installed
npm install --save-dev gh-pages

# 2. Initialize git (if not already done)
git init

# 3. Add all files
git add .

# 4. Make initial commit
git commit -m "Initial commit - Ready for deployment"

# 5. Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 6. Push to main branch
git branch -M main
git push -u origin main

# 7. Build and deploy to GitHub Pages
npm run deploy
```

Alternatively, you can use the deployment script:
```bash
# Make script executable
chmod +x deploy-to-github.sh

# Run deployment script
./deploy-to-github.sh
```

## Post-Deployment Configuration

### Configure GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings**
3. Scroll down to **Pages** section
4. Under **Source**, select `gh-pages` branch
5. Click **Save**

### Add Domain to Firebase
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (`jackcharlie-6d30b`)
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Add: `YOUR_USERNAME.github.io`
6. Click **Add**

## Verify Deployment

Your site will be available at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME
```

It may take 2-5 minutes for GitHub Pages to build and deploy your site.

## Troubleshooting

### Authentication Not Working
- Check that you added your GitHub Pages domain to Firebase authorized domains
- Clear browser cache and try again
- Check browser console for errors

### Blank Page
- Verify the `homepage` field in `package.json` matches your GitHub Pages URL exactly
- Check browser console for errors
- Make sure the build completed successfully

### 404 Errors
- Make sure you're using the correct URL
- Wait a few minutes for GitHub Pages to update
- Check that the `gh-pages` branch exists in your repository

## Updating Your Site

After making changes, deploy again with:
```bash
npm run deploy
```

This will automatically build and push changes to GitHub Pages.

## Security Checklist ✅

- ✅ Firebase config is public (safe - security is in the rules)
- ✅ Cloudflare credentials are NOT in the frontend code
- ✅ `.env` file is in `.gitignore`
- ✅ Sensitive data stays in Firebase Cloud Functions
- ✅ Firestore rules protect your data
- ✅ Firebase Authentication controls access

## What Gets Deployed

When you run `npm run deploy`, the following happens:
1. `npm run build` creates an optimized production build
2. Firebase config from `.env` is baked into the JavaScript bundle (safe!)
3. The `build` folder is deployed to the `gh-pages` branch
4. GitHub Pages serves the static files

## Important Notes

🔒 **Firebase API Keys**: Your Firebase API keys in the code are SAFE to be public. They identify your Firebase project, but cannot be used maliciously because:
- Firestore rules control data access
- Authentication controls user actions
- Storage rules control file access

⚠️ **Cloudflare**: Your Cloudflare credentials should NEVER be in frontend code. They should only be in:
- Firebase Cloud Functions (backend)
- The `.env` file (which is gitignored)

## Need Help?

Common issues and solutions are in `DEPLOYMENT_GUIDE.md`
