# underground Portfolio - Project Overview

## 🎨 Project Description

A sophisticated, underground-aesthetic portfolio website - The site blends architectural precision with artistic experimentation, featuring influences from:

- **Architectural Drawings** - Blueprint aesthetics and Da Vinci-style technical precision
- **Art Deco** - Geometric elegance with gold and silver accents
- **Film Photography** - Darkroom processes and analog authenticity
- **Andy Warhol's Factory** - Experimental, raw artistic energy
- **Steve Jobs** - Minimalist clarity and sophisticated presentation
- **Czech New Wave** - Underground, intellectual, avant-garde spirit

## 📁 Complete File Structure

```
jack/
├── README.md                          # Main documentation
├── DEPLOYMENT.md                      # Deployment guide
├── package.json                       # Dependencies and scripts
├── .gitignore                        # Git ignore rules
├── .env.example                      # Environment variables template
├── setup.sh                          # Quick setup script
│
├── public/
│   └── index.html                    # HTML template with fonts
│
└── src/
    ├── index.js                      # React entry point
    ├── index.css                     # Global styles, grid overlay, film grain
    ├── App.js                        # Main app component
    ├── App.css                       # App-specific styles
    │
    ├── config/
    │   └── firebase.js               # Firebase configuration
    │
    └── components/
        ├── Navigation.js             # Top navigation bar
        ├── Navigation.css
        ├── Hero.js                   # Landing hero section
        ├── Hero.css
        ├── Gallery.js                # Image gallery with Firebase
        ├── Gallery.css
        ├── Darkroom.js               # Darkroom experience section
        ├── Darkroom.css
        ├── Footer.js                 # Footer with links
        └── Footer.css
```

## 🎯 Key Features

### Design Elements

- ✅ **Architectural grid overlay** - Blueprint-style construction lines
- ✅ **Film grain animation** - Authentic analog photography feel
- ✅ **Glass morphism** - Blur effects with transparency
- ✅ **Art Deco borders** - Gradient golden accents
- ✅ **Underground text effects** - Double-exposure styling
- ✅ **Da Vinci sketches** - Technical drawing overlays
- ✅ **Darkroom safelight** - Red ambient lighting effect

### Components

1. **Navigation**

   - Fixed top bar with glass morphism
   - Numbered menu items [01-06]
   - Hover effects with letter spacing
   - Responsive mobile menu

2. **Hero Section**

   - Large animated title
   - Rotating profession text
   - Blueprint overlay with circles
   - Warhol-inspired floating elements
   - Call-to-action buttons

3. **Gallery**

   - Firebase Storage integration
   - Masonry grid layout
   - Hover reveal overlays
   - Blueprint corner markers
   - Lightbox modal
   - Loading states

4. **Darkroom Section**

   - Interactive exposure simulator
   - Development process timeline
   - Chemistry information cards
   - Equipment list
   - Red safelight effect

5. **Process Section**

   - 4-step workflow
   - Glass cards with hover effects
   - Numbered steps
   - Descriptive text

6. **Statement Section**

   - Centered quote
   - Art Deco border
   - Large quotation mark
   - Artist attribution

7. **Footer**
   - Three-column layout
   - Contact information
   - Navigation links
   - Social media
   - Decorative architectural line

## 🎨 Color Palette

```css
--primary-bg: #0a0a0a; /* Deep black */
--secondary-bg: #1a1a1a; /* Slightly lighter black */
--accent-gold: #d4af37; /* Art Deco gold */
--accent-silver: #c0c0c0; /* Silver metallic */
--text-primary: #e8e8e8; /* Light gray text */
--text-secondary: #999; /* Medium gray */
--blueprint-blue: #00bfff; /* Technical blue */
--darkroom-red: #8b0000; /* Safelight red */
```

## 🔤 Typography

### Primary Fonts

- **Orbitron** (900, 700, 500, 400) - Headings, titles
- **Space Mono** (700, 400) - Body text, descriptions
- **Courier Prime** (700, 400) - Alternative monospace
- **Major Mono Display** - Special accents

### Usage

- `.title-font` - Headings (Orbitron)
- `.mono-font` - Body text (Space Mono)
- `.major-mono` - Accents (Major Mono Display)

## 🛠 Tech Stack

