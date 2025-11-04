# American Paradise Vault - Cloudflare Storage Setup

## 🎯 Overview

All media assets for the portfolio are stored in Cloudflare services and cataloged in Firebase Firestore under the **`americanparadisevault`** collection.

### Storage Distribution

| Content Type | Storage Service | Purpose |
|--------------|----------------|---------|
| Images (photos, drawings, architecture) | **Cloudflare Images** | Automatic optimization, variants, CDN delivery |
| Videos | **Cloudflare Stream** | Adaptive streaming, automatic transcoding |
| Audio (music) | **Cloudflare R2** | Object storage for audio files |
| Documents (PDFs, text) | **Cloudflare R2** | Document storage |

## 📦 What Gets Saved Where

### Cloudflare Services (Media Storage)
- **Cloudflare Images**: All image files with automatic variants
- **Cloudflare Stream**: All video files with adaptive streaming
- **Cloudflare R2**: Audio files and documents

### Firebase Firestore (Metadata Database)
Collection: **`americanparadisevault`**

Each document contains:
```javascript
{
  // Identification
  id: "auto-generated-firestore-id",
  mediaId: "cloudflare-media-id",
  
  // Content info
  type: "photo|video|drawing|music|writing|architecture",
  category: "images|videos|audio|documents",
  title: "Filename or custom title",
  
  // Cloudflare URLs
  storage: "cloudflare-images|cloudflare-stream|cloudflare-r2|local",
  url: "https://...",              // Primary URL
  thumbnailUrl: "https://...",     // Thumbnail URL
  embedUrl: "https://...",         // Embed URL (videos)
  
  // Image variants (Cloudflare Images only)
  variants: [...],
  largeUrl: "https://...",
  mediumUrl: "https://...",
  smallUrl: "https://...",
  
  // Video-specific (Cloudflare Stream only)
  dashUrl: "https://...",
  duration: 120,
  status: "ready",
  
  // R2-specific
  r2Key: "audio/music-123.mp3",
  
  // Visual properties (for Playground)
  shape: "circle|square|diamond|...",
  size: 200,
  rotation: 15,
  position: { x: 100, y: 200 },
  bgColor: "hsl(180, 50%, 92%)",
  
  // File metadata
  fileName: "original-name.jpg",
  fileType: "image/jpeg",
  fileSize: 1024000,
  isPlaceholder: false,
  
  // User info
  createdBy: {
    uid: "firebase-user-id",
    email: "user@example.com",
    displayName: "User Name"
  },
  
  // Timestamps
  createdAt: Firestore Timestamp,
  updatedAt: Firestore Timestamp,
  
  // Organization
  collection: "americanparadisevault",
  year: "2024",
  active: true,
  visibility: "public|private|unlisted"
}
```

## 🚀 Setup Instructions

### 1. Cloudflare Images Setup

**Already configured!** ✅

Your credentials are in `.env`:
```env
REACT_APP_CF_ACCOUNT_ID=d4a0b2cf68aae5e594a5ceaeb0cba018
REACT_APP_CF_API_TOKEN=_4CLeeLUzscDS57mSkB4Rr0WIt9Y0NcsSQUPiwOL
REACT_APP_CF_ACCOUNT_HASH=lzEB4WEiwuaDooGpiwwqdQ
```

**Image URLs format:**
- Public: `https://imagedelivery.net/{ACCOUNT_HASH}/{IMAGE_ID}/public`
- Thumbnail: `https://imagedelivery.net/{ACCOUNT_HASH}/{IMAGE_ID}/thumbnail`
- Custom variants: Create in Cloudflare dashboard

**Create custom variants (optional):**
1. Go to Cloudflare Dashboard → Images → Variants
2. Create variants: `large`, `medium`, `small`
3. Set dimensions (e.g., large: 1920px, medium: 1024px, small: 640px)

### 2. Cloudflare Stream Setup

**Already configured!** ✅

