import express from "express";
import { middleware, Client } from "@line/bot-sdk";

// LINE Bot設定
const config = {
  channelAccessToken: MF0W2sLvZHnGzYqC1TrKLCZUCtT/LJYO7jxuJyxa0PPXIKM8YW+dadnCzMoxNXowssHnRWEdFglFrKQ5vyvRqggxQtLbkrQUot/vLY3Uf5VKGGK/Oh/plIg5sHLs6aA/vKshB8q/kr0e/AcIHl/9iwdB04t89/1O/w1cDnyilFU=,
  channelSecret: 5949cf8058d952e0770bd4c808a26600
};

const client = new Client(config);
const app = express();

app.post("/webhook", middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  return client.replyMessage(event.replyToken, {
    type: "text",
    text: `受け取ったメッセージ: ${event.message.text}`
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

