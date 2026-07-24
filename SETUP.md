# FireBirds Wiki - Docusaurus Setup Guide

## Quick Start

### Prerequisites
- Node.js 20+
- npm 9+
- GitHub repository with Actions enabled

### 1. Install Dependencies

```bash
cd website
npm install
```

### 2. Run Development Server

```bash
cd website
npm run start
```

The site will be available at `http://localhost:3000/FireBirds-Wiki/`

### 3. Build for Production

```bash
cd website
npm run build
```

Static files will be in `website/build/`

## Project Structure

```
7902 Wiki/
├── website/                    # Docusaurus site
│   ├── docs/                   # Wiki content (Markdown + MDX)
│   │   ├── index.md            # Wiki home page
│   │   ├── Engineering/        # Engineering docs
│   │   ├── Business/           # Business docs
│   │   └── Strategy/           # Strategy docs
│   ├── src/
│   │   ├── components/
│   │   │   ├── PdfEmbed/       # PDF embed React component
│   │   │   └── HomepageFeatures/
│   │   ├── css/
│   │   │   └── custom.css      # Custom styling
│   │   └── pages/
│   │       ├── index.tsx       # Homepage
│   │       └── index.module.css
│   ├── static/
│   │   ├── assets/             # PDF files (synced from Drive)
│   │   └── img/                # Images
│   ├── docusaurus.config.ts    # Docusaurus configuration
│   ├── sidebars.ts             # Sidebar configuration
│   └── package.json
├── backend/                    # Python sync scripts (kept for Drive sync)
│   └── services/sync/
│       ├── drive_sync.py       # Entry point
│       ├── sync_manager.py     # Sync orchestration
│       └── drive_client.py     # Google Drive client
├── .github/workflows/
│   └── sync-drive.yml          # CI/CD: sync Drive + deploy to GitHub Pages
└── package.json                # Root scripts
```

## Google Drive Sync

### Configuration

1. Set `GOOGLE_DRIVE_FOLDER_URL` in your environment:
   ```bash
   $env:GOOGLE_DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/your-folder-id"
   ```

2. Sync Google Drive to Docusaurus docs:
   ```bash
   python -m backend.services.sync.drive_sync
   ```

   This will:
   - Download Google Docs/Slides as PDFs into `website/static/assets/`
   - Create Docusaurus-compatible markdown files in `website/docs/`
   - Each markdown file embeds the PDF using the `<PdfEmbed>` component

### GitHub Actions (Automatic)

The workflow in `.github/workflows/sync-drive.yml`:
1. Syncs Google Drive content
2. Commits changes to `website/docs/` and `website/static/assets/`
3. Builds the Docusaurus site
4. Deploys to GitHub Pages (`gh-pages` branch)

## Features

- **Built-in Search**: Local search plugin (no Algolia account needed)
- **PDF Embedding**: Google Docs/Slides automatically converted to PDF and embedded
- **Dark Mode**: Respects system preference
- **Auto-generated Sidebar**: Docusaurus automatically builds navigation from folder structure
- **GitHub Pages Deploy**: Automatic deployment via GitHub Actions

## Customization

### Brand Colors
Edit `website/src/css/custom.css` to change the FireBirds red theme.

### PDF Embed Component
Located at `website/src/components/PdfEmbed/index.tsx` - customize iframe behavior.

## Adding Content

Place Markdown files in `website/docs/` organized by category:
```
website/docs/
├── Engineering/
│   ├── CAD/
│   ├── Manufacturing/
│   └── Programming/
├── Business/
│   ├── 5 Year Plan/
│   └── Cash Money Sponsorship/
└── Strategy/
    └── Scouting/
```

Each folder can have a `_category_.json` file for custom labels and descriptions.

## License

MIT License - See LICENSE.txt for details