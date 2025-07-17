import express from "express";
import bodyParser from "body-parser";
import { Client } from "@line/bot-sdk";
import multer from "multer";
import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const config = {
  channelAccessToken: "MF0W2sLvZHnGzYqC1TrKLCZUCtT/LJYO7jxuJyxa0PPXIKM8YW+dadnCzMoxNXowssHnRWEdFglFrKQ5vyvRqggxQtLbkrQUot/vLY3Uf5VKGGK/Oh/plIg5sHLs6aA/vKshB8q/kr0e/AcIHl/9iwdB04t89/1O/w1cDnyilFU=",
  channelSecret: "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";

const client = new Client(config);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Webhook endpoint
app.post("/webhook", (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
});

async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  return client.replyMessage(event.replyToken, {
    type: "text",
    text: `受け取りました: ${event.message.text}`
  });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
