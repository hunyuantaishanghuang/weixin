# 我们的小日子 · 多端全平台架构与一键部署总览

本项目已为您完成 **微信小程序 + 华为鸿蒙 (HarmonyOS NEXT) + 安卓 (Android App)** 三大主流平台的统一工程适配与源码构建。

---

## 🌟 为什么这个架构对技术新手最省力、最省步骤？

针对您提出的需求：“希望最简单、最省步骤、最方便，两个人输入配对码在云端数据库捆绑与隔离”：

1. **统一云端数据库（一套接口服务三端）**：
   - 云函数与云数据库只部署一套（推荐微信云开发或轻量云服务器 Docker）。
   - **微信小程序、安卓 App、鸿蒙 App 全部访问同一个云数据库**！
   - 男生哪怕拿的是华为鸿蒙手机，女生拿的是小米安卓手机，或者在微信小程序里，只要输入配对码完成双向同意，**数据实时互通无阻**！

2. **三个独立原生工程目录已为您全部准备好**：
   - 📱 **微信小程序**：位于 `/platforms/wechat-miniprogram/`（用微信开发者工具打开）
   - 📱 **华为鸿蒙 App**：位于 `/platforms/harmonyos-app/`（用华为 DevEco Studio 打开）
   - 📱 **安卓 Android App**：位于 `/platforms/android-app/`（用 Android Studio 打开）

---

## 🚀 接下来您具体怎么操作？（极简实操清单）

### 阶段一：云端数据库与云函数（5 分钟搞定）
如果您选择最省心的**微信云开发**：
```bash
# 1. 全局安装腾讯云开发命令行工具
npm install -g @cloudbase/cli

# 2. 授权登录
tcb login

# 3. 一键部署认证、双人配对与数据读写云函数 (开启HTTP公网访问，安卓与鸿蒙也能直连)
tcb fn deploy auth --env-id cloud-d3gbi9e14940c4306 --httpFn
tcb fn deploy pair --env-id cloud-d3gbi9e14940c4306 --httpFn
tcb fn deploy dataOps --env-id cloud-d3gbi9e14940c4306 --httpFn
```

### 🔐 双重身份认证体系说明 (支持微信登录 + 账号密码注册)
云函数 `/cloudfunctions/auth` 现已完美支持双通道：
1. **微信官方一键快捷授权登录**：
   - 微信小程序端调用直接通过 `cloud.getWXContext().OPENID` 获取真实微信身份，免密安全秒登。
2. **账号密码注册与登录**：
   - 适用于安卓 App、鸿蒙 App 或 Web 端用户；
   - 支持自定义用户名、6位以上密码、昵称与性别，密码采用 SHA-256 + 独立随机 Salt 加盐加密存储；
   - 无论是微信登录还是账号注册，**都可以在输入配对码后互相捆绑，数据完全隔离存储在同一个云端数据库中**！

### 阶段二：选择您想要打包的客户端
- **想发微信小程序**：直接把 `/platforms/wechat-miniprogram` 文件夹导入微信开发者工具，点击上传即可审核上线。
- **想发安卓手机**：直接用 Android Studio 打开 `/platforms/android-app`，点击 `Build APK` 即可传给伴侣安装。
- **想发鸿蒙手机**：用 DevEco Studio 打开 `/platforms/harmonyos-app`，一键运行到真机或打包 HAP。
