import React, { useState } from "react";
import { PairState, PageRoute } from "../types";
import {
  Copy,
  Check,
  Heart,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  X,
  Cloud,
  Terminal,
  RefreshCw,
  ExternalLink,
  Database,
  Server,
  User,
  Users,
  Lock,
  Layers,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  LogIn,
  LogOut,
} from "lucide-react";
import { cloudBaseService, CloudBaseConfig } from "../services/cloudbase";
import { AuthModal } from "./AuthModal";
import { authService } from "../services/auth";
import { AuthUser } from "../types";

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

// Preset simulated WeChat users for testing multi-account pairing
interface WeChatAccount {
  openid: string;
  name: string;
  avatar: string;
  gender: "male" | "female";
  role: "A" | "B";
}

const WECHAT_TEST_ACCOUNTS: WeChatAccount[] = [
  { openid: "wx_openid_jack_001", name: "阿杰", avatar: "👦", gender: "male", role: "A" },
  { openid: "wx_openid_lucy_002", name: "小鹿", avatar: "👧", gender: "female", role: "B" },
  { openid: "wx_openid_guest_999", name: "新微信用户", avatar: "👤", gender: "male", role: "A" },
];

export const PairPage: React.FC<PairPageProps> = ({
  pair,
  onUpdatePair,
  onNavigate,
}) => {
  const [inputCode, setInputCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [showUnbindModal, setShowUnbindModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Simulated / Real WeChat Account State
  const [currentWxUserIndex, setCurrentWxUserIndex] = useState<number>(() => {
    return pair.currentRole === "B" ? 1 : 0;
  });
  const [showArchExplainer, setShowArchExplainer] = useState(false);
  const [copiedOpenId, setCopiedOpenId] = useState(false);

  // Dual Auth State (WeChat & Account Register/Login)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  const handleAuthSuccess = (user: AuthUser) => {
    setAuthUser(user);
    onUpdatePair((prev) => ({
      ...prev,
      memberA: user.openid || user.id,
      nicknameA: user.nickname,
      genderA: user.gender,
      currentRole: "A",
      ...(user.pairId ? { pairId: user.pairId, status: "bound" } : {}),
    }));
  };

  const handleLogout = () => {
    authService.logout();
    setAuthUser(null);
    onUpdatePair((prev) => ({
      ...prev,
      status: "unbound",
      pairId: "",
      memberA: "",
      nicknameA: "未登录用户",
    }));
  };

  // CloudBase Config States
  const [tcbConfig, setTcbConfig] = useState<CloudBaseConfig>(() => cloudBaseService.getConfig());
  const [testingTcb, setTestingTcb] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [copiedCli, setCopiedCli] = useState(false);
  const [showCliGuide, setShowCliGuide] = useState(false);

  const activeWxUser = WECHAT_TEST_ACCOUNTS[currentWxUserIndex];

  const handleSwitchWeChatUser = (idx: number) => {
    setCurrentWxUserIndex(idx);
    const targetUser = WECHAT_TEST_ACCOUNTS[idx];
    if (idx === 2) {
      // Switch to a new un-paired guest WeChat user
      onUpdatePair((prev) => ({
        ...prev,
        status: "unbound",
        pairId: "",
        memberA: targetUser.openid,
        memberB: "",
        nicknameA: targetUser.name,
        currentRole: "A",
      }));
    } else {
      // Switch between Member A and Member B in the pair
      onUpdatePair((prev) => ({
        ...prev,
        currentRole: targetUser.role,
        ...(targetUser.role === "A" ? { nicknameA: targetUser.name, genderA: targetUser.gender } : { nicknameB: targetUser.name, genderB: targetUser.gender }),
      }));
    }
  };

  const handleToggleTcbEnabled = (enabled: boolean) => {
    const updated = cloudBaseService.saveConfig({ enabled });
    setTcbConfig(updated);
  };

  const handleTestTcb = async () => {
    setTestingTcb(true);
    setTestResult(null);
    try {
      const res = await cloudBaseService.testConnection();
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ ok: false, message: e.message || "测试连接失败" });
    } finally {
      setTestingTcb(false);
    }
  };

  const handleCopyCliCommand = (cmd: string) => {
    navigator.clipboard?.writeText(cmd);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyOpenId = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedOpenId(true);
    setTimeout(() => setCopiedOpenId(false), 2000);
  };

  const handleCreate = () => {
    const newCode = genCode();
    onUpdatePair((prev) => ({
      ...prev,
      pairId: newCode,
      status: "created",
      memberA: activeWxUser.openid,
      memberB: "",
      nicknameA: activeWxUser.name,
      genderA: activeWxUser.gender,
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
      memberA: prev.memberA || "wx_openid_jack_001",
      pendingB: activeWxUser.openid,
      nicknameB: activeWxUser.name,
      genderB: activeWxUser.gender,
      currentRole: "B",
    }));
  };

  const handleConfirmBind = () => {
    // Both agreed: generate official lifetime unique space binding code as permanent data identifier
    const officialBoundId = `LUV-${genCode()}`;
    onUpdatePair((prev) => ({
      ...prev,
      pairId: officialBoundId,
      status: "bound",
      memberB: prev.pendingB || activeWxUser.openid,
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
      {/* 🟢 Dual Auth (WeChat One-Tap & Account Register/Login) Card */}
      <div className={`w-full bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border text-left animate-card-in ${
        isBlue ? "border-blue-100" : "border-pink-100/80"
      }`}>
        <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
          <div className="flex items-center space-x-2">
            <span className={`w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold ${
              authUser?.loginType === "account" ? "bg-purple-600" : "bg-emerald-500"
            }`}>
              {authUser?.loginType === "account" ? "帐" : "微"}
            </span>
            <div>
              <div className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                <span>{authUser?.loginType === "account" ? "账号密码登录" : "微信一键登录"}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${
                  authUser?.loginType === "account" ? "bg-purple-50 text-purple-700" : "bg-emerald-50 text-emerald-600"
                }`}>
                  已登录
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="text-[11px] text-[#FF5370] hover:underline font-semibold flex items-center space-x-0.5 cursor-pointer"
            >
              <LogIn className="w-3 h-3" />
              <span>登录/注册</span>
            </button>
            <span className="text-stone-300">|</span>
            <button
              type="button"
              onClick={() => setShowArchExplainer(!showArchExplainer)}
              className="text-[11px] text-sky-600 hover:text-sky-700 flex items-center space-x-0.5 cursor-pointer font-medium"
            >
              <Database className="w-3 h-3" />
              <span>{showArchExplainer ? "收起" : "隔离原理"}</span>
            </button>
          </div>
        </div>

        {/* Current Active Account Info */}
        <div className="flex items-center justify-between pt-2.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-lg shadow-inner">
              {authUser?.avatar || activeWxUser.avatar}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                <span>{authUser?.nickname || activeWxUser.name}</span>
                {authUser?.username && (
                  <span className="text-[10px] font-mono text-stone-400">(@{authUser.username})</span>
                )}
              </div>
              <div
                onClick={() => handleCopyOpenId(authUser?.openid || authUser?.id || activeWxUser.openid)}
                className="text-[10px] font-mono text-slate-400 hover:text-slate-600 flex items-center space-x-1 cursor-pointer"
                title="点击复制用户唯一识别ID"
              >
                <span>{authUser?.openid || authUser?.id || activeWxUser.openid}</span>
                {copiedOpenId ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-slate-600 font-medium">
              {pair.status === "bound" ? `已绑定空间` : `未连线伴侣`}
            </span>
            {authUser && (
              <button
                type="button"
                onClick={handleLogout}
                className="text-stone-400 hover:text-red-500 text-[11px] p-1 cursor-pointer"
                title="退出登录"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Multi-Account Simulation Switcher for Testing Pairing */}
        <div className="mt-3 pt-2.5 border-t border-stone-100">
          <div className="text-[11px] text-slate-400 mb-1.5 flex items-center justify-between">
            <span>模拟多用户身份快速切换 (测试多端配对)：</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {WECHAT_TEST_ACCOUNTS.map((acc, idx) => {
              const isSelected = currentWxUserIndex === idx && !authUser?.username?.startsWith("u_");
              return (
                <button
                  key={acc.openid}
                  type="button"
                  onClick={() => handleSwitchWeChatUser(idx)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                    isSelected
                      ? isBlue
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-[#FF5370] text-white shadow-xs"
                      : "bg-stone-50 text-slate-600 hover:bg-stone-100"
                  }`}
                >
                  <span>{acc.avatar}</span>
                  <span className="truncate">{acc.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Expandable Architecture & Multi-tenant Database Isolation Explainer */}
        {showArchExplainer && (
          <div className="mt-3.5 p-3.5 rounded-2xl bg-sky-50/80 border border-sky-100 text-slate-700 text-xs space-y-2.5 animate-card-in">
            <div className="font-bold text-sky-950 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              <span>多对情侣如何通过「配对码」在云端数据库严格隔离？</span>
            </div>
            
            <p className="text-[11px] text-slate-600 leading-relaxed">
              针对您提到的“不是两个人用，而是很多情侣用，每个人微信授权登录后输入配对码捆绑，服务器本质上是数据库隔离”的核心逻辑：
            </p>

            <div className="space-y-2 text-[11px] text-slate-700">
              <div className="p-2 rounded-xl bg-white/90 border border-sky-100">
                <span className="font-bold text-sky-700">1. 用户身份池（Users 表）</span>
                <p className="text-slate-500 mt-0.5">每个微信用户进入应用，自动获取专属唯一的 <code className="text-sky-800 font-mono">OpenID</code>。无需账号密码，永不重复。</p>
              </div>

              <div className="p-2 rounded-xl bg-white/90 border border-sky-100">
                <span className="font-bold text-sky-700">2. 双人捆绑空间（Pairs 表）</span>
                <p className="text-slate-500 mt-0.5">用户 A 生成配对码（如 <code className="text-pink-600 font-mono">LUV520</code>），用户 B 微信登录后输入该码，在数据库将两人的 OpenID 绑定在同一个 <code className="text-sky-800 font-mono">pairId</code> 下。</p>
              </div>

              <div className="p-2 rounded-xl bg-white/90 border border-sky-100">
                <span className="font-bold text-sky-700">3. 云数据库严格数据隔离（业务表）</span>
                <p className="text-slate-500 mt-0.5">所有的点菜（dishes）、日记（diaries）、经期（periods）、留言便签（messages）在写入云端时，全部带有 pairId 标签！</p>
                <div className="bg-slate-900 text-emerald-400 p-2 rounded-lg font-mono text-[10px] mt-1">
                  db.collection(&quot;messages&quot;).where(&#123; pairId: &quot;LUV520&quot; &#125;).get()
                </div>
                <p className="text-slate-500 mt-1">
                  哪怕云端数据库里有一百万对情侣，情侣只能检索到带有自己 pairId 的数据，天然实现多租户严格物理/逻辑隔离！
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

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

        {/* Step: Created (Waiting for partner, or merge if both created codes) */}
        {pair.status === "created" && (
          <div>
            <div className="w-16 h-16 rounded-3xl bg-pink-50 text-3xl flex items-center justify-center mx-auto mb-4">
              ✨
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-1.5">我的双人邀请码</h2>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
              这是您的临时邀请码。发给TA后，TA在输入框填入并经双方同意，系统将正式生成唯一的永久数据绑定码。
            </p>

            <div
              onClick={() => handleCopy(pair.pairId)}
              className="my-3 p-4 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200/80 cursor-pointer active:scale-98 transition-all group"
            >
              <div className="text-3xl font-mono font-black text-[#FF5370] tracking-widest">
                {pair.pairId}
              </div>
              <div className="flex items-center justify-center space-x-1 text-xs text-pink-400 mt-1.5 font-medium">
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-semibold">已复制邀请码！</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>点击直接复制</span>
                  </>
                )}
              </div>
            </div>

            {/* Conflict resolution: what if the other person ALSO created an invite code? */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 text-left space-y-2 mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">对方也弄了邀请码？</span>
                <span className="text-[10px] text-pink-500 font-medium">输入对方的码即可</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                无需担心冲突！若TA也生成了邀请码，直接在此输入TA发来的码，系统会自动废除多余申请，直接转入双向确认：
              </p>
              <div className="flex space-x-1.5">
                <input
                  type="text"
                  maxLength={6}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="输入TA发来的6位码"
                  className="flex-1 py-1.5 px-3 rounded-xl bg-white border border-stone-200 text-center font-mono font-bold tracking-widest text-xs uppercase outline-none focus:border-[#FF5370]"
                />
                <button
                  type="button"
                  onClick={handleJoin}
                  className="px-3.5 py-1.5 rounded-xl bg-[#FF5370] hover:bg-[#fa3c5d] active:scale-95 text-white font-semibold text-xs transition-all cursor-pointer shrink-0"
                >
                  加入TA
                </button>
              </div>
            </div>

            {/* Quick helper for single-player testing */}
            <div className="pt-3 border-t border-slate-100 mt-4">
              <button
                onClick={() => {
                  onUpdatePair((prev) => ({
                    ...prev,
                    status: "pending",
                    pendingB: "wx_openid_lucy_002",
                  }));
                }}
                className="w-full py-2 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-600 text-xs font-medium transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>模拟测试：伴侣输入该码并申请加入</span>
              </button>
            </div>
          </div>
        )}

        {/* Step: Pending (双方彼此同意后，生成唯一终身绑定码作为数据标识符) */}
        {pair.status === "pending" && (
          <div>
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-3xl flex items-center justify-center mx-auto mb-4 animate-bounce">
              🔔
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-1.5">双人配对待双方同意</h2>
            
            <div className="my-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-left space-y-2 text-xs text-slate-700">
              <div className="flex items-center justify-between text-amber-950 font-bold">
                <span>配对申请验证</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-200 text-slate-800 text-[11px]">{pair.pairId}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                只有两个人<b>彼此双向同意后</b>，系统才会正式在云端生成唯一的<b>永久绑定空间码 (Pair Space ID)</b>，并以此作为所有点菜、经期推算、心情日记与私密留言的物理数据隔离标识符。
              </p>
              <div className="flex items-center space-x-2 pt-1 text-[11px] text-amber-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>双方身份已在云端验证通过</span>
              </div>
            </div>

            <button
              onClick={handleConfirmBind}
              className="w-full py-3 rounded-full bg-[#FF5370] hover:bg-[#fa3c5d] active:scale-95 text-white font-semibold text-xs shadow-md shadow-pink-200 transition-all cursor-pointer flex items-center justify-center space-x-1"
            >
              <span>双方同意，正式生成唯一绑定码</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step: Bound (Official Permanent Binding Code) */}
        {pair.status === "bound" && (
          <div>
            <div className="w-16 h-16 rounded-3xl bg-pink-50 text-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              💞
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">双方已正式绑定！</h2>
            
            <div className="text-xs text-slate-500 mb-4 flex items-center justify-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>永久唯一绑定码已生效 · 云端数据隔离开启</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6">
              <div className="text-[11px] text-slate-400 mb-1">永久空间数据标识符 (Pair ID)</div>
              <div className="text-2xl font-mono font-black text-slate-800 tracking-widest">
                {pair.pairId}
              </div>
              <div className="text-[10px] text-emerald-600 mt-1">云端所有点菜、日记、便签均绑定此唯一标识</div>
              <button
                onClick={() => handleCopy(pair.pairId)}
                className="mt-2 text-xs text-[#FF5370] hover:underline flex items-center justify-center space-x-1 mx-auto cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "已复制" : "复制唯一标识符"}</span>
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

      {/* ☁️ CloudBase (微信云开发) Service Integration Card */}
      <div className={`w-full bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border text-left space-y-3.5 animate-card-in ${
        isBlue ? "border-blue-100" : "border-pink-100/80"
      }`}>
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center space-x-1.5">
            <Cloud className="w-4 h-4 text-sky-500" />
            <h3 className="font-bold text-slate-800 text-sm">微信云开发 (CloudBase) 同步</h3>
          </div>
          <span className="text-[11px] font-mono font-medium text-slate-500">{tcbConfig.envId}</span>
        </div>

        {/* Sync Enable Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-100">
          <div>
            <div className="text-xs font-semibold text-slate-800">启用云函数双向同步</div>
            <div className="text-[11px] text-slate-400">优先连通云端数据库，未部署时自动离线持久化</div>
          </div>
          <input
            type="checkbox"
            checked={tcbConfig.enabled}
            onChange={(e) => handleToggleTcbEnabled(e.target.checked)}
            className="w-4 h-4 accent-[#FF5370] cursor-pointer"
          />
        </div>

        {/* CLI Deployment Quick Command Card */}
        <div className="p-3 rounded-2xl bg-slate-900 text-slate-100 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center space-x-1 text-sky-400 font-mono">
              <Terminal className="w-3 h-3" />
              <span>HTTP 云函数部署命令</span>
            </span>
            <button
              onClick={() => handleCopyCliCommand(`tcb fn deploy dataOps --env-id ${tcbConfig.envId} --httpFn`)}
              className="text-[10px] text-slate-400 hover:text-white flex items-center space-x-0.5 cursor-pointer"
            >
              {copiedCli ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCli ? "已复制" : "复制命令"}</span>
            </button>
          </div>

          <div className="bg-slate-950 p-2 rounded-xl text-[10px] font-mono text-emerald-400 break-all select-all">
            tcb fn deploy dataOps --env-id {tcbConfig.envId} --httpFn
          </div>
        </div>

        {/* Action Buttons: Test Connection & View Guide */}
        <div className="flex space-x-2 pt-1">
          <button
            type="button"
            onClick={handleTestTcb}
            disabled={testingTcb}
            className="flex-1 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-medium flex items-center justify-center space-x-1 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingTcb ? "animate-spin" : ""}`} />
            <span>{testingTcb ? "正在探测连通性…" : "测试云端连通性"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCliGuide(!showCliGuide)}
            className="py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-medium flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3 h-3" />
            <span>{showCliGuide ? "收起教程" : "部署指南"}</span>
          </button>
        </div>

        {/* Live Test Result Toast */}
        {testResult && (
          <div className={`p-2.5 rounded-xl text-xs font-medium border flex items-start space-x-1.5 ${
            testResult.ok ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-amber-50 border-amber-200 text-amber-800"
          }`}>
            <span>{testResult.ok ? "✅" : "💡"}</span>
            <span className="leading-relaxed">{testResult.message}</span>
          </div>
        )}

        {/* Collapsible Step-by-Step CLI Tutorial */}
        {showCliGuide && (
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs text-slate-700 space-y-3 animate-card-in">
            <h4 className="font-bold text-slate-900 text-xs flex items-center space-x-1">
              <span>🚀 极简云端部署方案对比 (给技术新手的最优建议)</span>
            </h4>

            {/* Plan A: WeChat CloudBase */}
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1.5">
              <div className="flex items-center justify-between font-bold text-emerald-800 text-[11px]">
                <span className="flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>方案一：微信云开发 (⭐️⭐️⭐️⭐️⭐️ 最省事最推荐)</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">0服务器 · 0域名备案</span>
              </div>
              <p className="text-[10px] text-emerald-800 leading-relaxed">
                无需购买服务器、无需配置 Nginx、无需申请 ICP 域名备案（传统建站备案通常需要 20 天）。微信官方自带免密登录与云数据库！
              </p>
              <div className="text-[10px] font-mono bg-slate-900 text-emerald-400 p-2 rounded-lg space-y-1">
                <div>npm install -g @cloudbase/cli</div>
                <div>tcb login</div>
                <div>tcb fn deploy dataOps --env-id {tcbConfig.envId} --httpFn</div>
                <div>tcb fn deploy pair --env-id {tcbConfig.envId} --httpFn</div>
              </div>
            </div>

            {/* Plan B: Own Server with Docker */}
            <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 space-y-1.5">
              <div className="flex items-center justify-between font-bold text-slate-800 text-[11px]">
                <span className="flex items-center space-x-1">
                  <Server className="w-3.5 h-3.5 text-slate-600" />
                  <span>方案二：自有云服务器 (Docker 一键部署)</span>
                </span>
                <span className="text-[10px] bg-stone-200 text-slate-700 px-1.5 py-0.5 rounded">需自有域名与HTTPS</span>
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                如果您已有腾讯云/阿里云服务器，我们已在项目根目录为您编写好完整的 Docker 镜像与 docker-compose。直接上传后在服务器终端执行：
              </p>
              <div className="text-[10px] font-mono bg-slate-900 text-sky-300 p-2 rounded-lg">
                docker compose up -d
              </div>
              <p className="text-[10px] text-amber-700 leading-relaxed">
                ⚠️ 注意：小程序调用自有服务器必须有已 ICP 备案的 HTTPS 域名并在小程序后台配置合法 request 域名。如未备案建议优先使用方案一。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 📱 微信小程序 · 鸿蒙 · 安卓 App 三端原生工程源码 */}
      <div className={`w-full bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border text-left space-y-3.5 animate-card-in ${
        isBlue ? "border-blue-100" : "border-pink-100/80"
      }`}>
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center space-x-1.5">
            <span className="text-base">🚀</span>
            <h3 className="font-bold text-slate-800 text-sm">多端原生工程源码 (微信/鸿蒙/安卓)</h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">3套完整源码就绪</span>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          已为您将多端适配工程打包在项目 <code className="font-mono text-slate-800 bg-stone-100 px-1 py-0.5 rounded">/platforms</code> 目录下，各端统一连接同一个云端数据库，数据完美互通：
        </p>

        <div className="space-y-2">
          {/* MiniProgram */}
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                <span>💬 微信小程序</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">微信开发者工具导入即用</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">目录：/platforms/wechat-miniprogram</div>
            <div className="text-[10px] text-slate-400">自带分享带参、自动读取微信身份、免域名免备案免运维</div>
          </div>

          {/* HarmonyOS NEXT */}
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                <span>🌌 华为鸿蒙 (HarmonyOS NEXT)</span>
              </span>
              <span className="text-[10px] font-mono text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">DevEco Studio 打开即用</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">目录：/platforms/harmonyos-app</div>
            <div className="text-[10px] text-slate-400">纯血鸿蒙 ArkTS 原生架构，支持真机运行与 HAP 一键打包</div>
          </div>

          {/* Android */}
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                <span>🤖 安卓 App (Android Studio)</span>
              </span>
              <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Build APK 导出即装</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">目录：/platforms/android-app</div>
            <div className="text-[10px] text-slate-400">Kotlin 原生工程，支持拍照/图片选择器，一键打出 APK 安装包</div>
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

      {/* 🔐 Dual Authentication (WeChat One-Tap / Account Register & Login) Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        isBlueTheme={isBlue}
      />

    </div>
  );
};