Your credentials are in `.env`:
```env
REACT_APP_CF_CUSTOMER_SUBDOMAIN=customer-egd8wletnhjj8i2u
```

**Video URLs format:**
- HLS: `https://{SUBDOMAIN}.cloudflarestream.com/{VIDEO_ID}/manifest/video.m3u8`
- Embed: `https://{SUBDOMAIN}.cloudflarestream.com/{VIDEO_ID}/iframe`
- Thumbnail: `https://{SUBDOMAIN}.cloudflarestream.com/{VIDEO_ID}/thumbnails/thumbnail.jpg`

**Stream features:**
- Automatic transcoding to multiple qualities
- Adaptive bitrate streaming
- No egress fees
- Built-in player

### 3. Cloudflare R2 Setup (For Audio/Documents)

**Needs setup** ⚠️

#### Option A: Using Cloudflare Worker (Recommended)

Follow the detailed guide in `CLOUDFLARE_R2_WORKER_SETUP.md`

Quick steps:
```bash
# 1. Install Wrangler
npm install -g wrangler

# 2. Login
wrangler login

# 3. Create bucket
wrangler r2 bucket create americanparadisevault

# 4. Deploy worker (see CLOUDFLARE_R2_WORKER_SETUP.md)
wrangler deploy
```

#### Option B: Using Presigned URLs

Create a backend endpoint that generates presigned URLs for uploads.

#### Option C: Local Storage Fallback

If R2 is not set up, audio files will be stored as base64 in the browser (not recommended for production).

### 4. Firebase Firestore Setup

**Already configured!** ✅

Collection `americanparadisevault` is automatically created when you upload your first item.

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // americanparadisevault collection
    match /americanparadisevault/{document} {
      // Anyone can read
      allow read: if true;
      
      // Only authenticated users can write
      allow create: if request.auth != null;
      
      // Only the creator can update/delete
      allow update, delete: if request.auth != null 
        && request.auth.uid == resource.data.createdBy.uid;
    }
  }
}
```

## 🔄 Upload Flow

### Frontend Upload Process

```javascript
// 1. User selects file
const file = event.target.files[0];

// 2. Upload to Cloudflare
const result = await uploadMediaFile(file, contentType);
// → Image goes to Cloudflare Images
// → Video goes to Cloudflare Stream  
// → Audio goes to Cloudflare R2

// 3. Save metadata to Firebase
const firestoreId = await saveContentItem({
  type: contentType,
  content: {
    mediaId: result.mediaId,
    url: result.url,
    thumbnailUrl: result.thumbnailUrl,
    storage: result.storage,
    // ... other data
  }
}, user);

// 4. Display in UI
```

### Backend/Worker Upload Process (R2)

```javascript
// 1. Frontend sends file as base64
const base64Data = await fileToBase64(file);

// 2. Worker uploads to R2
fetch('https://your-worker.workers.dev/upload', {
  method: 'POST',
  body: JSON.stringify({
    bucket: 'americanparadisevault',
    key: `audio/${filename}`,
    data: base64Data,
    contentType: file.type
  })
});

// 3. Worker returns public URL
// 4. Frontend saves URL to Firebase
```

## 📊 Monitoring & Management

### View Uploaded Content

**Cloudflare Dashboard:**
- Images: Dashboard → Images
- Stream: Dashboard → Stream
- R2: Dashboard → R2

**Firebase Console:**
- Firestore: Select project → Firestore Database → `americanparadisevault`

### Statistics

Get vault statistics:
```javascript
import { getVaultStatistics } from './services/contentService';

