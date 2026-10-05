const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 本地兜底：把粘贴文本按行解析为菜品（无 AI 时可用）
function localParse(text) {
  return text
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30)
    .map((line) => {
      const parts = line.split(/[：:，,、]/);
      const name = parts[0];
      const materials = parts.slice(1).map((s) => s.trim()).filter(Boolean);
      return { name, materials, note: "" };
    })
    .filter((d) => d.name);
}

// 调用大模型（CloudBase 云开发 AI，使用 hy3 模型）
// 文档：https://docs.cloudbase.net/ai/ai-inspire-plan
async function callLLM(prompt) {
  try {
    const res = await cloud.ai().chat({
      model: "hy3",
      messages: [
        { role: "system", content: "你是帮助用户经营情侣小日子的贴心助手，回答简洁、实用、温柔。" },
        { role: "user", content: prompt },
      ],
    });
    return res.reply || (res.choices && res.choices[0] && res.choices[0].message.content) || "";
  } catch (e) {
    console.error("LLM call failed, fallback", e);
    return "";
  }
}

// 解析粘贴板/网页文本 -> 结构化菜品列表
async function parseDishes(text) {
  const prompt = `请从下面这段文本中识别出菜品，并尽量提取每道菜的原材料。
只返回 JSON 数组，每个元素格式：{"name":"菜名","materials":["原材料1","原材料2"],"note":"简要做法或备注,可空"}。
不要解释，只返回 JSON。
文本：
${text}`;
  const reply = await callLLM(prompt);
  if (!reply) return localParse(text); // AI 不可用时降级
  try {
    const json = reply.replace(/```json|```/g, "").trim();
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr : localParse(text);
  } catch (e) {
    return localParse(text);
  }
}

// 生成一句情话/留言
async function genLove(style) {
  const prompt = `请写一句${style || "温柔甜蜜"}的情话或留言，不超过40字，直接给内容，不要解释。`;
  const reply = await callLLM(prompt);
  return reply || "今天也很想你 💕";
}

exports.main = async (event) => {
  try {
    switch (event.type) {
      case "parseDishes":
        return { success: true, dishes: await parseDishes(event.text || "") };
      case "genLove":
        return { success: true, text: await genLove(event.style) };
      default:
        return { success: false, msg: "unknown type" };
    }
  } catch (e) {
    return { success: false, errMsg: String(e) };
  }
};
