import React, { useState } from "react";
import { DiaryEntry, MoodConfig, PairState } from "../types";
import { MOODS, formatDate, formatDateTime } from "../storage";
import { ChevronLeft, ChevronRight, Plus, Trash2, Camera, X, Heart, Calendar as CalendarIcon, Edit3, Image as ImageIcon, Sparkles } from "lucide-react";

interface DiaryPageProps {
  pair: PairState;
  diaries: DiaryEntry[];
  onAddDiary: (entry: { dateString: string; mood: MoodConfig; text: string; images: string[] }) => void;
  onDeleteDiary: (id: string) => void;
}

const WEEK_DAYS = ["一", "二", "三", "四", "五", "六", "日"];

export const DiaryPage: React.FC<DiaryPageProps> = ({
  pair,
  diaries,
  onAddDiary,
  onDeleteDiary,
}) => {
  const todayStr = formatDate(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [currentYearMonth, setCurrentYearMonth] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodConfig>(MOODS[1]); // default love
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentYearMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentYearMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentYearMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(formatDate(now));
  };

  // Calendar Math
  const year = currentYearMonth.getFullYear();
  const month = currentYearMonth.getMonth(); // 0-indexed
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayWeekIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0, Sunday = 6

  // Generate calendar grid dates
  const calendarDays: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayWeekIndex - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevM = month === 0 ? 12 : month;
    const prevY = month === 0 ? year - 1 : year;
    const dateStr = `${prevY}-${String(prevM).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarDays.push({ day: d, dateStr, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarDays.push({ day: d, dateStr, isCurrentMonth: true });
  }

  // Next month leading days to complete full 35 or 42 grid
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const nextM = month === 11 ? 1 : month + 2;
    const nextY = month === 11 ? year + 1 : year;
    const dateStr = `${nextY}-${String(nextM).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarDays.push({ day: d, dateStr, isCurrentMonth: false });
  }

  // Map diaries by dateString for fast lookups
  const diaryMap = new Map<string, DiaryEntry>();
  diaries.forEach((d) => {
    diaryMap.set(d.dateString, d);
  });

  const selectedEntry = diaryMap.get(selectedDate);

  // Open modal to record/edit
  const handleOpenAddForDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const existing = diaryMap.get(dateStr);
    if (existing) {
      setSelectedMood(existing.mood);
      setText(existing.text);
      setImages(existing.images || []);
    } else {
      setSelectedMood(MOODS[1]); // default love
      setText("");
      setImages([]);
    }
    setShowModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          if (uploadEvent.target?.result) {
            setImages((prev) => [...prev, uploadEvent.target?.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImg = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = () => {
    onAddDiary({
      dateString: selectedDate,
      mood: selectedMood,
      text: text.trim(),
      images,
    });
    setShowModal(false);
  };

  // Month mood statistics
  const currentMonthEntries = diaries.filter((d) => {
    const [y, m] = d.dateString.split("-").map(Number);
    return y === year && m === month + 1;
  });

  return (
    <div className="flex-1 pb-24 px-4 pt-3 max-w-md mx-auto w-full space-y-4">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-500 via-[#A18CD1] to-[#FBC2EB] text-white p-5 shadow-[0_8px_24px_rgba(161,140,209,0.22)]">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-xs text-purple-100 font-medium">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Mood Calendar · 心情日历</span>
            </div>
            <h2 className="text-xl font-serif font-bold tracking-tight mt-1">
              彩色心情，印刻在每一天
            </h2>
            <p className="text-xs text-white/90 mt-1">
              本月已记录 <strong className="font-semibold tabular-nums">{currentMonthEntries.length}</strong> 天的小确幸
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-2xl shrink-0">
            📅
          </div>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-3xl p-4.5 border border-stone-200/70 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-3">
        
        {/* Month Switcher Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-bold text-stone-800 text-base">
              {year}年 {month + 1}月
            </span>
            <button
              onClick={handleGoToday}
              className="text-[11px] font-semibold text-[#C24B66] bg-pink-50 hover:bg-pink-100 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
            >
              今
            </button>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 active:scale-95 transition-all cursor-pointer"
              title="上个月"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 active:scale-95 transition-all cursor-pointer"
              title="下个月"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day of Week Labels */}
        <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-stone-400 py-1">
          {WEEK_DAYS.map((wd) => (
            <div key={wd}>{wd}</div>
          ))}
        </div>

        {/* Calendar Day Cells Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((item, idx) => {
            const entry = diaryMap.get(item.dateStr);
            const isSelected = selectedDate === item.dateStr;
            const isToday = todayStr === item.dateStr;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDate(item.dateStr)}
                className={`relative min-h-[48px] rounded-2xl flex flex-col items-center justify-between p-1 transition-all cursor-pointer ${
                  !item.isCurrentMonth
                    ? "opacity-30"
                    : isSelected
                    ? "bg-[#2D1B22] text-white shadow-md scale-105 z-10"
                    : isToday
                    ? "bg-pink-50/70 border border-pink-200 text-stone-800"
                    : "hover:bg-stone-50 text-stone-700"
                }`}
              >
                {/* Day number */}
                <span className={`text-xs font-semibold tabular-nums ${isSelected ? "text-amber-200" : ""}`}>
                  {item.day}
                </span>

                {/* Mood Color Tag / Emoji Marker */}
                {entry ? (
                  <div className="flex flex-col items-center">
                    <span className="text-xs leading-none">{entry.mood.icon}</span>
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-0.5"
                      style={{ backgroundColor: entry.mood.color }}
                    />
                  </div>
                ) : (
                  <div className="h-4 flex items-center justify-center">
                    {isToday && !isSelected && (
                      <span className="w-1 h-1 rounded-full bg-[#C24B66]" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Mood Color Legend */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between flex-wrap gap-1 text-[10px] text-stone-500 px-1">
          {MOODS.map((m) => {
            const count = currentMonthEntries.filter((e) => e.mood.key === m.key).length;
            return (
              <div key={m.key} className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                <span>{m.label}</span>
                {count > 0 && <span className="tabular-nums font-semibold text-stone-700">{count}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Detail Card */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-3.5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-bold text-stone-800 text-sm">
              {selectedDate}
            </span>
            {selectedDate === todayStr && (
              <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full">
                今日
              </span>
            )}
          </div>

          <button
            onClick={() => handleOpenAddForDate(selectedDate)}
            className="text-xs font-semibold text-[#C24B66] hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{selectedEntry ? "修改心情记录" : "记录这天心情"}</span>
          </button>
        </div>

        {selectedEntry ? (
          <div className="space-y-3">
            {/* Mood Header Tag */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{selectedEntry.mood.icon}</span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-lg text-white"
                  style={{ backgroundColor: selectedEntry.mood.color }}
                >
                  {selectedEntry.mood.label}
                </span>
                <span className="text-xs text-stone-400">· 由 {selectedEntry.authorRole === "A" ? pair.nicknameA || "我" : pair.nicknameB || "TA"} 记录</span>
              </div>

              <button
                onClick={() => onDeleteDiary(selectedEntry.id)}
                className="text-stone-300 hover:text-red-500 p-1 transition-colors cursor-pointer"
                title="删除记录"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Note text */}
            {selectedEntry.text && (
              <p className="text-xs text-stone-700 leading-relaxed font-serif whitespace-pre-wrap bg-stone-50/70 p-3 rounded-2xl border border-stone-100">
                {selectedEntry.text}
              </p>
            )}

            {/* Attached images */}
            {selectedEntry.images && selectedEntry.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {selectedEntry.images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setPreviewImage(img)}
                    className="aspect-square rounded-2xl overflow-hidden bg-stone-50 border border-stone-200/60 cursor-pointer hover:opacity-95"
                  >
                    <img src={img} alt="Memory" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center text-stone-400 text-xs">
            <span className="text-2xl block mb-1">🍃</span>
            <p>这天还没有记录心情日记</p>
            <button
              onClick={() => handleOpenAddForDate(selectedDate)}
              className="mt-3 px-4 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 text-[#C24B66] font-semibold text-xs transition-colors cursor-pointer"
            >
              ＋ 为 {selectedDate} 标记心情
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => handleOpenAddForDate(selectedDate)}
        className="fixed right-5 bottom-20 z-30 bg-[#C24B66] hover:bg-[#a8324e] active:scale-95 text-white font-semibold text-xs px-4 py-2.5 rounded-full shadow-[0_8px_20px_rgba(194,75,102,0.35)] flex items-center space-x-1.5 transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>记下心情</span>
      </button>

      {/* Record Mood Modal Drawer */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[88vh] overflow-y-auto shadow-2xl animate-card-in border border-stone-200">
            <div className="w-10 h-1.5 bg-stone-200 rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif font-bold text-stone-800 text-base">
                  记录心情 · {selectedDate}
                </h3>
                <span className="text-[11px] text-stone-400">选择专属情绪色并留下回忆</span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mood selector with colorful indicators */}
            <div className="mb-4">
              <label className="text-xs text-stone-600 font-semibold block mb-2">这天的情绪色彩</label>
              <div className="grid grid-cols-6 gap-1.5">
                {MOODS.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setSelectedMood(m)}
                    className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                      selectedMood.key === m.key
                        ? "ring-2 ring-stone-800 shadow-sm scale-105"
                        : "bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-100"
                    }`}
                    style={{
                      backgroundColor: selectedMood.key === m.key ? `${m.color}20` : undefined,
                    }}
                  >
                    <span className="text-xl mb-0.5">{m.icon}</span>
                    <span className="text-[10px] font-bold" style={{ color: m.color }}>
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Journal text */}
            <div className="mb-3.5">
              <label className="text-xs text-stone-600 font-semibold block mb-1">写点什么（选填）</label>
              <textarea
                rows={4}
                placeholder="这一天发生的故事、温暖的小瞬间或心底的悄悄话…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-3 text-xs outline-none focus:border-[#C24B66] focus:bg-white resize-none leading-relaxed"
              />
            </div>

            {/* Images upload */}
            <div className="mb-5">
              <label className="text-xs text-stone-600 font-semibold block mb-1">纪念照片（选填）</label>
              <div className="flex flex-wrap gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-2xl overflow-hidden border border-pink-200">
                    <img src={img} alt="Attachment" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImg(idx)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}

                <label className="w-16 h-16 border border-dashed border-pink-300 rounded-2xl flex flex-col items-center justify-center text-[#C24B66] text-[10px] cursor-pointer hover:bg-pink-50 transition-colors">
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span>传图</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-full bg-stone-100 text-stone-600 text-xs font-semibold hover:bg-stone-200 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-full bg-[#C24B66] text-white text-xs font-semibold hover:bg-[#a8324e] shadow-md shadow-rose-200 transition-colors cursor-pointer"
              >
                保存到日历
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 cursor-pointer"
        >
          <img
            src={previewImage}
            alt="Enlarged"
            className="max-w-full max-h-[85vh] rounded-3xl object-contain shadow-2xl"
          />
        </div>
      )}

    </div>
  );
};
