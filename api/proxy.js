const fetch = require("node-fetch");
const FormData = require("form-data");

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ message: "Only POST allowed" });
    return;
  }

  try {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", async () => {
      const buffer = Buffer.concat(chunks);

      const form = new FormData();
      form.append("file", buffer, {
        filename: "uploaded.jpg",
        contentType: req.headers["content-type"] || "image/jpeg",
      });

      const response = await fetch("http://220.128.130.212:9000/detect/", {
        method: "POST",
        body: form,
        headers: form.getHeaders(),
      });

      const resultBuffer = await response.buffer();
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", response.headers.get("content-type") || "image/jpeg");
      res.send(resultBuffer);
    });
  } catch (error) {
    console.error("Proxy error:", error);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).send("Proxy failed");
  }
};
