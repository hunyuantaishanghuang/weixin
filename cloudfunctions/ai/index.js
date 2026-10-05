const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const ROMANTIC_QUOTES = [
  "我喜欢你，胜于昨日，略匮明朝。",
  "想和你一起走在晚风里，看落日熔金，暮云合璧。",
  "遇见你的那天起，平凡的柴米油盐都变成了心动的风景。",
  "风行过万里，吹过无数森林，而我只想停驻在你的怀抱里。",
  "哪怕生活偶尔琐碎疲惫，只要一想到今晚有你热气腾腾的拥抱，整个人就满血复活了。",
  "世界上最幸福的事，莫过于每天醒来第一眼见你，睡前最后一句话是对你说晚安。",
  "我的宇宙原本荒无一物，直到你携着满天星辰撞了进来。",
];

function formatResponse(statusCode, data, isHttp = false) {
  if (!isHttp) return data;
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    },
    body: JSON.stringify(data),
  };
}

exports.main = async (event, context) => {
  const isHttp = !!event.httpMethod;

  if (isHttp && event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
      },
    };
  }

  const randomQuote = ROMANTIC_QUOTES[Math.floor(Math.random() * ROMANTIC_QUOTES.length)];

  return formatResponse(
    200,
    {
      success: true,
      quote: randomQuote,
      timestamp: new Date().toISOString(),
    },
    isHttp
  );
};
