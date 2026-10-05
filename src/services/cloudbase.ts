import cloudbase from "@cloudbase/js-sdk";

export interface CloudBaseConfig {
  envId: string;
  httpEndpoint?: string; // Optional custom HTTP trigger base URL
  enabled: boolean;
}

const STORAGE_KEY_TCB_CONFIG = "couple_days_tcb_config";

const DEFAULT_CONFIG: CloudBaseConfig = {
  envId: "cloud-d3gbi9e14940c4306",
  httpEndpoint: "https://cloud-d3gbi9e14940c4306.service.tcloudbase.com",
  enabled: false, // User can toggle this on in settings
};

class CloudBaseService {
  private app: any = null;
  private config: CloudBaseConfig;
  private isAuthDone = false;

  constructor() {
    this.config = this.loadConfig();
    this.initApp();
  }

  public loadConfig(): CloudBaseConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TCB_CONFIG);
      if (data) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CONFIG;
  }

  public saveConfig(cfg: Partial<CloudBaseConfig>): CloudBaseConfig {
    this.config = { ...this.config, ...cfg };
    localStorage.setItem(STORAGE_KEY_TCB_CONFIG, JSON.stringify(this.config));
    this.initApp();
    return this.config;
  }

  public getConfig(): CloudBaseConfig {
    return this.config;
  }

  private initApp() {
    try {
      if (this.config.envId) {
        this.app = cloudbase.init({
          env: this.config.envId,
        });
        this.isAuthDone = false;
      }
    } catch (err) {
      console.warn("CloudBase init notice:", err);
    }
  }

  private async ensureAuth(): Promise<boolean> {
    if (!this.app) return false;
    if (this.isAuthDone) return true;
    try {
      const auth = this.app.auth({ persistence: "local" });
      const loginState = await auth.getLoginState();
      if (!loginState) {
        await auth.anonymousAuthProvider().signIn();
      }
      this.isAuthDone = true;
      return true;
    } catch (err) {
      console.warn("CloudBase anonymous sign-in notice (normal if Web auth not configured in console):", err);
      return false;
    }
  }

  /**
   * Invokes a cloud function:
   * First tries HTTP Cloud Function (if deployed via `tcb fn deploy <name> --env-id <env> --httpFn`),
   * then falls back to Web SDK `app.callFunction`.
   */
  public async callFunction(name: string, data: Record<string, any>): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.config.enabled) {
      return { success: false, error: "云开发未开启" };
    }

    // 1. Try HTTP Trigger endpoint first if available
    const httpBase = this.config.httpEndpoint || `https://${this.config.envId}.service.tcloudbase.com`;
    const httpUrl = `${httpBase}/${name}`;

    try {
      const resp = await fetch(httpUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (resp.ok) {
        const json = await resp.json();
        return { success: true, data: json };
      }
    } catch (httpErr) {
      // Continue to SDK fallback
    }

    // 2. Try @cloudbase/js-sdk
    if (this.app) {
      try {
        await this.ensureAuth();
        const res = await this.app.callFunction({
          name,
          data,
        });
        if (res && res.result) {
          return { success: true, data: res.result };
        }
      } catch (sdkErr: any) {
        return { success: false, error: sdkErr?.message || "云函数调用失败" };
      }
    }

    return { success: false, error: "无法连接到微信云开发云函数" };
  }

  /**
   * Quick connection health check for pair or dataOps
   */
  public async testConnection(): Promise<{ ok: boolean; message: string; method?: "http" | "sdk" }> {
    // Test HTTP endpoint
    const httpBase = this.config.httpEndpoint || `https://${this.config.envId}.service.tcloudbase.com`;
    try {
      const resp = await fetch(`${httpBase}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ping" }),
      });
      if (resp.ok) {
        const json = await resp.json();
        return { ok: true, message: `HTTP 云函数连接成功！(已连通 ${this.config.envId})`, method: "http" };
      }
    } catch (e) {
      // ignore
    }

    // Test SDK
    if (this.app) {
      try {
        const authed = await this.ensureAuth();
        if (authed) {
          const res = await this.app.callFunction({
            name: "ai",
            data: { action: "ping" },
          });
          if (res) {
            return { ok: true, message: `CloudBase Web SDK 连接成功！`, method: "sdk" };
          }
        }
      } catch (e: any) {
        return {
          ok: false,
          message: `未连通云端 (提示: ${e?.message || "请确认是否已执行 tcb fn deploy --httpFn 或在控制台开启WEB安全域名"})`,
        };
      }
    }

    return {
      ok: false,
      message: `尚未检测到公网 HTTP 云函数。请使用命令：tcb fn deploy dataOps --env-id ${this.config.envId} --httpFn 部署后重试。`,
    };
  }
}

export const cloudBaseService = new CloudBaseService();
