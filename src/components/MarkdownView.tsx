import React, { useState } from 'react';
import { Copy, Check, Download, FileText } from 'lucide-react';
import { CurationData } from '../types.ts';
import { generateFullMarkdown } from '../utils/markdown.ts';

interface MarkdownViewProps {
  data: CurationData;
  onNotify: (msg: string) => void;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ data, onNotify }) => {
  const [copied, setCopied] = useState(false);
  const markdownText = generateFullMarkdown(data);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownText);
      setCopied(true);
      onNotify('전체 마크다운이 클립보드에 복사되었습니다.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onNotify('복사에 실패했습니다.');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = data.keyword.replace(/[^a-zA-Z0-9가-힣]/g, '_');
    link.href = url;
    link.download = `AI_News_${safeName}_Top3.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onNotify('마크다운(.md) 파일이 다운로드되었습니다.');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="px-4 sm:px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          <span className="text-xs sm:text-sm font-semibold">구조화 마크다운(Markdown) 출력본</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">복사 완료</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-300" />
                <span>마크다운 전체 복사</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700"
            title=".md 파일 다운로드"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">.md 저장</span>
          </button>
        </div>
      </div>

      {/* Code / Markdown Preview Area */}
      <div className="p-4 sm:p-5 bg-slate-950 text-slate-100 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed max-h-[500px] overflow-y-auto select-all">
        <pre className="whitespace-pre-wrap">{markdownText}</pre>
      </div>

      {/* Footer tips */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] sm:text-xs text-slate-500 flex items-center justify-between">
        <span>💡 노션(Notion), 슬랙(Slack), 잔디, 옵시디언, 블로그 등에 그대로 붙여넣을 수 있습니다.</span>
      </div>
    </div>
  );
};
