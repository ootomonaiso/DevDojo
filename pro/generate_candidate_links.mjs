// pro/generate_candidate_links.js
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { promisify } from 'util';
import { glob } from 'glob';

const globPromise = promisify(glob);

async function generateCandidateLinks() {
  // ビルド成果物のディレクトリ（例: pro/build）
  const buildDir = path.join(process.cwd(), 'build');
  const pattern = path.join(buildDir, '**/*.html');
  const files = await globPromise(pattern);

  const candidates = [];

  for (const file of files) {
    try {
      const htmlContent = fs.readFileSync(file, 'utf8');
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;
      // <title>タグからタイトルを抽出、なければファイル名を使用
      const titleElement = document.querySelector('title');
      const title = titleElement ? titleElement.textContent.trim() : path.basename(file, '.html');

      // ビルドディレクトリ以下の相対パスを URL として利用
      let relativeUrl = file.replace(buildDir, '');
      relativeUrl = relativeUrl.replace(/\\/g, '/'); // Windows 対応
      // index.html はディレクトリルートとして扱う
      const url = relativeUrl.endsWith('index.html')
        ? relativeUrl.replace('index.html', '')
        : relativeUrl;

      candidates.push({
        title,
        url
      });
    } catch (err) {
      console.error(`Error processing file ${file}: ${err.message}`);
    }
  }

  // 候補リンク一覧を JSON ファイルとして出力（pro/build/candidate-links.json）
  const outputPath = path.join(buildDir, 'candidate-links.json');
  fs.writeFileSync(outputPath, JSON.stringify({ candidates }, null, 2), 'utf8');
  console.log(`Candidate links generated at ${outputPath}`);
}

generateCandidateLinks().catch(err => {
  console.error('Error generating candidate links:', err);
  process.exit(1);
});
