# 📰 실시간 뉴스 큐레이션 및 AI 기사 요약 앱 (Summary Article)

`koreaseman-ux/summary_article` 저장소에서 포크 및 설정된 실시간 뉴스 큐레이션 및 AI 기사 요약 애플리케이션입니다.

## ✨ 주요 기능
- **실시간 뉴스 검색 및 수집**: 구글 뉴스 RSS 피드를 연동하여 최신 기사를 실시간으로 가져옵니다.
- **AI 기사 분석 및 요약**: Google Gemini API를 활용하여 0~100점 중요도 점수 산출, 핵심 3줄 요약, 주요 포인트(Key Points), 전체 종합 브리핑을 제공합니다.
- **북마크 및 마크다운 내보내기**: 마음에 드는 기사 북마크 보관, 마크다운 형식 변환 및 원터치 클립보드 복사.
- **모바일 연동 지원**: 동일 Wi-Fi 네트워크에서 모바일 접속을 위한 안내 및 인터페이스 제공.

---

## 🚀 빠른 시작

### 1. API 키 설정 (`.env`)
프로젝트 폴더의 `.env` 파일에 발급받은 Google Gemini API 키를 입력합니다:
```env
GEMINI_API_KEY="여기에_발급받은_Gemini_API_키_입력"
```
> API 키는 [Google AI Studio](https://aistudio.google.com/)에서 무료로 발급받으실 수 있습니다.

### 2. 서버 실행
- **방법 1 (원클릭 실행)**: `start.bat` 파일을 더블 클릭하여 실행합니다.
- **방법 2 (터미널 실행)**:
  ```bash
  npm run dev
  ```

### 3. 접속
브라우저에서 `http://localhost:3000` 으로 접속합니다.

---

## ☁️ Vercel 배포 안내

1. **GitHub 저장소 연동**: Vercel에 이 저장소를 Import합니다.
2. **Framework Preset**: `Vite` (또는 Other) 자동 감지
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **환경 변수(Environment Variables) 설정**:
   - `GEMINI_API_KEY`: 발급받은 Google Gemini API 키
   > 💡 `api/index.js`를 통해 Vercel Serverless Function으로 구글 뉴스 검색 및 Gemini AI 요약 엔드포인트(`/api/search-news`, `/api/health`)가 자동 배포됩니다.

---

## 🛠️ 기술 스택
- **Frontend**: React 19, Vite 8, TailwindCSS 4, Lucide Icons, Motion
- **Backend / Serverless**: Express, TSX, esbuild, Vercel Serverless Functions
- **AI Model**: Google Gemini (`@google/genai`)
