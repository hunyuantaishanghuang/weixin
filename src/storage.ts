import {
  PairState,
  Dish,
  MenuOrder,
  PeriodRecord,
  DiaryEntry,
  BoardNote,
  Role,
  MoodConfig,
  AdventureCard,
  AdventureCategory,
  AdventureMode,
  NoteColor,
  Gender,
  AppTheme,
  UserStatus,
  PairLiveStatus,
  StatusCode,
  PokeType,
  PokeRecord,
  CoupleLocation,
  PairLocationState,
} from "./types";
import tomatoImg from "./assets/images/dish_tomato_scrambled_eggs_1791210819836.jpg";
import colaImg from "./assets/images/dish_cola_chicken_wings_1791210837153.jpg";

export const MOODS: MoodConfig[] = [
  { key: "happy", icon: "😊", label: "开心", color: "#F59E0B", bgColor: "bg-amber-100 text-amber-800" },
  { key: "love", icon: "🥰", label: "甜蜜", color: "#F43F5E", bgColor: "bg-rose-100 text-rose-800" },
  { key: "calm", icon: "😌", label: "平静", color: "#10B981", bgColor: "bg-emerald-100 text-emerald-800" },
  { key: "sad", icon: "😢", label: "难过", color: "#0EA5E9", bgColor: "bg-sky-100 text-sky-800" },
  { key: "angry", icon: "😠", label: "生气", color: "#E11D48", bgColor: "bg-red-100 text-red-800" },
  { key: "tired", icon: "😩", label: "疲惫", color: "#8B5CF6", bgColor: "bg-purple-100 text-purple-800" },
];

const STORAGE_KEYS = {
  PAIR: "couple_days_pair",
  DISHES: "couple_days_dishes",
  ORDERS: "couple_days_orders",
  PERIODS: "couple_days_periods",
  DIARIES: "couple_days_diaries",
  MESSAGES: "couple_days_messages",
  ADVENTURES: "couple_days_adventures",
  STATUSES: "couple_days_statuses",
  POKES: "couple_days_pokes",
  LOCATIONS: "couple_days_locations",
};

export const PRESET_STATUSES: {
  code: StatusCode;
  emoji: string;
  label: string;
  defaultSub: string;
  tagColor: string;
}[] = [
  { code: "on_the_way", emoji: "🚗", label: "出发在路上", defaultSub: "正奔向有你的地方，注意安全哦", tagColor: "bg-blue-100 text-blue-900 border-blue-300" },
  { code: "busy", emoji: "💼", label: "在忙工作中", defaultSub: "正在全力冲刺搬砖，稍后回复你~", tagColor: "bg-amber-100 text-amber-900 border-amber-300" },
  { code: "free", emoji: "🍵", label: "空闲摸鱼", defaultSub: "随时在线，快找我聊天贴贴呀~", tagColor: "bg-emerald-100 text-emerald-900 border-emerald-300" },
  { code: "missing_you", emoji: "💖", label: "超级想你了", defaultSub: "每一分每一秒都在想你，求抱抱~", tagColor: "bg-rose-100 text-rose-900 border-rose-300" },
  { code: "eating", emoji: "🍱", label: "美味干饭中", defaultSub: "好吃的填饱肚子，你按时吃饭了吗", tagColor: "bg-orange-100 text-orange-900 border-orange-300" },
  { code: "low_battery", emoji: "🪫", label: "电量告急中", defaultSub: "累瘫躺平中，需要你的亲亲才能充能", tagColor: "bg-purple-100 text-purple-900 border-purple-300" },
  { code: "workout", emoji: "🏃", label: "运动暴汗中", defaultSub: "正在挥洒汗水燃烧卡路里~", tagColor: "bg-teal-100 text-teal-900 border-teal-300" },
  { code: "gaming", emoji: "🎮", label: "游戏中勿扰", defaultSub: "激战排位中，不坑队友稍后就来", tagColor: "bg-indigo-100 text-indigo-900 border-indigo-300" },
  { code: "sleeping", emoji: "💤", label: "准备呼呼睡", defaultSub: "被窝已封印，梦里相见晚安", tagColor: "bg-slate-200 text-slate-800 border-slate-300" },
];

export const POKE_ACTIONS: {
  type: PokeType;
  emoji: string;
  label: string;
  actionText: string;
}[] = [
  { type: "hug", emoji: "🫂", label: "隔空抱抱", actionText: "送出了一个暖烘烘的超大熊抱！" },
  { type: "tea", emoji: "🧋", label: "投喂奶茶", actionText: "投喂了一杯全糖多加波霸奶茶！" },
  { type: "kiss", emoji: "💋", label: "送飞吻", actionText: "送出了一个甜蜜暴击飞吻！" },
  { type: "rub_head", emoji: "💆", label: "摸摸头", actionText: "温柔摸了摸TA的小脑袋，辛苦啦！" },
  { type: "energy", emoji: "⚡", label: "元气充能", actionText: "注入了 100% 爱的活力元气！" },
];

export const NOTE_STICKERS = [
  "🐱 收到照办",
  "👑 必须重赏",
  "💖 爱你一万年",
  "☕ 暖胃关怀",
  "🥺 心疼抱抱",
  "✨ 准时回家",
  "🍓 甜度爆表",
  "💯 表现极好",
];

export const ADVENTURE_CATEGORIES: { key: AdventureCategory; name: string; tag: string; description: string }[] = [
  { key: "sweet", name: "甜蜜互动", tag: "柔情蜜意", description: "温暖升温的贴心小互动" },
  { key: "fun", name: "趣味整蛊", tag: "欢笑日常", description: "打破沉闷的搞笑小考验" },
  { key: "deep", name: "默契心声", tag: "灵魂共振", description: "深入内心的真挚倾诉" },
  { key: "heartbeat", name: "浪漫心跳", tag: "心动瞬间", description: "令人脸红心跳的专属亲密" },
];

