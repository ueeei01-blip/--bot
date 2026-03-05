// =============================
// 🔥 すべてのimportは一番上
// =============================
import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import fs from "fs";
import http from "http";

console.log("STARTING BOT...");

// =============================
// 🔐 環境変数読み込み
// =============================
dotenv.config();

console.log("TOKEN EXISTS:", !!process.env.DISCORD_TOKEN);

// =============================
// 🤖 Discordクライアント
// =============================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// =============================
// 💾 データファイル
// =============================
const DATA_FILE = "./gachaData.json";

// データ読み込み
let userData = {};
if (fs.existsSync(DATA_FILE)) {
  userData = JSON.parse(fs.readFileSync(DATA_FILE));
}

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
// 🎯 絵文字テーブル
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
// 📅 JST日付取得
// =============================
function getTodayJST() {
  return new Date().toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo"
  });
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
// 🎯 絵文字抽選
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

  // 📊 履歴確認
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

// =============================
// ✅ ログイン成功
// =============================
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// =============================
// 🔑 ログイン処理
// =============================
client.login(process.env.DISCORD_TOKEN)
  .catch(err => {
    console.error("LOGIN ERROR:", err);
  });

// =============================
// 🌐 Render用ダミーサーバー
// =============================
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot is running");
});

server.listen(process.env.PORT || 3000);