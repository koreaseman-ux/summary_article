import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Server, Layout, Key, ShieldCheck } from 'lucide-react';

interface ApiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (msg: string) => void;
}

export const ApiGuideModal: React.FC<ApiGuideModalProps> = ({
  isOpen,
  onClose,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'env' | 'backend' | 'frontend' | 'prompt'>('env');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    onNotify('코드가 클립보드에 복사되었습니다.');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const envCode = `# .env 파일에 추가
# Google AI Studio(https://aistudio.google.com/)에서 API 키를 발급받아 입력합니다.
GEMINI_API_KEY="AIzaSy..."

# 서버 포트 (기본값: 3000)
PORT=3000
NODE_ENV=production`;

  const backendCode = `// server.ts (Express + @google/genai)
import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

// 1. Gemini 클라이언트 초기화 (서버사이드에서만 API 키 사용)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' },
  },
});

// 2. 최신 기사 검색 및 3건 요약 API 엔드포인트
app.post('/api/search-news', async (req, res) => {
  try {
    const { keyword } = req.body;
    if (!keyword) return res.status(400).json({ error: '키워드가 필요합니다.' });

    const prompt = \`사용자 키워드: "\${keyword}"
Google Search 도구를 사용하여 "\${keyword}" 관련 최신 신뢰성 높은 기사 3건을 선별하세요.
각 기사마다 3~4문장의 한글 핵심 요약과 실제 원문 URL을 아래 JSON 형식으로 반환하세요:
{
  "keyword": "\${keyword}",
  "searchDate": "\${new Date().toISOString().split('T')[0]}",
  "overallSummary": "종합 2~3문장 분석",
  "articles": [
    {
      "id": 1,
      "title": "📌 기사 제목",
      "summary": "3~4문장 한글 핵심 요약",
      "keyPoints": ["포인트1", "포인트2", "포인트3"],
      "url": "https://실제기사URL",
      "source": "언론사명",
      "categoryTag": "분야"
    }
  ]
}\`;

    // 3. Google Search Grounding 도구 적용 호출
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // 실시간 구글 웹 검색 연동!
      },
    });

    const text = response.text || '{}';
    const jsonMatch = text.match(/\`\`\`(?:json)?\\s*([\\s\\S]*?)\\s*\`\`\`/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[1] : text);

    res.json(parsed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '기사 분석 중 오류가 발생했습니다.' });
  }
});

app.listen(3000, () => console.log('API Server running on http://localhost:3000'));`;

  const frontendCode = `// React 컴포넌트 내 호출 예시 (App.tsx / custom hook)
import { useState } from 'react';

export function useNewsCurator() {
  const [loading, setLoading] = useState(false);
  const [curation, setCuration] = useState(null);

  const searchArticles = async (keyword: string) => {
    setLoading(true);
    try {
      // 프론트엔드는 자체 서버의 프록시 API를 호출하므로 API 키가 노출되지 않습니다.
      const response = await fetch('/api/search-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      });
      const data = await response.json();
      setCuration(data);
      return data;
    } catch (err) {
      console.error('검색 실패:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { searchArticles, loading, curation };
}`;

  const promptSpecCode = `# AI 프롬프트 지침 (Prompt Architecture)

1. 역할: 최신 웹 기사 전문 큐레이터 및 요약 어시스턴트
2. 도구: tools: [{ googleSearch: {} }] (Gemini Google Search Grounding)
3. 출력 요구사항:
   - 📌 기사 제목
   - 📝 핵심 요약 (3~4문장의 핵심 내용 정리)
   - 🔗 원문 링크 (URL)
4. 응답 언어: 자연스럽고 정확한 한국어
5. 선별 기준: 신뢰도 높은 언론사, 최근 발행일자, 주제 직접 연관성`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                웹앱 구현 및 API 연동 가이드
              </h3>
              <p className="text-xs text-slate-500">
                Google Gen AI SDK(@google/genai) + Search Grounding 아키텍처
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-5 gap-2 overflow-x-auto text-xs font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('env')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'env'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            1. 환경변수 & API KEY
          </button>

          <button
            onClick={() => setActiveTab('backend')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'backend'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            2. 백엔드 (Express + GenAI)
          </button>

          <button
            onClick={() => setActiveTab('frontend')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'frontend'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            3. 프론트엔드 (React)
          </button>

          <button
            onClick={() => setActiveTab('prompt')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'prompt'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            4. 프롬프트 & 산출물 스펙
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed flex-1">
          {activeTab === 'env' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-indigo-950 text-xs sm:text-sm">
                    API KEY 보안 및 설정 원칙
                  </h4>
                  <p className="text-xs text-indigo-800 mt-1">
                    Google AI Studio 가이드라인에 따라 API Key는 <strong>절대 브라우저(클라이언트) 코드에 노출하지 않으며</strong>, 
                    반드시 백엔드 서버(Node.js / Express)의 환경 변수(<code>process.env.GEMINI_API_KEY</code>)를 통해 관리합니다.
                  </p>
                </div>
              </div>

              <h4 className="font-semibold text-slate-900 mt-2">API 키 발급 및 설정 방법:</h4>
              <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-600">
                <li>
                  <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-medium">
                    Google AI Studio
                  </a>에 접속하여 <strong>Get API Key</strong> 메뉴에서 키를 무료로 발급받습니다.
                </li>
                <li>
                  로컬 개발 환경에서는 프로젝트 루트의 <code>.env</code> 파일에 키를 저장합니다.
                </li>
                <li>
                  AI Studio 배포 환경에서는 상단 메뉴 <strong>Settings &gt; Secrets</strong>에서 <code>GEMINI_API_KEY</code>를 등록하면 자동으로 주입됩니다.
                </li>
              </ol>

              <div className="relative mt-2">
                <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto">
                  {envCode}
                </pre>
                <button
                  onClick={() => copyCode(envCode, 'env')}
                  className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors"
                  title="코드 복사"
                >
                  {copiedKey === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'backend' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                최신 <code>@google/genai</code> SDK의 <strong>Google Search Grounding</strong> 기능을 활성화하여 
                실시간 웹 뉴스를 검색하고, 요구사항에 맞춰 3건의 핵심 기사를 요약하여 클라이언트에 응답하는 백엔드 코드입니다.
              </p>

              <div className="relative">
                <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto max-h-[350px]">
                  {backendCode}
                </pre>
                <button
                  onClick={() => copyCode(backendCode, 'backend')}
                  className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors"
                  title="코드 복사"
                >
                  {copiedKey === 'backend' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'frontend' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                React 프론트엔드에서는 프록시 API(<code>/api/search-news</code>)로 사용자 키워드를 전송하여 데이터를 수신합니다.
              </p>

              <div className="relative">
                <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto max-h-[350px]">
                  {frontendCode}
                </pre>
                <button
                  onClick={() => copyCode(frontendCode, 'frontend')}
                  className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors"
                  title="코드 복사"
                >
                  {copiedKey === 'frontend' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'prompt' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                모바일 화면에서도 직관적이고 가독성이 극대화되도록 설정된 핵심 마크다운 구조 및 프롬프트 규격입니다.
              </p>

              <div className="relative">
                <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto">
                  {promptSpecCode}
                </pre>
                <button
                  onClick={() => copyCode(promptSpecCode, 'prompt')}
                  className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors"
                  title="코드 복사"
                >
                  {copiedKey === 'prompt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Powered by Gemini 3.8 Flash & Google Search Grounding
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
