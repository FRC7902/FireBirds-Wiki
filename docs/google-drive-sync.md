# Google Drive Synchronization

## Overview

The Firebirds Documentation Portal includes an automatic synchronization system that keeps the wiki content in sync with a Google Drive folder. Google Drive serves as the **single source of truth** for all documentation.

## Architecture

```
Google Drive
      │
      ▼
GitHub Actions (Daily at 06:00 UTC)
      │
      ├── Downloads new documents
      ├── Updates modified documents
      ├── Removes deleted documents
      ├── Generates metadata
      └── Commits changes to repository
      │
      ▼
GitHub Repository
      │
      ▼
GitHub Pages / Web Server
      │
      ▼
React Documentation Website
```

**Note**: The backend API provides an admin panel to manually trigger GitHub Actions workflows, but the actual synchronization runs in GitHub Actions for reliability and to avoid exposing Google Drive credentials.

## Features

### Automatic Synchronization
- **Schedule**: Every day at 06:00 UTC
- **Implementation**: GitHub Actions
- **Automatic**: No manual intervention required
- **Smart commits**: Only commits when changes are detected

### Manual Synchronization
- **From Admin Panel**: Click "Sync Now" button at `/admin`
- **From GitHub**: Use "Run workflow" button in GitHub Actions tab
- **Authentication**: JWT (Admin only) for admin panel
- **Results**: Workflow commits changes if any are detected

### Efficient Incremental Updates
- Tracks file modification times in `metadata.json`
- Only downloads files that have changed
- Idempotent: Running twice without changes = zero modifications
- Smart commits: GitHub Actions checks for changes before committing

### File Type Support
- **Google Docs** → PDF + TXT + Markdown wrapper with searchable text metadata
- **Google Sheets** → CSV download
- **Google Slides** → PDF + TXT + Markdown wrapper with searchable text metadata
- **PDFs** → Direct download with Markdown wrapper
- **Markdown** → Direct copy with searchable text metadata
- **Images** → Direct download

### Metadata Management
- Stores last sync timestamp
- Tracks each file's Drive ID, modification time, and local path
- **Extracts and stores full text content** from Google Docs and Google Slides for search indexing
- Enables efficient change detection
- Maintains sync history (last 20 entries)

## Setup

### 1. Environment Configuration

Create a `.env` file in the project root:

```env
# Required: Google Drive folder URL
GOOGLE_DRIVE_FOLDER_URL=https://drive.google.com/drive/folders/YOUR_FOLDER_ID

# Required: JWT secret key (CHANGE IN PRODUCTION!)
SECRET_KEY=your-secret-key-here-change-in-production

# Optional: GitHub configuration (for triggering workflows from admin panel)
# GITHUB_TOKEN=your-github-personal-access-token
# GITHUB_REPO=FRC7902/FireBirds-Wiki

# Optional: Content directory (defaults to ./Wiki)
# WIKI_CONTENT_DIR=./Wiki
```

### 2. Google Drive Setup

1. Create a folder in Google Drive for your documentation
2. **Share the folder**: Set sharing to "Anyone with the link can view"
3. Copy the folder URL
4. Add it to `.env` as `GOOGLE_DRIVE_FOLDER_URL`

**Important**: The folder must be publicly accessible for the sync to work without OAuth authentication.

### 3. Push the Workflow to GitHub

**IMPORTANT**: The workflow file `.github/workflows/sync-drive.yml` has been created locally but must be pushed to GitHub before it will appear in the Actions tab.

```bash
# Commit the workflow file
git add .github/workflows/sync-drive.yml

# Commit
git commit -m "Add Google Drive sync workflow"

# Push to GitHub
git push
```

**After pushing**, the "Sync Google Drive" workflow will appear in the GitHub Actions tab.

### 4. GitHub Secrets Configuration

For GitHub Actions to access your Google Drive folder:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add repository secret:
   - Name: `GOOGLE_DRIVE_FOLDER_URL`
   - Value: Your Google Drive folder URL

**Optional**: For admin panel sync trigger:
4. Create a GitHub Personal Access Token (PAT) with `repo` scope
5. Add repository secret:
   - Name: `GITHUB_TOKEN`
   - Value: Your PAT

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Start the Backend (Optional)

