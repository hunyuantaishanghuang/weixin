# 华为鸿蒙 HarmonyOS NEXT (ArkTS) 运行指南

本目录为专为**华为鸿蒙 NEXT (API 12+)** 打包好的完整原生 ArkTS 项目，开箱即用。

---

## 🛠 3 步在华为 DevEco Studio 中运行

### 第 1 步：下载华为官方 IDE
- 下载并安装华为官方 **DevEco Studio (NEXT 开发者版本)**。
- 启动 IDE，点击 **Open**，选择当前目录：
  ```text
  /platforms/harmonyos-app
  ```

### 第 2 步：配置网址与权限
- 在 `entry/src/main/ets/pages/Index.ets` 中，`appUrl` 默认配置为当前云端链接，上线时替换为您部署的正式域名。
- 在 `module.json5` 中，已经为您配置好 `ohos.permission.INTERNET` 网络访问权限。

### 第 3 步：运行与打包
1. 启动鸿蒙模拟器（Emulator）或连接华为鸿蒙真机（打开 USB 调试）。
2. 点击 DevEco Studio 右上角绿色的 **Run** 按钮。
3. 应用将自动编译并在鸿蒙手机/平板上启动，与微信小程序、安卓 App 实时互通同一个云端数据库！
