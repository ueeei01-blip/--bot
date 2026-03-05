import dotenv from "dotenv";
dotenv.config();

import { Client, GatewayIntentBits } from "discord.js";
import fs from "fs";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const DATA_FILE = "./gachaData.json";

// =============================
// 🎲 排出率
// =============================
const rarityRates = {
  Normal: 60,
  Rare: 27,
  "Super Rare": 9,
  Secret: 1,
  Legendary: 3
};

// =============================
// 🎯 絵文字テーブル（均等）
// =============================
const emojiTable = {
  Normal: [
    "🔥","😺","💩","😗","😀","☠️","👁️","🧑","👩","🧍",
    "🧍‍♀️","🧍‍♂️","🩷","❤️","❗","❓","🐶","⚙️","✏️","👓",
    "🥀","🌚","🧘‍♂️","🪒","🪮"
  ],
  Rare: [
    "🖊️","💲","🐷","🧑‍🤝‍🧑","👫","🤰","🦑","💦","🌙",
    "🍴","⛪","🏨","🧿","🔪","🔑","🥷"
  ],
  "Super Rare": [
    "🫃","🤰‍♂️","🕶️","🎰","🪬","🏩","💒","🪅",
    "🖋️","✒️","💓","☯️","☢️","🈵","⁉️","🈁","⚧️",
    "👨‍👨‍👦","🔏"
  ],
  Secret: [
    "🥔","🥭","👘","🐄","👵","🐟","⛄","🦌",
    "🔦","🇷","🇧🇫","🏴‍☠️","🚜","🔱"
  ],
  Legendary: ["🍑"]
};

// =============================
// 💾 データ読み込み
// =============================
let userData = {};
if (fs.existsSync(DATA_FILE)) {
  userData = JSON.parse(fs.readFileSync(DATA_FILE));
}

// =============================
// 📅 JST日付
// =============================
function getTodayJST() {
  return new Date().toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" });
}

// =============================
// 🎲 レア抽選
// =============================
function rollRarity() {
  const rand = Math.random() * 100;
  let cumulative = 0;

  for (const rarity in rarityRates) {
    cumulative += rarityRates[rarity];
    if (rand < cumulative) return rarity;
  }
}

// =============================
// 🎯 絵文字抽選（均等）
// =============================
function rollEmoji(rarity) {
  const list = emojiTable[rarity];
  return list[Math.floor(Math.random() * list.length)];
}

// =============================
// 📩 メッセージ監視
// =============================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const userId = message.author.id;

  // 🍑 ガチャ
  if (message.content === "桃くれ") {

    const today = getTodayJST();

    if (!userData[userId]) {
      userData[userId] = {
        lastRoll: null,
        history: {
          Normal: 0,
          Rare: 0,
          "Super Rare": 0,
          Secret: 0,
          Legendary: 0
        }
      };
    }

    if (userData[userId].lastRoll === today) {
      return message.reply("あげない");
    }

    const rarity = rollRarity();
    const emoji = rollEmoji(rarity);

    userData[userId].lastRoll = today;
    userData[userId].history[rarity]++;

    fs.writeFileSync(DATA_FILE, JSON.stringify(userData, null, 2));

    await message.react(emoji);

    return message.reply(
`${emoji}あげる
Rarity：${rarity}`
    );
  }

  // 📊 履歴
  if (message.content === "桃履歴") {

    if (!userData[userId]) {
      return message.reply("まだ桃をもらったことがありません。");
    }

    const h = userData[userId].history;

    return message.reply(
`🍑 桃ガチャ履歴

Normal : ${h.Normal}
Rare : ${h.Rare}
Super Rare : ${h["Super Rare"]}
Secret : ${h.Secret}
Legendary : ${h.Legendary}`
    );
  }
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);

import http from "http";

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot is running");
});

server.listen(process.env.PORT || 3000);
