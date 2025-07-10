import fs from 'fs';
import path from 'path';

const fixturesDir = path.join(process.cwd(), '__fixtures__');

export const testDirPath = (dir: string) =>
  path.join(process.cwd(), '__fixtures__', dir);

export function createDummyWithContent({
  files,
  dir,
}: {
  files: Record<string, string>;
  dir: string;
}) {
  for (const [file, content] of Object.entries(files)) {
    const fullPath = path.join(fixturesDir, dir, file);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
  }
}

export function createDummy({ files, dir }: { files: string[]; dir: string }) {
  for (const file of files) {
    const fullPath = path.join(fixturesDir, dir, file);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, '');
  }
}

export function deleteDummy(dir: string) {
  if (fs.existsSync(testDirPath(dir))) {
    fs.rmSync(path.join(fixturesDir, dir), {
      recursive: true,
      force: true,
    });
  }
}
