import { CoupleLocation, PairLocationState, Role } from "../types";
import { storage } from "../storage";
import { cloudBaseService } from "./cloudbase";

class LocationService {
  /**
   * 上报当前用户位置到云端，并获取双方实时距离
   */
  public async reportLocation(
    pairId: string,
    role: Role,
    data: Partial<CoupleLocation>
  ): Promise<PairLocationState> {
    // 1. 本地快速更新，零延迟反馈
    const localState = storage.updateCoupleLocation(pairId, role, data);

    // 2. 尝试向云端数据库发起实时通信
    try {
      const cloudRes = await cloudBaseService.callFunction("dataOps", {
        type: "locations",
        action: "updateLocation",
        pairId,
        role,
        location: {
          ...data,
          updateTime: new Date().toISOString(),
        },
      });

      if (cloudRes.success && cloudRes.data) {
        const cloudData = cloudRes.data;
        const targetKey = role === "A" ? "locationA" : "locationB";
        const otherKey = role === "A" ? "locationB" : "locationA";

        const syncedState: PairLocationState = {
          pairId,
          [targetKey]: cloudData.myLocation || localState[targetKey],
          [otherKey]: cloudData.partnerLocation || localState[otherKey],
          distanceMeters: cloudData.distanceMeters !== null ? cloudData.distanceMeters : localState.distanceMeters,
          isNearBluetooth: cloudData.isNearBluetooth !== undefined ? cloudData.isNearBluetooth : localState.isNearBluetooth,
          lastCloudSyncTime: cloudData.lastCloudSyncTime || new Date().toISOString(),
        } as PairLocationState;

        storage.saveLocationState(pairId, syncedState);
        return syncedState;
      }
    } catch (e) {
      console.warn("云端位置同步通知 (将使用本地离线缓存):", e);
    }

    return localState;
  }

  /**
   * 获取云端双方最新的位置与实时距离
   */
  public async fetchPairLocations(pairId: string): Promise<PairLocationState> {
    const localState = storage.getLocationState(pairId);

    try {
      const cloudRes = await cloudBaseService.callFunction("dataOps", {
        type: "locations",
        action: "getLocation",
        pairId,
      });

      if (cloudRes.success && cloudRes.data) {
        const d = cloudRes.data;
        const syncedState: PairLocationState = {
          pairId,
          locationA: d.locationA || localState.locationA,
          locationB: d.locationB || localState.locationB,
          distanceMeters: d.distanceMeters !== null ? d.distanceMeters : localState.distanceMeters,
          isNearBluetooth: d.isNearBluetooth !== undefined ? d.isNearBluetooth : localState.isNearBluetooth,
          lastCloudSyncTime: d.lastCloudSyncTime || new Date().toISOString(),
        };
        storage.saveLocationState(pairId, syncedState);
        return syncedState;
      }
    } catch (e) {
      console.warn("读取云端位置异常:", e);
    }

    return localState;
  }

  /**
   * 调用浏览器 / 手机 GPS 获取真实物理经纬度
   */
  public getCurrentGpsCoordinates(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("当前设备不支持定位功能"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          reject(err);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }

  /**
   * 格式化距离显示
   */
  public formatDistance(meters?: number): { text: string; sub: string; tag: string } {
    if (meters === undefined || meters === null || isNaN(meters)) {
      return { text: "定位同步中…", sub: "正在连通双方云端 GPS", tag: "测距中" };
    }
    if (meters < 25) {
      return { text: "近在咫尺 · 就在身旁", sub: "已在蓝牙靠近感应范围内 ❤️", tag: "超亲密" };
    }
    if (meters < 1000) {
      return { text: `相距约 ${meters} 米`, sub: "散步几分钟就能抱到TA！", tag: "附近" };
    }
    const km = (meters / 1000).toFixed(1);
    if (meters < 50000) {
      return { text: `相距约 ${km} 公里`, sub: "同城同呼吸，正在奔向你", tag: "同城" };
    }
    return { text: `相距约 ${km} 公里`, sub: "虽然相隔两地，心却紧紧相连 ✈️", tag: "异地" };
  }
}

export const locationService = new LocationService();