const stats = await getVaultStatistics();
console.log(stats);
// {
//   total: 150,
//   byType: { photo: 80, video: 30, music: 20, ... },
//   byCategory: { images: 100, videos: 30, audio: 20 },
//   byStorage: { 'cloudflare-images': 100, 'cloudflare-stream': 30, ... },
//   byYear: { '2024': 150 }
// }
```

## 💰 Cost Estimation

### Cloudflare Images
- **Storage**: $5/month per 100,000 images
- **Delivery**: $1/month per 100,000 delivered images
- First 100,000 images delivered/month: **FREE**

**Estimate for portfolio:**
- 500 images stored: ~$2.50/month
- 10,000 deliveries/month: **FREE**

### Cloudflare Stream
- **Storage**: $5/month per 1,000 minutes
- **Delivery**: $1/month per 1,000 minutes watched
- First 1,000 minutes watched/month: **FREE**

**Estimate for portfolio:**
- 100 minutes of video: $0.50/month
- 5,000 minutes watched/month: $4/month (after free tier)

### Cloudflare R2
- **Storage**: $0.015/GB/month
- **Class A Operations**: $4.50/million
- **Class B Operations**: $0.36/million
- **Egress**: **FREE** (no data transfer fees!)

**Estimate for portfolio:**
- 10 GB storage (audio/docs): $0.15/month
- 10,000 reads: $0.004/month

**Total estimated cost: ~$7-10/month** for a full portfolio with hundreds of images, hours of video, and audio files.

## 🔒 Security Best Practices

1. **Never expose API tokens in frontend**
   - Tokens are in `.env` which is gitignored
   - Only send to Cloudflare from backend/worker

2. **Use Firestore Security Rules**
   - Only authenticated users can upload
   - Only creators can delete their content

3. **Implement rate limiting** (optional)
   - Limit uploads per user per hour
   - Prevent abuse

4. **Validate file types**
   - Check MIME types before upload
   - Set maximum file sizes

5. **Use signed URLs for sensitive content**
   - For private videos: `requireSignedURLs: true`
   - Generate signed tokens server-side

## 🛠️ Maintenance

### Cleanup Old Files

Delete from both Cloudflare and Firebase:
```javascript
// Get item from Firebase
const item = await getContentById(itemId);

// Delete from Cloudflare
if (item.storage === 'cloudflare-images') {
  await deleteCloudflareImage(item.mediaId);
} else if (item.storage === 'cloudflare-stream') {
  await deleteCloudflareStreamVideo(item.mediaId);
} else if (item.storage === 'cloudflare-r2') {
  await deleteFromCloudflareR2(item.r2Key);
}

// Delete from Firebase
await deleteContentItem(itemId);
```

### Bulk Operations

List all content in vault:
```javascript
const allContent = await getAllContent();
console.log(`Total items: ${allContent.length}`);

// Filter by type
const videos = allContent.filter(item => item.type === 'video');
const images = allContent.filter(item => item.category === 'images');
```

## 🐛 Troubleshooting

**Upload fails:**
- Check API tokens are correct
- Verify network connection
- Check file size limits (Images: 10MB, Stream: 5GB)

**URLs don't work:**
- Verify account hash is correct
- Check if content is publicly accessible
- Ensure CORS is configured

**R2 uploads fail:**
- Deploy the Cloudflare Worker
- Check worker URL in `.env`
- Verify bucket name is correct

**Firebase saves but Cloudflare fails:**
- Items will have `storage: 'local'`
- Re-upload to Cloudflare manually
- Update Firebase document with new URLs

## 📚 Additional Resources

- [Cloudflare Images Docs](https://developers.cloudflare.com/images/)
- [Cloudflare Stream Docs](https://developers.cloudflare.com/stream/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Firebase Firestore Docs](https://firebase.google.com/docs/firestore)

## ✅ Quick Test

Test your setup:
```javascript
// In browser console after uploading a file:
import { getVaultStatistics } from './services/contentService';

const stats = await getVaultStatistics();
console.log('Vault contains:', stats);

// Check Cloudflare
// → Dashboard → Images / Stream / R2

// Check Firebase
// → Console → Firestore → americanparadisevault collection
```

---

**🎉 You're all set!** Your media is now stored in Cloudflare and cataloged in the `americanparadisevault` Firebase collection.
