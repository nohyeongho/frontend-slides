/**
 * @file export-pdf.js
 * @description HTML 프레젠테이션을 1920x1080 고해상도 PDF로 내보내는 크로스 플랫폼(Windows/macOS/Linux) Node.js 스크립트입니다.
 * 
 * [왜 이렇게 작성했는가?]
 * - 원본 `export-pdf.sh`는 리눅스/맥용 Bash 스크립트이므로 윈도우 환경(PowerShell/CMD)에서 실행 시 호환성 문제가 발생합니다.
 * - 본 Node.js 스크립트는 Playwright를 직접 구동하고 내장 로컬 HTTP 서버를 띄워 폰트/이미지 등의 에셋이 정상 로드된 상태에서 각 슬라이드를 캡처 및 PDF로 결합합니다.
 * 
 * [사용법]
 *   node scripts/export-pdf.js <HTML파일경로> [출력PDF경로] [--compact]
 *   예: node scripts/export-pdf.js ./presentation.html ./output.pdf
 */

import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync, existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { join, extname, resolve, dirname, basename } from 'path';

// 1. 명령행 인자 파싱
const args = process.argv.slice(2);
let isCompact = false;
let inputHtmlArg = '';
let outputPdfArg = '';

for (const arg of args) {
  if (arg === '--compact') {
    isCompact = true;
  } else if (!inputHtmlArg) {
    inputHtmlArg = arg;
  } else if (!outputPdfArg) {
    outputPdfArg = arg;
  }
}

if (!inputHtmlArg) {
  console.error('\n❌ 사용법: node scripts/export-pdf.js <HTML파일경로> [출력PDF경로] [--compact]');
  console.error('예: node scripts/export-pdf.js ./sample-deck.html ./presentation.pdf\n');
  process.exit(1);
}

const inputHtml = resolve(process.cwd(), inputHtmlArg);
if (!existsSync(inputHtml)) {
  console.error(`\n❌ 파일을 찾을 수 없습니다: ${inputHtml}\n`);
  process.exit(1);
}

const serveDir = dirname(inputHtml);
const htmlFilename = basename(inputHtml);
const outputPdf = outputPdfArg
  ? resolve(process.cwd(), outputPdfArg)
  : join(serveDir, `${basename(inputHtml, extname(inputHtml))}.pdf`);

const vpWidth = isCompact ? 1280 : 1920;
const vpHeight = isCompact ? 720 : 1080;

console.log('\n========================================');
console.log('       Frontend Slides PDF 내보내기       ');
console.log('========================================');
console.log(`- 입력 파일: ${inputHtml}`);
console.log(`- 출력 PDF: ${outputPdf}`);
console.log(`- 해상도: ${vpWidth}x${vpHeight} (${isCompact ? '컴팩트 모드' : 'Full HD 고해상도'})`);

// 2. 에셋(폰트, 이미지 등) 로딩을 위한 간이 로컬 HTTP 서버 실행
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

const server = createServer((req, res) => {
  const decodedUrl = decodeURIComponent(req.url || '/');
  const relPath = decodedUrl === '/' ? htmlFilename : decodedUrl.replace(/^\//, '');
  const filePath = join(serveDir, relPath);

  try {
    if (existsSync(filePath)) {
      const content = readFileSync(filePath);
      const ext = extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(content);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  } catch (err) {
    res.writeHead(500);
    res.end('Server error');
  }
});

const port = await new Promise((res) => {
  server.listen(0, '127.0.0.1', () => {
    const addr = server.address();
    res(typeof addr === 'object' && addr ? addr.port : 8000);
  });
});

console.log(`\n[1/4] 로컬 에셋 서버 시작됨 (Port: ${port})`);

try {
  // 3. Playwright 브라우저 실행 및 슬라이드 감지
  console.log('[2/4] Headless 브라우저 실행 중...');
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: vpWidth, height: vpHeight },
  });

  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000); // 폰트 및 초기 애니메이션 렌더링 대기

  const slideCount = await page.evaluate(() => {
    return document.querySelectorAll('.slide').length;
  });

  if (slideCount === 0) {
    throw new Error('프레젠테이션에서 .slide 요소를 찾을 수 없습니다.');
  }

  console.log(`[3/4] 총 ${slideCount}개의 슬라이드 캡처 시작...`);

  const tempScreenshots = [];
  const tempDir = join(serveDir, '.temp-pdf-screenshots');
  mkdirSync(tempDir, { recursive: true });

  for (let i = 0; i < slideCount; i++) {
    // 슬라이드 활성화 전환
    await page.evaluate((index) => {
      const slides = document.querySelectorAll('.slide');
      slides.forEach((slide, idx) => {
        if (idx === index) {
          slide.style.display = '';
          slide.style.opacity = '1';
          slide.style.visibility = 'visible';
          slide.style.position = 'relative';
          slide.style.transform = 'none';
          slide.classList.add('active');
        } else {
          slide.style.display = 'none';
          slide.classList.remove('active');
        }
      });
    }, i);

    await page.waitForTimeout(400); // 화면 안정화 대기
    const shotPath = join(tempDir, `slide-${String(i + 1).padStart(3, '0')}.png`);
    await page.screenshot({ path: shotPath });
    tempScreenshots.push(shotPath);
    console.log(`  - 슬라이드 ${i + 1}/${slideCount} 캡처 완료`);
  }

  await browser.close();

  // 4. 캡처된 이미지들을 단일 PDF로 조합
  console.log('[4/4] PDF 문서 생성 중...');
  
  // HTML 기반 PDF 조립 페이지 생성
  const pdfBuilderBrowser = await chromium.launch();
  const pdfPage = await pdfBuilderBrowser.newPage();

  const imgHtmlList = tempScreenshots.map((shotPath) => {
    const base64 = readFileSync(shotPath).toString('base64');
    return `<div class="pdf-page"><img src="data:image/png;base64,${base64}" /></div>`;
  }).join('\n');

  const pdfTemplate = `
<!DOCTYPE html>
<html>
<head>
  <style>
    @page {
      size: ${vpWidth}px ${vpHeight}px;
      margin: 0;
    }
    body {
      margin: 0;
      padding: 0;
      background: #000;
    }
    .pdf-page {
      width: ${vpWidth}px;
      height: ${vpHeight}px;
      page-break-after: always;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  </style>
</head>
<body>
  ${imgHtmlList}
</body>
</html>
  `;

  await pdfPage.setContent(pdfTemplate, { waitUntil: 'load' });
  await pdfPage.pdf({
    path: outputPdf,
    width: `${vpWidth}px`,
    height: `${vpHeight}px`,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await pdfBuilderBrowser.close();

  // 임시 캡처 이미지 정리
  for (const shot of tempScreenshots) {
    try { unlinkSync(shot); } catch (e) {}
  }

  console.log(`\n🎉 PDF 생성 성공!`);
  console.log(`📄 파일 위치: ${outputPdf}\n`);

} catch (err) {
  console.error('\n❌ PDF 내보내기 실패:', err.message);
} finally {
  server.close();
}
