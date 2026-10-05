import React, { useState } from "react";
import { PairState, PageRoute } from "../types";
import { Copy, Check, Heart, Sparkles, ShieldCheck, ArrowRight, X } from "lucide-react";

interface PairPageProps {
  pair: PairState;
  onUpdatePair: (updater: (prev: PairState) => PairState) => void;
  onNavigate: (page: PageRoute) => void;
}

function genCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const PairPage: React.FC<PairPageProps> = ({
  pair,
  onUpdatePair,
  onNavigate,
}) => {
  const [inputCode, setInputCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [showUnbindModal, setShowUnbindModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreate = () => {
    const newCode = genCode();
    onUpdatePair((prev) => ({
      ...prev,
      pairId: newCode,
      status: "created",
      memberA: "user_a",
      memberB: "",
      currentRole: "A",
    }));
  };

  const handleJoin = () => {
    const code = inputCode.trim().toUpperCase();
    if (code.length !== 6) {
      setErrorMsg("请输入6位识别码");
      setTimeout(() => setErrorMsg(""), 2500);
      return;
    }
    onUpdatePair((prev) => ({
      ...prev,
      pairId: code,
      status: "pending",
      memberA: "user_a",
      pendingB: "user_b",
      memberB: "",
      currentRole: "A",
    }));
  };

  const handleConfirmBind = () => {
    onUpdatePair((prev) => ({
      ...prev,
      status: "bound",
      memberB: prev.pendingB || "user_b",
      pendingB: undefined,
      bindTime: new Date().toISOString(),
    }));
  };

  const handleUnbind = () => {
    onUpdatePair(() => ({
      pairId: "",
      status: "unbound",
      memberA: "",
      memberB: "",
      currentRole: "A",
      nicknameA: "男孩",
      nicknameB: "女孩",
      genderA: "male",
      genderB: "female",
      theme: "pink",
    }));
    setShowUnbindModal(false);
  };

  const handleUpdateGenderA = (gender: "male" | "female") => {
    onUpdatePair((prev) => ({ ...prev, genderA: gender }));
  };

  const handleUpdateGenderB = (gender: "male" | "female") => {
    onUpdatePair((prev) => ({ ...prev, genderB: gender }));
  };

  const handleUpdateNicknameA = (name: string) => {
    onUpdatePair((prev) => ({ ...prev, nicknameA: name }));
  };

  const handleUpdateNicknameB = (name: string) => {
    onUpdatePair((prev) => ({ ...prev, nicknameB: name }));
  };

  const handleUpdateTheme = (theme: "pink" | "blue") => {
    onUpdatePair((prev) => ({ ...prev, theme }));
  };

  const isBlue = pair.theme === "blue";

  return (
    <div className="flex-1 pb-24 px-4 pt-6 max-w-sm mx-auto w-full flex flex-col justify-center items-center space-y-4">
      {/* Pair Status Card */}
      <div className={`w-full bg-white rounded-3xl p-6 sm:p-7 shadow-[0_12px_36px_rgba(0,0,0,0.06)] border text-center animate-card-in ${
        isBlue ? "border-blue-100" : "border-pink-100/80"
      }`}>
        
        {/* Step: Unbound */}
        {pair.status === "unbound" && (
          <div>
            <div className="w-16 h-16 rounded-3xl bg-pink-50 text-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              💕
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-1.5">伴侣专属连线</h2>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              绑定后，你们的点菜、经期推算、心情日记与私密留言都将安全隔离，只属于彼此。
            </p>

            <button
              onClick={handleCreate}
              className="w-full py-3 rounded-full bg-[#FF5370] hover:bg-[#fa3c5d] active:scale-95 text-white font-semibold text-xs shadow-md shadow-pink-200 transition-all cursor-pointer"
            >
              创建我的识别码
            </button>

            <div className="flex items-center my-5">
              <div className="flex-1 h-px bg-slate-200/70"></div>
              <span className="px-3 text-xs text-slate-400">或者输入TA的码</span>
              <div className="flex-1 h-px bg-slate-200/70"></div>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                maxLength={6}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="输入TA发来的6位识别码"
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-[#FF5370] focus:bg-white text-center font-mono font-bold tracking-widest text-base uppercase outline-none transition-all placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-normal placeholder:text-xs"
              />
              <button
                onClick={handleJoin}
                className="w-full py-3 rounded-full bg-pink-50 hover:bg-pink-100 active:scale-95 text-[#FF5370] font-semibold text-xs transition-all cursor-pointer"
              >
                加入TA的关系
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-500 mt-3 animate-pulse">{errorMsg}</p>
            )}
          </div>
        )}

        {/* Step: Created (Waiting for partner) */}
        {pair.status === "created" && (
          <div>
            <div className="w-16 h-16 rounded-3xl bg-pink-50 text-3xl flex items-center justify-center mx-auto mb-4">
              ✨
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-1.5">把识别码发给TA</h2>

            <div
              onClick={() => handleCopy(pair.pairId)}
              className="my-5 p-4 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200/80 cursor-pointer active:scale-98 transition-all group"
            >
              <div className="text-3xl font-mono font-black text-[#FF5370] tracking-widest">
                {pair.pairId}
              </div>
              <div className="flex items-center justify-center space-x-1 text-xs text-pink-400 mt-1.5 font-medium">
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-semibold">已复制到剪贴板！</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>点击直接复制</span>
                  </>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              等待TA在伴侣页面输入识别码加入，并等你最终确认…
            </p>

            {/* Quick helper for single-player testing */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  onUpdatePair((prev) => ({
                    ...prev,
                    status: "pending",
                    pendingB: "user_b",
                  }));
                }}
                className="w-full py-2.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-600 text-xs font-medium transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>模拟测试：伴侣申请加入该码</span>
              </button>
            </div>
          </div>
        )}

        {/* Step: Pending (Partner applied) */}
        {pair.status === "pending" && (
          <div>
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-3xl flex items-center justify-center mx-auto mb-4 animate-bounce">
              🔔
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-1.5">TA申请加入啦！</h2>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              识别码 <span className="font-mono font-bold text-[#FF5370]">{pair.pairId}</span> 收到伴侣连线请求，确认后你们将正式开启双人生活空间。
            </p>

            <button
              onClick={handleConfirmBind}
              className="w-full py-3 rounded-full bg-[#FF5370] hover:bg-[#fa3c5d] active:scale-95 text-white font-semibold text-xs shadow-md shadow-pink-200 transition-all cursor-pointer"
            >
              确认绑定并开启
            </button>
          </div>
        )}

        {/* Step: Bound */}
        {pair.status === "bound" && (
          <div>
            <div className="w-16 h-16 rounded-3xl bg-pink-50 text-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              💞
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">已成功绑定！</h2>
            
            <div className="text-xs text-slate-500 mb-4 flex items-center justify-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>数据双人加密隔离已开启</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6">
              <div className="text-[11px] text-slate-400 mb-1">专属关系识别码</div>
              <div className="text-2xl font-mono font-black text-slate-800 tracking-widest">
                {pair.pairId}
              </div>
              <button
                onClick={() => handleCopy(pair.pairId)}
                className="mt-2 text-xs text-[#FF5370] hover:underline flex items-center justify-center space-x-1 mx-auto cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "已复制" : "复制备查"}</span>
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => onNavigate("home")}
                className="w-full py-3 rounded-full bg-[#FF5370] hover:bg-[#fa3c5d] active:scale-95 text-white font-semibold text-xs shadow-md shadow-pink-200 transition-all cursor-pointer flex items-center justify-center space-x-1"
              >
                <span>回到首页享受小日子</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowUnbindModal(true)}
                className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 text-xs font-semibold transition-all cursor-pointer"
              >
                解除伴侣绑定
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Couple Profiles & Gender Settings Card */}
      <div className={`w-full bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border text-left space-y-4 animate-card-in ${
        isBlue ? "border-blue-100" : "border-pink-100/80"
      }`}>
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center space-x-1.5">
            <span className="text-base">👫</span>
            <h3 className="font-bold text-slate-800 text-sm">双人信息与性别设置</h3>
          </div>
          <span className="text-[11px] text-slate-400">区分男女与便签色彩</span>
        </div>

        {/* Member A Config */}
        <div className="space-y-1.5 p-3 rounded-2xl bg-stone-50 border border-stone-100">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">成员 A (我)</span>
            <span className="text-[11px] text-slate-400">当前角色：{pair.currentRole === "A" ? "正在使用" : "伴侣"}</span>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="text"
              value={pair.nicknameA}
              onChange={(e) => handleUpdateNicknameA(e.target.value)}
              placeholder="成员A昵称 (如: 男孩/阿杰)"
              className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#FF5370]"
            />
            
            {/* Gender toggle A */}
            <div className="flex rounded-xl bg-stone-200/60 p-0.5 text-xs shrink-0">
              <button
                type="button"
                onClick={() => handleUpdateGenderA("male")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  pair.genderA === "male"
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                👦 男
              </button>
              <button
                type="button"
                onClick={() => handleUpdateGenderA("female")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  pair.genderA === "female"
                    ? "bg-rose-500 text-white shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                👧 女
              </button>
            </div>
          </div>
        </div>

        {/* Member B Config */}
        <div className="space-y-1.5 p-3 rounded-2xl bg-stone-50 border border-stone-100">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">成员 B (TA)</span>
            <span className="text-[11px] text-slate-400">当前角色：{pair.currentRole === "B" ? "正在使用" : "伴侣"}</span>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="text"
              value={pair.nicknameB}
              onChange={(e) => handleUpdateNicknameB(e.target.value)}
              placeholder="成员B昵称 (如: 女孩/小暖)"
              className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#FF5370]"
            />
            
            {/* Gender toggle B */}
            <div className="flex rounded-xl bg-stone-200/60 p-0.5 text-xs shrink-0">
              <button
                type="button"
                onClick={() => handleUpdateGenderB("male")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  pair.genderB === "male"
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                👦 男
              </button>
              <button
                type="button"
                onClick={() => handleUpdateGenderB("female")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  pair.genderB === "female"
                    ? "bg-rose-500 text-white shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                👧 女
              </button>
            </div>
          </div>
        </div>

        {/* Background Version Switcher */}
        <div className="space-y-2 p-3 rounded-2xl bg-stone-50 border border-stone-100">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">背景版本风格</span>
            <span className="text-[11px] text-slate-400">蓝色/粉色随心切换</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleUpdateTheme("pink")}
              className={`p-2.5 rounded-xl border flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                pair.theme === "pink"
                  ? "bg-rose-50 border-rose-400 text-rose-700 ring-2 ring-rose-300 font-semibold"
                  : "bg-white border-stone-200 text-stone-600 hover:bg-rose-50/50"
              }`}
            >
              <span>🌸</span>
              <span className="text-xs">浪漫粉版</span>
            </button>

            <button
              type="button"
              onClick={() => handleUpdateTheme("blue")}
              className={`p-2.5 rounded-xl border flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                pair.theme === "blue"
                  ? "bg-blue-50 border-blue-400 text-blue-700 ring-2 ring-blue-300 font-semibold"
                  : "bg-white border-stone-200 text-stone-600 hover:bg-blue-50/50"
              }`}
            >
              <span>💙</span>
              <span className="text-xs">澄澈蓝版</span>
            </button>
          </div>
        </div>
      </div>

      {/* Unbind Confirmation Modal */}
      {showUnbindModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl text-center animate-card-in border border-pink-100">
            <h4 className="text-base font-bold text-slate-800 mb-2">解除伴侣绑定</h4>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              解除后双方数据将不再互通，确定要解除你们的关系吗？
            </p>
            <div className="flex space-x-2.5">
              <button
                onClick={() => setShowUnbindModal(false)}
                className="flex-1 py-2.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                我再想想
              </button>
              <button
                onClick={handleUnbind}
                className="flex-1 py-2.5 rounded-full bg-red-500 text-white text-xs font-semibold hover:bg-red-600 shadow-md shadow-red-200 transition-colors cursor-pointer"
              >
                确定解绑
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
