import React, { useState } from "react";
import { AuthUser, Gender } from "../types";
import { authService } from "../services/auth";
import { X, Lock, User, Check, Eye, EyeOff, Sparkles, ShieldCheck } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  isBlueTheme?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isBlueTheme = false,
}) => {
  const [tab, setTab] = useState<"wechat" | "login" | "register">("wechat");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleWechatLogin = async (presetUser?: { openid: string; name: string; avatar: string; gender: Gender }) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await authService.wechatLogin({
        openid: presetUser?.openid,
        nickname: presetUser?.name,
        avatar: presetUser?.avatar,
        gender: presetUser?.gender,
      });
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.error || "微信登录失败，请重试");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "微信登录出现异常");
    } finally {
      setLoading(false);
    }
  };

  const handleAccountLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg("请输入用户名与密码");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await authService.login(username.trim(), password);
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.error || "账号或密码错误");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "登录请求异常");
    } finally {
      setLoading(false);
    }
  };

  const handleAccountRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg("请填写完整的用户名和密码");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("密码至少需要 6 个字符");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await authService.register({
        username: username.trim(),
        password,
        nickname: nickname.trim() || username.trim(),
        gender,
      });
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.error || "注册失败，该用户名可能已存在");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "注册服务异常");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-card-in border border-stone-100 relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white text-2xl flex items-center justify-center mx-auto mb-2 shadow-md shadow-pink-200">
            {tab === "wechat" ? "💚" : tab === "login" ? "🔐" : "✨"}
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {tab === "wechat" ? "微信一键快捷登录" : tab === "login" ? "账号密码登录" : "注册新情侣账号"}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            微信小程序免密直登 · 安卓/鸿蒙通用账号注册
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-2xl mb-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => { setTab("wechat"); setErrorMsg(""); }}
            className={`py-1.5 rounded-xl transition-all cursor-pointer ${
              tab === "wechat" ? "bg-white text-emerald-600 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            微信登录
          </button>
          <button
            type="button"
            onClick={() => { setTab("login"); setErrorMsg(""); }}
            className={`py-1.5 rounded-xl transition-all cursor-pointer ${
              tab === "login" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            账号登录
          </button>
          <button
            type="button"
            onClick={() => { setTab("register"); setErrorMsg(""); }}
            className={`py-1.5 rounded-xl transition-all cursor-pointer ${
              tab === "register" ? "bg-white text-pink-600 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            立即注册
          </button>
        </div>

        {/* Tab 1: WeChat One-Tap Login */}
        {tab === "wechat" && (
          <div className="space-y-3.5">
            <button
              onClick={() => handleWechatLogin()}
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold text-xs shadow-md shadow-emerald-200 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span className="w-4 h-4 rounded-full bg-white text-emerald-600 flex items-center justify-center text-[10px] font-bold">
                微
              </span>
              <span>{loading ? "正在授权中…" : "微信官方一键授权登录"}</span>
            </button>

            <div className="pt-2 border-t border-stone-100">
              <div className="text-[11px] text-slate-400 mb-2">或快速模拟情侣测试身份：</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleWechatLogin({ openid: "wx_openid_jack_001", name: "阿杰", avatar: "👦", gender: "male" })}
                  className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-100 text-xs font-medium text-blue-700 flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                >
                  <span>👦</span>
                  <span>阿杰 (男生)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleWechatLogin({ openid: "wx_openid_lucy_002", name: "小鹿", avatar: "👧", gender: "female" })}
                  className="p-2 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-100 text-xs font-medium text-pink-700 flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                >
                  <span>👧</span>
                  <span>小鹿 (女生)</span>
                </button>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-[10px] text-slate-500 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>微信小程序端自动读取 OPENID，绝无密码泄露风险</span>
            </div>
          </div>
        )}

        {/* Tab 2: Account Login */}
        {tab === "login" && (
          <form onSubmit={handleAccountLogin} className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-slate-600 mb-1 block">用户名 / 手机号</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入您的账号"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-slate-800 outline-none focus:border-[#FF5370] focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-600 mb-1 block">登录密码</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-9 pr-9 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-slate-800 outline-none focus:border-[#FF5370] focus:bg-white transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-xl font-semibold text-xs text-white shadow-md active:scale-95 transition-all cursor-pointer ${
                isBlueTheme ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200" : "bg-[#FF5370] hover:bg-[#fa3c5d] shadow-pink-200"
              }`}
            >
              {loading ? "正在登录…" : "登 录"}
            </button>
          </form>
        )}

        {/* Tab 3: Account Register */}
        {tab === "register" && (
          <form onSubmit={handleAccountRegister} className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-slate-600 mb-1 block">账号名称 (用于登录)</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="3位以上英文字母或数字"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-slate-800 outline-none focus:border-[#FF5370] focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-600 mb-1 block">设置密码</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少 6 位密码"
                  className="w-full pl-9 pr-9 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-slate-800 outline-none focus:border-[#FF5370] focus:bg-white transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-slate-600 mb-1 block">昵称</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="如: 男孩/阿杰"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-slate-800 outline-none focus:border-[#FF5370]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 mb-1 block">性别</label>
                <div className="flex bg-stone-100 p-0.5 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setGender("male")}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                      gender === "male" ? "bg-blue-600 text-white" : "text-slate-600"
                    }`}
                  >
                    👦 男
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("female")}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                      gender === "female" ? "bg-rose-500 text-white" : "text-slate-600"
                    }`}
                  >
                    👧 女
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-xl font-semibold text-xs text-white shadow-md active:scale-95 transition-all cursor-pointer ${
                isBlueTheme ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200" : "bg-[#FF5370] hover:bg-[#fa3c5d] shadow-pink-200"
              }`}
            >
              {loading ? "正在注册…" : "立即注册并登录"}
            </button>
          </form>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mt-3 p-2 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[11px] text-center">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
};
