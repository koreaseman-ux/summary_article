import React, { useState } from 'react';
import { Smartphone, QrCode, Copy, Check, ExternalLink, X, Wifi, Globe, ShieldCheck } from 'lucide-react';

interface MobileConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (msg: string) => void;
}

export const MobileConnectModal: React.FC<MobileConnectModalProps> = ({
  isOpen,
  onClose,
  onNotify,
}) => {
  const [copiedLink, setCopiedLink] = useState<'cloud' | 'local' | null>(null);

  if (!isOpen) return null;

  // Google Cloud Run Cloud URL (Accessible from ANY mobile phone with internet)
  const cloudUrl = 'https://ais-pre-zkuns77sjifw4gljzvrobd-675460355521.asia-northeast1.run.app';
  
  // Local network URL guide
  const qrCloudCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    cloudUrl
  )}&margin=10&color=0f172a`;

  const handleCopy = async (url: string, type: 'cloud' | 'local') => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(type);
      onNotify('모바일 접속 링크가 클립보드에 복사되었습니다.');
      setTimeout(() => setCopiedLink(null), 2000);
    } catch {
      onNotify('링크 복사에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">모바일 기기 연결 및 테스트</h3>
              <p className="text-xs text-slate-500">스마트폰에서 즉시 테스트할 수 있는 접속 링크</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* 1. Recommended Method: Public Cloud Live URL */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/50 border border-indigo-100/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white">
                  추천 방법 1
                </span>
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  클라우드 실시간 공개 URL (어디서나 접속)
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium border border-emerald-200/60">
                <ShieldCheck className="w-3 h-3" /> HTTPS 보안 연결
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              와이파이 제약 없이 LTE/5G 모바일 데이터 환경에서도 스마트폰 카메라로 QR 코드를 비추거나 링크를 열면 즉시 실행됩니다.
            </p>

            {/* QR Code and Quick Link Box */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
              {/* QR Code */}
              <div className="p-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs shrink-0 text-center">
                <img
                  src={qrCloudCodeUrl}
                  alt="모바일 접속 QR 코드"
                  className="w-36 h-36 rounded-lg mx-auto"
                />
                <span className="text-[10px] text-slate-500 font-medium block mt-1 flex items-center justify-center gap-1">
                  <QrCode className="w-3 h-3 text-indigo-600" /> 카메라로 스캔
                </span>
              </div>

              {/* URL & Action buttons */}
              <div className="flex-1 w-full space-y-2.5">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">모바일 접속 URL</span>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 break-all select-all">
                    {cloudUrl}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(cloudUrl, 'cloud')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                  >
                    {copiedLink === 'cloud' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>링크 복사 완료!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>모바일 링크 복사</span>
                      </>
                    )}
                  </button>

                  <a
                    href={cloudUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="새 창에서 열기"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Alternative Method: Local Wi-Fi Network */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-700 text-white">
                방법 2
              </span>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-slate-600" />
                동일한 와이파이(공유기) 내 로컬 IP 접속
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              PC와 스마트폰이 <strong>같은 Wi-Fi 공유기</strong>에 연결되어 있다면, PC의 내부 IP 주소로 스마트폰 브라우저에서 직접 접속할 수 있습니다:
            </p>

            <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 space-y-1">
              <div className="text-slate-400 text-[11px] font-sans font-medium">접속 형식 예시:</div>
              <div className="text-indigo-600 font-bold">http://192.168.X.X:3000</div>
            </div>

            <div className="text-[11px] text-slate-500 space-y-1 pl-1">
              <div>• <strong>Windows:</strong> 명령 프롬프트(cmd)에서 <code>ipconfig</code> 실행 ➔ <em>IPv4 주소</em> 확인</div>
              <div>• <strong>Mac:</strong> 터미널에서 <code>ipconfig getifaddr en0</code> 실행 ➔ IP 확인</div>
              <div>• 현재 서버는 이미 <code>0.0.0.0:3000</code>(모든 네트워크 인터페이스 허용)으로 수신 대기 중이므로 별도 옵션 변경 없이 바로 접속됩니다.</div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
