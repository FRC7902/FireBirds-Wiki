# Firebirds Documentation Portal - Setup Guide

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
- GitHub repository with Actions enabled

### 1. Clone and Install

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
# Required:
# - GOOGLE_DRIVE_FOLDER_URL: Your Google Drive folder URL
# - SECRET_KEY: A secure random string for JWT
# Optional (for admin panel sync trigger):
# - GITHUB_TOKEN: GitHub Personal Access Token
# - GITHUB_REPO: Your repository (e.g., FRC7902/FireBirds-Wiki)
```

### 3. Google Drive Setup

1. Create a folder in Google Drive for documentation
2. Right-click → Share → "Anyone with the link can view"
3. Copy the folder URL
4. Add to `.env`:
   ```
   GOOGLE_DRIVE_FOLDER_URL=https://drive.google.com/drive/folders/YOUR_FOLDER_ID
   ```

### 4. Push the GitHub Actions Workflow

The workflow file `.github/workflows/sync-drive.yml` has been created in your repository. You need to commit and push it to GitHub:

```bash
# Commit the workflow file
git add .github/workflows/sync-drive.yml

# Commit
git commit -m "Add Google Drive sync workflow"

# Push to GitHub
git push
```

**Important**: The workflow will only appear in the GitHub Actions tab after you push it to GitHub.

### 5. GitHub Secrets Configuration

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add repository secret:
   - Name: `GOOGLE_DRIVE_FOLDER_URL`
   - Value: Your Google Drive folder URL

**Optional** (for admin panel sync trigger):
4. Create a GitHub Personal Access Token (PAT) with `repo` scope
5. Add repository secret:
   - Name: `GITHUB_TOKEN`
   - Value: Your PAT

### 5. Start Backend (Optional - for admin panel)

```bash
# From project root
python -m uvicorn backend.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

**Note**: The backend is only needed for the admin panel. The actual sync runs in GitHub Actions.

### 6. Start Frontend

```bash
# From project root
cd frontend
npm run dev
```

The website will be available at `http://localhost:5173`

### 7. Access Admin Dashboard

1. Navigate to `http://localhost:5173/admin`
2. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`
3. **⚠️ IMPORTANT**: Change these credentials in production!

## Default Admin Credentials

**Username**: `admin`  
**Password**: `admin123`

To change, edit `backend/services/auth.py`:
```python
USERS_DB = {
    "admin": {
        "username": "admin",
        "hashed_password": pwd_context.hash("YOUR_NEW_PASSWORD"),
        "role": "admin",
        "disabled": False
    }
}
```

**Note**: These credentials are only for the admin panel. The actual sync runs in GitHub Actions.

## Project Structure

```
7902 Wiki/
├── backend/
│   ├── main.py                    # FastAPI application entry
│   ├── routes/
│   │   ├── tree.py                # Folder tree API
│   │   ├── documents.py           # Document API
│   │   ├── admin.py               # Admin sync API
│   │   └── auth.py                # Authentication API
│   └── services/
│       ├── auth.py                # JWT authentication
│       ├── markdown_loader.py     # Markdown file loader
│       ├── tree_builder.py        # Folder tree builder
│       └── sync/
│           ├── drive_client.py    # Google Drive client
│           ├── sync_manager.py    # Sync orchestration
│           ├── metadata.py        # Metadata management
│           ├── scheduler.py       # Weekly scheduler
│           └── logger.py          # Logging utilities
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── admin.ts           # Admin API client
│   │   ├── components/admin/      # Admin UI components
│   │   ├── pages/
│   │   │   ├── AdminPage.tsx      # /admin route
│   │   │   └── LoginPage.tsx      # Login page
│   │   └── types/
│   │       └── admin.ts           # TypeScript types
│   └── package.json
├── Wiki/                          # Synced content directory
├── .env                           # Environment variables (create this)
├── .env.example                   # Environment template
├── requirements.txt               # Python dependencies
└── SETUP.md                       # This file
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_DRIVE_FOLDER_URL` | Yes | - | Google Drive folder URL |
| `SECRET_KEY` | Yes | - | JWT secret key (change in production!) |
| `GITHUB_TOKEN` | No | - | GitHub PAT for triggering workflows from admin panel |
| `GITHUB_REPO` | No | `FRC7902/FireBirds-Wiki` | GitHub repository for workflow dispatch |
| `WIKI_CONTENT_DIR` | No | `./Wiki` | Content directory path |
| `PORT` | No | `8000` | Backend server port |

### GitHub Secrets

| Secret | Required | Description |
|--------|----------|-------------|
| `GOOGLE_DRIVE_FOLDER_URL` | Yes | Google Drive folder URL (for GitHub Actions) |
| `GITHUB_TOKEN` | No | GitHub PAT (for admin panel sync trigger) |

### Google Drive Folder Setup

1. **Create Folder**: Create a folder in Google Drive
2. **Organize Content**: Create subfolders for different sections
3. **Share Settings**: 
   - Click "Share"
   - Set to "Anyone with the link can view"
   - Copy the URL
4. **Add to .env**:
   ```
   GOOGLE_DRIVE_FOLDER_URL=https://drive.google.com/drive/folders/abc123...
   ```

### Supported File Types

| Google Drive Type | Local Format | Notes |
|-------------------|--------------|-------|
| Google Docs | `.md` + PDF | PDF stored in `frontend/public/assets/` |
| Google Slides | `.md` + PDF | PDF stored in `frontend/public/assets/` |
| PDF | `.md` + PDF | PDF stored in `frontend/public/assets/` |
| Markdown | `.md` | Direct copy |
| Images | Original | Direct download |
| Google Sheets | CSV | Download as CSV |

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

### Manual Synchronization

**From Admin Panel**:
1. Go to `http://localhost:5173/admin`
2. Login with admin credentials
3. Click "Sync Now"
4. The workflow will be triggered on GitHub

