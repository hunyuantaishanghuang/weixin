import React, { useState } from "react";
import { PeriodRecord, PairState } from "../types";
import { Plus, Trash2, Calendar, Heart, Sparkles, X, ShieldAlert, Coffee, Sun, Moon, Info, UserCheck } from "lucide-react";
import { formatDate } from "../storage";

interface PeriodPageProps {
  pair: PairState;
  records: PeriodRecord[];
  onAddRecord: (date: string) => void;
  onDeleteRecord: (id: string) => void;
  onSwitchRole?: () => void;
}

export const PeriodPage: React.FC<PeriodPageProps> = ({
  pair,
  records,
  onAddRecord,
  onDeleteRecord,
  onSwitchRole,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [pickDate, setPickDate] = useState(formatDate(new Date()));

  // Gender check: only female records period
  const currentGender = pair.currentRole === "A" ? pair.genderA : pair.genderB;
  const isFemale = currentGender === "female";
  const partnerRoleName = pair.currentRole === "A" ? pair.nicknameB || "女孩" : pair.nicknameA || "女孩";

  let cycle = 28;
  const duration = 5;

  const sorted = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sorted.length >= 2) {
    const gaps: number[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const diff = Math.round(
        (new Date(sorted[i].date).getTime() - new Date(sorted[i + 1].date).getTime()) / 86400000
      );
      if (diff > 15 && diff < 60) {
        gaps.push(diff);
      }
    }
    if (gaps.length > 0) {
      cycle = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    }
  }

  const last = sorted[0];
  let nextDate = "";
  let countdownDays: number | null = null;
  let fertileStart = "";
  let fertileEnd = "";

  if (last) {
    const lastTime = new Date(last.date).getTime();
    const next = new Date(lastTime + cycle * 86400000);
    nextDate = formatDate(next);

    const now = new Date();
    const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const nextZero = new Date(next.getFullYear(), next.getMonth(), next.getDate()).getTime();
    countdownDays = Math.round((nextZero - todayZero) / 86400000);

    // 易孕期：下次前14天 ± 5天
    const fStart = new Date(nextZero - (14 + 5) * 86400000);
    const fEnd = new Date(nextZero - (14 - 5) * 86400000);
    fertileStart = formatDate(fStart);
    fertileEnd = formatDate(fEnd);
  }

  const handleSubmit = () => {
    if (!pickDate) return;
    onAddRecord(pickDate);
    setShowAdd(false);
  };

  return (
    <div className="flex-1 pb-24 px-4 pt-3 max-w-md mx-auto w-full space-y-4">
      
      {/* Role / Gender Notice Header Banner */}
      <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
        isFemale
          ? "bg-rose-50/70 border-rose-200/80 text-rose-800"
          : "bg-blue-50/70 border-blue-200/80 text-blue-900"
      }`}>
        <div className="flex items-center space-x-1.5 font-medium">
          {isFemale ? (
            <>
              <span className="text-base">👧</span>
              <span>女生专属空间 · 记录生理期首日，算法自动推算</span>
            </>
          ) : (
            <>
              <span className="text-base">👦</span>
              <span>男友暖心呵护模式 · 经期数据由女生填写</span>
            </>
          )}
        </div>

        {!isFemale && onSwitchRole && (
          <button
            onClick={onSwitchRole}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-0.5 cursor-pointer whitespace-nowrap ml-1"
          >
            <UserCheck className="w-3 h-3" />
            <span>切换为女生视角</span>
          </button>
        )}
      </div>

      {/* Prediction Main Dial Card */}
      <div className={`relative overflow-hidden rounded-3xl text-white p-6 shadow-xl transition-all ${
        isFemale
          ? "bg-gradient-to-br from-rose-500 via-[#FF5370] to-[#FF758C] shadow-rose-200/50"
          : "bg-gradient-to-br from-indigo-900 via-blue-800 to-sky-700 shadow-blue-200/50"
      }`}>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between text-xs text-white/90 font-medium">
          <div className="flex items-center space-x-1.5">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>{isFemale ? "我的生理周期" : "女友生理周期提醒"}</span>
          </div>
          <span className="text-[11px] opacity-80">
            {isFemale ? "贴心预测" : "暖心关爱"}
          </span>
        </div>

        {/* Center Prominent Metric */}
        <div className="my-5 text-center">
          {countdownDays !== null ? (
            <div>
              <div className="text-xs uppercase tracking-wider text-white/80 mb-1">
                预计下次经期
              </div>
              <div className="text-4xl font-serif font-black tracking-tight tabular-nums">
                {countdownDays >= 0 ? `还有 ${countdownDays} 天` : `已推迟 ${-countdownDays} 天`}
              </div>
              <div className="text-xs text-white/90 mt-2 font-medium">
                预估开始日期 · <span className="font-semibold tabular-nums">{nextDate}</span>
              </div>
            </div>
          ) : (
            <div className="py-2">
              <div className="text-2xl font-bold">{isFemale ? "记下第一天吧" : "等待女友记录"}</div>
              <p className="text-xs text-white/80 mt-1">
                {isFemale
                  ? "添加过往经期记录，即可智能推算周期与易孕期"
                  : "女友添加过往经期记录后，将自动为你提供关爱提醒"}
              </p>
            </div>
          )}
        </div>

        {/* Cycle Numbers (Tabular Numerals) */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/20">
          <div className="bg-white/15 backdrop-blur-xs rounded-2xl p-3 text-center">
            <div className="text-2xl font-black tabular-nums">{cycle}</div>
            <div className="text-[11px] text-white/90 mt-0.5">平均周期 (天)</div>
          </div>
          <div className="bg-white/15 backdrop-blur-xs rounded-2xl p-3 text-center">
            <div className="text-2xl font-black tabular-nums">{duration}</div>
            <div className="text-[11px] text-white/90 mt-0.5">平均经期 (天)</div>
          </div>
        </div>

        {/* Fertile Window Notice */}
        {fertileStart && (
          <div className="mt-3.5 bg-black/15 backdrop-blur-xs rounded-xl p-2.5 text-center text-xs text-white/95 flex items-center justify-center space-x-1.5">
            <span>🌸 易孕期区间：</span>
            <span className="font-semibold tabular-nums text-white">
              {fertileStart} 至 {fertileEnd}
            </span>
          </div>
        )}
      </div>

      {/* Boyfriend Care Tips Widget (When in Male Mode) */}
      {!isFemale && (
        <div className="bg-white rounded-3xl p-5 border border-blue-100 shadow-[0_4px_20px_rgba(2,132,199,0.06)] space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🍵</span>
            <h3 className="font-serif font-bold text-stone-800 text-sm">男友暖心呵护备忘清单</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-stone-600">
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-start space-x-2">
              <span className="text-amber-600 text-sm">☕</span>
              <div>
                <strong className="block text-amber-900 font-semibold mb-0.5">备好温热红糖姜茶</strong>
                <span className="text-[11px] text-amber-700">经期前一天提醒她喝热饮</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200/60 flex items-start space-x-2">
              <span className="text-rose-600 text-sm">🛌</span>
              <div>
                <strong className="block text-rose-900 font-semibold mb-0.5">准备暖宝宝与热水袋</strong>
                <span className="text-[11px] text-rose-700">提前充好电或放在床头</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 flex items-start space-x-2">
              <span className="text-emerald-600 text-sm">💆</span>
              <div>
                <strong className="block text-emerald-900 font-semibold mb-0.5">多包揽家务洗碗</strong>
                <span className="text-[11px] text-emerald-700">让她好好休息，避免碰冷水</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200/60 flex items-start space-x-2">
              <span className="text-purple-600 text-sm">🍫</span>
              <div>
                <strong className="block text-purple-900 font-semibold mb-0.5">情绪温柔包容</strong>
                <span className="text-[11px] text-purple-700">多抱抱她，多倾听安慰</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History List */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-stone-800 text-sm">过往经期记录 ({records.length})</h3>
          <span className="text-xs text-stone-400">
            {isFemale ? "持续记录推算更准" : "由女友记录的数据"}
          </span>
        </div>

        <div className="divide-y divide-stone-100">
          {sorted.map((item) => (
            <div
              key={item.id}
              className="py-3.5 flex items-center justify-between hover:bg-stone-50/50 px-1 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-rose-500 font-bold text-sm">🩸</span>
                <div>
                  <div className="text-sm font-semibold text-stone-800 tabular-nums">
                    {item.date}
                  </div>
                  <div className="text-[11px] text-stone-400">经期首日</div>
                </div>
              </div>

              {isFemale ? (
                <button
                  onClick={() => onDeleteRecord(item.id)}
                  className="text-stone-300 hover:text-red-500 p-2 transition-colors cursor-pointer"
                  title="删除记录"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                <span className="text-xs text-stone-300 pr-2">已同步</span>
              )}
            </div>
          ))}

          {records.length === 0 && (
            <div className="py-8 text-center text-stone-400 text-xs">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-pink-200 stroke-[1.5]" />
              <p>暂无过往记录</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button (Only for Female) */}
      {isFemale ? (
        <button
          onClick={() => setShowAdd(true)}
          className="fixed right-5 bottom-20 z-30 bg-[#C24B66] hover:bg-[#a8324e] active:scale-95 text-white font-semibold text-xs px-4 py-2.5 rounded-full shadow-[0_8px_20px_rgba(194,75,102,0.35)] flex items-center space-x-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>记一笔</span>
        </button>
      ) : (
        onSwitchRole && (
          <button
            onClick={onSwitchRole}
            className="fixed right-5 bottom-20 z-30 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs px-4 py-2.5 rounded-full shadow-[0_8px_20px_rgba(37,99,235,0.35)] flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>协助她记录</span>
          </button>
        )
      )}

      {/* Date Picker Modal (Female only) */}
      {showAdd && isFemale && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-xs rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-card-in border border-stone-200">
            <div className="w-10 h-1.5 bg-stone-200 rounded-full mx-auto mb-3 sm:hidden" />
            
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-serif font-bold text-stone-800 text-base">记上这一天</h4>
              <button
                onClick={() => setShowAdd(false)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-stone-500 block mb-1.5">经期第一天日期</label>
                <input
                  type="date"
                  value={pickDate}
                  onChange={(e) => setPickDate(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-800 outline-none focus:border-[#C24B66] focus:bg-white"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 rounded-full bg-stone-100 text-stone-600 text-xs font-semibold hover:bg-stone-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 rounded-full bg-[#C24B66] text-white text-xs font-semibold hover:bg-[#a8324e] shadow-md shadow-rose-200 transition-colors cursor-pointer"
                >
                  保存记录
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
