import React, { useState } from "react";
import { AdventureCard, AdventureCategory, AdventureMode, PairState } from "../types";
import { ADVENTURE_CATEGORIES } from "../storage";
import { Sparkles, Dices, Plus, Check, Trash2, Heart, Award, X, Flame, MessageCircleQuestion } from "lucide-react";
import { playCardFlipSound, playChimeSound } from "../utils/sound";

interface AdventurePageProps {
  pair: PairState;
  adventures: AdventureCard[];
  onAddAdventure: (card: { mode: "truth" | "dare"; category: AdventureCategory; content: string; reward?: string }) => void;
  onDeleteAdventure: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export const AdventurePage: React.FC<AdventurePageProps> = ({
  pair,
  adventures,
  onAddAdventure,
  onDeleteAdventure,
  onToggleComplete,
}) => {
  const [modeFilter, setModeFilter] = useState<AdventureMode>("all");
  const [selectedCategory, setSelectedCategory] = useState<AdventureCategory | "all">("all");
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"draw" | "deck">("draw");

  // Form states for custom card
  const [customMode, setCustomMode] = useState<"truth" | "dare">("truth");
  const [customCat, setCustomCat] = useState<AdventureCategory>("sweet");
  const [customContent, setCustomContent] = useState("");
  const [customReward, setCustomReward] = useState("");

  // Filter pool
  const pool = adventures.filter((card) => {
    if (modeFilter !== "all" && card.mode !== modeFilter) return false;
    if (selectedCategory !== "all" && card.category !== selectedCategory) return false;
    return true;
  });

  const currentCard: AdventureCard | undefined = pool[currentCardIndex % (pool.length || 1)];

  // Draw / Shuffle card
  const handleDraw = () => {
    if (pool.length === 0) return;
    setIsShuffling(true);
    setIsFlipped(false);
    playCardFlipSound();

    setTimeout(() => {
      let nextIdx = Math.floor(Math.random() * pool.length);
      if (nextIdx === currentCardIndex && pool.length > 1) {
        nextIdx = (nextIdx + 1) % pool.length;
      }
      setCurrentCardIndex(nextIdx);
      setIsShuffling(false);
      setIsFlipped(true);
      playChimeSound();
    }, 320);
  };

  const handleCardClick = () => {
    setIsFlipped((prev) => !prev);
    playCardFlipSound();
  };

  const handleCompleteCurrent = () => {
    if (currentCard) {
      onToggleComplete(currentCard.id);
      playChimeSound();
    }
  };

  const handleSaveCustom = () => {
    if (!customContent.trim()) return;
    onAddAdventure({
      mode: customMode,
      category: customCat,
      content: customContent.trim(),
      reward: customReward.trim() || undefined,
    });
    setCustomContent("");
    setCustomReward("");
    setShowAddModal(false);
    playChimeSound();
  };

  const completedCount = adventures.filter((a) => a.completed).length;
  const truthCount = adventures.filter((a) => a.mode === "truth").length;
  const dareCount = adventures.filter((a) => a.mode === "dare").length;

  return (
    <div className="flex-1 pb-24 px-4 pt-3 max-w-md mx-auto w-full space-y-4">
      
      {/* Editorial Luxury Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2D1B22] via-[#381B26] to-[#1C1217] text-white p-5 shadow-[0_12px_32px_rgba(45,27,34,0.28)] border border-amber-900/30">
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-xs text-amber-200/90 font-serif tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Truth or Dare · 恋爱真心话与大冒险</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-stone-100 tracking-tight mt-1">
              翻开属于你们的浪漫密语
            </h2>
            <div className="text-xs text-stone-400 mt-1 flex items-center space-x-2">
              <span>海量卡池 <strong className="text-amber-300 font-semibold tabular-nums">{adventures.length}</strong> 张</span>
              <span>·</span>
              <span>真心话 {truthCount} · 大冒险 {dareCount}</span>
              <span>·</span>
              <span>已达成 <strong className="text-rose-300 font-semibold tabular-nums">{completedCount}</strong></span>
            </div>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-300/20 flex items-center justify-center text-amber-200 text-2xl shadow-inner shrink-0">
            🃏
          </div>
        </div>
      </div>

      {/* Mode Segmented Controller (Draw vs Deck Manager) */}
      <div className="p-1 bg-stone-200/60 rounded-2xl flex items-center">
        <button
          onClick={() => setActiveTab("draw")}
          className={`flex-1 min-h-[38px] text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === "draw"
              ? "bg-white text-stone-800 shadow-sm"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          抽卡大冒险
        </button>
        <button
          onClick={() => setActiveTab("deck")}
          className={`flex-1 min-h-[38px] text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === "deck"
              ? "bg-white text-stone-800 shadow-sm"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          题库总览与自定义 ({adventures.length})
        </button>
      </div>

      {activeTab === "draw" ? (
        <div className="space-y-3.5">
          
          {/* Truth / Dare Mode Filter Tabs */}
          <div className="flex items-center justify-between gap-1.5 p-1 bg-stone-100 rounded-2xl">
            <button
              onClick={() => {
                setModeFilter("all");
                setCurrentCardIndex(0);
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                modeFilter === "all"
                  ? "bg-white text-stone-800 shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              全部混抽 ({adventures.length})
            </button>
            <button
              onClick={() => {
                setModeFilter("truth");
                setCurrentCardIndex(0);
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                modeFilter === "truth"
                  ? "bg-white text-rose-700 shadow-xs"
                  : "text-stone-500 hover:text-rose-700"
              }`}
            >
              <Heart className="w-3 h-3 fill-current text-rose-500" />
              <span>真心话 ({truthCount})</span>
            </button>
            <button
              onClick={() => {
                setModeFilter("dare");
                setCurrentCardIndex(0);
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                modeFilter === "dare"
                  ? "bg-white text-amber-700 shadow-xs"
                  : "text-stone-500 hover:text-amber-700"
              }`}
            >
              <Flame className="w-3 h-3 text-amber-500" />
              <span>大冒险 ({dareCount})</span>
            </button>
          </div>

          {/* Theme Category Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
            <button
              onClick={() => {
                setSelectedCategory("all");
                setCurrentCardIndex(0);
              }}
              className={`px-3 py-1 rounded-full transition-all whitespace-nowrap cursor-pointer text-xs ${
                selectedCategory === "all"
                  ? "bg-[#C24B66] text-white font-semibold shadow-xs"
                  : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/70"
              }`}
            >
              全部分类
            </button>
            {ADVENTURE_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => {
                  setSelectedCategory(cat.key);
                  setCurrentCardIndex(0);
                }}
                className={`px-3 py-1 rounded-full transition-all whitespace-nowrap cursor-pointer text-xs ${
                  selectedCategory === cat.key
                    ? "bg-[#C24B66] text-white font-semibold shadow-xs"
                    : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/70"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* 3D Physical Interactive Card Canvas */}
          <div className="perspective-1000 py-2 flex justify-center">
            <div
              onClick={handleCardClick}
              className={`relative w-full max-w-[325px] h-[395px] rounded-3xl cursor-pointer select-none transition-transform duration-500 transform-style-3d ${
                isFlipped ? "rotate-y-180" : ""
              } ${isShuffling ? "scale-95 opacity-80" : "scale-100 opacity-100 hover:scale-[1.01]"}`}
            >
              
              {/* CARD BACK (Dark luxury gold-embossed seal) */}
              <div className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-[#23151B] via-[#351923] to-[#180F13] border-2 border-amber-300/40 p-6 flex flex-col justify-between items-center text-center backface-hidden shadow-[0_20px_40px_rgba(35,21,27,0.35)]">
                <div className="w-full flex justify-between items-center text-amber-300/60 text-[10px] tracking-widest font-serif">
                  <span>TRUTH OR DARE</span>
                  <span>SECRET CARDS</span>
                </div>

                <div className="space-y-3">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-200/20 to-rose-300/10 border border-amber-300/40 flex items-center justify-center mx-auto shadow-inner text-3xl">
                    ✨
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-amber-100 tracking-wide">
                      {modeFilter === "truth" ? "真心话 · 灵魂拷问" : modeFilter === "dare" ? "大冒险 · 心跳挑战" : "真心话与大冒险"}
                    </h3>
                    <p className="text-xs text-amber-200/70 mt-1">
                      轻触翻开，抽取专属于你们的一张卡牌
                    </p>
                  </div>
                </div>

                <div className="w-full text-center text-amber-200/50 text-[11px] font-medium flex items-center justify-center space-x-1">
                  <span>点击卡牌立即揭晓</span>
                  <span>›</span>
                </div>
              </div>

              {/* CARD FRONT (Cream luxury editorial parchment) */}
              <div className="absolute inset-0 w-full h-full rounded-3xl bg-[#FFFDFB] border border-amber-200/80 p-6 flex flex-col justify-between backface-hidden rotate-y-180 shadow-[0_20px_40px_rgba(45,27,34,0.12)]">
                {currentCard ? (
                  <>
                    <div>
                      {/* Top Header: Mode & Category */}
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <div className="flex items-center space-x-2 text-xs">
                          <span
                            className={`font-serif font-bold px-2 py-0.5 rounded-md text-[11px] ${
                              currentCard.mode === "truth"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-amber-50 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {currentCard.mode === "truth" ? "💖 真心话" : "⚡ 大冒险"}
                          </span>
                          <span className="text-stone-400">·</span>
                          <span className="font-medium text-stone-600">{currentCard.categoryName}</span>
                          {currentCard.isCustom && (
                            <span className="text-amber-600 text-[10px] font-medium">· 自定义</span>
                          )}
                        </div>
                        {currentCard.completed && (
                          <div className="flex items-center space-x-1 text-emerald-600 text-xs font-semibold">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>已完成</span>
                          </div>
                        )}
                      </div>

                      {/* Main Task / Truth Description */}
                      <div className="mt-5 text-stone-800 font-serif text-base leading-relaxed">
                        {currentCard.content}
                      </div>

                      {/* Reward / Consequence Note */}
                      {currentCard.reward && (
                        <div className="mt-4 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/50 text-xs text-amber-900 leading-normal">
                          <span className="font-semibold text-amber-800">心动奖励：</span>
                          <span>{currentCard.reward}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom hint */}
                    <div className="text-center text-stone-400 text-[11px] pt-2 border-t border-stone-100/70">
                      点击卡面可重新翻回牌背
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-stone-400 text-xs text-center">
                    <p>当前筛选条件下暂无卡牌</p>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Action Triggers */}
          <div className="flex items-center justify-center space-x-3 pt-1">
            <button
              onClick={handleDraw}
              className="flex-1 min-h-[46px] rounded-full bg-[#C24B66] hover:bg-[#a8324e] active:scale-95 text-white font-semibold text-xs shadow-md shadow-rose-200 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Dices className="w-4 h-4" />
              <span>{isFlipped ? "换一张抽牌" : "随机抽取卡牌"}</span>
            </button>

            {isFlipped && currentCard && (
              <button
                onClick={handleCompleteCurrent}
                className={`min-h-[46px] px-5 rounded-full font-semibold text-xs border transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95 ${
                  currentCard.completed
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-white text-stone-700 border-stone-200 hover:border-emerald-300 hover:text-emerald-700 shadow-xs"
                }`}
              >
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{currentCard.completed ? "已完成" : "标记完成"}</span>
              </button>
            )}
          </div>

        </div>
      ) : (
        /* Deck List & Custom Card Management */
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">
              卡牌总题库 · 包含 {adventures.length} 道题目
            </span>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 rounded-full bg-[#C24B66] text-white text-xs font-semibold flex items-center space-x-1 shadow-xs hover:bg-[#a8324e] active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>添加两人专属卡</span>
            </button>
          </div>

          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-0.5 no-scrollbar">
            {adventures.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-start justify-between gap-3 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 text-xs text-stone-400 mb-1">
                    <span
                      className={`font-semibold text-[10px] px-1.5 py-0.2 rounded ${
                        card.mode === "truth"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {card.mode === "truth" ? "真心话" : "大冒险"}
                    </span>
                    <span>·</span>
                    <span className="text-stone-600 font-medium">{card.categoryName}</span>
                    <span>·</span>
                    <span>{card.isCustom ? "两人私订" : "精选卡"}</span>
                    {card.completed && (
                      <>
                        <span>·</span>
                        <span className="text-emerald-600 font-semibold">已达成</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-stone-800 leading-relaxed font-serif">
                    {card.content}
                  </p>
                  {card.reward && (
                    <p className="text-[11px] text-amber-800 mt-1 italic">
                      奖励：{card.reward}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-1 shrink-0 pt-1">
                  <button
                    onClick={() => onToggleComplete(card.id)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      card.completed
                        ? "text-emerald-600 bg-emerald-50"
                        : "text-stone-300 hover:text-emerald-600 hover:bg-stone-50"
                    }`}
                    title={card.completed ? "已完成" : "标记完成"}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  {card.isCustom && (
                    <button
                      onClick={() => onDeleteAdventure(card.id)}
                      className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      title="删除此卡片"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Adventure Card Modal Drawer */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto shadow-2xl animate-card-in border border-stone-200">
            <div className="w-10 h-1.5 bg-stone-200 rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-stone-800 text-base">添加专属真心话或大冒险</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Mode choice: Truth or Dare */}
              <div>
                <label className="text-xs text-stone-600 font-semibold block mb-1.5">题目形式</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomMode("truth")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                      customMode === "truth"
                        ? "bg-rose-50 border-rose-400 text-rose-700 shadow-xs"
                        : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 fill-current text-rose-500" />
                    <span>真心话 (倾诉与回忆)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomMode("dare")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                      customMode === "dare"
                        ? "bg-amber-50 border-amber-400 text-amber-800 shadow-xs"
                        : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>大冒险 (互动与考验)</span>
                  </button>
                </div>
              </div>

              {/* Category picker */}
              <div>
                <label className="text-xs text-stone-600 font-semibold block mb-1.5">主题风格</label>
                <div className="grid grid-cols-2 gap-2">
                  {ADVENTURE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setCustomCat(cat.key)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        customCat === cat.key
                          ? "bg-rose-50/70 border-[#C24B66] text-[#C24B66]"
                          : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      <div className="text-xs font-bold">{cat.name}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{cat.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content textarea */}
              <div>
                <label className="text-xs text-stone-600 font-semibold block mb-1.5">题目或挑战内容</label>
                <textarea
                  rows={3}
                  placeholder="写下你想对 TA 提出的真心话问题，或浪漫大冒险挑战…"
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-3 text-xs outline-none focus:border-[#C24B66] focus:bg-white resize-none leading-relaxed"
                />
              </div>

              {/* Reward input */}
              <div>
                <label className="text-xs text-stone-600 font-semibold block mb-1.5">通关奖励或惩罚 (选填)</label>
                <input
                  type="text"
                  placeholder="如：满足对方周末吃顿大餐的愿望，或亲一下脸颊"
                  value={customReward}
                  onChange={(e) => setCustomReward(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#C24B66] focus:bg-white"
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-full bg-stone-100 text-stone-600 text-xs font-semibold hover:bg-stone-200 transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="flex-1 py-2.5 rounded-full bg-[#C24B66] text-white text-xs font-semibold hover:bg-[#a8324e] shadow-md shadow-rose-200 transition-colors cursor-pointer"
                >
                  加入卡池
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
