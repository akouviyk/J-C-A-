# 🎨 American Paradise Vault - Quick Reference

## 📍 Collection Name
**`americanparadisevault`** - All media metadata stored here in Firebase Firestore

## 🗂️ Storage Locations

| File Type | Cloudflare Service | Collection in Firebase |
|-----------|-------------------|----------------------|
| Images (jpg, png, gif, etc.) | **Cloudflare Images** | americanparadisevault |
| Videos (mp4, mov, etc.) | **Cloudflare Stream** | americanparadisevault |
| Audio (mp3, wav, etc.) | **Cloudflare R2** | americanparadisevault |
| Documents (pdf, txt, etc.) | **Cloudflare R2** | americanparadisevault |

## 🔗 URL Formats

### Cloudflare Images
```
Public: https://imagedelivery.net/lzEB4WEiwuaDooGpiwwqdQ/{IMAGE_ID}/public
Thumbnail: https://imagedelivery.net/lzEB4WEiwuaDooGpiwwqdQ/{IMAGE_ID}/thumbnail
Large: https://imagedelivery.net/lzEB4WEiwuaDooGpiwwqdQ/{IMAGE_ID}/large
Medium: https://imagedelivery.net/lzEB4WEiwuaDooGpiwwqdQ/{IMAGE_ID}/medium
Small: https://imagedelivery.net/lzEB4WEiwuaDooGpiwwqdQ/{IMAGE_ID}/small
```

### Cloudflare Stream
```
HLS: https://customer-egd8wletnhjj8i2u.cloudflarestream.com/{VIDEO_ID}/manifest/video.m3u8
Embed: https://customer-egd8wletnhjj8i2u.cloudflarestream.com/{VIDEO_ID}/iframe
Thumbnail: https://customer-egd8wletnhjj8i2u.cloudflarestream.com/{VIDEO_ID}/thumbnails/thumbnail.jpg
DASH: https://customer-egd8wletnhjj8i2u.cloudflarestream.com/{VIDEO_ID}/manifest/video.mpd
```

### Cloudflare R2
```
Audio: https://pub-YOUR_BUCKET_ID.r2.dev/audio/{filename}
Documents: https://pub-YOUR_BUCKET_ID.r2.dev/documents/{filename}
```

## 📦 Data Structure in Firebase

Every upload creates a document in `americanparadisevault`:

```javascript
{
  // Core identification
  mediaId: "cloudflare-id",
  storage: "cloudflare-images|cloudflare-stream|cloudflare-r2",
  
  // Content classification
  type: "photo|video|drawing|music|writing|architecture",
  category: "images|videos|audio|documents",
  
  // URLs (primary)
  url: "https://...",
  thumbnailUrl: "https://...",
  embedUrl: "https://..." // videos only,
  
  // Visual properties
  shape: "circle|square|diamond|hexagon|...",
  size: 200,
  rotation: 15,
  position: { x: 100, y: 200 },
  bgColor: "hsl(180, 50%, 92%)",
  
  // File info
  fileName: "original-name.jpg",
  fileType: "image/jpeg",
  fileSize: 1024000,
  
  // User
  createdBy: { uid: "...", email: "..." },
  
  // Metadata
  collection: "americanparadisevault",
  year: "2024",
  active: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🚀 Quick Commands

### View Statistics
```javascript
import { getVaultStatistics } from './services/contentService';
const stats = await getVaultStatistics();
```

### Get All Content
```javascript
import { getAllContent } from './services/contentService';
const items = await getAllContent();
```

### Filter by Category
```javascript
import { getContentByCategory } from './services/contentService';
const images = await getContentByCategory('images');
```

### Filter by Type
```javascript
import { getContentByType } from './services/contentService';
const photos = await getContentByType('photo');
```

### Upload File
```javascript
import { uploadMediaFile, saveContentItem } from './services/contentService';

const result = await uploadMediaFile(file, 'photo');
const docId = await saveContentItem(itemData, user);
```

## 🔧 Environment Variables

```env
# Firebase
REACT_APP_FIREBASE_PROJECT_ID=jackcharlie-6d30b

# Cloudflare
REACT_APP_CF_ACCOUNT_ID=d4a0b2cf68aae5e594a5ceaeb0cba018
REACT_APP_CF_ACCOUNT_HASH=lzEB4WEiwuaDooGpiwwqdQ
REACT_APP_CF_CUSTOMER_SUBDOMAIN=customer-egd8wletnhjj8i2u

# R2 Worker (add after deployment)
REACT_APP_CF_R2_WORKER_URL=https://americanparadisevault-worker.YOUR-SUBDOMAIN.workers.dev
REACT_APP_CF_R2_PUBLIC_URL=https://pub-YOUR_BUCKET_ID.r2.dev
```

## 📂 File Organization

### In Cloudflare R2 Bucket: `americanparadisevault`
```
americanparadisevault/
├── audio/
│   ├── music-1234567890-abc123.mp3
│   └── song-1234567890-def456.wav
└── documents/
    ├── writing-1234567890-ghi789.pdf
    └── text-1234567890-jkl012.txt
```

### In Cloudflare Images
- Stored with metadata tag: `collection: "americanparadisevault"`
- Organized by: `category: "images"`

### In Cloudflare Stream
- Stored with metadata tag: `collection: "americanparadisevault"`
- Organized by: `category: "videos"`

## 🎯 Content Type Mapping

| User Selects | Type in Firebase | Category | Cloudflare Service |
|--------------|-----------------|----------|-------------------|
| PHOTO | photo | images | Images |
| VIDEO | video | videos | Stream |
| DRAWING | drawing | images | Images |
| MUSIC | music | audio | R2 |
| WRITING | writing | documents | R2 |
| ARCHITECTURE | architecture | images | Images |

## 💰 Estimated Monthly Costs

**For a typical portfolio:**
- 500 images: ~$2.50
- 100 min video: ~$4.50  
- 10 GB audio: ~$0.15
- **Total: ~$7-10/month**

All include unlimited bandwidth (no egress fees!)

## 📱 Access Points

### View in Cloudflare Dashboard
- Images: Dashboard → Images
- Videos: Dashboard → Stream
- Audio/Docs: Dashboard → R2 → americanparadisevault

### View in Firebase Console
- Console → Firestore → americanparadisevault collection

### View in App
- Open Playground
- All items displayed with metadata

## 🐛 Quick Troubleshooting

**Images not uploading?**
→ Check `REACT_APP_CF_API_TOKEN` and `REACT_APP_CF_ACCOUNT_HASH`

**Videos not uploading?**
→ Check `REACT_APP_CF_CUSTOMER_SUBDOMAIN`

**Audio not uploading?**
→ Deploy R2 worker or use local storage fallback

**Can't see items?**
→ Check Firebase collection name is `americanparadisevault`

## 📚 Documentation Files

1. **VAULT_SETUP_COMPLETE.md** - Complete setup guide
2. **AMERICANPARADISEVAULT_SETUP.md** - Detailed configuration
3. **CLOUDFLARE_R2_WORKER_SETUP.md** - R2 worker deployment
4. **cloudflare-worker/README.md** - Worker API reference

## ✅ Setup Status

- ✅ Cloudflare Images configured
- ✅ Cloudflare Stream configured  
- ⚠️ Cloudflare R2 needs worker deployment
- ✅ Firebase Firestore configured
- ✅ Content service integrated

---

**Everything is stored in americanparadisevault** - both as files in Cloudflare and metadata in Firebase! 🎨
