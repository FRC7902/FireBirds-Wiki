# Markham FireBirds Wiki

The official wiki for Markham FireBirds, FRC Team 7902. Built with FastAPI, React, TypeScript, and Vite.

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React 18 + TypeScript + Vite
- **Content Format**: Markdown with YAML frontmatter
- **Styling**: CSS Modules

## Requirements

- [Node.js](https://nodejs.org/en/download/) (v18 or higher)
- [Python](https://www.python.org/downloads/) (v3.10 or higher)
- [Git](https://git-scm.com/downloads)
- [VSCode](https://code.visualstudio.com/download) (optional, but recommended)
- [Obsidian](https://obsidian.md/) (optional, for editing content)

## Project Structure

```
7902 Wiki/
├── backend/                  # FastAPI backend
│   ├── main.py              # FastAPI application entry point
│   ├── services/            # Business logic
│   │   ├── markdown_loader.py
│   │   └── tree_builder.py
│   └── routes/              # API endpoints
│       ├── tree.py
│       └── documents.py
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript type definitions
│   │   ├── api/             # API client
│   │   └── App.tsx
│   └── package.json
├── Wiki/                    # Wiki markdown files (Google Docs/Sheets exports)
│   ├── Engineering/
│   ├── Business/
│   └── Strategy/
├── content/                 # Legacy content (kept for reference)
├── package.json             # Root package.json
└── requirements.txt         # Python dependencies
```

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "7902 Wiki"
```

### 2. Install Dependencies

**Install Node.js dependencies:**

```bash
npm run install:all
```

Or manually:

```bash
npm install
cd frontend
npm install
cd ..
```

**Install Python dependencies:**

```bash
pip install -r requirements.txt
```

### 3. Running the Development Server

**Option A: Run both backend and frontend together**

```bash
npm run dev
```

This will start:
- Backend API on `http://localhost:8000`
- Frontend on `http://localhost:5173`

**Option B: Run individually**

Terminal 1 - Start the backend:

```bash
npm run backend
```

Terminal 2 - Start the frontend:

```bash
npm run frontend
```

### 4. Open in Browser

Navigate to `http://localhost:5173` to view the wiki.

## Adding and Editing Content

Content files are stored in the `Wiki/` directory as Markdown files with YAML frontmatter. When you export documents from Google Docs or Google Slides, place them in the appropriate subdirectory under `Wiki/`.

### Content Structure

Each markdown file should include frontmatter:

```markdown
---
title: Page Title
description: Brief description of the page
tags: [tag1, tag2]
---

# Page Title

Your content here...
```

## Syncing Google Drive

Share the source folder and its contents as **Anyone with the link**. No
Google Cloud project, API key, or service-account key is needed. In PowerShell,
set:

```powershell
$env:GOOGLE_DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/your-folder-id"
```

Install the added Python dependencies once:

```powershell
pip install -r requirements.txt
```

Run a manual sync from the repository root:

```powershell
python -m backend.services.drive_sync
```

The sync mirrors Markdown files, exports Google Docs as Markdown, exports
Google Slides as text-backed Markdown, and downloads PDFs for in-browser
display.

## API Documentation

The backend provides the following endpoints:

### Tree Endpoints

- `GET /api/tree/` - Get the complete folder tree structure
- `GET /api/tree/siblings/{path}` - Get sibling files in a directory

### Document Endpoints

- `GET /api/documents/all` - Get all documents
- `GET /api/documents/{path}` - Get a specific document
- `GET /api/documents/search?q={query}` - Search documents

### Health Check

- `GET /health` - API health status

## Building for Production

### Build Frontend

```bash
npm run frontend:build
```

The compiled frontend will be in `frontend/dist/`.

### Running Backend in Production

```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

## Directory Overview

### Backend Services

**markdown_loader.py**
- Loads and parses markdown files
- Extracts frontmatter metadata
- Provides search functionality

**tree_builder.py**
- Builds folder tree structure from content directory
- Generates sibling relationships

### Frontend Components

- **Navbar** - Top navigation bar
- **SearchBar** - Search functionality
- **FolderTree** - Expandable folder/file tree
- **FileItem** - Individual file display in tree
- **DocumentViewer** - Document content display
- **Breadcrumbs** - Navigation breadcrumbs

### Pages

- **HomePage** - Main wiki view with sidebar and document viewer
- **DocumentPage** - Individual document view
- **SearchPage** - Search results view

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload during development
2. **API Proxy**: The frontend is configured to proxy API requests to the backend in development
3. **TypeScript**: Type-safe frontend development with full TypeScript support
4. **CSS Modules**: Component-scoped styling with CSS Modules

## Contributing

1. Create a new branch for your changes
2. Edit content in the `Google Drive` 
3. Test your changes locally
4. Commit and push your changes
5. Create a pull request

## Troubleshooting

### Backend not connecting

- Ensure the backend is running on `http://localhost:8000`
- Check the `.env.local` file in the frontend directory
- Verify Python dependencies: `pip install -r requirements.txt`

### Port conflicts

- Backend: Change port in `backend/main.py`
- Frontend: Change port in `frontend/vite.config.ts`

### Python version issues

- Ensure Python 3.10+ is installed
- Use a virtual environment: `python -m venv venv`
- Activate: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (macOS/Linux)

## License

MIT License - See LICENSE.txt for details

## Questions?

For questions or issues, please open an issue on the repository.
