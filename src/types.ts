export type Role = "A" | "B";
export type Gender = "male" | "female";
export type AppTheme = "pink" | "blue";

export interface AuthUser {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  gender: Gender;
  loginType: "wechat" | "account";
  openid?: string;
  token?: string;
  pairId?: string;
}

export interface PairState {
  pairId: string;
  status: "unbound" | "created" | "pending" | "bound";
  memberA: string;
  memberB: string;
  pendingB?: string;
  currentRole: Role;
  nicknameA: string;
  nicknameB: string;
  genderA: Gender;
  genderB: Gender;
  theme: AppTheme;
  bindTime?: string;
}

export interface Dish {
  id: string;
  name: string;
  materials: string[];
  note: string;
  image?: string;
  createTime: string;
  pairId: string;
}

export interface MenuOrder {
  id: string;
  dishId?: string;
  name: string;
  materials: string[];
  note: string;
  image?: string;
  dateKey: string;
  done: boolean;
  createTime: string;
  pairId: string;
}

export interface PeriodRecord {
  id: string;
  date: string; // YYYY-MM-DD
  pairId: string;
  createTime: string;
}

export interface MoodConfig {
  key: string;
  icon: string;
  label: string;
  color: string; // Color for calendar day indicator (e.g. amber, rose, emerald, etc.)
  bgColor: string;
}

export interface DiaryEntry {
  id: string;
  dateString: string; // YYYY-MM-DD for calendar indexing
  mood: MoodConfig;
  text: string;
  images: string[];
  date: string; // Human readable formatted time
  createTime: string;
  pairId: string;
  authorRole?: Role;
}

export type NoteColor = "blue" | "cyan" | "pink" | "rose" | "yellow" | "purple";

export interface BoardNote {
  id: string;
  fromRole: Role;
  toRole: Role;
  gender: Gender; // 男生 or 女生
  content: string;
  color: NoteColor;
  pinned: boolean;
  likes: number;
  likedByMe: boolean;
  sticker?: string; // 贴纸标记: e.g. "🐱 收到照办", "🥤 赏你奶茶", "💖 最爱你"
  createTime: string;
  pairId: string;
}

export type StatusCode =
  | "busy"        // 在忙工作
  | "free"        // 空闲摸鱼
  | "on_the_way"  // 在路上奔向你
  | "eating"      // 美味干饭中
  | "missing_you" // 超级想你了
  | "low_battery" // 电量告急累趴
  | "sleeping"    // 呼呼入睡中
  | "workout"     // 运动暴汗中
  | "gaming"      // 游戏激战中
  | "custom";     // 自定义状态

export interface UserStatus {
  code: StatusCode;
  emoji: string;
  label: string;
  subText?: string;
  etaMinutes?: number; // 预计到达时间(分钟)
  updateTime: string;  // 更新时间
}

export interface PairLiveStatus {
  statusA: UserStatus;
  statusB: UserStatus;
}

export type PokeType = "hug" | "tea" | "kiss" | "rub_head" | "energy";

export interface PokeRecord {
  id: string;
  fromRole: Role;
  toRole: Role;
  type: PokeType;
  emoji: string;
  text: string;
  createTime: string;
}

// Keep MessageItem as alias for compatibility
export type MessageItem = BoardNote;

export type PageRoute = "home" | "pair" | "menu" | "period" | "diary" | "message" | "adventure";

export type AdventureCategory = "sweet" | "fun" | "deep" | "heartbeat";
export type AdventureMode = "all" | "truth" | "dare";

export interface AdventureCard {
  id: string;
  mode: "truth" | "dare"; // 真心话 vs 大冒险
  category: AdventureCategory;
  categoryName: string;
  content: string;
  reward?: string;
  isCustom?: boolean;
  completed?: boolean;
  pairId: string;
  createTime: string;
}

export interface CoupleLocation {
  role: Role;
  nickname: string;
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  battery?: number; // 手机剩余电量百分比
  isCharging?: boolean; // 充电状态
  statusTag?: string; // 如 "在公司", "在家", "地铁通勤中", "商场逛街"
  updateTime: string;
}

export interface PairLocationState {
  pairId: string;
  locationA: CoupleLocation;
  locationB: CoupleLocation;
  distanceMeters: number; // 两人直线物理距离 (米)
  isNearBluetooth: boolean; // 蓝牙近场感应 (< 20米)
  lastCloudSyncTime: string;
}

