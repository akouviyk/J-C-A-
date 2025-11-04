# Music Studio Implementation - Complete Guide

## Overview
The Music Studio is a comprehensive audio creation tool integrated into The Factory playground, offering three distinct ways to create and share music:
1. **Compose Music** - Interactive synthesizer using Reactronica
2. **Record Audio** - Voice/sound recording using Web Audio API
3. **Upload Files** - Upload audio tracks or extract audio from videos

## Installation

### Required Dependencies
Add these to your `package.json`:
```json
{
  "dependencies": {
    "reactronica": "^3.0.2",
    "tone": "^14.7.77"
  }
}
```

Install with:
```bash
npm install reactronica tone
```

## Components Created

### 1. MusicStudio.js (`/src/components/MusicStudio.js`)
**Main Features:**
- Tab-based interface (Choose, Compose, Record, Upload)
- Title input for naming musical creations
- Save functionality for all music types
- Real-time feedback and progress indicators

**Props:**
- `onClose`: Function to close the modal
- `onSave`: Function to save music (receives file and musicData)
- `user`: Current user object

### 2. MusicStudio.css (`/src/components/MusicStudio.css`)
Professional, responsive styling with:
- Gradient-based color scheme (purple/pink theme)
- Smooth animations and transitions
- Mobile-responsive design
- Custom audio player styling

## Three Music Creation Modes

### 1. COMPOSE MODE (Reactronica)
**Interactive synthesizer with:**
- **5 Instrument Types:**
  - Synthesizer (🎹)
  - Drum (🥁)
  - AM Synth (🎛️)
  - FM Synth (📻)
  - Duo Synth (🎼)

- **Controls:**
  - Tempo: 60-200 BPM
  - Volume: -30 to 0 dB
  - Note sequencer with visual notes
  - Piano keyboard (C4 to E5)

- **How it works:**
  - Users select an instrument
  - Click piano keys to add notes to sequence
  - Adjust tempo and volume
  - Play/pause to preview composition
  - Saved as JSON file with composition data

**Data Structure:**
```javascript
{
  title: "My Composition",
  type: "compose",
  composition: {
    tempo: 120,
    instrument: "synth",
    notes: [
      { note: "C4", duration: 0.5 },
      { note: "E4", duration: 0.5 }
    ],
    volume: 0
  },
  createdAt: "2025-11-02T..."
}
```

### 2. RECORD MODE (Web Audio API)
**Voice/audio recording with:**
- Microphone access via MediaRecorder API
- Real-time recording timer
- Pause/resume functionality
- Visual recording indicator with pulse animation
- Audio preview with playback controls

**Features:**
- Recording quality tips
- Duration tracking
- Discard and re-record option
- Saves as WebM audio file

**Technical Implementation:**
```javascript
// Uses navigator.mediaDevices.getUserMedia
// MediaRecorder for audio capture
// Creates Blob and preview URL
// Saves as .webm file
```

### 3. UPLOAD MODE
**File upload with:**
- Support for audio files (MP3, WAV, M4A, OGG)
- Support for video files (MP4, MOV, AVI)
- Audio extraction from videos (backend process)
- Drag-and-drop interface
- File preview with audio player

**Supported Formats:**
- Audio: All common formats
- Video: MP4, MOV, AVI (audio extracted automatically)

## Integration with Playground

### Updated Playground.js

**New State:**
```javascript
const [showMusicStudio, setShowMusicStudio] = useState(false);
```

**New Handler: handleMusicSave**
Handles saving all three music types:
- Uploads audio/video files to Cloudflare
- Stores compositions as JSON in Firestore
- Maintains metadata about music type and source

**File Handling:**
```javascript
// Audio/Video files → Cloudflare
if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
  uploadMediaFile(file, 'music');
}

// Compositions → Firestore only
else if (file.type === 'application/json') {
  store in Firestore with musicData
}
```

### Display Rendering

**Music items show:**
- Large music note icon (🎵)
- Type badge (🎹 Composition / 🎤 Recording / 📁 Track)
- Inline audio player with controls
- Title below

**CSS Classes:**
- `.music-content` - Container
- `.music-visualizer` - Icon and type display
- `.music-type` - Type badge
- `.audio-preview` - Styled audio player
- `.item-filename` - Title badge

## Firebase Data Structure