export function getTodayKey(d = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function formatDate(d = new Date()): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function formatDateTime(d = new Date()): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  const h = `${d.getHours()}`.padStart(2, "0");
  const min = `${d.getMinutes()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day} ${h}:${min}`;
}

export function formatTime(d = new Date()): string {
  const h = `${d.getHours()}`.padStart(2, "0");
  const min = `${d.getMinutes()}`.padStart(2, "0");
  return `${h}:${min}`;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Initial seed data
const DEFAULT_PAIR: PairState = {
  pairId: "LUV520",
  status: "bound",
  memberA: "user_a_001",
  memberB: "user_b_002",
  currentRole: "A",
  nicknameA: "男孩",
  nicknameB: "女孩",
  genderA: "male",
  genderB: "female",
  theme: "pink",
  bindTime: new Date(Date.now() - 30 * 86400000).toISOString(),
};

const DEFAULT_DISHES: Dish[] = [
  {
    id: "dish_1",
    name: "番茄炒蛋",
    materials: ["番茄", "土鸡蛋", "小葱", "白糖"],
    note: "酸甜适中，多留点汤汁拌饭最香啦~",
    image: tomatoImg,
    createTime: new Date(Date.now() - 5 * 86400000).toISOString(),
    pairId: "LUV520",
  },
  {
    id: "dish_2",
    name: "秘制可乐鸡翅",
    materials: ["鸡中翅", "可口可乐", "生姜", "料酒", "熟白芝麻"],
    note: "两面划刀先煎至金黄，收汁浓稠时撒上芝麻",
    image: colaImg,
    createTime: new Date(Date.now() - 4 * 86400000).toISOString(),
    pairId: "LUV520",
  },
  {
    id: "dish_3",
    name: "蒜蓉西兰花",
    materials: ["西兰花", "大蒜", "生抽", "蚝油"],
    note: "加盐焯水30秒捞出过凉水，保持爽脆翠绿",
    createTime: new Date(Date.now() - 3 * 86400000).toISOString(),
    pairId: "LUV520",
  },
  {
    id: "dish_4",
    name: "暖胃冬阴功鲜虾汤",
    materials: ["鲜活基围虾", "口蘑", "柠檬", "香茅", "椰浆"],
    note: "酸辣开胃，天气转凉的时候喝一碗超幸福",
    createTime: new Date(Date.now() - 2 * 86400000).toISOString(),
    pairId: "LUV520",
  },
];

const DEFAULT_ORDERS: MenuOrder[] = [
  {
    id: "order_1",
    dishId: "dish_1",
    name: "番茄炒蛋",
    materials: ["番茄", "土鸡蛋", "小葱", "白糖"],
    note: "酸甜适中，多留点汤汁拌饭最香啦~",
    image: tomatoImg,
    dateKey: getTodayKey(),
    done: true,
    createTime: new Date(Date.now() - 3600000).toISOString(),
    pairId: "LUV520",
  },
  {
    id: "order_2",
    dishId: "dish_2",
    name: "秘制可乐鸡翅",
    materials: ["鸡中翅", "可口可乐", "生姜", "料酒", "熟白芝麻"],
    note: "两面划刀先煎至金黄，收汁浓稠时撒上芝麻",
    image: colaImg,
    dateKey: getTodayKey(),
    done: false,
    createTime: new Date(Date.now() - 1800000).toISOString(),
    pairId: "LUV520",
  },
];

function getSeedPeriods(): PeriodRecord[] {
  const now = new Date();
  const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 18);
  const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 46);
  const d3 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 74);
  return [
    { id: "period_1", date: formatDate(d1), pairId: "LUV520", createTime: d1.toISOString() },
    { id: "period_2", date: formatDate(d2), pairId: "LUV520", createTime: d2.toISOString() },
    { id: "period_3", date: formatDate(d3), pairId: "LUV520", createTime: d3.toISOString() },
  ];
}

// Default calendar diaries across recent dates
function getSeedDiaries(): DiaryEntry[] {
  const now = new Date();
  const d0 = formatDate(now);
  const d1 = formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  const d2 = formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3));
  const d3 = formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5));
  const d4 = formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 8));
  const d5 = formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 12));

  return [
    {
      id: "diary_0",
      dateString: d0,
      mood: MOODS[1], // love
      text: "今天下班一起去了菜市场，买了红通通的番茄和新鲜鸡翅。在厨房里两个人一起翻炒切菜，听着油滋滋的声音，觉得平凡的日子里全是温柔浪漫。",
      images: [],
      date: formatDateTime(now),
      createTime: now.toISOString(),
      pairId: "LUV520",
      authorRole: "A",
    },
    {
      id: "diary_1",
      dateString: d1,
      mood: MOODS[0], // happy
      text: "晚上散步吹着微凉的晚风，路过街角买了草莓冰淇淋，两个人一人一口抢着吃，开怀大笑。",
      images: [],
      date: formatDateTime(new Date(now.getTime() - 86400000)),
      createTime: new Date(now.getTime() - 86400000).toISOString(),
      pairId: "LUV520",
      authorRole: "B",
    },
    {
      id: "diary_2",
      dateString: d2,
      mood: MOODS[2], // calm
      text: "周末窝在沙发上看了部老电影，外面下着小雨，屋里有咖啡香。什么都不用说就很舒服的午后。",
      images: [],
      date: formatDateTime(new Date(now.getTime() - 3 * 86400000)),
      createTime: new Date(now.getTime() - 3 * 86400000).toISOString(),
      pairId: "LUV520",
      authorRole: "A",
    },
    {
      id: "diary_3",
      dateString: d3,
      mood: MOODS[5], // tired
      text: "今天加班好辛苦，回到家一开门发现桌上热着你煮的银耳汤，那一瞬间所有的疲惫都被融化了。",
      images: [],
      date: formatDateTime(new Date(now.getTime() - 5 * 86400000)),
      createTime: new Date(now.getTime() - 5 * 86400000).toISOString(),
      pairId: "LUV520",
      authorRole: "B",
    },
    {
      id: "diary_4",
      dateString: d4,
      mood: MOODS[1], // love
      text: "悄悄给你挑了情侣保温杯，看你拆开礼物时眼睛亮晶晶的样子，心里像揣了一只欢蹦乱跳的小兔子。",
      images: [],
      date: formatDateTime(new Date(now.getTime() - 8 * 86400000)),
      createTime: new Date(now.getTime() - 8 * 86400000).toISOString(),
      pairId: "LUV520",
      authorRole: "A",
    },
    {
      id: "diary_5",
      dateString: d5,
      mood: MOODS[2], // calm
      text: "一起去湖边骑车看落日，天空是粉紫色的晚霞，你抓着我的后背衣角，风里有桂花的甜香。",
      images: [],
      date: formatDateTime(new Date(now.getTime() - 12 * 86400000)),
      createTime: new Date(now.getTime() - 12 * 86400000).toISOString(),
      pairId: "LUV520",
      authorRole: "B",
    },
  ];
}

