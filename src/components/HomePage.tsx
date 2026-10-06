import React, { useState } from "react";
import { PageRoute, PairState, MenuOrder, MessageItem, PeriodRecord, DiaryEntry, AdventureCard, PairLiveStatus } from "../types";
import { ChevronRight, Heart, Sparkles, AlertCircle, Utensils, CalendarHeart, BookHeart, MessageCircleHeart, Dices } from "lucide-react";
import { CoupleDistanceRadar } from "./CoupleDistanceRadar";

interface HomePageProps {
  pair: PairState;
  onNavigate: (page: PageRoute) => void;
  orders: MenuOrder[];
  messages: MessageItem[];
  periods: PeriodRecord[];
  diaries: DiaryEntry[];
  adventures: AdventureCard[];
  liveStatus?: PairLiveStatus;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "夜深了";
  if (h < 11) return "早上好";
  if (h < 14) return "中午好";
  if (h < 18) return "下午好";
  return "晚上好";
}

export const HomePage: React.FC<HomePageProps> = ({
  pair,
  onNavigate,
  orders,
  messages,
  periods,
  diaries,
  adventures,
  liveStatus,
}) => {
  const [showUnboundModal, setShowUnboundModal] = useState(false);
  const greet = getGreeting();
  const isBound = pair.status === "bound" && !!pair.pairId;

  // Calculate days together if bound
  const daysTogether = pair.bindTime
    ? Math.max(1, Math.floor((Date.now() - new Date(pair.bindTime).getTime()) / 86400000))
    : 30;

  const partnerRole = pair.currentRole === "A" ? "B" : "A";
  const partnerGender = pair.currentRole === "A" ? pair.genderB : pair.genderA;
  const partnerRoleName = pair.currentRole === "A" 
    ? pair.nicknameB || (partnerGender === "male" ? "男孩" : "女孩") 
    : pair.nicknameA || (partnerGender === "male" ? "男孩" : "女孩");
  const partnerStatus = liveStatus 
    ? (partnerRole === "A" ? liveStatus.statusA : liveStatus.statusB)
    : undefined;

  // Today pending dishes
  const pendingOrders = orders.filter((o) => !o.done);
  const latestMessage = messages[messages.length - 1];
  const latestDiary = diaries[0];
  const completedAdventures = adventures.filter((a) => a.completed).length;

  // Period days estimate
  let periodCountdown = "";
  if (periods.length > 0) {
    const sorted = [...periods].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastDate = new Date(sorted[0].date).getTime();
    const nextDate = new Date(lastDate + 28 * 86400000);
    const diff = Math.round((nextDate.getTime() - Date.now()) / 86400000);
    periodCountdown = diff >= 0 ? `还有 ${diff} 天` : `已超 ${-diff} 天`;
  }

  const handleCardClick = (page: PageRoute) => {
    if (!isBound) {
      setShowUnboundModal(true);
      return;
    }
    onNavigate(page);
  };

  const isBlue = pair.theme === "blue";

  return (
    <div className="flex-1 pb-24 px-4 pt-3 max-w-md mx-auto w-full space-y-4">
      
      {/* Romantic Greeting Hero Card (Adapts to Blue / Pink Version) */}
      <div className={`relative overflow-hidden rounded-3xl p-5 border transition-all duration-300 ${
        isBlue
          ? "bg-gradient-to-br from-[#EBF5FB] via-[#DCEEFB] to-[#D0E5F7] shadow-[0_10px_30px_rgba(37,99,235,0.1)] border-blue-200/80"
          : "bg-gradient-to-br from-[#FFF0F3] via-[#FFE5EC] to-[#FFD8E2] shadow-[0_10px_30px_rgba(255,107,129,0.12)] border-pink-200/60"
      }`}>
        <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
          isBlue ? "bg-blue-400/20" : "bg-pink-300/20"
        }`} />
        
        <div className="relative z-10">
          <div className={`flex items-center justify-between text-xs font-medium mb-1 ${
            isBlue ? "text-blue-800" : "text-[#C24B66]"
          }`}>
            <span className="flex items-center space-x-1">
              <Heart className={`w-3.5 h-3.5 fill-current ${isBlue ? "text-blue-600" : "text-[#C24B66]"}`} />
              <span>{greet}，属于你们的小日子</span>
            </span>
            <span className="tabular-nums text-slate-500 text-[11px]">
              相伴第 <strong className="text-slate-800 font-semibold">{daysTogether}</strong> 天
            </span>
          </div>

          <h1 className="text-2xl font-serif font-black text-slate-800 tracking-tight mt-1">
            愿每一天，都心动如初
          </h1>

          {/* Couple Lockup banner with Boy/Girl avatars */}
          <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
            isBlue ? "border-blue-200/60" : "border-pink-200/50"
          }`}>
            {isBound ? (
              <button
                onClick={() => onNavigate("pair")}
                className={`flex items-center space-x-2 text-slate-700 transition-colors group cursor-pointer ${
                  isBlue ? "hover:text-blue-700" : "hover:text-[#C24B66]"
                }`}
              >
                <div className="flex items-center -space-x-1">
                  <div className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-bold shadow-xs ${
                    pair.genderA === "male" ? "bg-blue-200 text-blue-900" : "bg-rose-200 text-rose-900"
                  }`}>
                    {pair.nicknameA?.[0] || (pair.genderA === "male" ? "男" : "女")}
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-bold shadow-xs ${
                    pair.genderB === "male" ? "bg-blue-200 text-blue-900" : "bg-rose-200 text-rose-900"
                  }`}>
                    {pair.nicknameB?.[0] || (pair.genderB === "male" ? "男" : "女")}
                  </div>
                </div>
                <span className="text-slate-700 group-hover:text-slate-900 font-medium">
                  {pair.nicknameA || "男孩"} 与 {pair.nicknameB || "女孩"} 已绑定
                </span>
                <span className="text-slate-400 text-[11px]">· {pair.pairId}</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate("pair")}
                className={`font-medium flex items-center space-x-1 hover:underline cursor-pointer ${
                  isBlue ? "text-blue-700" : "text-[#C24B66]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>尚未连接伴侣，点此生成专属识别码 →</span>
              </button>
            )}

            <button
              onClick={() => onNavigate("pair")}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              title="伴侣配对设置"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Partner Live Status Bar on HomePage */}
      {isBound && partnerStatus && (
        <div
          onClick={() => onNavigate("message")}
          className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between cursor-pointer hover:border-pink-200 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-xl flex items-center justify-center shrink-0">
              {partnerStatus.emoji}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-stone-800">
                  {partnerRoleName}当前状态：{partnerStatus.label}
                </span>
                {partnerStatus.etaMinutes && (
                  <span className="text-[10px] text-blue-600 font-semibold">
                    (预计 {partnerStatus.etaMinutes} 分钟到家)
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 truncate mt-0.5 font-light">
                {partnerStatus.subText || "去留言板看TA或给TA盖章戳一戳~"}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-[#C24B66] shrink-0 ml-2">
            戳一戳 →
          </span>
        </div>
      )}

      {/* 📍 情侣实时距离与位置雷达 (云端实时通信 + GPS + 蓝牙靠近感应) */}
      <CoupleDistanceRadar pair={pair} isBlueTheme={isBlue} />

      {/* Featured Interactive Hero Highlight: 恋爱大冒险 */}
      <div
        onClick={() => handleCardClick("adventure")}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#29171F] via-[#3B1C28] to-[#1C1217] text-white p-4.5 border border-amber-500/30 shadow-[0_8px_24px_rgba(41,23,31,0.25)] cursor-pointer hover:border-amber-400/50 active:scale-[0.99] transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-200 text-xl shrink-0 shadow-inner">
              <Dices className="w-6 h-6 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-serif font-bold text-amber-100">恋爱大冒险 · 互动翻牌</span>
                <span className="text-[10px] text-amber-300/80 uppercase font-serif tracking-widest">
                  NEW
                </span>
              </div>
              <p className="text-xs text-stone-300 truncate mt-0.5 font-light">
                {completedAdventures > 0
                  ? `已解锁 ${completedAdventures} 个专属心动任务 · 翻开新挑战`
                  : "今晚谁来抽一张？甜蜜互动、浪漫心跳与专属自定义"}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-300/70 group-hover:text-amber-200 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Quick Daily Digest / Today's Menu Highlight (if orders exist) */}
      {pendingOrders.length > 0 && (
        <div
          onClick={() => onNavigate("menu")}
          className="bg-white rounded-2xl p-3.5 border border-pink-100/90 shadow-[0_4px_16px_rgba(255,107,129,0.06)] flex items-center justify-between cursor-pointer hover:border-pink-200 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-xl flex items-center justify-center shrink-0">
              🍳
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-800">今日待做菜品</span>
                <span className="text-[11px] text-slate-400">· {pendingOrders.length}道菜</span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {pendingOrders.map((o) => o.name).join("、")}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 ml-2" />
        </div>
      )}

      {/* 4 Feature Bento Navigation Cards */}
      <div className="grid grid-cols-2 gap-3.5">
        
        {/* Card 1: 今日点菜 */}
        <div
          onClick={() => handleCardClick("menu")}
          className="bg-white rounded-2xl p-4 border border-pink-100/70 shadow-[0_4px_20px_rgba(255,107,129,0.06)] hover:shadow-md hover:border-pink-200 active:scale-[0.97] transition-all cursor-pointer flex flex-col justify-between h-40 group"
        >
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-white shadow-sm shadow-rose-200">
              <Utensils className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors">
              {pendingOrders.length > 0 ? `${pendingOrders.length}道待下厨` : "菜谱库"}
            </span>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#C24B66] transition-colors">
              今日点菜
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              想吃的，点给TA做
            </p>
          </div>
        </div>

        {/* Card 2: 经期记录 */}
        <div
          onClick={() => handleCardClick("period")}
          className="bg-white rounded-2xl p-4 border border-pink-100/70 shadow-[0_4px_20px_rgba(255,107,129,0.06)] hover:shadow-md hover:border-pink-200 active:scale-[0.97] transition-all cursor-pointer flex flex-col justify-between h-40 group"
        >
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-rose-500 bg-gradient-to-br from-rose-400 to-pink-300 flex items-center justify-center text-white shadow-sm shadow-pink-200">
              <CalendarHeart className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors tabular-nums">
              {periodCountdown || "智能推算"}
            </span>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#C24B66] transition-colors">
              经期记录
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              温柔呵护，贴心提醒
            </p>
          </div>
        </div>

        {/* Card 3: 心情日历 */}
        <div
          onClick={() => handleCardClick("diary")}
          className="bg-white rounded-2xl p-4 border border-pink-100/70 shadow-[0_4px_20px_rgba(255,107,129,0.06)] hover:shadow-md hover:border-pink-200 active:scale-[0.97] transition-all cursor-pointer flex flex-col justify-between h-40 group"
        >
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-purple-500 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white shadow-sm shadow-purple-200">
              <BookHeart className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors">
              {latestDiary ? latestDiary.mood.label : "日历标记"}
            </span>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#C24B66] transition-colors">
              心情日历
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              {latestDiary ? `${latestDiary.dateString} · ${latestDiary.text}` : "按日期记录情绪色彩"}
            </p>
          </div>
        </div>

        {/* Card 4: 情侣留言板 */}
        <div
          onClick={() => handleCardClick("message")}
          className="bg-white rounded-2xl p-4 border border-pink-100/70 shadow-[0_4px_20px_rgba(255,107,129,0.06)] hover:shadow-md hover:border-pink-200 active:scale-[0.97] transition-all cursor-pointer flex flex-col justify-between h-40 group"
        >
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
              <MessageCircleHeart className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors tabular-nums">
              {messages.length > 0 ? `${messages.length}张便签` : "贴纸便签"}
            </span>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#C24B66] transition-colors">
              情侣留言板
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
              {latestMessage ? latestMessage.content : "贴上爱意叮嘱小纸条"}
            </p>
          </div>
        </div>

      </div>

      {/* Unbound Alert Modal */}
      {showUnboundModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl text-center animate-card-in border border-pink-100">
            <div className="w-12 h-12 rounded-full bg-pink-50 text-[#C24B66] flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800 mb-1.5">伴侣连线提示</h4>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              请先完成双人专属绑定，共同解锁大冒险互动、点菜、日记、经期推算与悄悄话空间哦。
            </p>
            <div className="flex space-x-2.5">
              <button
                onClick={() => setShowUnboundModal(false)}
                className="flex-1 py-2.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
              >
                稍后再说
              </button>
              <button
                onClick={() => {
                  setShowUnboundModal(false);
                  onNavigate("pair");
                }}
                className="flex-1 py-2.5 rounded-full bg-[#C24B66] text-white text-xs font-medium hover:bg-[#a8324e] shadow-md shadow-pink-200 transition-colors cursor-pointer"
              >
                去绑定
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
