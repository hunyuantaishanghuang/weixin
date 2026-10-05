# 我们的小日子 · 情侣小程序（云开发版）

基于 **微信小程序 + 云开发（CloudBase）** 的多端友好架构，后端全部走云函数 + 云数据库，
前端轻量，可平滑扩展到 App / 桌面组件（留言等模块已预留接口）。

## 环境
- 云开发环境 ID：`cloud-d3gbi9e14940c4306`（已写入 `miniprogram/app.js`）

## 功能
1. 点菜 `pages/menu`：菜谱库 + 模拟菜馆点单，图片/文字上传；粘贴板/网页文本经 AI 云函数一键解析菜品+原材料
2. 经期记录 `pages/period`：记录特殊日子，推算周期/下次/易孕期
3. 心情日记 `pages/diary`：心情+文字+多图
4. 悄悄话 `pages/message`：双方留言（预留，便于扩展 App/桌面组件）
5. 配对 `pages/pair` + `cloudfunctions/pair`：唯一识别码 + 双方确认绑定，以 `pairId` 隔离数据

## 云函数（右键上传并云端安装依赖）
- `pair`：身份校验/配对（生成识别码、加入、确认、解绑、查状态）
- `dataOps`：通用数据 CRUD，强制按 `pairId` 过滤，保证双方数据不混淆
- `ai`：调大模型 `hy3` 解析菜品 / 生成情话（需环境开通 AI 资源包，否则相关按钮降级）
- `initDb`：一键建集合

## 数据库集合（均以 pairId 隔离）
`users / pairs / dishes / menus / periods / diaries / messages`

## 部署步骤
1. 微信开发者工具导入本项目（环境已配 `cloud-d3gbi9e14940c4306`）。
2. 右键上传部署 4 个云函数：`pair` `dataOps` `ai` `initDb`（云端安装依赖）。
3. 调用一次 `initDb` 建好集合。
4. 双方打开小程序，在「伴侣绑定」页：一方创建识别码，另一方输入申请，发起方确认即绑定。

## AI 能力
`cloudfunctions/ai` 通过 `cloud.ai().chat({ model: "hy3" })` 调用大模型（参考 https://docs.cloudbase.net/ai/ai-inspire-plan）。
未开通 AI 资源包时，点菜仍可手动添加、留言仍可正常收发，仅"粘贴识别""💡情话"降级。