// Default board notes (情侣留言板便签: 男生蓝调，女生粉调)
const DEFAULT_BOARD_NOTES: BoardNote[] = [
  {
    id: "note_1",
    fromRole: "A",
    toRole: "B",
    gender: "male",
    content: "今晚风大，出门记得扣紧风衣领子。炖锅里热着红枣枸杞茶，回家喝一碗暖胃哦 💕",
    color: "blue",
    pinned: true,
    likes: 5,
    likedByMe: true,
    createTime: formatDateTime(new Date(Date.now() - 3600000 * 3)),
    pairId: "LUV520",
  },
  {
    id: "note_2",
    fromRole: "B",
    toRole: "A",
    gender: "female",
    content: "下班顺路买了你最爱吃的那家草莓大福！还温热着，等我回家一起吃 🍓",
    color: "pink",
    pinned: true,
    likes: 4,
    likedByMe: true,
    createTime: formatDateTime(new Date(Date.now() - 3600000 * 2)),
    pairId: "LUV520",
  },
  {
    id: "note_3",
    fromRole: "A",
    toRole: "B",
    gender: "male",
    content: "周末天气晴朗，我们去植物园野餐吧？我已经把野餐垫和小音箱准备好啦 ✨",
    color: "cyan",
    pinned: false,
    likes: 3,
    likedByMe: false,
    createTime: formatDateTime(new Date(Date.now() - 86400000)),
    pairId: "LUV520",
  },
  {
    id: "note_4",
    fromRole: "B",
    toRole: "A",
    gender: "female",
    content: "今天辛苦啦！今晚的所有碗筷、铲子都由我包办，你只管舒舒服服泡个热水澡 🛁",
    color: "rose",
    pinned: false,
    likes: 6,
    likedByMe: true,
    createTime: formatDateTime(new Date(Date.now() - 86400000 * 2)),
    pairId: "LUV520",
  },
  {
    id: "note_5",
    fromRole: "A",
    toRole: "B",
    gender: "male",
    content: "哪怕世界再喧闹，看到你笑的那一刻，我的整个宇宙就安静了下来 🌙",
    color: "blue",
    pinned: false,
    likes: 2,
    likedByMe: false,
    createTime: formatDateTime(new Date(Date.now() - 86400000 * 3)),
    pairId: "LUV520",
  },
];

