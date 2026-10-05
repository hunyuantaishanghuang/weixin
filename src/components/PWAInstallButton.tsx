import React, { useState } from "react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { Download, X, Smartphone } from "lucide-react";

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA or inside webview standalone, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / HarmonyOS browser flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 active:scale-95 transition-all cursor-pointer"
        title="安装到手机桌面 (极速原生 App 体验)"
      >
        <Download className="w-3.5 h-3.5" />
        <span>装到手机</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 active:scale-95 transition-all cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>添加到主屏幕</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-xs rounded-3xl bg-white p-5 shadow-2xl text-center border border-pink-100 animate-card-in">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 text-2xl flex items-center justify-center mx-auto mb-3">
                📱
              </div>
              <h3 className="text-base font-bold text-slate-800">安装到 iPhone 桌面</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed text-left bg-stone-50 p-3 rounded-2xl border border-stone-200/70">
                1. 点击 Safari 底部中间的 <strong>分享图标</strong>（带有向上箭头的方框）<br />
                2. 向下滑动找到并点击 <strong>添加到主屏幕</strong><br />
                3. 点击右上角 <strong>添加</strong> 即可生成全屏桌面应用！
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-full bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                我知道啦
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