The backend is only needed for the admin panel. The actual sync runs in GitHub Actions.

```bash
cd backend
python -m uvicorn main:app --reload
```

## Usage

### Automatic Synchronization

The system automatically syncs every **day at 06:00 UTC** via GitHub Actions.

Check workflow runs:
1. Go to your GitHub repository
2. Click **Actions** tab
3. View "Sync Google Drive" workflow runs

Download and view logs:
```bash
# After workflow completes, pull latest changes
git pull

# View sync log
cat sync.log
```

### Manual Synchronization - Command Line

You can run the sync manually from your local machine:

```bash
# Set the required environment variable
export GOOGLE_DRIVE_FOLDER_URL="https://drive.google.com/drive/folders/YOUR_FOLDER_ID"

# Run the sync (from project root)
python -m backend.services.sync.drive_sync

# Or specify a custom content directory
python -m backend.services.sync.drive_sync --content-dir ./website/docs
```

**Windows (Command Prompt):**
```cmd
# Set environment variable
set GOOGLE_DRIVE_FOLDER_URL=https://drive.google.com/drive/folders/YOUR_FOLDER_ID

# Run the sync
python -m backend.services.sync.drive_sync
```

**Windows (PowerShell):**
```powershell
# Set environment variable
$env:GOOGLE_DRIVE_FOLDER_URL="https://drive.google.com/drive/folders/YOUR_FOLDER_ID"

# Run the sync
python -m backend.services.sync.drive_sync
```

**Using a .env file:**
```bash
# Create a .env file in the project root
echo GOOGLE_DRIVE_FOLDER_URL=https://drive.google.com/drive/folders/YOUR_FOLDER_ID > .env

# Run the sync (it will automatically load from .env)
python -m backend.services.sync.drive_sync
```

### Manual Synchronization - GitHub Actions

**From Admin Panel**:
1. Go to `http://localhost:5173/admin`
2. Login with admin credentials
3. Click "Sync Now"
4. The workflow will be triggered on GitHub

**From GitHub UI** (Recommended for manual syncs):
1. Navigate to your GitHub repository
2. Click the **Actions** tab at the top
3. In the left sidebar, click **"Sync Google Drive & Deploy"** workflow
4. Click the **"Run workflow"** button
5. Select the branch (usually `main` or `master`)
6. Click **"Run workflow"** again to confirm
7. The workflow will start running immediately
8. Click on the running workflow to see real-time progress
9. Wait for completion (usually 1-2 minutes)

**Visual Guide**:
```
Repository Page
├── Actions tab (top menu)
│   ├── Workflows (left sidebar)
│   │   └── Sync Google Drive & Deploy
│   │       ├── Run workflow button (top right)
│   │       ├── Select branch dropdown
│   │       └── Run workflow button (green)
│   └── Recent Workflow Runs
│       └── Click to view logs and progress
```


### API Endpoints

#### Authentication
```bash
# Login
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

username=admin&password=admin123
```

#### Admin (requires JWT token)
```bash
# Trigger sync (triggers GitHub Actions workflow)
POST /api/admin/sync
Authorization: Bearer YOUR_TOKEN

# Get status (reads from metadata.json)
GET /api/admin/status
Authorization: Bearer YOUR_TOKEN

# Get progress (estimates based on last sync time)
GET /api/admin/sync/status
Authorization: Bearer YOUR_TOKEN

# Get history
GET /api/admin/history?limit=20
Authorization: Bearer YOUR_TOKEN
```

#### Public
```bash
# Health check
GET /health

# Get folder tree
GET /api/tree/

# Get all documents
GET /api/documents/all

# Get specific document
GET /api/documents/Engineering/CAD/CAD Overview

# Search documents
GET /api/documents/search?q=keyword
```

## Admin Dashboard

Access the admin dashboard at: `http://localhost:5173/admin`

### Features
- **Google Drive Status**: Last sync time, status, document/folder counts
- **Sync Button**: Trigger manual synchronization via GitHub Actions
- **Statistics**: New, updated, deleted files and duration
- **Sync History**: Last 20 synchronizations with details

## File Structure