- **React 18** - UI framework
- **Framer Motion 10** - Smooth animations
- **Firebase 10** - Backend & storage
  - Cloud Storage - Images, videos, music
  - Firestore - Metadata (optional)
- **CSS3** - Styling with custom properties
- **Google Fonts** - Typography

## 📦 NPM Scripts

```bash
npm start          # Start development server (port 3000)
npm run build      # Create production build
npm test           # Run tests
npm run eject      # Eject from Create React App
```

## 🔧 Configuration Files

### package.json

- React dependencies
- Framer Motion for animations
- Firebase SDK
- React Router (optional)

### .env.example

- Firebase credentials template
- Cloudflare configuration
- Site metadata

### .gitignore

- Node modules
- Build folder
- Environment files
- Firebase cache

## 🎭 Animation System

Using Framer Motion:

1. **Initial animations** - Fade in from hidden
2. **Scroll animations** - Appear on viewport enter
3. **Hover effects** - Scale, color changes
4. **Stagger children** - Sequential reveals
5. **Exit animations** - Fade out smoothly

Example:

```jsx
<motion.div
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
  Content
</motion.div>
```

## 🖼 Firebase Storage Structure

```
/architecture/
  ├── building-001.jpg
  ├── blueprint-002.jpg
  └── ...

/photography/
  ├── portrait-001.jpg
  ├── landscape-002.jpg
  └── ...

/darkroom/
  ├── analog-001.jpg
  ├── bw-002.jpg
  └── ...

/playground/
  ├── experimental-001.jpg
  └── ...

/music/
  ├── ambient-01.mp3
  └── ...

/videos/
  ├── timelapse-01.mp4
  └── ...
```

## 📱 Responsive Breakpoints

```css
/* Desktop */
@media (min-width: 1024px) {
}

/* Tablet */
@media (max-width: 1024px) {
}

/* Mobile */
@media (max-width: 768px) {
}
```

## 🎯 Performance Features

1. **Lazy loading** - Images load on scroll
2. **Code splitting** - Components load on demand
3. **Firebase caching** - Reduces API calls
4. **Optimized images** - Compressed assets
5. **Minimal dependencies** - Fast load times

## 🔐 Security

- Firebase read-only rules for public content
- No authentication required for viewing
- Environment variables for sensitive data
- CORS configured for Firebase Storage

## 🚀 Quick Start

```bash
# 1. Navigate to project
cd /Users/akouvi/Desktop/jack

# 2. Run setup script (Mac/Linux)
chmod +x setup.sh
./setup.sh

# 3. Edit .env with Firebase credentials

# 4. Start development server
npm start

# 5. Open browser
http://localhost:3000
```

## 📋 Content Checklist

Before going live:

- [ ] Replace all placeholder images
- [ ] Update contact email and phone
- [ ] Fill in actual project descriptions
- [ ] Upload photos to Firebase Storage
- [ ] Add music/video files
- [ ] Test on mobile devices
- [ ] Verify all links work
- [ ] Check grammar and spelling
- [ ] Add meta tags for SEO
- [ ] Test Firebase connection

## 🎨 Customization Guide

### Change Colors

Edit `/src/index.css` root variables

### Add New Section

1. Create component in `/src/components/`
2. Import in `/src/App.js`
3. Add to JSX structure
4. Style with CSS file

### Add Gallery Category

```jsx
<Gallery category="new-category" />
```

Create folder in Firebase Storage: `/new-category/`

### Modify Navigation

Edit `navItems` array in `/src/components/Navigation.js`

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome)

## 📧 Contact & Credits

**Portfolio for:** Architect & Photographer  
**Education:** Film Institute / Architecture Studies  
**Specialties:** Architecture, Film Photography, Directing

**Built with:**

- Precision engineering
- Artistic vision
- Underground aesthetics
- Czech New Wave influence

---

## 🎯 Next Steps

1. ✅ Install dependencies (`npm install`)
2. ✅ Configure Firebase (`.env`)
3. ✅ Upload content to Firebase Storage
4. ✅ Customize text and colors
5. ✅ Test locally (`npm start`)
6. ✅ Build for production (`npm run build`)
7. ✅ Deploy (see DEPLOYMENT.md)
8. ✅ Share with the world!
