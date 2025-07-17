
const express = require("express");
const axios = require("axios");
const multer = require("multer");
const vision = require("@google-cloud/vision");
const path = require("path");

const app = express();
app.use(express.json());
const upload = multer({ dest: "uploads/" });

// 環境変数からトークンを取得
const LINE_CHANNEL_ACCESS_TOKEN = "MF0W2sLvZHnGzYqC1TrKLCZUCtT/LJYO7jxuJyxa0PPXIKM8YW+dadnCzMoxNXowssHnRWEdFglFrKQ5vyvRqggxQtLbkrQUot/vLY3Uf5VKGGK/Oh/plIg5sHLs6aA/vKshB8q/kr0e/AcIHl/9iwdB04t89/1O/w1cDnyilFU=";
const GROQ_API_KEY = "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";


// Google Cloud Visionクライアント設定
const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, // Secretに設定したJSONパス
});

app.post("/webhook", async (req, res) => {
  const event = req.body.events?.[0];

  if (event?.message?.type === "text") {
    const userText = event.message.text;

    // Groq API へ送信
    try {
      const groqResp = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: "あなたは親切な日本語アシスタントです。" },
            { role: "user", content: userText },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const replyText = groqResp.data.choices?.[0]?.message?.content ?? "何を登録しますか？";

      // LINEへ返信
      await axios.post(
        "https://api.line.me/v2/bot/message/reply",
        {
          replyToken: event.replyToken,
          messages: [{ type: "text", text: replyText }],
        },
        {
          headers: {
            Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Groq APIエラー:", error.response?.data || error.message);
    }
  } else if (event?.message?.type === "image") {
    // 画像メッセージ受信時
    try {
      const imageBuffer = await downloadImage(event.message.id);
      const [result] = await visionClient.textDetection(imageBuffer);
      const detections = result.textAnnotations;
      const ocrText = detections?.[0]?.description ?? "文字を読み取れませんでした。";

      await axios.post(
        "https://api.line.me/v2/bot/message/reply",
        {
          replyToken: event.replyToken,
          messages: [{ type: "text", text: `OCR結果: ${ocrText}` }],
        },
        {
          headers: {
            Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (err) {
      console.error("Vision APIエラー:", err.message);
    }
  }

  res.sendStatus(200);
});

// LINE画像を取得
async function downloadImage(messageId) {
  const response = await axios.get(`https://api-data.line.me/v2/bot/message/${messageId}/content`, {
    responseType: "arraybuffer",
    headers: { Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` },
  });
  return response.data;
}

// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
