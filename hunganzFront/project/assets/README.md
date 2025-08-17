# Assets Directory

This directory contains all static assets for the Hunganz gaming NFT ecosystem.

## Directory Structure

```
assets/
├── images/          # Game images, backgrounds, character art
├── icons/           # UI icons, logos, favicons
├── fonts/           # Custom fonts for the game
├── videos/          # Video assets, trailers, animations
└── README.md        # This file
```

## Usage in Next.js

### Images
Place images in the `images/` folder and import them:
```typescript
import hungaLogo from '@/assets/images/hunga-logo.png';
```

### Icons
Store SVG icons and other icon assets:
```typescript
import BananeIcon from '@/assets/icons/banane-icon.svg';
```

### Fonts
Custom fonts for the Hunganz theme:
- Place font files (.woff2, .woff, .ttf) in the `fonts/` folder
- Import in CSS or use with Next.js font optimization

### Videos
Game trailers, character animations, background videos:
```typescript
import introVideo from '@/assets/videos/hunganz-intro.mp4';
```

## Asset Guidelines

### Images
- Use WebP format for better compression
- Provide multiple sizes for responsive design
- Optimize images before adding to repository

### Icons
- Prefer SVG format for scalability
- Use consistent naming convention: `component-name-icon.svg`
- Optimize SVGs to remove unnecessary metadata

### Fonts
- Include only necessary font weights
- Use modern formats (woff2) for better performance
- Ensure proper licensing for commercial use

## Hunganz-Specific Assets

### Character Assets
- FireBob evolution stages
- PlantJimmy evolution stages  
- WaterNolan evolution stages
- Character portraits and thumbnails

### UI Assets
- Banane token icon
- Hunganz logo variations
- Background textures
- Button styles and borders

### Game Assets
- Jungle backgrounds
- Evolution effects
- Fetch mission illustrations
- Marketplace graphics