```
backend/
├── routes/
│   ├── admin.py          # Admin API endpoints (triggers GitHub Actions)
│   └── auth.py           # Authentication endpoints
└── services/
    ├── auth.py           # JWT authentication
    └── sync/
        ├── drive_client.py    # Google Drive API client
        │                        - Downloads files from Drive
        │                        - Exports Google Docs/Slides as PDF
        │                        - Exports Google Docs/Slides as plain text
        ├── sync_manager.py    # Core sync logic
        │                        - Downloads PDF and TXT for each document
        │                        - Saves text to frontmatter for search indexing
        │                        - Formats text for YAML frontmatter
        ├── metadata.py        # Metadata management
        │                        - Stores extracted text in metadata.json
        └── logger.py          # Logging utilities

.github/
└── workflows/
    └── sync-drive.yml     # GitHub Actions workflow (daily sync)

frontend/src/
├── types/
│   └── admin.ts          # TypeScript interfaces
├── api/
│   └── admin.ts          # Admin API client
├── components/admin/
│   ├── AdminDashboard.tsx
│   ├── SyncStatusCard.tsx
│   ├── SyncButton.tsx
│   ├── ProgressBar.tsx
│   ├── StatisticsCard.tsx
│   └── RecentSyncHistory.tsx
└── pages/
    ├── AdminPage.tsx     # /admin route
    └── LoginPage.tsx     # Login page
```

## Metadata Format

`metadata.json` is stored in the repository root:

```json
{
  "lastSync": "2026-07-24T02:00:00Z",
  "files": {
    "driveId123": {
      "modified": "2026-07-23T15:30:00Z",
      "path": "Engineering/CAD",
      "local": "Engineering/CAD/CAD Overview.md",
      "text": "Full extracted text content from the document for search indexing..."
    }
  },
  "syncHistory": [
    {
      "timestamp": "2026-07-24T02:04:00Z",
      "status": "completed",
      "new": 4,
      "updated": 2,
      "deleted": 1,
      "skipped": 74,
      "duration": "14.2s",
      "trigger": "manual"
    }
  ]
}
```

### Searchable Text Storage

For Google Docs and Google Slides, the sync system:

1. **Downloads as PDF** - For viewing and downloading by users
2. **Downloads as TXT** - Plain text extraction (flattened formatting)
3. **Embeds in Markdown frontmatter** - Adds `searchable_text` field to the generated `.md` file
4. **Stores in metadata.json** - Saves full text for backend search indexing

Example generated markdown file:

```markdown
---
sidebar_label: "Document Title"
title: "Document Title"
searchable_text: |
    This is the extracted text from the Google Doc.
    It includes all content but formatting is flattened.
    
    Headings, lists, and tables are converted to plain text.
---

# Document Title

This Google Doc is shown below.

import PdfEmbed from '@site/src/components/PdfEmbed';

<PdfEmbed src="/FireBirds-Wiki/assets/{drive_id}.pdf" title="Document Title" />
```

## Logging

Logs are written to `sync.log` in the repository root:

```
[02:00] Starting sync (automatic)
[02:00] Scanning Engineering
[02:01] Downloaded Engineering/CAD/CAD Overview
[02:02] Updated Engineering/Programming/Java Fundamentals
[02:04] Finished - 82 scanned, 3 new, 2 updated, 0 deleted, 0 failed (14.2s)
```

View logs after sync:
```bash
git pull
cat sync.log
```

## Error Handling

- Failed syncs do not delete existing content
- Previous content is preserved on failure
- Detailed error messages returned in API responses
- All errors logged to `sync.log` and GitHub Actions console

Example error response:
```json
{
  "status": "failed",
  "reason": "Google Drive API timeout",
  "new": 0,
  "updated": 0,
  "deleted": 0,
  "skipped": 0,
  "failed": 0,
  "duration": "5.3s"
}
```

## Security

- JWT-based authentication for admin panel
- Admin-only access to sync trigger endpoints
- Returns 401 for unauthenticated requests
- Returns 403 for non-admin users
- Secret key configurable via environment variable
- GitHub Actions secrets for sensitive data

## Extensibility

The sync system is modular and can be extended to support other storage providers:

- **OneDrive**: Implement `OneDriveClient` with same interface as `DriveClient`
- **SharePoint**: Implement `SharePointClient`
- **Dropbox**: Implement `DropboxClient`

The frontend React components remain unchanged - only the backend sync service needs modification.

