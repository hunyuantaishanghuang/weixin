import React from "react";
import { ArrowLeft, RefreshCw, Users, Heart, Palette } from "lucide-react";
import { PageRoute, PairState, AppTheme } from "../types";

interface HeaderProps {
  currentPage: PageRoute;
  pair: PairState;
  onNavigate: (page: PageRoute) => void;
  onSwitchRole: () => void;
  onToggleTheme: () => void;
  onResetData: () => void;
}

const PAGE_TITLES: Record<PageRoute, string> = {
  home: "我们的小日子",
  pair: "伴侣绑定",
  adventure: "恋爱大冒险",
  menu: "今日点菜",
  period: "经期记录",
  diary: "心情日历",
  message: "情侣留言板",
};

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  pair,
  onNavigate,
  onSwitchRole,
  onToggleTheme,
  onResetData,
}) => {
  const isHome = currentPage === "home";
  const isPairPage = currentPage === "pair";
  const isBlueTheme = pair.theme === "blue";

  const currentGender = pair.currentRole === "A" ? pair.genderA : pair.genderB;
  const currentRoleName = pair.currentRole === "A" ? pair.nicknameA || (currentGender === "male" ? "男孩" : "女孩") : pair.nicknameB || (currentGender === "male" ? "男孩" : "女孩");
  const partnerGender = pair.currentRole === "A" ? pair.genderB : pair.genderA;
  const partnerRoleName = pair.currentRole === "A" ? pair.nicknameB || (partnerGender === "male" ? "男孩" : "女孩") : pair.nicknameA || (partnerGender === "male" ? "男孩" : "女孩");
  const isBound = pair.status === "bound" && !!pair.pairId;

  return (
    <header className={`sticky top-0 z-30 backdrop-blur-md border-b shadow-xs transition-colors ${
      isBlueTheme ? "bg-white/90 border-blue-100/90 text-slate-800" : "bg-white/90 border-pink-100/90 text-slate-800"
    }`}>
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        
        {/* Zone 1: Brand Wordmark / Back Action */}
        <div className="flex items-center space-x-2 shrink-0">
          {isPairPage ? (
            <button
              onClick={() => onNavigate("home")}
              className="min-h-[44px] -ml-2 px-2 flex items-center space-x-1 text-slate-600 hover:text-slate-900 active:scale-95 transition-transform cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-medium">返回</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1.5 cursor-pointer" onClick={() => onNavigate("home")}>
              <span className="text-lg">{isBlueTheme ? "💙" : "💕"}</span>
              <span className="font-bold text-slate-800 text-sm tracking-tight">
                {isHome ? "我们的小日子" : PAGE_TITLES[currentPage]}
              </span>
            </div>
          )}
        </div>

        {/* Zone 2: Relationship Status (Unboxed text with · separator) */}
        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-500">
          {isBound ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <button
                onClick={() => onNavigate("pair")}
                className={`transition-colors cursor-pointer ${isBlueTheme ? "hover:text-blue-600" : "hover:text-rose-600"}`}
                title="点击管理伴侣配对"
              >
                已绑定 · <span className="font-mono font-medium text-slate-700">{pair.pairId}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => onNavigate("pair")}
              className={`hover:underline font-medium cursor-pointer ${isBlueTheme ? "text-blue-600" : "text-rose-600"}`}
            >
              未绑定 · 点击连线
            </button>
          )}
        </div>

        {/* Zone 3: Actions (Theme Toggle, Role Switcher, Reset) */}
        <div className="flex items-center space-x-1.5 shrink-0">
          
          {/* Theme background switcher: Pink vs Blue */}
          <button
            onClick={onToggleTheme}
            className={`min-h-[34px] px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 border active:scale-95 transition-all cursor-pointer ${
              isBlueTheme
                ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
            }`}
            title={`当前为${isBlueTheme ? "澄澈蓝" : "浪漫粉"}背景版本，点击切换`}
          >
            <span>{isBlueTheme ? "🌊 蓝版" : "🌸 粉版"}</span>
          </button>

          {/* Perspective switch with Boy/Girl indicators */}
          <button
            onClick={onSwitchRole}
            className={`min-h-[34px] px-2.5 py-1 rounded-full text-xs font-medium flex items-center space-x-1 border active:scale-95 transition-all cursor-pointer ${
              currentGender === "male"
                ? "bg-blue-50/80 hover:bg-blue-100 text-blue-700 border-blue-200/60"
                : "bg-pink-50/80 hover:bg-pink-100 text-[#C24B66] border-pink-200/60"
            }`}
            title={`当前是「${currentRoleName} (${currentGender === "male" ? "男" : "女"})」，点击切换为「${partnerRoleName}」`}
          >
            <span className="text-sm">{currentGender === "male" ? "👦" : "👧"}</span>
            <span className="whitespace-nowrap">{currentRoleName}</span>
          </button>

          <button
            onClick={onResetData}
            className="min-h-[34px] min-w-[34px] p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            title="重置预设演示数据"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};
