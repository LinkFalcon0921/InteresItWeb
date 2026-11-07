#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const MAX_LINES = 600;
const WARN_LINES = 450;

const EXTENSIONS = new Set(['.ts', '.svelte', '.scss', '.json']);
const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.svelte-kit',
  'build',
  'dist',
  '.idea',
  '.vscode',
  '.agent'
]);
const IGNORED_FILES = new Set([
  'pnpm-lock.yaml',
  'package-lock.json',
  'index.html' // Monolito legacy preservado intacto como baseline
]);

let totalFilesChecked = 0;
let warningCount = 0;
let errorCount = 0;

function checkFile(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  const ext = path.extname(filePath);
  const fileName = path.basename(filePath);

  if (IGNORED_FILES.has(fileName)) return;
  if (!EXTENSIONS.has(ext)) return;

  const content = fs.readFileSync(filePath, 'utf8');
  const lineCount = content.split('\n').length;
  totalFilesChecked++;

  if (lineCount > MAX_LINES) {
    console.error(`❌ ERROR: ${relativePath} tiene ${lineCount} líneas (máximo permitido: ${MAX_LINES})`);
    errorCount++;
  } else if (lineCount > WARN_LINES) {
    console.warn(`⚠️ ADVERTENCIA: ${relativePath} tiene ${lineCount} líneas (umbral de advertencia: ${WARN_LINES})`);
    warningCount++;
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile()) {
      checkFile(fullPath);
    }
  }
}

console.log('🔍 Verificando límites de líneas por archivo (máx 600, alerta 450)...');
walkDir(process.cwd());

console.log(`\n📊 Resumen de verificación de líneas:`);
console.log(`- Archivos analizados: ${totalFilesChecked}`);
console.log(`- Advertencias (> 450 líneas): ${warningCount}`);
console.log(`- Errores (> 600 líneas): ${errorCount}`);

if (errorCount > 0) {
  console.error(`\n❌ Se encontraron ${errorCount} archivo(s) que superan el límite de ${MAX_LINES} líneas.`);
  process.exit(1);
} else {
  console.log(`\n✅ Todos los archivos cumplen con el límite de líneas.`);
}
