// api/proxy.js
// 需要安裝 node-fetch v2: npm install node-fetch@2 或 yarn add node-fetch@2
// Vercel Serverless Functions 通常不支持直接使用 ES Modules 的 fetch，
// 或者你可以使用 axios 或內建 https 模組

const fetch = require('node-fetch');
const { URLSearchParams } = require('url'); // node-fetch 可能需要

module.exports = async (req, res) => {
  // 1. 設定 CORS 標頭 (在發送實際回應前設定)
  //    非常重要：確保這裡允許你的前端來源
  res.setHeader('Access-Control-Allow-Origin', 'https://pan77775.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // 允許 POST 和處理 Preflight 的 OPTIONS
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // 允許的標頭
  res.setHeader('Access-Control-Allow-Credentials', 'true'); // 如果前端需要發送憑證

  // 處理瀏覽器 Preflight Request (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.status(204).end(); // 204 No Content
    return;
  }

  // 只處理 POST 請求
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const targetUrl = 'http://220.128.130.212:9000/detect';

  try {
    // 2. 將前端請求轉發到後端
    const backendResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        // 從前端請求複製必要的標頭，特別是 Content-Type
        // 注意：直接複製 host 可能導致問題，避免複製 host, connection 等標頭
        'Content-Type': req.headers['content-type'],
        // 如果你的後端需要其他特定標頭，可以在這裡添加
      },
      body: req, // 直接將前端請求的 body 流轉發給後端
      // 如果需要處理 buffer:
      // body: req.body // Vercel 可能已經解析了 body，或者你需要手動讀取 stream
    });

    // 3. 獲取後端回應狀態和內容
    const status = backendResponse.status;
    const data = await backendResponse.json(); // 假設後端總是回傳 JSON

    // 4. 將後端的回應 (包含狀態碼和 JSON 內容) 發送回前端
    //    CORS 標頭已在前面設定
    res.status(status).json(data);

  } catch (error) {
    console.error('Proxy Error:', error);
    // 5. 處理錯誤
    res.status(500).json({ error: 'Proxy failed', details: error.message });
  }
};
