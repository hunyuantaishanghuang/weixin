import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { BottomNavBar } from "./components/BottomNavBar";
import { HomePage } from "./components/HomePage";
import { PairPage } from "./components/PairPage";
import { MenuPage } from "./components/MenuPage";
import { PeriodPage } from "./components/PeriodPage";
import { DiaryPage } from "./components/DiaryPage";
import { MessagePage } from "./components/MessagePage";
import { AdventurePage } from "./components/AdventurePage";
import { storage } from "./storage";
import {
  PageRoute,
  PairState,
  Dish,
  MenuOrder,
  PeriodRecord,
  DiaryEntry,
  BoardNote,
  AdventureCard,
  AdventureCategory,
  NoteColor,
  Role,
  MoodConfig,
  AppTheme,
  Gender,
  UserStatus,
  PairLiveStatus,
  PokeType,
  PokeRecord,
} from "./types";

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageRoute>("home");
  const [pair, setPair] = useState<PairState>(() => storage.getPair());
  const [dishes, setDishes] = useState<Dish[]>(() => storage.getDishes(pair.pairId));
  const [orders, setOrders] = useState<MenuOrder[]>(() => storage.getOrders(pair.pairId));
  const [periods, setPeriods] = useState<PeriodRecord[]>(() => storage.getPeriods(pair.pairId));
  const [diaries, setDiaries] = useState<DiaryEntry[]>(() => storage.getDiaries(pair.pairId));
  const [notes, setNotes] = useState<BoardNote[]>(() => storage.getBoardNotes(pair.pairId));
  const [adventures, setAdventures] = useState<AdventureCard[]>(() => storage.getAdventures(pair.pairId));
  const [liveStatus, setLiveStatus] = useState<PairLiveStatus>(() => storage.getLiveStatus(pair.pairId));
  const [pokes, setPokes] = useState<PokeRecord[]>(() => storage.getPokes(pair.pairId));
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2200);
  };

  useEffect(() => {
    setDishes(storage.getDishes(pair.pairId));
    setOrders(storage.getOrders(pair.pairId));
    setPeriods(storage.getPeriods(pair.pairId));
    setDiaries(storage.getDiaries(pair.pairId));
    setNotes(storage.getBoardNotes(pair.pairId));
    setAdventures(storage.getAdventures(pair.pairId));
    setLiveStatus(storage.getLiveStatus(pair.pairId));
    setPokes(storage.getPokes(pair.pairId));
  }, [pair.pairId]);

  const handleUpdatePair = (updater: (prev: PairState) => PairState) => {
    setPair((prev) => {
      const updated = updater(prev);
      storage.savePair(updated);
      return updated;
    });
  };

  const handleSwitchRole = () => {
    handleUpdatePair((prev) => {
      const newRole: Role = prev.currentRole === "A" ? "B" : "A";
      const name = newRole === "A" ? prev.nicknameA || "我" : prev.nicknameB || "TA";
      showToast(`已切换体验视角为「${name}」`);
      return { ...prev, currentRole: newRole };
    });
  };

  const handleResetData = () => {
    if (window.confirm("确定要重置为初始演示数据吗？将恢复精选菜谱、心情日历、留言板与海量真心话大冒险题库。")) {
      storage.resetDefaults();
      const freshPair = storage.getPair();
      setPair(freshPair);
      setDishes(storage.getDishes(freshPair.pairId));
      setOrders(storage.getOrders(freshPair.pairId));
      setPeriods(storage.getPeriods(freshPair.pairId));
      setDiaries(storage.getDiaries(freshPair.pairId));
      setNotes(storage.getBoardNotes(freshPair.pairId));
      setAdventures(storage.getAdventures(freshPair.pairId));
      showToast("已恢复预设生活记录！");
    }
  };

  // Dish Handlers
  const handleAddDish = (dishData: { name: string; materials: string[]; note: string; image?: string }) => {
    const newDish = storage.addDish(pair.pairId, dishData);
    setDishes((prev) => [newDish, ...prev]);
  };

  const handleDeleteDish = (id: string) => {
    storage.deleteDish(id);
    setDishes((prev) => prev.filter((d) => d.id !== id));
  };

  // Order Handlers
  const handleAddOrder = (dish: Partial<Dish>) => {
    const newOrder = storage.addOrder(pair.pairId, dish);
    setOrders((prev) => [newOrder, ...prev]);
  };

  const handleToggleOrder = (id: string) => {
    storage.toggleOrderDone(id);
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, done: !o.done } : o))
    );
  };

  const handleDeleteOrder = (id: string) => {
    storage.deleteOrder(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  // Period Handlers
  const handleAddPeriod = (date: string) => {
    const newRecord = storage.addPeriod(pair.pairId, date);
    setPeriods((prev) => [newRecord, ...prev]);
  };

  const handleDeletePeriod = (id: string) => {
    storage.deletePeriod(id);
    setPeriods((prev) => prev.filter((p) => p.id !== id));
  };

  // Diary Calendar Handlers
  const handleAddDiary = (entry: { dateString: string; mood: MoodConfig; text: string; images: string[] }) => {
    const updated = storage.addDiary(pair.pairId, {
      ...entry,
      authorRole: pair.currentRole,
    });
    setDiaries(storage.getDiaries(pair.pairId));
    showToast(`已成功保存 ${entry.dateString} 的心情！`);
  };

  const handleDeleteDiary = (id: string) => {
    storage.deleteDiary(id);
    setDiaries((prev) => prev.filter((d) => d.id !== id));
    showToast("已删除该日记记录");
  };

  // Theme toggle
  const handleToggleTheme = () => {
    const nextTheme: AppTheme = pair.theme === "blue" ? "pink" : "blue";
    handleUpdatePair((prev) => ({ ...prev, theme: nextTheme }));
    showToast(`已切换为${nextTheme === "blue" ? "澄澈蓝" : "浪漫粉"}背景版本`);
  };

  // Message Board Note Handlers
  const handleAddNote = (data: { fromRole: Role; gender: Gender; content: string; color: NoteColor; pinned: boolean }) => {
    const newNote = storage.addBoardNote(pair.pairId, data);
    setNotes(storage.getBoardNotes(pair.pairId));
    showToast("已成功贴上留言便签！");
  };

  const handleTogglePin = (id: string) => {
    storage.togglePinBoardNote(id);
    setNotes(storage.getBoardNotes(pair.pairId));
  };

  const handleToggleLike = (id: string) => {
    storage.toggleLikeBoardNote(id);
    setNotes(storage.getBoardNotes(pair.pairId));
  };

  const handleDeleteNote = (id: string) => {
    storage.deleteBoardNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    showToast("已撕下该便签");
  };

  // Live Status & Poke Handlers
  const handleUpdateStatus = (newStatus: UserStatus) => {
    const updated = storage.updateUserStatus(pair.pairId, pair.currentRole, newStatus);
    setLiveStatus(updated);
    showToast(`此时此刻状态已同步为「${newStatus.emoji} ${newStatus.label}」`);
  };

  const handleSendPoke = (type: PokeType) => {
    const targetRole: Role = pair.currentRole === "A" ? "B" : "A";
    const newRecord = storage.sendPoke(pair.pairId, {
      fromRole: pair.currentRole,
      toRole: targetRole,
      type,
    });
    setPokes(storage.getPokes(pair.pairId));
    showToast(`已向TA发送 ${newRecord.emoji} ${newRecord.text}`);
  };

  const handleUpdateNoteSticker = (id: string, sticker: string) => {
    storage.updateNoteSticker(id, sticker);
    setNotes(storage.getBoardNotes(pair.pairId));
    showToast(`已为便签贴上贴纸「${sticker}」`);
  };

  // Adventure Handlers
  const handleAddAdventure = (data: { mode: "truth" | "dare"; category: AdventureCategory; content: string; reward?: string }) => {
    const newCard = storage.addAdventure(pair.pairId, data);
    setAdventures((prev) => [newCard, ...prev]);
    showToast("已加入题库卡池！");
  };

  const handleDeleteAdventure = (id: string) => {
    storage.deleteAdventure(id);
    setAdventures((prev) => prev.filter((a) => a.id !== id));
    showToast("已删除该卡片");
  };

  const handleToggleAdventureComplete = (id: string) => {
    storage.toggleAdventureComplete(id);
    setAdventures((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
  };

  const pendingOrdersCount = orders.filter((o) => !o.done).length;
  const isBlue = pair.theme === "blue";

  return (
    <div className={`min-h-screen flex flex-col items-center transition-colors duration-300 ${
      isBlue ? "bg-[#EBF2F7] text-slate-800" : "bg-[#FDF2F4] text-stone-800"
    }`}>
      {/* Container wrapper for mobile/tablet responsive canvas */}
      <div className={`w-full max-w-md min-h-screen flex flex-col relative border-x transition-colors duration-300 ${
        isBlue
          ? "bg-[#F8FAFC] border-blue-200/70 shadow-[0_0_50px_rgba(37,99,235,0.08)]"
          : "bg-[#FCFAF8] border-pink-200/70 shadow-[0_0_50px_rgba(244,63,94,0.08)]"
      }`}>
        
        {/* Global Toast */}
        {toastMsg && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full shadow-2xl animate-card-in border border-stone-800">
            {toastMsg}
          </div>
        )}

        {/* Top App Header */}
        <Header
          currentPage={currentPage}
          pair={pair}
          onNavigate={setCurrentPage}
          onSwitchRole={handleSwitchRole}
          onToggleTheme={handleToggleTheme}
          onResetData={handleResetData}
        />

        {/* Active View Container */}
        <main className="flex-1 flex flex-col">
          {currentPage === "home" && (
            <HomePage
              pair={pair}
              onNavigate={setCurrentPage}
              orders={orders}
              messages={notes}
              periods={periods}
              diaries={diaries}
              adventures={adventures}
              liveStatus={liveStatus}
            />
          )}

          {currentPage === "adventure" && (
            <AdventurePage
              pair={pair}
              adventures={adventures}
              onAddAdventure={handleAddAdventure}
              onDeleteAdventure={handleDeleteAdventure}
              onToggleComplete={handleToggleAdventureComplete}
            />
          )}

          {currentPage === "pair" && (
            <PairPage
              pair={pair}
              onUpdatePair={handleUpdatePair}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === "menu" && (
            <MenuPage
              pair={pair}
              dishes={dishes}
              orders={orders}
              onAddDish={handleAddDish}
              onDeleteDish={handleDeleteDish}
              onAddOrder={handleAddOrder}
              onToggleOrder={handleToggleOrder}
              onDeleteOrder={handleDeleteOrder}
            />
          )}

          {currentPage === "period" && (
            <PeriodPage
              pair={pair}
              records={periods}
              onAddRecord={handleAddPeriod}
              onDeleteRecord={handleDeletePeriod}
              onSwitchRole={handleSwitchRole}
            />
          )}

          {currentPage === "diary" && (
            <DiaryPage
              pair={pair}
              diaries={diaries}
              onAddDiary={handleAddDiary}
              onDeleteDiary={handleDeleteDiary}
            />
          )}

          {currentPage === "message" && (
            <MessagePage
              pair={pair}
              notes={notes}
              liveStatus={liveStatus}
              pokes={pokes}
              onAddNote={handleAddNote}
              onTogglePin={handleTogglePin}
              onToggleLike={handleToggleLike}
              onDeleteNote={handleDeleteNote}
              onSwitchRole={handleSwitchRole}
              onUpdateStatus={handleUpdateStatus}
              onSendPoke={handleSendPoke}
              onUpdateNoteSticker={handleUpdateNoteSticker}
            />
          )}
        </main>

        {/* Bottom Tab Navigation Bar */}
        <BottomNavBar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          pendingOrdersCount={pendingOrdersCount}
          theme={pair.theme}
        />
      </div>
    </div>
  );
};

export default App;