### Adding New Document Types

To add support for new document types with text extraction:

1. **Add download method** in `drive_client.py`:
   ```python
   def download_new_type_pdf(self, file_id: str) -> bytes:
       """Download new type as PDF."""
       url = f"https://example.com/export/pdf"
       return get_bytes(url)
   
   def download_new_type_text(self, file_id: str) -> str:
       """Download new type as plain text."""
       url = f"https://example.com/export/txt"
       return get_bytes(url).decode('utf-8', errors='replace')
   ```

2. **Add processing logic** in `sync_manager.py` `_download_and_save()`:
   ```python
   elif mime_type == "application/vnd.new-type":
       pdf_content = self.drive_client.download_new_type_pdf(drive_id)
       text_content = self.drive_client.download_new_type_text(drive_id)
       
       # Save PDF and text files
       asset_path.write_bytes(pdf_content)
       text_asset_path.write_text(text_content, encoding='utf-8')
       
       # Create markdown with searchable text
       content = f"""---
       searchable_text: |
       {self._format_searchable_text(text_content)}
       ---
       ...
       """
   ```

3. **Update MIME type checks** in `_process_drive_file()` and `_remove_deleted_files()`

## Troubleshooting

### "Could not read public folder"
- Ensure the Google Drive folder is shared as "Anyone with the link"
- Check the folder URL in `.env` and GitHub Secrets

### "GITHUB_TOKEN not configured"
- Add `GITHUB_TOKEN` to `.env` for admin panel sync trigger
- Or use GitHub Actions "Run workflow" button directly

### Files not syncing
- Check GitHub Actions logs for errors
- Verify `GOOGLE_DRIVE_FOLDER_URL` secret is set correctly
- Check `sync.log` in repository after workflow completes
- Verify Google Drive folder permissions

### Authentication not working
- Verify `SECRET_KEY` is set in `.env`
- Check JWT token is being sent in Authorization header
- Ensure user has "admin" role

### Workflow not triggering
- Check GitHub Actions is enabled in repository
- Verify workflow file is in `.github/workflows/`
- Check repository secrets are configured
- Review GitHub Actions permissions

## Production Deployment

### Backend (Admin Panel)
1. **Change default credentials** in `backend/services/auth.py`
2. **Set strong SECRET_KEY** in `.env`
3. **Use HTTPS** for all API requests
4. **Configure CORS** properly in `backend/main.py`
5. **Use a real database** instead of in-memory user store
6. **Use environment variables** for all configuration

### GitHub Actions
1. **Add secrets** to GitHub repository settings
2. **Monitor workflow runs** in Actions tab
3. **Set up notifications** for failed workflows
4. **Review commits** before merging to main

### GitHub Pages
1. Enable GitHub Pages in repository settings
2. Select source branch (e.g., `main`)
3. Site will auto-deploy after each sync commit

## GitHub Actions Workflow

The workflow file is located at `.github/workflows/sync-drive.yml`:

```yaml
name: Sync Google Drive
on:
  schedule:
    - cron: "0 6 * * *"  # Every day at 06:00 UTC
  workflow_dispatch:  # Allows manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - run: pip install -r requirements.txt
      - run: python -m backend.services.sync.drive_sync
        env:
          GOOGLE_DRIVE_FOLDER_URL: ${{ secrets.GOOGLE_DRIVE_FOLDER_URL }}
      - name: Commit changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add Wiki/ frontend/public/assets/ metadata.json
          git diff --cached --quiet || git commit -m "Auto-sync: Update documentation from Google Drive"
          git push
```

## API Reference

### Authentication
- `POST /api/auth/login` - Get JWT token
- `POST /api/auth/logout` - Logout (client-side token removal)
- `GET /api/auth/me` - Get current user info

### Admin
- `POST /api/admin/sync` - Trigger GitHub Actions workflow
- `GET /api/admin/status` - Get sync status from metadata
- `GET /api/admin/sync/status` - Get sync progress estimate
- `GET /api/admin/history` - Get sync history

### Public
- `GET /` - Health check
- `GET /health` - Health check
- `GET /api/tree/` - Get folder tree
- `GET /api/documents/all` - Get all documents
- `GET /api/documents/{path}` - Get specific document
- `GET /api/documents/search?q={query}` - Search documents