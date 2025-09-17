import { execSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

let built = false;

export async function ensureBuild() {
  if (built) return;
  execSync('npm run build', { stdio: 'inherit' });
  built = true;
}

export async function getPageHtml(relativePath) {
  await ensureBuild();
  const normalisedPath = relativePath.replace(/^\/+/, '');
  const filePath = resolve(process.cwd(), 'dist', normalisedPath);
  return readFile(filePath, 'utf-8');
}
