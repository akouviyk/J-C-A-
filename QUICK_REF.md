# American Paradise Vault - Quick Reference

## Collection Name
`americanparadisevault` - All media metadata in Firebase

## Storage Locations

| Type | Storage | URLs |
|------|---------|------|
| Images | Cloudflare Images | imagedelivery.net |
| Videos | Cloudflare Stream | cloudflarestream.com |
| Audio | Firebase Storage | firebasestorage.googleapis.com |
| Docs | Firebase Storage | firebasestorage.googleapis.com |

## Quick Commands

```javascript
// Get statistics
import { getVaultStatistics } from './services/contentService';
const stats = await getVaultStatistics();

// Get all items
import { getAllContent } from './services/contentService';
const items = await getAllContent();

// Upload file
import { uploadMediaFile, saveContentItem } from './services/contentService';
const result = await uploadMediaFile(file, 'photo');
await saveContentItem(itemData, user);
```

## Storage Details

**Images → Cloudflare Images**
- Automatic optimization
- Multiple variants
- Global CDN

**Videos → Cloudflare Stream**
- Adaptive streaming
- Automatic transcoding
- HLS/DASH support

**Audio/Docs → Firebase Storage**
- Simple file storage
- Secure URLs
- Easy integration

## Cost: ~$7/month

All configured and ready to use!
