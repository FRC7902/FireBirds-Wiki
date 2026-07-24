# Markham FireBirds Wiki

The official wiki for Markham FireBirds, FRC Team 7902. Built with [Docusaurus](https://docusaurus.io/).

## Tech Stack

- **Site Generator**: Docusaurus 3 (React + TypeScript)
- **Content Format**: Markdown with MDX (React components inside Markdown)
- **Search**: Local search plugin (no external service needed)
- **PDF Embedding**: Google Docs/Slides auto-converted to PDF and embedded
- **Sync**: Python scripts + GitHub Actions for Google Drive integration
- **Hosting**: GitHub Pages (auto-deployed via GitHub Actions)

## Quick Start

```bash
# Install dependencies
cd website
npm install

# Start development server
npm run start
```

The site will be available at `http://localhost:3000/FireBirds-Wiki/`

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
│   │   │   └── custom.css      # Custom FireBirds branding
│   │   └── pages/
│   │       ├── index.tsx       # Homepage
│   │       └── index.module.css
│   ├── static/
│   │   ├── assets/             # PDF files (synced from Google Drive)
│   │   └── img/                # Images and logos
│   ├── docusaurus.config.ts    # Docusaurus configuration
│   ├── sidebars.ts             # Auto-generated sidebar config
│   └── package.json
├── backend/                    # Python sync scripts
│   └── services/sync/
│       ├── drive_sync.py       # Entry point
│       ├── sync_manager.py     # Sync orchestration
│       └── drive_client.py     # Google Drive client
├── .github/workflows/
│   └── sync-drive.yml          # CI/CD: sync Drive + deploy to GitHub Pages
└── package.json                # Root scripts
```

## Features

### 📄 PDF Embedding
Google Docs and Slides are automatically converted to PDFs and embedded directly in wiki pages using the custom `<PdfEmbed>` component. Each PDF has a download link and is viewable inline.

### 🔍 Built-in Search
Full-text search across all wiki content with highlighted results. No external service or API key required.

### 🌙 Dark Mode
Respects system color scheme preference with custom FireBirds-themed colors.

### 📱 Responsive
Works on desktop, tablet, and mobile devices.

### 🤖 Automatic Sync
Google Drive content is synced daily via GitHub Actions, with automatic deployment to GitHub Pages.

## Google Drive Sync

### Configuration

```bash
$env:GOOGLE_DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/your-folder-id"
```

### Manual Sync

```bash
python -m backend.services.sync.drive_sync
```

This will:
- Download Google Docs/Slides as PDFs into `website/static/assets/`
- Create Docusaurus-compatible markdown files in `website/docs/`
- Each markdown file embeds the PDF using the `<PdfEmbed>` component

### Automatic Sync (GitHub Actions)

The workflow in `.github/workflows/sync-drive.yml` runs daily at 06:00 UTC and:
1. Syncs Google Drive content
2. Commits changes to `website/docs/` and `website/static/assets/`
3. Builds the Docusaurus site
4. Deploys to GitHub Pages (`gh-pages` branch)

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

### PDF Embedding in Markdown

To embed a PDF in any markdown file:

```markdown
import PdfEmbed from '@site/src/components/PdfEmbed';

<PdfEmbed src="/FireBirds-Wiki/assets/your-file.pdf" title="Document Title" />
```

## Building for Production

```bash
cd website
npm run build
```

Static files will be in `website/build/`.

## Customization

### Brand Colors
Edit `website/src/css/custom.css` to change the FireBirds red theme.

### PDF Embed Component
Located at `website/src/components/PdfEmbed/index.tsx` - customize iframe behavior.

### Site Configuration
Edit `website/docusaurus.config.ts` for site metadata, navbar, footer, etc.

## License

MIT License - See LICENSE.txt for details