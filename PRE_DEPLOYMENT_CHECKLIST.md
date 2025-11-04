# 📋 Pre-Deployment Verification Checklist

Use this checklist to ensure everything is ready before deploying to GitHub Pages.

## Part 1: Configuration Verification

### Package.json
- [ ] Open `package.json`
- [ ] Find the line: `"homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME"`
- [ ] Replace `YOUR_USERNAME` with your GitHub username
- [ ] Replace `YOUR_REPO_NAME` with your repository name
- [ ] Save the file

Example:
```json
"homepage": "https://akouvi.github.io/jack-portfolio"
```

### Git Repository
- [ ] Create a new repository on GitHub (https://github.com/new)
- [ ] Copy the repository URL
- [ ] Do NOT initialize with README, .gitignore, or license

## Part 2: Security Verification

### Check .env File
Run this command in your terminal:
```bash
git status
```

- [ ] Verify `.env` is NOT listed (it should be ignored)
- [ ] If you see `.env` in the output, STOP and check your `.gitignore`

### Verify No Secrets in Code
Run these commands:
```bash
# Check for API tokens (should find none in src/)
grep -r "CF_API_TOKEN" src/
grep -r "_4CLee" src/

# Check for account IDs (should find none in src/)
grep -r "CF_ACCOUNT" src/
```

- [ ] All commands above return "No matches found" or empty
- [ ] If you see matches, sensitive data is in your code - DO NOT DEPLOY YET

### Check Firebase Rules
- [ ] You have `firestore.rules` file
- [ ] Rules properly restrict access
- [ ] Rules have been deployed: `firebase deploy --only firestore:rules`

## Part 3: Local Testing

### Build Test
```bash
npm run build
```

- [ ] Build completes without errors
- [ ] Check `build/` folder was created
- [ ] Check `build/static/js/` contains bundle files

### Start Test (Optional)
```bash
npm start
```

- [ ] App opens in browser
- [ ] Authentication works
- [ ] No console errors
- [ ] Features work as expected
- [ ] Press Ctrl+C to stop

## Part 4: Git Setup

### Initialize Git (if needed)
```bash
git init
```

### Check Git Status
```bash
git status
```

Verify these files are NOT listed (should be ignored):
- [ ] `.env`
- [ ] `node_modules/`
- [ ] `.DS_Store`
- [ ] `.firebase/`

### Add and Commit
```bash
git add .
git commit -m "Initial commit - Ready for GitHub Pages deployment"
```

- [ ] Commit completes successfully
- [ ] No errors shown

### Add Remote
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

Replace with your actual repository URL!

- [ ] Command completes without error

### Push to GitHub
```bash
git branch -M main
git push -u origin main
```

- [ ] Push completes successfully
- [ ] Visit your repository on GitHub to verify files are there
- [ ] Check that `.env` is NOT visible on GitHub

## Part 5: Deploy to GitHub Pages

### Install gh-pages (if needed)
```bash
npm install --save-dev gh-pages
```

- [ ] Installation completes

### Deploy
```bash
npm run deploy
```

OR use the script:
```bash
chmod +x deploy-to-github.sh
./deploy-to-github.sh
```

- [ ] Build completes
- [ ] Deploy completes
- [ ] No errors shown
- [ ] You see "Published" message

## Part 6: GitHub Configuration

### Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings**
3. Scroll to **Pages** section
4. Under **Source**, select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
5. Click **Save**

- [ ] `gh-pages` branch is available in dropdown
- [ ] Source is set correctly
- [ ] Page shows URL where site will be published

## Part 7: Firebase Configuration

### Add Authorized Domain
1. Go to https://console.firebase.google.com
2. Select project: `jackcharlie-6d30b`
3. Go to **Authentication**
4. Click **Settings** tab
5. Scroll to **Authorized domains**
6. Click **Add domain**
7. Enter: `YOUR_USERNAME.github.io`
8. Click **Add**

- [ ] Domain added successfully
- [ ] Domain shows in list

## Part 8: Testing Deployed Site

### Wait for Deployment
- [ ] Wait 2-5 minutes for GitHub Pages to build

### Visit Your Site
URL: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`

- [ ] Site loads successfully
- [ ] No blank page
- [ ] Design looks correct

### Test Features
- [ ] Underground gate appears
- [ ] Can enter with code
- [ ] Navigation works
- [ ] Authentication modal opens
- [ ] Can sign in / sign up
- [ ] Playground loads
- [ ] No console errors

### Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for requests

- [ ] Firebase requests work
- [ ] No 404 errors for critical files
- [ ] No visible API tokens in requests

### Check Console
1. Open browser DevTools (F12)
2. Go to Console tab

- [ ] No red errors
- [ ] No authentication errors
- [ ] No CORS errors

## Part 9: Security Final Check

### Verify Secrets Are Hidden
1. Open DevTools (F12)
2. Go to Sources tab
3. Look for your JavaScript files
4. Search for these strings:

- [ ] `_4CLee` is NOT found (Cloudflare token)
- [ ] `d4a0b2cf` is NOT found (Cloudflare account ID)
- [ ] Firebase config IS found (this is okay!)

### What You Should See
In your JavaScript bundle, you SHOULD see:
```javascript
apiKey: "AIzaSyBrkhoyNyXvAAI4X3BUX_r8dDFcIQcAJWU"  // ✅ This is SAFE
projectId: "jackcharlie-6d30b"                     // ✅ This is SAFE
```

You should NOT see:
```javascript
CF_API_TOKEN: "_4CLee..."  // ❌ This is SECRET
CF_ACCOUNT_ID: "d4a0b2..."  // ❌ This is SECRET
```

- [ ] Firebase config is visible (expected and safe)
- [ ] Cloudflare credentials are NOT visible (good!)

## Part 10: Final Verification

### All Systems Go?
- [ ] Site is live and accessible
- [ ] Authentication works
- [ ] No security leaks
- [ ] No console errors
- [ ] All features functional
- [ ] Firestore rules deployed
- [ ] Firebase domain authorized

## 🎉 Deployment Complete!

If you checked all boxes, congratulations! Your site is:
- ✅ Deployed successfully
- ✅ Secure (no secrets exposed)
- ✅ Functional
- ✅ Ready for users

## Need to Update?

After making changes to your code:

1. Make your changes
2. Test locally: `npm start`
3. Commit: `git add . && git commit -m "Your message"`
4. Push: `git push`
5. Deploy: `npm run deploy`
6. Wait 2-5 minutes for changes to appear

## Issues?

If something didn't work:
- Check `DEPLOYMENT_GUIDE.md` for troubleshooting
- Review error messages carefully
- Verify all checkboxes are checked
- Double-check Firebase authorized domains
- Clear browser cache and try again

---

## Command Reference

For future deployments, you only need:
```bash
# After making changes
git add .
git commit -m "Update: description of changes"
git push
npm run deploy
```

That's it! Good luck! 🚀
