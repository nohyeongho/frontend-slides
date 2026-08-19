# 🎨 Frontend Slides (프론트엔드 슬라이드) 사용자 가이드

> **웹 기술(HTML/CSS/JS)과 코딩 에이전트(AI)의 프론트엔드 역량을 결합하여, 설치나 빌드 과정 없는 무의존성(Zero-Dependency) 고품질 애니메이션 웹 프레젠테이션을 제작하고 PowerPoint(PPTX)를 웹 슬라이드로 변환하는 스킬입니다.**

---

## 🌟 주요 특징

1. **무의존성 단일 HTML 파일 (Zero Dependencies)**
   - npm 빌드나 별도의 프레임워크 설치 없이, 브라우저에서 바로 더블 클릭해 열 수 있는 독립적인 단일 HTML 파일로 완성됩니다.
2. **시각적 스타일 탐색 (Show, Don't Tell)**
   - 디자인 용어를 몰라도 괜찮습니다. AI가 3가지 고유한 스타일 미리보기(Style A, B, C)를 생성해 보여주며 마음에 드는 디자인을 직접 선택할 수 있습니다.
3. **16:9 고정 뷰포트 비율 (Fixed Stage)**
   - 어떤 화면(모바일, 태블릿, 와이드 모니터)에서도 레이아웃이 깨지지 않는 완벽한 1920×1080 고정 비율 뷰포트 스케일링을 지원합니다.
4. **기존 PPTX 완벽 변환**
   - 기존의 PowerPoint(`.pptx`) 파일에서 텍스트, 이미지, 발표자 노트를 자동으로 추출하여 현대적인 웹 슬라이드로 재탄생시킵니다.
5. **34개 볼드 템플릿 팩 & 12개 내장 프리셋**
   - 진부한 "AI 슬롭(보라색 그라디언트 일색)"을 탈피한 네오 브루탈리즘, 에디토리얼 매거진, 레트로 윈도우, 스위스 모던 등 수준 높은 디자인 시스템을 지원합니다.
6. **인라인 편집(E 키) 및 PDF/웹 배포 지원**
   - 완성된 슬라이드 화면에서 키보드 `E` 키를 누르면 텍스트를 바로 수정하고 `Ctrl+S`로 저장할 수 있습니다.

---

## 📁 프로젝트 폴더 구조

```text
d:\app_github\13_PPT작업\
├── bold-template-pack/       # 34종의 전문가급 볼드 템플릿 시스템
│   ├── selection-index.json  # 템플릿 인덱스 메타데이터
│   └── templates/            # 각 템플릿별 preview.md 및 design.md
├── scripts/
│   ├── extract-pptx.py       # PPTX 내용 추출 파이썬 스크립트
│   ├── export-pdf.js         # Playwright 기반 PDF 변환 Node.js 스크립트
│   ├── export-pdf.ps1        # Windows PowerShell용 PDF 변환 스크립트
│   ├── deploy.ps1            # Windows PowerShell용 Vercel 배포 스크립트
│   ├── deploy.sh             # Linux/macOS용 Vercel 배포 스크립트
│   └── export-pdf.sh         # Linux/macOS용 PDF 변환 스크립트
├── animation-patterns.md     # 분위기별 CSS 애니메이션 패턴 정의
├── html-template.md          # 슬라이드 HTML 기본 아키텍처 및 JS 로직
├── STYLE_PRESETS.md          # 12종 내장 스타일 프리셋 가이드
├── viewport-base.css         # 16:9 고정 뷰포트 필수 CSS
├── SKILL.md                  # 에이전트 스킬 핵심 정의 문서
├── requirements.txt          # 파이썬 의존성 (python-pptx)
├── package.json              # Node.js 의존성 (playwright)
└── README.ko.md              # 한국어 사용 가이드 (본 문서)
```

---

## 🚀 사용 방법

### 1️⃣ 새로운 슬라이드 제작 요청하기
에이전트에게 원하는 프레젠테이션 주제를 자유롭게 말해주세요.
> **예시 프롬프트:**
> - "2026년 AI 트렌드 및 기업 도입 전략을 주제로 8장의 발표용 슬라이드를 만들어줘"
> - "우리 스타트업의 IR 투자 유치용 피치덱을 만들어줘"

**진행 과정:**
1. **내용 파악**: 목적, 대상 청중, 슬라이드 수, 밀도(발표용/보고서용) 등을 확인
2. **스타일 3종 미리보기 생성**: 1종 기본 프리셋 + 1종 볼드 템플릿 + 1종 맞춤 디자인 미리보기 생성 및 확인
3. **스타일 선택**: 마음에 드는 스타일 번호 또는 느낌 선택
4. **최종 슬라이드 완성**: 전체 HTML 파일 생성 후 브라우저에서 자동 실행

---

### 2️⃣ 기존 PowerPoint(.pptx) 파일 변환하기
기존의 PPTX 파일을 프로젝트 폴더에 넣고 변환을 요청하세요.

> **예시 프롬프트:**
> - "`business-report.pptx` 파일을 웹 슬라이드로 변환해줘"

**수동 추출 실행 방법 (필요 시):**
```powershell
# python-pptx 설치
pip install -r requirements.txt

# pptx 파일 추출 실행
python scripts/extract-pptx.py my-presentation.pptx
```
- 추출된 텍스트와 발표자 노트는 `extracted-slides.json`으로 저장되고, 이미지는 `assets/` 폴더에 자동 분류됩니다.

---

### 3️⃣ PDF 파일로 내보내기

생성된 웹 슬라이드를 고해상도 PDF 문서로 변환합니다.

```powershell
# 최초 1회: Playwright 브라우저 설치
npx playwright install chromium

# PDF 변환 실행 (PowerShell)
.\scripts\export-pdf.ps1 -HtmlPath .\sample-deck.html

# 또는 Node.js로 직접 실행
node scripts/export-pdf.js .\sample-deck.html .\output.pdf

# 용량 절감 컴팩트 모드 (720p)
node scripts/export-pdf.js .\sample-deck.html .\output.pdf --compact
```

---

### 4️⃣ 웹(Vercel)으로 원클릭 무료 배포하기

전 세계 어디서나 모바일/PC 링크로 볼 수 있게 Vercel에 무료 배포합니다.

```powershell
# 배포 실행
.\scripts\deploy.ps1 -PresentationPath .\sample-deck.html
```

---

## ⌨️ 슬라이드 뷰어 단축키

슬라이드를 브라우저에서 열었을 때 사용할 수 있는 단축키입니다:

| 단축키 | 기능 |
| :--- | :--- |
| **`→` / `Space` / `PageDown`** | 다음 슬라이드 |
| **`←` / `PageUp`** | 이전 슬라이드 |
| **`Home` / `End`** | 첫 번째 / 마지막 슬라이드로 이동 |
| **`F`** | 전체 화면 (Fullscreen) 토글 |
| **`E`** | **인라인 텍스트 편집 모드** 토글 (클릭하여 수정 후 `Ctrl+S`로 저장) |