**From GitHub UI** (Easiest method):
1. Go to your GitHub repository in your browser
2. Click the **Actions** tab at the top of the page
3. In the left sidebar, you'll see **"Sync Google Drive"** workflow
4. Click on **"Sync Google Drive"**
5. Click the green **"Run workflow"** button on the right side
6. A dropdown will appear - select your branch (usually `main`)
7. Click the green **"Run workflow"** button again to confirm
8. A new workflow run will appear at the top of the page
9. Click on it to watch the progress in real-time
10. Wait for it to complete (usually 1-2 minutes)

**Tip**: Bookmark the Actions tab for quick access to manual syncs.

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
# Trigger sync
POST /api/admin/sync
Authorization: Bearer YOUR_TOKEN

# Get status
GET /api/admin/status
Authorization: Bearer YOUR_TOKEN

# Get progress
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

## Development

### Backend Development (Admin Panel Only)

```bash
# Install dependencies
pip install -r requirements.txt

# Run with auto-reload
python -m uvicorn backend.main:app --reload

# API documentation
open http://localhost:8000/docs
```

**Note**: The backend is only for the admin panel. The actual sync runs in GitHub Actions.

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

### Testing the Sync

**Local Testing**:
```bash
# Test sync locally (requires GOOGLE_DRIVE_FOLDER_URL in .env)
python -m backend.services.sync.drive_sync

# Check results
ls Wiki/
cat metadata.json
```

**Via GitHub Actions**:
1. Add a test document to your Google Drive folder
2. Go to GitHub repository → Actions tab
3. Click "Run workflow" on "Sync Google Drive"
4. Wait for workflow to complete
5. Pull changes: `git pull`
6. Check that the document appears in `Wiki/` directory
7. Verify it appears on the website

## Troubleshooting

### "Could not read public folder"
- Ensure folder is shared as "Anyone with the link"
- Check folder URL in `.env` and GitHub Secrets

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

### Port already in use
```bash
# Change port in .env or use different port
PORT=8001 python -m uvicorn backend.main:app --reload
```

## Production Deployment

### Security Checklist

- [ ] Change default admin password
- [ ] Set strong `SECRET_KEY` (use `openssl rand -hex 32`)
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Use real database instead of in-memory users
- [ ] Use environment variables for all config

### GitHub Actions Setup

1. **Add secrets** to GitHub repository settings:
   - `GOOGLE_DRIVE_FOLDER_URL` (required)
   - `GITHUB_TOKEN` (optional, for admin panel trigger)

2. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Select source branch (e.g., `main`)
   - Site will auto-deploy after each sync commit

3. **Monitor workflows**:
   - Check Actions tab regularly
   - Set up notifications for failed workflows
   - Review commits before merging

### Deployment Options

#### Option 1: GitHub Pages (Recommended)

The site automatically deploys via GitHub Pages when GitHub Actions commits synced content.

1. Enable GitHub Pages in repository settings
2. Select branch (e.g., `main`)
3. Site deploys automatically after each sync

#### Option 2: Self-Hosted

If self-hosting the admin panel:

```dockerfile
# Dockerfile example
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Option 3: PM2 (Node.js process manager)

```bash
npm install -g pm2
pm2 start "python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000" --name wiki-api
```

## Maintenance

### View Logs

```bash
# Pull latest changes
git pull

# View sync log
cat sync.log

# View last 50 lines
tail -n 50 sync.log
```

### Manual Metadata Reset

```bash
# Delete metadata to force full re-sync
rm metadata.json
git add metadata.json
git commit -m "Reset metadata for full re-sync"
git push
```

### Backup

```bash
# Backup content and metadata
tar -czf wiki-backup.tar.gz Wiki/ metadata.json
```

### Trigger Manual Sync

**From Admin Panel**:
1. Go to `http://localhost:5173/admin`
2. Click "Sync Now"

**From GitHub**:
1. Go to repository → Actions tab
2. Select "Sync Google Drive" workflow
3. Click "Run workflow"

## Support

For issues or questions:
1. Check `docs/google-drive-sync.md` for detailed documentation
2. Review `sync.log` for error messages
3. Verify Google Drive folder permissions
4. Check API documentation at `http://localhost:8000/docs`

## License

[Your License Here]