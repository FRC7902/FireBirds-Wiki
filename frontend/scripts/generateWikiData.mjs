import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const contentRootCandidates = [
  path.join(repoRoot, 'content'),
  path.join(repoRoot, 'Wiki'),
];

const contentRoot = contentRootCandidates.find((candidate) => {
  return fs.existsSync(candidate) && fs.statSync(candidate).isDirectory();
}) || path.join(repoRoot, 'content');

const outputDir = path.join(repoRoot, 'frontend', 'src', 'generated');
const outputPath = path.join(outputDir, 'wiki-data.json');

function parseFrontmatter(rawContent) {
  const normalized = rawContent.replace(/^\uFEFF/, '');
  const match = normalized.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);

  if (!match) {
    return {
      metadata: {},
      content: normalized.trim(),
    };
  }

  const frontmatter = match[1]
    .split(/\r?\n/)
    .reduce((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        return acc;
      }

      const separatorIndex = trimmed.indexOf(':');
      if (separatorIndex === -1) {
        return acc;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if (!value) {
        acc[key] = '';
        return acc;
      }

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        acc[key] = value.slice(1, -1);
        return acc;
      }

      if (value.startsWith('[') && value.endsWith(']')) {
        acc[key] = value
          .slice(1, -1)
          .split(',')
          .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
          .filter(Boolean);
        return acc;
      }

      acc[key] = value;
      return acc;
    }, {});

  return {
    metadata: frontmatter,
    content: normalized.slice(match[0].length).trim(),
  };
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function buildTree(currentPath, relativePath = '') {
  const stats = fs.statSync(currentPath);
  const name = path.basename(currentPath);
  const nodePath = relativePath ? toPosixPath(relativePath) : '';

  if (!stats.isDirectory()) {
    const fileContents = fs.readFileSync(currentPath, 'utf8');
    const { metadata, content } = parseFrontmatter(fileContents);
    const fileName = path.basename(currentPath, path.extname(currentPath));

    return {
      name,
      type: 'file',
      path: nodePath,
      title: metadata.title || fileName,
      description: metadata.description || '',
    };
  }

  const entries = fs
    .readdirSync(currentPath, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith('.') && !entry.name.startsWith('_'))
    .sort((a, b) => a.name.localeCompare(b.name));

  const children = [];
  for (const entry of entries) {
    const entryPath = path.join(currentPath, entry.name);
    const entryRelativePath = relativePath ? path.join(relativePath, entry.name) : entry.name;
    const childNode = buildTree(entryPath, entryRelativePath);
    if (childNode) {
      children.push(childNode);
    }
  }

  return {
    name,
    type: 'folder',
    path: nodePath,
    children,
  };
}

function collectDocuments(currentPath, relativeParent = '') {
  const stats = fs.statSync(currentPath);
  if (!stats.isDirectory()) {
    const fileContents = fs.readFileSync(currentPath, 'utf8');
    const { metadata, content } = parseFrontmatter(fileContents);
    const relativePath = toPosixPath(relativeParent || path.basename(currentPath));

    return [
      {
        path: relativePath,
        title: metadata.title || path.basename(currentPath, path.extname(currentPath)),
        content,
        metadata,
      },
    ];
  }

  const documents = [];
  const entries = fs
    .readdirSync(currentPath, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith('.') && !entry.name.startsWith('_'))
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const entryPath = path.join(currentPath, entry.name);
    const nextParent = relativeParent ? path.join(relativeParent, entry.name) : entry.name;
    documents.push(...collectDocuments(entryPath, nextParent));
  }

  return documents;
}

function walkMarkdownFiles(rootDir) {
  const docs = [];
  const stack = [rootDir];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true })
      .filter((entry) => !entry.name.startsWith('.') && !entry.name.startsWith('_'))
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
        const fileContents = fs.readFileSync(entryPath, 'utf8');
        const { metadata, content } = parseFrontmatter(fileContents);
        const relativePath = toPosixPath(path.relative(contentRoot, entryPath));
        docs.push({
          path: relativePath,
          title: metadata.title || path.basename(entryPath, path.extname(entryPath)),
          content,
          metadata,
        });
      }
    }
  }

  return docs;
}

fs.mkdirSync(outputDir, { recursive: true });
const documents = walkMarkdownFiles(contentRoot);
const tree = buildTree(contentRoot, '');

const payload = {
  tree,
  documents,
};

fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
console.log(`Generated ${documents.length} wiki documents from ${contentRoot}`);
