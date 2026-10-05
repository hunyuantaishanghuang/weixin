import React, { useState } from "react";
import {
  BoardNote,
  NoteColor,
  PairState,
  Role,
  Gender,
  UserStatus,
  PairLiveStatus,
  PokeType,
  PokeRecord,
  StatusCode,
} from "../types";
import { PRESET_STATUSES, POKE_ACTIONS, NOTE_STICKERS } from "../storage";
import {
  Plus,
  Pin,
  Heart,
  Trash2,
  Sparkles,
  X,
  UserCheck,
  Search,
  Clock,
  Car,
  Smile,
  Send,
  Check,
  Zap,
} from "lucide-react";
import { playChimeSound, playCardFlipSound } from "../utils/sound";

interface MessagePageProps {
  pair: PairState;
  notes: BoardNote[];
  liveStatus: PairLiveStatus;
  pokes: PokeRecord[];
  onAddNote: (data: { fromRole: Role; gender: Gender; content: string; color: NoteColor; pinned: boolean }) => void;
  onTogglePin: (id: string) => void;
  onToggleLike: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onSwitchRole: () => void;
  onUpdateStatus: (newStatus: UserStatus) => void;
  onSendPoke: (type: PokeType) => void;
  onUpdateNoteSticker: (noteId: string, sticker: string) => void;
}

const LOVE_QUOTES = [
  "今晚别太累，回家给你煮热乎乎的冰糖雪梨汤 🍐",
  "下班路上风大，记得拉紧外套拉链呀~",
  "遇见你之后，我所有的愿望都有了具体的模样 ✨",
  "辛苦啦宝贝！今晚的碗筷与家务全都包在我身上！",
  "哪怕世界再喧闹，看到你笑的那一刻，我的整个宇宙就安静了下来 🌙",
  "今天也是超级超级喜欢你的一天 🍓",
  "累了就抱抱我，我一直都在你身后。",
  "想和你一起吃很多很多顿热气腾腾的饭，看一万次落日 🌇",
  "周末天气好的话，我们去湖边散步踩落叶吧？",
  "你是我平淡无奇的日子里，最璀璨的奇迹 💕",
];

const MALE_COLORS: { key: NoteColor; name: string; bg: string; border: string; accent: string }[] = [
  { key: "blue", name: "晴空蓝", bg: "bg-[#EFF6FF]", border: "border-blue-200/90", accent: "text-blue-800" },
  { key: "cyan", name: "冰川青", bg: "bg-[#ECFEFF]", border: "border-cyan-200/90", accent: "text-cyan-800" },
  { key: "purple", name: "雾霾紫", bg: "bg-[#FAF5FF]", border: "border-purple-200/90", accent: "text-purple-800" },
  { key: "yellow", name: "暖阳黄", bg: "bg-[#FFFBEB]", border: "border-amber-200/90", accent: "text-amber-800" },
];

const FEMALE_COLORS: { key: NoteColor; name: string; bg: string; border: string; accent: string }[] = [
  { key: "pink", name: "落樱粉", bg: "bg-[#FFF1F2]", border: "border-rose-200/90", accent: "text-rose-800" },
  { key: "rose", name: "蜜桃粉", bg: "bg-[#FDF2F8]", border: "border-pink-200/90", accent: "text-pink-800" },
  { key: "purple", name: "丁香紫", bg: "bg-[#FAF5FF]", border: "border-purple-200/90", accent: "text-purple-800" },
  { key: "yellow", name: "暖杏黄", bg: "bg-[#FFFBEB]", border: "border-amber-200/90", accent: "text-amber-800" },
];