Music items are stored with:
```javascript
{
  type: 'music',
  category: 'audio',
  title: 'My Song',
  fileName: 'My Song',
  fileType: 'audio/webm' | 'audio/mpeg' | 'application/json',
  
  // For uploaded audio/video
  url: 'https://cloudflare-url/...',
  mediaId: 'cloudflare-media-id',
  storage: 'cloudflare-stream',
  duration: 120,
  
  // For compositions
  storage: 'firestore-only',
  textContent: '{"composition":{...}}',
  
  // Metadata
  musicData: {
    title: 'My Song',
    type: 'compose' | 'record' | 'upload',
    composition: {...},  // if compose
    duration: 45,        // if record
    isVideo: false       // if upload from video
  },
  
  // Visual properties
  shape: 'circle',
  size: 250,
  position: { x, y },
  bgColor: 'hsl(...)',
  
  // User info
  createdBy: { uid, email, displayName },
  createdAt: Timestamp,
  active: true
}
```

## User Flow

### Composing Music:
1. Click **+** button → Select **MUSIC**
2. Music Studio opens → Click **COMPOSE** tab
3. Select instrument from grid
4. Adjust tempo and volume
5. Click piano keys to add notes
6. Click "Play" to preview
7. Enter title
8. Click "SAVE & PUBLISH"
9. Composition appears in playground

### Recording Audio:
1. Click **+** button → Select **MUSIC**
2. Music Studio opens → Click **RECORD** tab
3. Click "Start Recording" (grant mic permission)
4. Speak/sing/make sounds
5. Click "Pause" or "Stop" when done
6. Preview recording
7. Enter title
8. Click "SAVE & PUBLISH"
9. Recording appears in playground with player

### Uploading Files:
1. Click **+** button → Select **MUSIC**
2. Music Studio opens → Click **UPLOAD** tab
3. Click to browse or drag file
4. Upload audio file or video (audio extracted)
5. Preview uploaded audio
6. Enter title (auto-filled from filename)
7. Click "SAVE & PUBLISH"
8. Audio appears in playground with player

## Technical Notes

### Reactronica Integration
- Uses `Song`, `Track`, and `Instrument` components
- Requires Tone.js as peer dependency
- Playback is client-side only
- Compositions are saved as JSON for recreation

### Browser Compatibility
- **Recording:** Requires HTTPS and microphone permissions
- **Playback:** All modern browsers support HTML5 audio
- **WebM:** Universally supported for audio recording

### Audio Extraction from Video
- Handled server-side (backend function needed)
- Client sends video file
- Backend extracts audio track
- Returns audio file URL

### Performance
- Audio files cached by Cloudflare
- Compositions are lightweight JSON
- Recordings compressed as WebM
- Efficient streaming for playback

## Customization Options

### Add More Instruments:
```javascript
const instruments = [
  { id: 'pluckSynth', label: 'Pluck', icon: '🪕' },
  { id: 'monoSynth', label: 'Mono', icon: '🎸' },
  // Add more from Tone.js
];
```

### Extend Note Range:
```javascript
const availableNotes = [
  'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3',
  'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4',
  'C5', 'D5', 'E5', 'F5', 'G5'
];
```

### Add Effects:
```javascript
import { Effect } from 'reactronica';

<Track>
  <Instrument type="synth" />
  <Effect type="reverb" />
  <Effect type="delay" />
</Track>
```

## Troubleshooting

### Recording Not Working:
- Check HTTPS (required for microphone access)
- Verify microphone permissions in browser
- Test microphone in other apps

### Composition Not Playing:
- Check browser console for Tone.js errors
- Ensure notes array is not empty
- Verify instrument type is valid

### Upload Failing:
- Check file size limits
- Verify Cloudflare API credentials
- Check file format is supported

## Future Enhancements

### Potential Features:
1. **Advanced Sequencer:** Grid-based step sequencer
2. **Effects Chain:** Add reverb, delay, distortion
3. **Collaboration:** Real-time co-composition
4. **Sheet Music:** Visual notation display
5. **Mixing:** Multi-track mixing interface
6. **Loops:** Loop samples and patterns
7. **Waveform Display:** Visual audio waveform
8. **Sharing:** Export to MP3/WAV

## Resources

- **Reactronica Docs:** https://reactronica.com/
- **Tone.js Docs:** https://tonejs.github.io/
- **Web Audio API:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **MediaRecorder API:** https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder

## Summary

The Music Studio provides three powerful ways to create music:
- **Compose:** Build melodies with synthesizers
- **Record:** Capture voice or live audio
- **Upload:** Add existing tracks or extract from video

All music is beautifully displayed in The Factory with inline playback controls, making it a true creative collaborative space for multimedia content.
