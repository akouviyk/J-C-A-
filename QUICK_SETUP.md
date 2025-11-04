# Quick Reference: Cloudflare Upload Implementation

## 🎯 What Changed

### Before

- ❌ Direct API calls from browser → CORS errors
- ❌ API tokens exposed in client code
- ❌ Base64 fallbacks stored in Firestore
- ❌ Firebase Storage as backup

### After

- ✅ Firebase Functions proxy → No CORS
- ✅ API tokens secure on server
- ✅ Only Cloudflare URLs in Firestore
- ✅ No fallback storage methods

---

## 📁 New Files

```
/functions/
  ├── package.json          # Function dependencies
  └── index.js              # Cloud Functions implementation

/firebase.json              # Firebase configuration
/CLOUDFLARE_UPLOAD_FIX.md  # Complete setup guide
/.env.example               # Environment variables template

```

---

## 🔧 Modified Files

### src/utils/cloudflareImages.js

**Changed:** Calls Firebase Function instead of Cloudflare API directly
**Key method:** `uploadToCloudflareImages(file, name, metadata)`

### src/utils/cloudflareStream.js

**Changed:** Calls Firebase Function instead of Cloudflare API directly
**Key method:** `uploadToCloudflareStream(file, name, metadata)`

### src/services/contentService.js

**Changed:**

- Removed all base64 fallbacks
- Removed Firebase Storage imports
- Added base64 URL validation
- Only saves external URLs to Firestore

**Key changes:**

- `uploadMediaFile()` - No more fallbacks
- `saveContentItem()` - Rejects base64 URLs
- `isBase64Url()` - New validation helper

---

## 🚀 Setup Commands

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Initialize Functions (if needed)
firebase init functions

# 4. Install dependencies
cd functions && npm install && cd ..

# 5. Set Cloudflare credentials
firebase functions:config:set \
  cloudflare.account_id="YOUR_ACCOUNT_ID" \
  cloudflare.api_token="YOUR_API_TOKEN" \
  cloudflare.account_hash="YOUR_ACCOUNT_HASH" \
  cloudflare.customer_subdomain="YOUR_SUBDOMAIN"

# 6. Deploy functions
firebase deploy --only functions

# 7. Update .env
echo "REACT_APP_FUNCTIONS_URL=https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net" >> .env

# 8. Restart app
npm start
```

---

## 🔐 Environment Variables

### Frontend (.env)

```bash
REACT_APP_FUNCTIONS_URL=https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net
REACT_APP_CF_CUSTOMER_SUBDOMAIN=customer-egd8wletnhjj8i2u
```

### Backend (Firebase Config)

```bash
cloudflare.account_id=...
cloudflare.api_token=...
cloudflare.account_hash=...
cloudflare.customer_subdomain=...
```

---

## 📊 Upload Flow

```
1. User selects file in Playground.js
   ↓
2. File converted to base64 (for transmission only)
   ↓
3. Frontend calls Firebase Function with:
   - File data (base64)
   - File name
   - Metadata
   - Auth token
   ↓
4. Firebase Function:
   - Verifies authentication
   - Converts base64 to buffer
   - Uploads to Cloudflare
   - Returns URLs
   ↓
5. Frontend receives:
   - url
   - thumbnailUrl
   - mediaId
   - embedUrl
   ↓
6. contentService validates URLs
   ↓
7. Only external URLs saved to Firestore
```

---

## 🧪 Testing Checklist

```bash
# Check functions deployed
firebase functions:list

# Check function logs
firebase functions:log

# Test image upload
1. Open app
2. Login
3. Click "+"
4. Select "PHOTO"
5. Choose image file
6. Wait for success message

# Verify in Firestore
1. Open Firebase Console
2. Go to Firestore
3. Check americanparadisevault collection
4. Verify document contains:
   ✅ url: "https://imagedelivery.net/..."
   ✅ thumbnailUrl: "https://imagedelivery.net/..."
   ✅ storage: "cloudflare-images"
   ❌ NO base64 data
   ❌ NO data:image/... URLs
```

---

## 🐛 Common Issues

### CORS Error

**Problem:** Still getting CORS errors  
**Solution:**

- Ensure functions are deployed
- Check REACT_APP_FUNCTIONS_URL in .env
- Clear browser cache
- Restart dev server

### Authentication Error

**Problem:** "User must be authenticated"  
**Solution:** Login before uploading

### Upload Timeout

**Problem:** Function times out on large files  
**Solution:** Video function has 9min timeout, check file size

### Base64 in Firestore

**Problem:** Still seeing base64 data  
**Solution:**

- Run migration: `node src/scripts/cleanBase64Data.js`
- Ensure using updated contentService.js

---

## 📝 Code Snippets

### Check if URL is base64 (JavaScript)

```javascript
const isBase64Url = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('data:') || url.includes('base64');
};
```

### Upload Image (Frontend)

```javascript
import { uploadMediaFile } from '../services/contentService';

const result = await uploadMediaFile(file, 'photo');
if (result.success) {
  console.log('URL:', result.url);
  console.log('Thumbnail:', result.thumbnailUrl);
}
```

### Save to Firestore (Frontend)

```javascript
import { saveContentItem } from '../services/contentService';

const item = {
  type: 'photo',
  content: {
    url: result.url,
    thumbnailUrl: result.thumbnailUrl,
    mediaId: result.mediaId,
    storage: 'cloudflare-images',
  },
  // ... other fields
};

const docId = await saveContentItem(item, user);
```

---

## 🔗 Resources

- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Cloudflare Images API](https://developers.cloudflare.com/images/)
- [Cloudflare Stream API](https://developers.cloudflare.com/stream/)
- [Setup Guide](./CLOUDFLARE_UPLOAD_FIX.md)

---

## 💡 Tips

1. **Always test with small files first** (< 1MB)
2. **Check function logs** when debugging: `firebase functions:log`
3. **Monitor Cloudflare usage** in dashboard
4. **Set file size limits** in frontend before upload
5. **Add progress indicators** for better UX
6. **Run migration script** to clean old data

---

## 📞 Need Help?

1. Check Firebase Functions logs: `firebase functions:log`
2. Check browser console for errors
3. Verify all env variables are set
4. Read full setup guide: `CLOUDFLARE_UPLOAD_FIX.md`