// 50+ Curated Truth & Dare Cards across categories (真心话 & 大冒险)
const INITIAL_ADVENTURES: AdventureCard[] = [
  // --- 真心话 (Truths) ---
  {
    id: "adv_t_1",
    mode: "truth",
    category: "deep",
    categoryName: "默契心声",
    content: "在过去的相处中，对方做的哪一件微小的事情，最让你感到‘自己被深深坚定地选择’？",
    reward: "相互交换一个温暖的深情拥抱",
    isCustom: false,
    completed: true,
    pairId: "LUV520",
    createTime: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "adv_t_2",
    mode: "truth",
    category: "sweet",
    categoryName: "甜蜜互动",
    content: "你第一次在心里偷偷意识到自己对 TA 彻底心动，是在哪个具体的时间、地点或场景？",
    reward: "说出细节并获得额头轻吻一个",
    isCustom: false,
    completed: true,
    pairId: "LUV520",
    createTime: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "adv_t_3",
    mode: "truth",
    category: "fun",
    categoryName: "趣味整蛊",
    content: "坦白一个你平时觉得 TA 特别可爱、或者特别搞怪的小习惯/口头禅？",
    reward: "被坦白方可以捏对方脸蛋一下",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "adv_t_4",
    mode: "truth",
    category: "heartbeat",
    categoryName: "浪漫心跳",
    content: "在什么时候或者穿什么衣服时，对方在你眼里显得最迷人、最具吸引力？",
    reward: "对方害羞的话奖励一颗糖果",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "adv_t_5",
    mode: "truth",
    category: "deep",
    categoryName: "默契心声",
    content: "如果时光可以倒流回你们初遇的那一天，现在的你最想对那天的自己说一句什么话？",
    reward: "敬相遇一杯温水或果汁",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_t_6",
    mode: "truth",
    category: "sweet",
    categoryName: "甜蜜互动",
    content: "说出对方身上最吸引你的 3 个专属特质，且必须是用心的细节描写。",
    reward: "获得对方亲手削的水果一块",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_t_7",
    mode: "truth",
    category: "deep",
    categoryName: "默契心声",
    content: "坦白一件你曾经为对方偷偷做过、但一直没好意思当面说出口的小事或小心思。",
    reward: "听完必须说一声‘谢谢宝贝’",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_t_8",
    mode: "truth",
    category: "fun",
    categoryName: "趣味整蛊",
    content: "有没有哪一次吃过对方的小醋？老实交代当时心里的吃醋碎碎念和真实感受！",
    reward: "对方必须哄你 30 秒",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_t_9",
    mode: "truth",
    category: "heartbeat",
    categoryName: "浪漫心跳",
    content: "如果现在立刻给 TA 发一条只有四个字的情话，你会发哪四个字？",
    reward: "当场写在手心展示",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_t_10",
    mode: "truth",
    category: "deep",
    categoryName: "默契心声",
    content: "如果给你们俩现在的相处舒适度打个分（满分 100），你打多少分？扣分扣在什么小地方？",
    reward: "双方共同约定改进一个小毛病",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_t_11",
    mode: "truth",
    category: "sweet",
    categoryName: "甜蜜互动",
    content: "对方对你说过的哪一句话，曾让你在失落或者疲惫时突然充满了安全感？",
    reward: "回赠对方一个摸头杀",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_t_12",
    mode: "truth",
    category: "fun",
    categoryName: "趣味整蛊",
    content: "如果用一种小动物来形容对方生气时的样子，你会选什么动物？为什么？",
    reward: "现场模仿一次该动物叫声",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_t_13",
    mode: "truth",
    category: "deep",
    categoryName: "默契心声",
    content: "你想象中十年后我们两个人的生活画面，最理想的一个瞬间是什么样的？",
    reward: "拉勾约定一起努力实现",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_t_14",
    mode: "truth",
    category: "heartbeat",
    categoryName: "浪漫心跳",
    content: "坦白：最近一次在梦里梦见对方是在什么时候？梦里发生了什么情节？",
    reward: "梦见好的要奖励，梦见打架要补偿",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_t_15",
    mode: "truth",
    category: "sweet",
    categoryName: "甜蜜互动",
    content: "两人平时在一起做过的哪一件极度无聊的小事，反而让你觉得特别安心幸福？",
    reward: "今晚再一起做一次这件小事",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_t_16",
    mode: "truth",
    category: "fun",
    categoryName: "趣味整蛊",
    content: "在今天对方做过的所有事里，挑出一件你觉得最呆萌可爱的事情并大声讲出来。",
    reward: "被夸奖方可向对方索要抱抱",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_t_17",
    mode: "truth",
    category: "deep",
    categoryName: "默契心声",
    content: "在一起之后，你觉得对方带给你身上最明显、最好的一个改变是什么？",
    reward: "真诚碰杯或互致谢意",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_t_18",
    mode: "truth",
    category: "heartbeat",
    categoryName: "浪漫心跳",
    content: "如果今晚只能给对方点一个赞，你最想赞美 TA 身体或性格的哪一个具体亮点？",
    reward: "被赞美方享受 1 分钟害羞时间",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_t_19",
    mode: "truth",
    category: "sweet",
    categoryName: "甜蜜互动",
    content: "如果有一笔可以随时兑现的专属旅行基金，你最渴望牵着 TA 的手去哪座城市呆一周？",
    reward: "把该城市记在以后的愿望清单里",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_t_20",
    mode: "truth",
    category: "deep",
    categoryName: "默契心声",
    content: "坦白一个你心里一直想要、但一直没好意思让对方送给你的小愿望或小礼物？",
    reward: "对方在下一个纪念日前悄悄安排",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_t_21",
    mode: "truth",
    category: "fun",
    categoryName: "趣味整蛊",
    content: "说实话，对方做过的哪道菜或者哪次家务表现，让你在心里偷偷笑了很久？",
    reward: "今晚免罚一次小家务",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_t_22",
    mode: "truth",
    category: "heartbeat",
    categoryName: "浪漫心跳",
    content: "对方身上散发出的哪种专属味道（洗发水/香气/阳光味道），会瞬间让你联想到‘家’？",
    reward: "近距离轻嗅一下对方确认",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_t_23",
    mode: "truth",
    category: "deep",
    categoryName: "默契心声",
    content: "如果有一天两个人闹了小矛盾，你最希望对方用什么样的方式给你台阶下？",
    reward: "双方以此为以后的破冰密码",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_t_24",
    mode: "truth",
    category: "sweet",
    categoryName: "甜蜜互动",
    content: "当你在外面遇到委屈或者难过时，第一时间想到对方给你的感觉是什么？",
    reward: "被倾听方给一个长长的拥抱",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_t_25",
    mode: "truth",
    category: "heartbeat",
    categoryName: "浪漫心跳",
    content: "在你们所有的合照或者回忆里，你最私藏、最百看不厌的一张是哪一张？",
    reward: "翻出那张照片一起回味 1 分钟",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },

  // --- 大冒险 (Dares) ---
  {
    id: "adv_d_1",
    mode: "dare",
    category: "sweet",
    categoryName: "甜蜜互动",
    content: "注视对方双眼整整 30 秒，期间不许移开视线，时间一到深情说一句最想对 TA 说的真心话。",
    reward: "获得对方温柔额头轻吻一个",
    isCustom: false,
    completed: true,
    pairId: "LUV520",
    createTime: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "adv_d_2",
    mode: "dare",
    category: "fun",
    categoryName: "趣味整蛊",
    content: "用家乡方言连续夸奖对方 3 句优点，语速要慢，且中间绝对不能笑场！",
    reward: "被夸奖方满足一个今晚免做家务特权",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "adv_d_3",
    mode: "dare",
    category: "heartbeat",
    categoryName: "浪漫心跳",
    content: "闭上眼睛伸出左手手心，由对方用手指在手心写下一个秘密词汇，猜出来即算通关！",
    reward: "猜对获得对方亲手投喂一颗零食",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "adv_d_4",
    mode: "dare",
    category: "sweet",
    categoryName: "甜蜜互动",
    content: "为对方认真做一次 3 分钟的温柔肩颈舒缓按摩，期间轻声询问力道舒适度。",
    reward: "双方身心放松，治愈一整天的疲劳",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "adv_d_5",
    mode: "dare",
    category: "heartbeat",
    categoryName: "浪漫心跳",
    content: "选一首你们都喜欢的歌，在房间里轻轻牵起对方的手，伴随旋律慢步摇摆 1 分钟。",
    reward: "解锁一段浪漫电影般的双人时光",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_d_6",
    mode: "dare",
    category: "fun",
    categoryName: "趣味整蛊",
    content: "闭上眼睛，由对方挑选一口今晚的食物或零食喂你吃，并在 3 秒内猜出菜品/零食名称！",
    reward: "猜错要被对方轻轻捏一下鼻尖",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_d_7",
    mode: "dare",
    category: "sweet",
    categoryName: "甜蜜互动",
    content: "从背后给对方一个持续 30 秒的温暖大拥抱，并在对方耳边悄悄念一句肉麻情话。",
    reward: "被拥抱方享受被满满宠爱的感觉",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_d_8",
    mode: "dare",
    category: "fun",
    categoryName: "趣味整蛊",
    content: "模仿对方平时的 2 个经典撒娇、或者生气的口头禅表情，直到对方亲口认出来。",
    reward: "模仿成功免洗今晚的盘子",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_d_9",
    mode: "dare",
    category: "heartbeat",
    categoryName: "浪漫心跳",
    content: "把对方的手轻轻贴在自己的心口上，闭上眼让 TA 静静感受你此刻的心跳声 20 秒。",
    reward: "两颗心的距离瞬间拉近",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_d_10",
    mode: "dare",
    category: "sweet",
    categoryName: "甜蜜互动",
    content: "为对方轻轻整理一下凌乱的头发，并在 TA 的额头留下一个温柔纯真的轻吻。",
    reward: "获得对方眼里的满分温柔",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_d_11",
    mode: "dare",
    category: "fun",
    categoryName: "趣味整蛊",
    content: "换上对方的一件大外套或者帽子，摆出走秀模特的搞怪姿势让对方拍一张照片留念！",
    reward: "将该张照片作为双人专属表情包",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_d_12",
    mode: "dare",
    category: "deep",
    categoryName: "默契心声",
    content: "在留言板上为对方亲手贴上一张便签，写下你今晚对 TA 的一个具体甜蜜承诺。",
    reward: "该便签被对方永久置顶珍藏",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_d_13",
    mode: "dare",
    category: "heartbeat",
    categoryName: "浪漫心跳",
    content: "深情对视并向对方撒娇 30 秒，无论用什么词汇，直到对方忍不住笑出来或心软答应。",
    reward: "答应对方一个合理的小愿望",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_d_14",
    mode: "dare",
    category: "sweet",
    categoryName: "甜蜜互动",
    content: "给对方倒一杯温热的蜂蜜水或清茶，双手恭敬奉上并柔声说一句：‘客官请用茶~’",
    reward: "品尝生活里的小确幸滋味",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_d_15",
    mode: "dare",
    category: "fun",
    categoryName: "趣味整蛊",
    content: "让对方任意轻轻摆弄你的五官表情，配合拍下一张搞怪双人合照存入日记。",
    reward: "记录下独一无二的无拘无束瞬间",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_d_16",
    mode: "dare",
    category: "heartbeat",
    categoryName: "浪漫心跳",
    content: "在对方耳边用耳语轻声说出你最喜欢 TA 的 3 个小细节（如眼角的笑意、声音等）。",
    reward: "耳根发烫，心动值爆表",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_d_17",
    mode: "dare",
    category: "sweet",
    categoryName: "甜蜜互动",
    content: "用深情的电台主播腔调，把手机里对方最新一条发给你的消息富有感情地朗读一遍。",
    reward: "引爆满屋的欢声笑语",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_d_18",
    mode: "dare",
    category: "deep",
    categoryName: "默契心声",
    content: "由对方为你指定一套明天的出门穿搭或颜色搭配，明天的你必须听从安排并穿上！",
    reward: "享受被伴侣精心装扮的仪式感",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_d_19",
    mode: "dare",
    category: "heartbeat",
    categoryName: "浪漫心跳",
    content: "亲吻对方的手背，并像骑士一样单膝微屈，说一句‘今晚我的世界全听你吩咐’。",
    reward: "获得对方的一整晚甜宠奖励",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_d_20",
    mode: "dare",
    category: "fun",
    categoryName: "趣味整蛊",
    content: "连续做 5 个俯卧撑或者 10 个深蹲，每做一个必须大声喊出对方名字加‘我好喜欢你’！",
    reward: "运动健身与表白两不误",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_d_21",
    mode: "dare",
    category: "sweet",
    categoryName: "甜蜜互动",
    content: "由对方在你的手心或者手背上用笔画一个可爱的小猫咪或者心形印记，今天不许擦掉。",
    reward: "佩戴专属的双人浪漫印记一整天",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_d_22",
    mode: "dare",
    category: "heartbeat",
    categoryName: "浪漫心跳",
    content: "把脸颊轻轻贴在对方的脸颊上停留 15 秒，感受彼此皮肤的温度与呼吸。",
    reward: "感受最原始纯粹的体温与依赖",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_d_23",
    mode: "dare",
    category: "deep",
    categoryName: "默契心声",
    content: "把手机密码或相册公开让对方翻看 1 分钟，展示彼此之间毫无保留的绝对信任。",
    reward: "获得信任感拉满的安全感加持",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_d_24",
    mode: "dare",
    category: "fun",
    categoryName: "趣味整蛊",
    content: "深情地看着对方，用最严肃认真的表情给 TA 讲一个巨冷的笑话，看谁先忍不住破功！",
    reward: "先笑的人给对方削一个苹果",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
  {
    id: "adv_d_25",
    mode: "dare",
    category: "sweet",
    categoryName: "甜蜜互动",
    content: "两人十指相扣紧紧握住，闭上双眼在心中默默为对方许一个愿望，倒数 10 秒后睁开眼拥抱。",
    reward: "心愿在彼此守护中悄悄生根发芽",
    isCustom: false,
    completed: false,
    pairId: "LUV520",
    createTime: new Date().toISOString(),
  },
];

export const storage = {
  getPair(): PairState {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAIR);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    this.savePair(DEFAULT_PAIR);
    return DEFAULT_PAIR;
  },

  savePair(pair: PairState): void {
    localStorage.setItem(STORAGE_KEYS.PAIR, JSON.stringify(pair));
  },

  getDishes(pairId: string): Dish[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DISHES);
      if (data) {
        const list: Dish[] = JSON.parse(data);
        return list.filter((item) => item.pairId === pairId);
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(STORAGE_KEYS.DISHES, JSON.stringify(DEFAULT_DISHES));
    return DEFAULT_DISHES.filter((d) => d.pairId === pairId);
  },

  saveDishes(dishes: Dish[]): void {
    localStorage.setItem(STORAGE_KEYS.DISHES, JSON.stringify(dishes));
  },

  addDish(pairId: string, dishData: { name: string; materials: string[]; note: string; image?: string }): Dish {
    const all = this.getAllDishes();
    const newDish: Dish = {
      id: generateId(),
      ...dishData,
      pairId,
      createTime: new Date().toISOString(),
    };
    all.unshift(newDish);
    this.saveDishes(all);
    return newDish;
  },

  deleteDish(id: string): void {
    const all = this.getAllDishes().filter((d) => d.id !== id);
    this.saveDishes(all);
  },

  getAllDishes(): Dish[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DISHES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_DISHES;
  },

  getOrders(pairId: string, dateKey?: string): MenuOrder[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      const today = dateKey || getTodayKey();
      if (data) {
        const list: MenuOrder[] = JSON.parse(data);
        return list.filter((item) => item.pairId === pairId && item.dateKey === today);
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
    return DEFAULT_ORDERS.filter((item) => item.pairId === pairId);
  },

  addOrder(pairId: string, dish: Partial<Dish>): MenuOrder {
    const all = this.getAllOrders();
    const today = getTodayKey();
    const newOrder: MenuOrder = {
      id: generateId(),
      dishId: dish.id,
      name: dish.name || "未命名菜品",
      materials: dish.materials || [],
      note: dish.note || "",
      image: dish.image,
      dateKey: today,
      done: false,
      createTime: new Date().toISOString(),
      pairId,
    };
    all.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(all));
    return newOrder;
  },

  toggleOrderDone(id: string): void {
    const all = this.getAllOrders().map((o) => (o.id === id ? { ...o, done: !o.done } : o));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(all));
  },

  deleteOrder(id: string): void {
    const all = this.getAllOrders().filter((o) => o.id !== id);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(all));
  },

  getAllOrders(): MenuOrder[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_ORDERS;
  },

  getPeriods(pairId: string): PeriodRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PERIODS);
      if (data) {
        const list: PeriodRecord[] = JSON.parse(data);
        return list.filter((p) => p.pairId === pairId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    } catch (e) {
      console.error(e);
    }
    const defaults = getSeedPeriods();
    localStorage.setItem(STORAGE_KEYS.PERIODS, JSON.stringify(defaults));
    return defaults.filter((p) => p.pairId === pairId);
  },

  addPeriod(pairId: string, date: string): PeriodRecord {
    const all = this.getAllPeriods();
    const newRecord: PeriodRecord = {
      id: generateId(),
      date,
      pairId,
      createTime: new Date().toISOString(),
    };
    all.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.PERIODS, JSON.stringify(all));
    return newRecord;
  },

  deletePeriod(id: string): void {
    const all = this.getAllPeriods().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PERIODS, JSON.stringify(all));
  },

  getAllPeriods(): PeriodRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PERIODS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return getSeedPeriods();
  },

  getDiaries(pairId: string): DiaryEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DIARIES);
      if (data) {
        const list: DiaryEntry[] = JSON.parse(data);
        return list.filter((d) => d.pairId === pairId).sort((a, b) => new Date(b.dateString).getTime() - new Date(a.dateString).getTime());
      }
    } catch (e) {
      console.error(e);
    }
    const defaults = getSeedDiaries();
    localStorage.setItem(STORAGE_KEYS.DIARIES, JSON.stringify(defaults));
    return defaults.filter((d) => d.pairId === pairId);
  },

  addDiary(
    pairId: string,
    diaryData: { dateString: string; mood: MoodConfig; text: string; images: string[]; authorRole?: Role }
  ): DiaryEntry {
    const all = this.getAllDiaries();
    // Check if entry for date already exists, update or add
    const existingIndex = all.findIndex((d) => d.pairId === pairId && d.dateString === diaryData.dateString);
    const dateObj = new Date(diaryData.dateString + "T12:00:00");
    const formatted = formatDateTime(dateObj);

    if (existingIndex >= 0) {
      const updated: DiaryEntry = {
        ...all[existingIndex],
        mood: diaryData.mood,
        text: diaryData.text,
        images: diaryData.images,
        authorRole: diaryData.authorRole || all[existingIndex].authorRole,
        date: formatted,
      };
      all[existingIndex] = updated;
      localStorage.setItem(STORAGE_KEYS.DIARIES, JSON.stringify(all));
      return updated;
    } else {
      const newDiary: DiaryEntry = {
        id: generateId(),
        dateString: diaryData.dateString,
        mood: diaryData.mood,
        text: diaryData.text,
        images: diaryData.images,
        date: formatted,
        createTime: new Date().toISOString(),
        pairId,
        authorRole: diaryData.authorRole,
      };
      all.unshift(newDiary);
      localStorage.setItem(STORAGE_KEYS.DIARIES, JSON.stringify(all));
      return newDiary;
    }
  },

  deleteDiary(id: string): void {
    const all = this.getAllDiaries().filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DIARIES, JSON.stringify(all));
  },

  getAllDiaries(): DiaryEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DIARIES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return getSeedDiaries();
  },

  // --- Message Board (情侣留言板便签) ---
  getBoardNotes(pairId: string): BoardNote[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (data) {
        const list: BoardNote[] = JSON.parse(data);
        return list.filter((m) => m.pairId === pairId).sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          return new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
        });
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(DEFAULT_BOARD_NOTES));
    return DEFAULT_BOARD_NOTES.filter((m) => m.pairId === pairId);
  },

  addBoardNote(
    pairId: string,
    data: { fromRole: Role; gender: Gender; content: string; color?: NoteColor; pinned?: boolean }
  ): BoardNote {
    const all = this.getAllBoardNotes();
    const defaultColor: NoteColor = data.gender === "male" ? "blue" : "pink";
    const newNote: BoardNote = {
      id: generateId(),
      fromRole: data.fromRole,
      toRole: data.fromRole === "A" ? "B" : "A",
      gender: data.gender,
      content: data.content,
      color: data.color || defaultColor,
      pinned: !!data.pinned,
      likes: 0,
      likedByMe: false,
      createTime: formatDateTime(new Date()),
      pairId,
    };
    all.unshift(newNote);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(all));
    return newNote;
  },

  setTheme(theme: "pink" | "blue"): void {
    const pair = this.getPair();
    pair.theme = theme;
    this.savePair(pair);
  },

  togglePinBoardNote(id: string): void {
    const all = this.getAllBoardNotes().map((n) =>
      n.id === id ? { ...n, pinned: !n.pinned } : n
    );
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(all));
  },

  toggleLikeBoardNote(id: string): void {
    const all = this.getAllBoardNotes().map((n) => {
      if (n.id === id) {
        const nextLiked = !n.likedByMe;
        return {
          ...n,
          likedByMe: nextLiked,
          likes: nextLiked ? n.likes + 1 : Math.max(0, n.likes - 1),
        };
      }
      return n;
    });
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(all));
  },

  deleteBoardNote(id: string): void {
    const all = this.getAllBoardNotes().filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(all));
  },

  getAllBoardNotes(): BoardNote[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_BOARD_NOTES;
  },

  // --- Adventure Deck (50+ 真心话 & 大冒险) ---
  getAdventures(pairId: string): AdventureCard[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADVENTURES);
      if (data) {
        const list: AdventureCard[] = JSON.parse(data);
        return list.filter((a) => a.pairId === pairId);
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(STORAGE_KEYS.ADVENTURES, JSON.stringify(INITIAL_ADVENTURES));
    return INITIAL_ADVENTURES.filter((a) => a.pairId === pairId);
  },

  addAdventure(
    pairId: string,
    data: { mode: "truth" | "dare"; category: AdventureCategory; content: string; reward?: string }
  ): AdventureCard {
    const all = this.getAllAdventures();
    const catObj = ADVENTURE_CATEGORIES.find((c) => c.key === data.category);
    const newCard: AdventureCard = {
      id: generateId(),
      mode: data.mode,
      category: data.category,
      categoryName: catObj ? catObj.name : "甜蜜互动",
      content: data.content,
      reward: data.reward,
      isCustom: true,
      completed: false,
      pairId,
      createTime: new Date().toISOString(),
    };
    all.unshift(newCard);
    localStorage.setItem(STORAGE_KEYS.ADVENTURES, JSON.stringify(all));
    return newCard;
  },

  deleteAdventure(id: string): void {
    const all = this.getAllAdventures().filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ADVENTURES, JSON.stringify(all));
  },

  toggleAdventureComplete(id: string): void {
    const all = this.getAllAdventures().map((a) =>
      a.id === id ? { ...a, completed: !a.completed } : a
    );
    localStorage.setItem(STORAGE_KEYS.ADVENTURES, JSON.stringify(all));
  },

  getAllAdventures(): AdventureCard[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADVENTURES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ADVENTURES;
  },

  // --- Live Status & Pokes (情侣即时状态与互动传情) ---
  getLiveStatus(pairId: string): PairLiveStatus {
    try {
      const data = localStorage.getItem(`${STORAGE_KEYS.STATUSES}_${pairId}`);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    const def = {
      statusA: {
        code: "on_the_way" as StatusCode,
        emoji: "🚗",
        label: "出发在路上",
        subText: "正开车奔向有你的地方，大概20分钟到家~",
        etaMinutes: 20,
        updateTime: new Date(Date.now() - 10 * 60000).toISOString(),
      },
      statusB: {
        code: "missing_you" as StatusCode,
        emoji: "💖",
        label: "超级想你了",
        subText: "刚下班窝在沙发上，买好了草莓等开饭 🍓",
        updateTime: new Date(Date.now() - 5 * 60000).toISOString(),
      },
    };
    localStorage.setItem(`${STORAGE_KEYS.STATUSES}_${pairId}`, JSON.stringify(def));
    return def;
  },

  updateUserStatus(pairId: string, role: Role, newStatus: UserStatus): PairLiveStatus {
    const cur = this.getLiveStatus(pairId);
    if (role === "A") {
      cur.statusA = newStatus;
    } else {
      cur.statusB = newStatus;
    }
    localStorage.setItem(`${STORAGE_KEYS.STATUSES}_${pairId}`, JSON.stringify(cur));
    return cur;
  },

  sendPoke(pairId: string, pokeData: { fromRole: Role; toRole: Role; type: PokeType }): PokeRecord {
    const pokes = this.getPokes(pairId);
    const actionObj = POKE_ACTIONS.find((a) => a.type === pokeData.type) || POKE_ACTIONS[0];
    const newRecord: PokeRecord = {
      id: generateId(),
      fromRole: pokeData.fromRole,
      toRole: pokeData.toRole,
      type: pokeData.type,
      emoji: actionObj.emoji,
      text: actionObj.actionText,
      createTime: formatDateTime(new Date()),
    };
    pokes.unshift(newRecord);
    // keep latest 30 pokes
    const trimmed = pokes.slice(0, 30);
    localStorage.setItem(`${STORAGE_KEYS.POKES}_${pairId}`, JSON.stringify(trimmed));
    return newRecord;
  },

  getPokes(pairId: string): PokeRecord[] {
    try {
      const data = localStorage.getItem(`${STORAGE_KEYS.POKES}_${pairId}`);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: "poke_1",
        fromRole: "B",
        toRole: "A",
        type: "tea",
        emoji: "🧋",
        text: "投喂了一杯全糖多加波霸奶茶！",
        createTime: formatDateTime(new Date(Date.now() - 30 * 60000)),
      },
      {
        id: "poke_2",
        fromRole: "A",
        toRole: "B",
        type: "hug",
        emoji: "🫂",
        text: "送出了一个暖烘烘的超大熊抱！",
        createTime: formatDateTime(new Date(Date.now() - 90 * 60000)),
      },
    ];
  },

  updateNoteSticker(id: string, sticker: string): void {
    const all = this.getAllBoardNotes().map((n) =>
      n.id === id ? { ...n, sticker: n.sticker === sticker ? undefined : sticker } : n
    );
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(all));
  },

  // --- 📍 实时位置与距离 (GPS / 蓝牙靠近雷达) ---
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // 地球半径 (米)
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  },

  getLocationState(pairId: string): PairLocationState {
    try {
      const data = localStorage.getItem(`${STORAGE_KEYS.LOCATIONS}_${pairId}`);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    const locA: CoupleLocation = {
      role: "A",
      nickname: "男孩",
      latitude: 22.5408,
      longitude: 113.9344,
      address: "南山区科技园软件产业基地",
      city: "深圳市",
      battery: 86,
      isCharging: false,
      statusTag: "在公司办公",
      updateTime: formatDateTime(new Date(Date.now() - 5 * 60000)),
    };
    const locB: CoupleLocation = {
      role: "B",
      nickname: "女孩",
      latitude: 22.5385,
      longitude: 114.0558,
      address: "福田区中心城CBD星巴克",
      city: "深圳市",
      battery: 62,
      isCharging: true,
      statusTag: "悠闲喝奶茶中",
      updateTime: formatDateTime(new Date(Date.now() - 2 * 60000)),
    };
    const dist = this.calculateDistance(locA.latitude, locA.longitude, locB.latitude, locB.longitude);
    return {
      pairId,
      locationA: locA,
      locationB: locB,
      distanceMeters: dist,
      isNearBluetooth: dist <= 25,
      lastCloudSyncTime: new Date().toISOString(),
    };
  },

  saveLocationState(pairId: string, state: PairLocationState): void {
    localStorage.setItem(`${STORAGE_KEYS.LOCATIONS}_${pairId}`, JSON.stringify(state));
  },

  updateCoupleLocation(pairId: string, role: Role, update: Partial<CoupleLocation>): PairLocationState {
    const current = this.getLocationState(pairId);
    const targetKey = role === "A" ? "locationA" : "locationB";
    const otherKey = role === "A" ? "locationB" : "locationA";
    const updatedTarget: CoupleLocation = {
      ...current[targetKey],
      ...update,
      updateTime: formatDateTime(new Date()),
    };
    const otherLoc = current[otherKey];
    const dist = this.calculateDistance(
      updatedTarget.latitude,
      updatedTarget.longitude,
      otherLoc.latitude,
      otherLoc.longitude
    );
    const newState: PairLocationState = {
      ...current,
      [targetKey]: updatedTarget,
      distanceMeters: dist,
      isNearBluetooth: dist <= 25,
      lastCloudSyncTime: new Date().toISOString(),
    };
    this.saveLocationState(pairId, newState);
    return newState;
  },

  resetDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.PAIR, JSON.stringify(DEFAULT_PAIR));
    localStorage.setItem(STORAGE_KEYS.DISHES, JSON.stringify(DEFAULT_DISHES));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
    localStorage.setItem(STORAGE_KEYS.PERIODS, JSON.stringify(getSeedPeriods()));
    localStorage.setItem(STORAGE_KEYS.DIARIES, JSON.stringify(getSeedDiaries()));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(DEFAULT_BOARD_NOTES));
    localStorage.setItem(STORAGE_KEYS.ADVENTURES, JSON.stringify(INITIAL_ADVENTURES));
    localStorage.removeItem(`${STORAGE_KEYS.STATUSES}_LUV520`);
    localStorage.removeItem(`${STORAGE_KEYS.POKES}_LUV520`);
  },
};
