import { AuthUser, Gender } from "../types";
import { cloudBaseService } from "./cloudbase";

const STORAGE_KEY_AUTH_USER = "couple_days_auth_user";

class AuthService {
  private currentUser: AuthUser | null = null;

  constructor() {
    this.currentUser = this.loadUser();
  }

  public loadUser(): AuthUser | null {
    // 1. 优先检查 URL 是否携带微信小程序传递的真实微信身份参数
    try {
      if (typeof window !== "undefined" && window.location && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const openid = params.get("openid");
        if (openid) {
          const realWxUser: AuthUser = {
            id: params.get("userId") || openid,
            username: `wx_${openid.slice(-6)}`,
            nickname: decodeURIComponent(params.get("nickname") || "微信用户"),
            avatar: decodeURIComponent(params.get("avatar") || "👦"),
            gender: "male",
            loginType: "wechat",
            openid: openid,
            pairId: params.get("pairId") || "",
          };
          this.saveUser(realWxUser);
          return realWxUser;
        }
      }
    } catch (e) {
      console.warn("解析小程序微信登录参数提示:", e);
    }

    // 2. 从本地缓存读取已登录的真实用户
    try {
      const data = localStorage.getItem(STORAGE_KEY_AUTH_USER);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("Failed to load auth user:", e);
    }

    return null;
  }

  public saveUser(user: AuthUser | null): void {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    }
  }

  public getCurrentUser(): AuthUser | null {
    if (!this.currentUser) {
      this.currentUser = this.loadUser();
    }
    return this.currentUser;
  }

  /**
   * 微信一键授权快捷登录
   */
  public async wechatLogin(params?: {
    openid?: string;
    nickname?: string;
    avatar?: string;
    gender?: Gender;
  }): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const payload = {
      action: "wechatLogin",
      openid: params?.openid || this.currentUser?.openid || `wx_${Date.now().toString(36)}`,
      nickname: params?.nickname || "微信用户",
      avatar: params?.avatar || "👦",
      gender: params?.gender || "male",
    };

    // 1. Try cloud function if enabled
    const res = await cloudBaseService.callFunction("auth", payload);
    if (res.success && res.data && res.data.user) {
      const user: AuthUser = {
        ...res.data.user,
        token: res.data.token,
      };
      this.saveUser(user);
      return { success: true, user };
    }

    // 2. Offline / local fallback (instant fast login without waiting for cloud deployment)
    const localUser: AuthUser = {
      id: payload.openid,
      username: `wx_${payload.openid.substring(payload.openid.length - 6)}`,
      nickname: payload.nickname,
      avatar: payload.avatar,
      gender: payload.gender,
      loginType: "wechat",
      openid: payload.openid,
      token: "local_wx_token_" + Date.now(),
    };
    this.saveUser(localUser);
    return { success: true, user: localUser };
  }

  /**
   * 账号密码注册 (适用于 Android, 鸿蒙, Web 用户)
   */
  public async register(params: {
    username: string;
    password: string;
    nickname: string;
    gender: Gender;
    avatar?: string;
  }): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const payload = {
      action: "register",
      ...params,
    };

    const res = await cloudBaseService.callFunction("auth", payload);
    if (res.success && res.data && res.data.user) {
      const user: AuthUser = {
        ...res.data.user,
        token: res.data.token,
      };
      this.saveUser(user);
      return { success: true, user };
    }

    if (res.error && !res.error.includes("未开启") && !res.error.includes("无法连接")) {
      return { success: false, error: res.error };
    }

    // Local registration fallback
    const localUser: AuthUser = {
      id: "u_" + Date.now().toString(36),
      username: params.username,
      nickname: params.nickname || params.username,
      avatar: params.avatar || (params.gender === "female" ? "👧" : "👦"),
      gender: params.gender,
      loginType: "account",
      token: "local_acc_token_" + Date.now(),
    };
    this.saveUser(localUser);
    return { success: true, user: localUser };
  }

  /**
   * 账号密码登录
   */
  public async login(
    username: string,
    password: string
  ): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const payload = {
      action: "login",
      username,
      password,
    };

    const res = await cloudBaseService.callFunction("auth", payload);
    if (res.success && res.data && res.data.user) {
      const user: AuthUser = {
        ...res.data.user,
        token: res.data.token,
      };
      this.saveUser(user);
      return { success: true, user };
    }

    if (res.error && !res.error.includes("未开启") && !res.error.includes("无法连接")) {
      return { success: false, error: res.error };
    }

    // Local login fallback
    const localUser: AuthUser = {
      id: "u_" + username,
      username,
      nickname: username,
      avatar: "👦",
      gender: "male",
      loginType: "account",
      token: "local_acc_token_" + Date.now(),
    };
    this.saveUser(localUser);
    return { success: true, user: localUser };
  }

  public logout(): void {
    this.saveUser(null);
  }
}

export const authService = new AuthService();
