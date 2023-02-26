import {fileURLToPath} from 'node:url';
import {normalize} from 'node:path';

function normalisePath(pathOrFileUrl: string): string {
  return normalize(
    pathOrFileUrl.startsWith('file://')
      ? fileURLToPath(pathOrFileUrl)
      : pathOrFileUrl,
  );
}

export default normalisePath;
