// app.js (完全修正版)
import express from "express";
import { middleware, Client } from "@line/bot-sdk";

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const app = express();
const lineClient = new Client(config);

// LINE webhook middleware
app.post("/webhook", middleware(config), (req, res) => {
  // 👇 先にHTTP 200を返すことでLINEのタイムアウトを防ぐ
  res.status(200).send("OK");

  req.body.events.map(async (event) => {
    try {
      await handleEvent(event);
    } catch (err) {
      console.error(err);
    }
  });
});

async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return;
  }
  const echo = { type: "text", text: `Echo: ${event.message.text}` };
  await lineClient.replyMessage(event.replyToken, echo);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