function timeAgo(dateString: string): string {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "刚刚";
    if (diffMin < 60) return `${diffMin}分钟前`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}小时前`;
    return `${Math.floor(diffHours / 24)}天前`;
  } catch {
    return "刚刚";
  }
}

export const MessagePage: React.FC<MessagePageProps> = ({
  pair,
  notes,
  liveStatus,
  pokes,
  onAddNote,
  onTogglePin,
  onToggleLike,
  onDeleteNote,
  onSwitchRole,
  onUpdateStatus,
  onSendPoke,
  onUpdateNoteSticker,
}) => {
  const [filter, setFilter] = useState<"all" | "male" | "female" | "pinned">("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activeStickerMenuNoteId, setActiveStickerMenuNoteId] = useState<string | null>(null);

  // New note form states
  const [content, setContent] = useState("");
  const [pinned, setPinned] = useState(false);

  // Status edit form states
  const currentRole = pair.currentRole;
  const currentGender = currentRole === "A" ? pair.genderA : pair.genderB;
  const currentRoleName = currentRole === "A" ? pair.nicknameA || (currentGender === "male" ? "男孩" : "女孩") : pair.nicknameB || (currentGender === "male" ? "男孩" : "女孩");
  const partnerGender = currentRole === "A" ? pair.genderB : pair.genderA;
  const partnerRoleName = currentRole === "A" ? pair.nicknameB || (partnerGender === "male" ? "男孩" : "女孩") : pair.nicknameA || (partnerGender === "male" ? "男孩" : "女孩");

  const myStatus: UserStatus = currentRole === "A" ? liveStatus.statusA : liveStatus.statusB;
  const partnerStatus: UserStatus = currentRole === "A" ? liveStatus.statusB : liveStatus.statusA;

  // Custom status draft in modal
  const [selectedStatusCode, setSelectedStatusCode] = useState<StatusCode>(myStatus.code);
  const [customEmoji, setCustomEmoji] = useState(myStatus.emoji || "💖");
  const [customLabel, setCustomLabel] = useState(myStatus.label || "此时此刻");
  const [customSub, setCustomSub] = useState(myStatus.subText || "");
  const [customEta, setCustomEta] = useState<number | undefined>(myStatus.etaMinutes);

  const availableColors = currentGender === "male" ? MALE_COLORS : FEMALE_COLORS;
  const [selectedColor, setSelectedColor] = useState<NoteColor>(() => (currentGender === "male" ? "blue" : "pink"));

  const handleOpenAddModal = () => {
    setSelectedColor(currentGender === "male" ? "blue" : "pink");
    setShowAddModal(true);
  };

  const handleOpenStatusModal = () => {
    setSelectedStatusCode(myStatus.code);
    setCustomEmoji(myStatus.emoji);
    setCustomLabel(myStatus.label);
    setCustomSub(myStatus.subText || "");
    setCustomEta(myStatus.etaMinutes);
    setShowStatusModal(true);
  };

  const handleSelectPresetStatus = (preset: typeof PRESET_STATUSES[0]) => {
    setSelectedStatusCode(preset.code);
    setCustomEmoji(preset.emoji);
    setCustomLabel(preset.label);
    setCustomSub(preset.defaultSub);
    if (preset.code === "on_the_way" && !customEta) {
      setCustomEta(20);
    }
  };

  const handleSaveStatus = () => {
    const newStatus: UserStatus = {
      code: selectedStatusCode,
      emoji: customEmoji || "💖",
      label: customLabel || "状态更新",
      subText: customSub.trim() || undefined,
      etaMinutes: selectedStatusCode === "on_the_way" ? customEta : undefined,
      updateTime: new Date().toISOString(),
    };
    onUpdateStatus(newStatus);
    setShowStatusModal(false);
    playChimeSound();
  };

  const handleGenLove = () => {
    const randomQuote = LOVE_QUOTES[Math.floor(Math.random() * LOVE_QUOTES.length)];
    setContent(randomQuote);
  };

  const handleSaveNote = () => {
    if (!content.trim()) return;
    onAddNote({
      fromRole: currentRole,
      gender: currentGender,
      content: content.trim(),
      color: selectedColor,
      pinned,
    });
    setContent("");
    setPinned(false);
    setShowAddModal(false);
    playChimeSound();
  };

  const handlePokeClick = (type: PokeType) => {
    onSendPoke(type);
    playCardFlipSound();
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    if (filter === "male" && n.gender !== "male") return false;
    if (filter === "female" && n.gender !== "female") return false;
    if (filter === "pinned" && !n.pinned) return false;
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      return n.content.toLowerCase().includes(q) || (n.sticker && n.sticker.includes(q));
    }
    return true;
  });

  const maleNotesCount = notes.filter((n) => n.gender === "male").length;
  const femaleNotesCount = notes.filter((n) => n.gender === "female").length;
  const latestPoke = pokes[0];

  return (
    <div className="flex-1 pb-28 px-4 pt-3 max-w-md mx-auto w-full space-y-4">
      
      {/* Editorial Luxury Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2D1B22] via-[#3B1E28] to-[#1C1217] text-white p-5 shadow-[0_12px_32px_rgba(45,27,34,0.25)] border border-amber-900/30">
        <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-xs text-amber-200/90 font-serif tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Love Board · 实时状态与双色便签板</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-stone-100 tracking-tight mt-1">
              彼此在身边 · 心动随时传达
            </h2>
            <div className="text-xs text-stone-400 mt-1 flex items-center space-x-2">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                <span>男生 {maleNotesCount} 张</span>
              </span>
              <span>·</span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                <span>女生 {femaleNotesCount} 张</span>
              </span>
              <span>·</span>
              <span>当前: {currentGender === "male" ? "👦 男生" : "👧 女生"}视角</span>
            </div>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-300/20 flex items-center justify-center text-2xl shrink-0 shadow-inner">
            💌
          </div>
        </div>
      </div>

      {/* 🌟 1. 此时此刻情侣实时状态看板 (Live Status Widget) */}
      <div className="bg-white rounded-3xl p-4.5 border border-stone-200/80 shadow-[0_6px_24px_rgba(0,0,0,0.04)] space-y-3">
        <div className="flex items-center justify-between text-xs pb-1 border-b border-stone-100">
          <div className="flex items-center space-x-1.5 font-bold text-stone-800">
            <span className="text-base">📍</span>
            <span>此时此刻 · 双方实时状态</span>
          </div>
          <button
            onClick={onSwitchRole}
            className="text-[11px] font-medium text-[#C24B66] hover:underline flex items-center space-x-1 cursor-pointer"
            title="切换为对方视角查看"
          >
            <UserCheck className="w-3 h-3" />
            <span>换成「{partnerRoleName}」视角</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* My Live Status Card */}
          <div
            onClick={handleOpenStatusModal}
            className="p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200/70 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
                <span className="flex items-center space-x-1 font-semibold text-stone-700">
                  <span>{currentGender === "male" ? "👦 我 (男)" : "👧 我 (女)"}</span>
                  <span className="text-stone-400 font-normal">· {currentRoleName}</span>
                </span>
                <span className="text-[10px] text-blue-600 group-hover:underline">修改 ✏️</span>
              </div>

              <div className="flex items-center space-x-2 mt-1">
                <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">
                  {myStatus.emoji}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-stone-900 truncate">
                    {myStatus.label}
                  </div>
                  {myStatus.etaMinutes && (
                    <div className="text-[10px] font-semibold text-blue-600 flex items-center space-x-0.5 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      <span>约 {myStatus.etaMinutes} 分钟到家</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 line-clamp-1 mt-2.5 font-light">
              {myStatus.subText || "点击自定义当前心情与动向"}
            </p>
          </div>

          {/* Partner Live Status Card */}
          <div className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
            partnerGender === "male" ? "bg-blue-50/60 border-blue-200/80" : "bg-rose-50/60 border-rose-200/80"
          }`}>
            <div>
              <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
                <span className="flex items-center space-x-1 font-semibold text-stone-700">
                  <span>{partnerGender === "male" ? "👦 TA (男)" : "👧 TA (女)"}</span>
                  <span className="text-stone-400 font-normal">· {partnerRoleName}</span>
                </span>
                <span className="text-[10px] text-stone-400 tabular-nums">{timeAgo(partnerStatus.updateTime)}</span>
              </div>

              <div className="flex items-center space-x-2 mt-1">
                <span className="text-2xl shrink-0 animate-pulse">
                  {partnerStatus.emoji}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-stone-900 truncate">
                    {partnerStatus.label}
                  </div>
                  {partnerStatus.etaMinutes && (
                    <div className="text-[10px] font-semibold text-blue-700 flex items-center space-x-0.5 mt-0.5">
                      <Car className="w-2.5 h-2.5" />
                      <span>正在路上 · 约 {partnerStatus.etaMinutes} 分钟</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-stone-600 line-clamp-1 mt-2.5 font-light">
              {partnerStatus.subText || "暂无特别叮嘱"}
            </p>
          </div>
        </div>

        {/* 💖 2. 隔空互动戳一戳 (Quick Poke Action Bar) */}
        <div className="pt-2 border-t border-stone-100 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-stone-500 font-medium">向 {partnerRoleName} 隔空传情：</span>
            {latestPoke && (
              <span className="text-[10px] text-stone-400 truncate max-w-[190px]">
                {latestPoke.fromRole === currentRole ? "你" : partnerRoleName}
                {latestPoke.emoji} {latestPoke.text}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-0.5">
            {POKE_ACTIONS.map((action) => (
              <button
                key={action.type}
                onClick={() => handlePokeClick(action.type)}
                className="flex-1 py-1.5 px-2 rounded-xl bg-stone-100 hover:bg-pink-50 hover:text-[#C24B66] text-stone-700 active:scale-95 transition-all text-xs font-medium flex items-center justify-center space-x-1 shrink-0 cursor-pointer border border-stone-200/50"
                title={action.actionText}
              >
                <span>{action.emoji}</span>
                <span className="text-[11px]">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🔍 Search & Filters Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜索留言便签关键词或贴纸…"
            className="w-full pl-9 pr-8 py-2 rounded-2xl bg-white border border-stone-200/80 text-xs text-stone-800 outline-none focus:border-[#C24B66]"
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
              filter === "all"
                ? "bg-[#C24B66] text-white font-semibold shadow-xs"
                : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/70"
            }`}
          >
            全部便签 ({notes.length})
          </button>
          <button
            onClick={() => setFilter("male")}
            className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1 ${
              filter === "male"
                ? "bg-blue-600 text-white font-semibold shadow-xs"
                : "bg-white text-blue-700 hover:bg-blue-50 border border-blue-200/70"
            }`}
          >
            <span>👦 男孩蓝笺</span>
            <span className="tabular-nums">({maleNotesCount})</span>
          </button>
          <button
            onClick={() => setFilter("female")}
            className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1 ${
              filter === "female"
                ? "bg-rose-500 text-white font-semibold shadow-xs"
                : "bg-white text-rose-700 hover:bg-rose-50 border border-rose-200/70"
            }`}
          >
            <span>👧 女孩粉笺</span>
            <span className="tabular-nums">({femaleNotesCount})</span>
          </button>
          <button
            onClick={() => setFilter("pinned")}
            className={`px-2.5 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
              filter === "pinned"
                ? "bg-stone-800 text-white font-semibold shadow-xs"
                : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/70"
            }`}
          >
            📌 置顶
          </button>
        </div>
      </div>

      {/* 📌 Sticky Notes Pinboard Grid */}
      <div className="space-y-4">
        {filteredNotes.map((note) => {
          const isBoy = note.gender === "male";
          const allColors = isBoy ? MALE_COLORS : FEMALE_COLORS;
          const colorConfig = allColors.find((c) => c.key === note.color) || allColors[0];
          
          const authorName = note.fromRole === "A" 
            ? (pair.nicknameA || (note.gender === "male" ? "男孩" : "女孩"))
            : (pair.nicknameB || (note.gender === "male" ? "男孩" : "女孩"));
            
          const recipientName = note.toRole === "A"
            ? (pair.nicknameA || (pair.genderA === "male" ? "男孩" : "女孩"))
            : (pair.nicknameB || (pair.genderB === "male" ? "男孩" : "女孩"));

          const isStickerMenuOpen = activeStickerMenuNoteId === note.id;

          return (
            <div
              key={note.id}
              className={`relative rounded-3xl p-5 border-2 shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition-all ${colorConfig.bg} ${colorConfig.border} group`}
            >
              {/* Cute Washi Tape Strip at the Top */}
              <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 rounded-sm backdrop-blur-xs opacity-80 shadow-xs rotate-[-1deg] pointer-events-none ${
                isBoy ? "bg-blue-300/70 border border-blue-400/40" : "bg-rose-300/70 border border-rose-400/40"
              }`} />

              {/* Pushpin & Gender Badge Header */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center space-x-2 text-xs flex-wrap gap-y-1">
                  {note.pinned && (
                    <span className="flex items-center space-x-0.5 text-amber-700 font-bold bg-white/90 px-2 py-0.5 rounded-md border border-amber-200 shadow-2xs">
                      <Pin className="w-3 h-3 fill-current text-rose-600" />
                      <span>置顶</span>
                    </span>
                  )}

                  {/* Gender Signature Tag */}
                  <span
                    className={`font-semibold px-2.5 py-0.5 rounded-full text-[11px] flex items-center space-x-1 border shadow-2xs ${
                      isBoy
                        ? "bg-blue-100/90 border-blue-300 text-blue-900"
                        : "bg-rose-100/90 border-rose-300 text-rose-900"
                    }`}
                  >
                    <span>{isBoy ? "👦 男生便签" : "👧 女生便签"}</span>
                    <span>·</span>
                    <span>{authorName}</span>
                  </span>

                  <span className="text-stone-300">·</span>
                  <span className="text-stone-400 text-[11px] tabular-nums">{note.createTime}</span>
                </div>

                <div className="flex items-center space-x-1">
                  {/* Pin button */}
                  <button
                    onClick={() => onTogglePin(note.id)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      note.pinned ? "text-rose-600 bg-white/80" : "text-stone-400 hover:text-stone-700"
                    }`}
                    title={note.pinned ? "取消置顶" : "置顶在板子上"}
                  >
                    <Pin className={`w-3.5 h-3.5 ${note.pinned ? "fill-current" : ""}`} />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 transition-colors cursor-pointer"
                    title="撕下便签"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Note Content */}
              <p className="text-stone-800 font-serif text-sm leading-relaxed whitespace-pre-wrap py-1 pl-0.5">
                {note.content}
              </p>

              {/* Attached Sticker Stamp if exists */}
              {note.sticker && (
                <div className="mt-2 inline-flex items-center space-x-1 bg-white/90 border border-stone-200/80 px-2.5 py-1 rounded-full text-xs font-semibold text-stone-700 shadow-2xs">
                  <span>{note.sticker}</span>
                </div>
              )}

              {/* Bottom Card Actions: Recipient, Sticker Selector & Likes */}
              <div className="pt-2.5 mt-2.5 border-t border-black/5 flex items-center justify-between text-xs">
                <span className={`text-[11px] font-medium flex items-center space-x-1 ${
                  isBoy ? "text-blue-700/80" : "text-rose-700/80"
                }`}>
                  <span>留给:</span>
                  <span className="font-semibold">{recipientName}</span>
                </span>

                <div className="flex items-center space-x-2">
                  {/* Add/Change Sticker button */}
                  <button
                    onClick={() => setActiveStickerMenuNoteId(isStickerMenuOpen ? null : note.id)}
                    className="px-2 py-1 rounded-full bg-white/80 hover:bg-white text-stone-600 border border-black/5 flex items-center space-x-1 cursor-pointer transition-colors"
                    title="盖上甜蜜印章贴纸"
                  >
                    <Smile className="w-3 h-3 text-amber-500" />
                    <span className="text-[11px]">{note.sticker ? "换贴纸" : "贴纸"}</span>
                  </button>

                  {/* Like button */}
                  <button
                    onClick={() => onToggleLike(note.id)}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                      note.likedByMe
                        ? "bg-rose-500 text-white shadow-xs"
                        : "bg-white/80 hover:bg-white text-stone-600 border border-black/5"
                    }`}
                    title="为这张便签心动点赞"
                  >
                    <Heart className={`w-3.5 h-3.5 ${note.likedByMe ? "fill-current" : ""}`} />
                    <span className="tabular-nums">{note.likes > 0 ? note.likes : "心动"}</span>
                  </button>
                </div>
              </div>

              {/* Quick Sticker Dropdown Drawer for Note */}
              {isStickerMenuOpen && (
                <div className="mt-3 p-2.5 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200/90 shadow-lg animate-card-in">
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mb-2 px-1">
                    <span>选择盖章贴纸：</span>
                    <button
                      onClick={() => setActiveStickerMenuNoteId(null)}
                      className="text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {NOTE_STICKERS.map((sticker) => (
                      <button
                        key={sticker}
                        type="button"
                        onClick={() => {
                          onUpdateNoteSticker(note.id, sticker);
                          setActiveStickerMenuNoteId(null);
                        }}
                        className={`p-1.5 rounded-xl border text-[11px] font-medium transition-all text-center cursor-pointer ${
                          note.sticker === sticker
                            ? "bg-rose-50 border-rose-300 text-rose-700 font-bold"
                            : "bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700"
                        }`}
                      >
                        {sticker}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredNotes.length === 0 && (
          <div className="bg-white rounded-3xl p-10 text-center text-stone-400 text-xs border border-stone-200/70">
            <span className="text-3xl block mb-2">📌</span>
            <p className="font-serif font-bold text-stone-700 text-sm">
              {searchKeyword ? "未搜索到匹配的便签" : "该分类下暂无便签"}
            </p>
            <p className="text-stone-400 mt-1">点击右下角，为对方贴上专属便签吧~</p>
          </div>
        )}
      </div>

      {/* Floating Action Button (+ 贴一张留言便签) */}
      <button
        onClick={handleOpenAddModal}
        className={`fixed right-5 bottom-20 z-30 active:scale-95 text-white font-semibold text-xs px-4 py-2.5 rounded-full shadow-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
          currentGender === "male"
            ? "bg-blue-600 hover:bg-blue-700 shadow-blue-300/40"
            : "bg-[#C24B66] hover:bg-[#a8324e] shadow-rose-300/40"
        }`}
      >
        <Plus className="w-4 h-4" />
        <span>贴一张{currentGender === "male" ? "蓝色" : "粉色"}便签</span>
      </button>

      {/* ✏️ 3. 状态修改弹窗 (Live Status Customizer Modal) */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[88vh] overflow-y-auto shadow-2xl animate-card-in border border-stone-200">
            <div className="w-10 h-1.5 bg-stone-200 rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif font-bold text-stone-800 text-base">更新我的此时此刻状态</h3>
                <span className="text-[11px] text-stone-400">同步给「{partnerRoleName}」，让爱不失联</span>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Presets Grid */}
              <div>
                <label className="text-xs text-stone-600 font-semibold block mb-2">常用情侣预设状态</label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_STATUSES.map((preset) => {
                    const isSelected = selectedStatusCode === preset.code;
                    return (
                      <button
                        key={preset.code}
                        type="button"
                        onClick={() => handleSelectPresetStatus(preset)}
                        className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-rose-50 border-rose-400 ring-2 ring-rose-300 shadow-xs"
                            : "bg-stone-50 border-stone-200/80 hover:bg-stone-100"
                        }`}
                      >
                        <div className="text-xl mb-1">{preset.emoji}</div>
                        <div className={`text-xs font-bold ${isSelected ? "text-rose-900" : "text-stone-800"}`}>
                          {preset.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* If "On the way" is chosen: ETA presets */}
              {selectedStatusCode === "on_the_way" && (
                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-blue-900">
                    <Car className="w-3.5 h-3.5 text-blue-600" />
                    <span>预计到达时间 (ETA)</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[10, 20, 30, 45, 60].map((min) => (
                      <button
                        key={min}
                        type="button"
                        onClick={() => setCustomEta(min)}
                        className={`py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          customEta === min
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-blue-800 border-blue-200 hover:bg-blue-100"
                        }`}
                      >
                        {min}分钟
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Note input */}
              <div>
                <label className="text-xs text-stone-600 font-semibold block mb-1.5">
                  个性化说明 / 心里话
                </label>
                <input
                  type="text"
                  maxLength={40}
                  value={customSub}
                  onChange={(e) => setCustomSub(e.target.value)}
                  placeholder="写一句想对TA说的小叮嘱或状态解释…"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 outline-none focus:border-[#C24B66] focus:bg-white"
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 py-2.5 rounded-full bg-stone-100 text-stone-600 text-xs font-semibold hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveStatus}
                  className="flex-1 py-2.5 rounded-full bg-[#C24B66] hover:bg-[#a8324e] text-white text-xs font-semibold shadow-md shadow-rose-200 transition-colors cursor-pointer flex items-center justify-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>立即同步状态</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 💌 4. 贴一张留言便签弹窗 (Post Sticky Note Modal) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[88vh] overflow-y-auto shadow-2xl animate-card-in border border-stone-200">
            <div className="w-10 h-1.5 bg-stone-200 rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif font-bold text-stone-800 text-base flex items-center space-x-1.5">
                  <span>{currentGender === "male" ? "👦 男生蓝色留言便签" : "👧 女生粉色留言便签"}</span>
                </h3>
                <span className="text-[11px] text-stone-400">以「{currentRoleName}」的身份贴给「{partnerRoleName}」</span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Paper color selector */}
              <div>
                <label className="text-xs text-stone-600 font-semibold block mb-1.5">
                  {currentGender === "male" ? "男生冷调信纸配色" : "女生暖调信纸配色"}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {availableColors.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setSelectedColor(c.key)}
                      className={`h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${c.bg} ${
                        selectedColor === c.key ? "ring-2 ring-stone-800 scale-105" : "border-stone-200"
                      }`}
                    >
                      <span className={`text-[11px] font-bold ${c.accent}`}>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-stone-600 font-semibold">便签留言内容</label>
                  <button
                    type="button"
                    onClick={handleGenLove}
                    className="text-xs text-[#C24B66] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>💗 填入情话灵感</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  placeholder={
                    currentGender === "male"
                      ? "写下男生想对她说的叮嘱、爱意、暖心承诺或日常小纸条…"
                      : "写下女生想对他说的悄悄话、撒娇、关怀或甜蜜约定…"
                  }
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-3 text-xs outline-none focus:border-[#C24B66] focus:bg-white resize-none leading-relaxed"
                />
              </div>

              {/* Pin to top toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                <div className="flex items-center space-x-2">
                  <Pin className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-semibold text-stone-700">置顶在留言板最前方</span>
                </div>
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="w-4 h-4 accent-[#C24B66] cursor-pointer"
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-full bg-stone-100 text-stone-600 text-xs font-semibold hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  disabled={!content.trim()}
                  className={`flex-1 py-2.5 rounded-full disabled:opacity-40 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer ${
                    currentGender === "male"
                      ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                      : "bg-[#C24B66] hover:bg-[#a8324e] shadow-rose-200"
                  }`}
                >
                  贴上留言板
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
