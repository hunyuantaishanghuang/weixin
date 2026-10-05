# 安卓 Android 原生应用快速运行与打包指南

本目录为专为 **Android 原生平台** 打包好的完整 Kotlin / Gradle 工程，开箱即用。

---

## 🛠 3 步在 Android Studio 中打开与打包

### 第 1 步：下载并打开 Android Studio
- 打开官方 **Android Studio**（Hedgehog / Iguana 或更新版本）。
- 点击 **File -> Open**，选择当前工程目录：
  ```text
  /platforms/android-app
  ```

### 第 2 步：配置网址与权限
- 在 `app/src/main/java/com/ourlittledays/app/MainActivity.kt` 中，`webAppUrl` 默认配置为当前云端链接，上线时替换为您部署的正式域名。
- 在 `AndroidManifest.xml` 中，已经为您配置好 `INTERNET` 网络权限与照片上传选择器。

### 第 3 步：运行与一键生成 APK
1. **直接运行**：点击顶部绿色三角形 **Run 'app'** 按钮，连接安卓手机或启动模拟器即可立即运行。
2. **打包安装包 (APK)**：
   - 菜单栏点击 **Build -> Build Bundle(s) / APK(s) -> Build APK(s)**。
   - 打包完成后点击右下角 **locate**，即可获得可直接在任意安卓手机上安装的 `.apk` 文件！
