import React, { useState } from "react";
import { Dish, MenuOrder, PairState } from "../types";
import { Plus, Check, Trash2, Sparkles, Image as ImageIcon, X, Utensils, ChefHat } from "lucide-react";

interface MenuPageProps {
  pair: PairState;
  dishes: Dish[];
  orders: MenuOrder[];
  onAddDish: (dish: { name: string; materials: string[]; note: string; image?: string }) => void;
  onDeleteDish: (id: string) => void;
  onAddOrder: (dish: Partial<Dish>) => void;
  onToggleOrder: (id: string) => void;
  onDeleteOrder: (id: string) => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({
  pair,
  dishes,
  orders,
  onAddDish,
  onDeleteDish,
  onAddOrder,
  onToggleOrder,
  onDeleteOrder,
}) => {
  const [tab, setTab] = useState<"cook" | "order">("cook");
  const [showAdd, setShowAdd] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [materials, setMaterials] = useState("");
  const [note, setNote] = useState("");
  const [image, setImage] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [isParsing, setIsParsing] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2200);
  };

  const handleOrderDish = (dish: Dish) => {
    onAddOrder(dish);
    showToast(`已把「${dish.name}」点给TA 💕`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setImage(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualSubmit = () => {
    if (!name.trim()) {
      showToast("请输入菜名哦");
      return;
    }
    const matList = materials
      .split(/[，,\n、]/)
      .map((s) => s.trim())
      .filter(Boolean);

    onAddDish({
      name: name.trim(),
      materials: matList,
      note: note.trim(),
      image: image || undefined,
    });

    setName("");
    setMaterials("");
    setNote("");
    setImage("");
    setShowAdd(false);
    showToast("成功添加菜谱！");
  };

  // Smart Recipe Parser
  const handleParsePaste = () => {
    const text = pastedText.trim();
    if (!text) {
      showToast("请先粘贴菜谱文字或链接哦");
      return;
    }

    setIsParsing(true);

    setTimeout(() => {
      const lines = text
        .split(/\n+/)
        .map((s) => s.trim())
        .filter(Boolean);

      const parsedDishes: { name: string; materials: string[]; note: string }[] = [];

      for (const line of lines) {
        if (line.includes("：") || line.includes(":")) {
          const parts = line.split(/[：:]/);
          const dishName = parts[0].replace(/^[0-9一二三四五六七八九十\.\s、]+/, "").trim();
          const rest = parts.slice(1).join(" ");
          const matSplit = rest.split(/[，,、\s]+/).filter(Boolean);
          if (dishName) {
            parsedDishes.push({
              name: dishName,
              materials: matSplit.slice(0, 8),
              note: "",
            });
          }
        } else {
          const clean = line.replace(/^[0-9一二三四五六七八九十\.\s、\-*]+/, "").trim();
          if (clean && clean.length <= 15) {
            parsedDishes.push({
              name: clean,
              materials: [],
              note: "",
            });
          }
        }
      }

      if (parsedDishes.length === 0) {
        parsedDishes.push({
          name: text.slice(0, 12),
          materials: ["精选食材"],
          note: text.slice(12, 100),
        });
      }

      parsedDishes.slice(0, 5).forEach((d) => {
        onAddDish({
          name: d.name,
          materials: d.materials,
          note: d.note,
        });
      });

      setIsParsing(false);
      setPastedText("");
      setShowAdd(false);
      showToast(`已智能解析并添加 ${parsedDishes.length} 道菜谱！`);
    }, 500);
  };

  const pendingCount = orders.filter((o) => !o.done).length;

  return (
    <div className="flex-1 pb-24 px-4 pt-3 max-w-md mx-auto w-full space-y-4">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full shadow-xl animate-card-in">
          {toastMsg}
        </div>
      )}

      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FF6B81] to-[#FF8FA3] text-white p-5 shadow-[0_8px_24px_rgba(255,107,129,0.22)]">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center space-x-1.5">
              <span>🍽 今天，谁下厨？</span>
            </h2>
            <p className="text-xs text-white/90 mt-1">把嘴馋的菜点给TA，回家就有着落</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-2xl">
            👨‍🍳
          </div>
        </div>
      </div>

      {/* Segmented Filter Control */}
      <div className="p-1 bg-pink-100/60 rounded-2xl flex items-center">
        <button
          onClick={() => setTab("cook")}
          className={`flex-1 min-h-[40px] text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer ${
            tab === "cook"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>菜谱库</span>
          <span className="text-[11px] text-slate-400">({dishes.length})</span>
        </button>
        <button
          onClick={() => setTab("order")}
          className={`flex-1 min-h-[40px] text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer ${
            tab === "order"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>今日点单</span>
          <span className="text-[11px] text-slate-400">({orders.length})</span>
          {pendingCount > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5370]" />
          )}
        </button>
      </div>

      {/* Tab: Cook (Dishes Library) */}
      {tab === "cook" && (
        <div className="space-y-3">
          {dishes.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-3 border border-pink-100/70 shadow-[0_4px_16px_rgba(255,107,129,0.06)] flex items-center gap-3.5 group hover:border-pink-200 transition-all"
            >
              {/* Dish Visual with Zero-Broken-Image Fallback */}
              <div className="w-18 h-18 rounded-2xl overflow-hidden bg-pink-50 shrink-0 relative border border-pink-100/60">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    🍲
                  </div>
                )}
              </div>

              {/* Dish Info (Unboxed text with · separator, zero pills) */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                  <button
                    onClick={() => onDeleteDish(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-opacity p-1 cursor-pointer"
                    title="删除菜谱"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {item.materials && item.materials.length > 0 && (
                  <p className="text-[11px] text-slate-500 mt-1 truncate">
                    {item.materials.join(" · ")}
                  </p>
                )}

                {item.note && (
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 italic">
                    {item.note}
                  </p>
                )}
              </div>

              {/* Order Button */}
              <button
                onClick={() => handleOrderDish(item)}
                className="shrink-0 min-h-[38px] px-3 py-1.5 rounded-full bg-[#FF5370] hover:bg-[#fa3c5d] active:scale-95 text-white text-xs font-semibold shadow-xs shadow-pink-200 transition-all cursor-pointer whitespace-nowrap"
              >
                点给TA
              </button>
            </div>
          ))}

          {dishes.length === 0 && (
            <div className="bg-white rounded-3xl p-10 text-center text-slate-400 text-xs border border-pink-100">
              <ChefHat className="w-10 h-10 mx-auto mb-2 text-pink-200 stroke-[1.5]" />
              <p className="font-medium text-slate-600">菜谱空空如也</p>
              <p className="text-slate-400 mt-1">点击右下角加一道你们爱吃的美食吧~</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Order (Today's Orders) */}
      {tab === "order" && (
        <div className="space-y-3">
          {orders.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-3.5 border border-pink-100/70 shadow-[0_4px_16px_rgba(255,107,129,0.06)] flex items-center justify-between gap-3 transition-all ${
                item.done ? "opacity-50 bg-slate-50/70" : ""
              }`}
            >
              <button
                onClick={() => onToggleOrder(item.id)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  item.done
                    ? "bg-emerald-500 text-white"
                    : "border-2 border-slate-300 hover:border-[#FF5370]"
                }`}
                title={item.done ? "标记为未做" : "标记为已做"}
              >
                {item.done && <Check className="w-4 h-4 stroke-[3]" />}
              </button>

              <div className="flex-1 min-w-0">
                <h4
                  className={`font-bold text-sm truncate ${
                    item.done ? "line-through text-slate-400" : "text-slate-800"
                  }`}
                >
                  {item.name}
                </h4>
                {item.materials && item.materials.length > 0 && (
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {item.materials.join(" · ")}
                  </p>
                )}
              </div>

              <button
                onClick={() => onDeleteOrder(item.id)}
                className="text-slate-300 hover:text-red-400 p-1.5 shrink-0 transition-colors cursor-pointer"
                title="移除该条点单"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="bg-white rounded-3xl p-10 text-center text-slate-400 text-xs border border-pink-100">
              <span className="text-3xl block mb-2">🍱</span>
              <p className="font-medium text-slate-600">今天还没点菜呢</p>
              <p className="text-slate-400 mt-1">去「菜谱库」挑选好吃的点给TA吧~</p>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button (+ 加菜) */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed right-5 bottom-20 z-30 bg-[#FF5370] hover:bg-[#fa3c5d] active:scale-95 text-white font-semibold text-xs px-4 py-2.5 rounded-full shadow-[0_8px_20px_rgba(255,83,112,0.35)] flex items-center space-x-1.5 transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>加一道菜</span>
      </button>

      {/* Add Modal Bottom Sheet Drawer */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto shadow-2xl animate-card-in border border-pink-100">
            {/* Grab Handle Affordance */}
            <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base">添加新菜谱</h3>
              <button
                onClick={() => setShowAdd(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-600 font-semibold block mb-1">菜名</label>
                <input
                  type="text"
                  placeholder="如：番茄炒蛋"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#FF5370] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 font-semibold block mb-1">主要食材</label>
                <input
                  type="text"
                  placeholder="逗号分隔，如：番茄, 鸡蛋, 小葱"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#FF5370] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 font-semibold block mb-1">做法备注 / 秘诀</label>
                <input
                  type="text"
                  placeholder="火候或调味喜好，可留空"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#FF5370] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 font-semibold block mb-1">菜品照片</label>
                <div className="flex items-center space-x-3">
                  {image ? (
                    <div className="relative">
                      <img
                        src={image}
                        alt="Preview"
                        className="w-14 h-14 rounded-2xl object-cover border border-pink-200"
                      />
                      <button
                        onClick={() => setImage("")}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null}
                  <label className="w-14 h-14 border border-dashed border-pink-300 rounded-2xl flex flex-col items-center justify-center text-[#FF5370] text-[10px] cursor-pointer hover:bg-pink-50 transition-colors">
                    <ImageIcon className="w-4 h-4 mb-0.5" />
                    <span>传图</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* AI Smart Parser Card */}
              <div className="bg-pink-50/70 border border-pink-200/60 rounded-2xl p-3.5">
                <div className="flex items-center space-x-1.5 text-xs text-[#FF5370] font-semibold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>智能识别（粘贴小红书/聊天记录菜谱）</span>
                </div>
                <textarea
                  rows={2}
                  placeholder="把整段菜谱文本贴进来，智能提取菜名与原材料"
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="w-full bg-white border border-pink-200/70 rounded-xl p-2.5 text-xs outline-none focus:border-[#FF5370]"
                />
                <button
                  type="button"
                  onClick={handleParsePaste}
                  disabled={isParsing}
                  className="mt-2 w-full py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 active:scale-98 text-white font-semibold text-xs shadow-xs hover:opacity-95 transition-all flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isParsing ? "正在解析提取中..." : "一键智能识别并添加"}</span>
                </button>
              </div>

              {/* Modal Actions */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleManualSubmit}
                  className="flex-1 py-2.5 rounded-full bg-[#FF5370] text-white text-xs font-semibold hover:bg-[#fa3c5d] shadow-md shadow-pink-200 transition-colors cursor-pointer"
                >
                  保存菜谱
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
