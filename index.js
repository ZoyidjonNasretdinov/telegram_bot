import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.on("message", (msg) => {
  const text = msg.text.toString().toLowerCase();
  const chatId = msg.chat.id;

  if (text === "/info") {
    bot.sendMessage(
      chatId,
      `*NewEra Cash & Carry Telegram Botga Xush Kelibsiz!* 🎉  
      
*NewEra Cash & Carry* boti xaridlaringizni oson, tez va qulay qilish uchun yaratilgan. Endi istalgan joydan mahsulotlarimizni ko‘rib chiqing, buyurtma bering va tez yetkazib berish xizmatidan foydalaning.  
      
*Bot Imkoniyatlari:*  
- 🛍️ Mahsulotlarni ko‘rish va tanlash.  
- 🛒 Buyurtma berish va kuzatish.  
- 💬 Mijozlarni qo‘llab-quvvatlash bilan bog‘lanish.  
- 🔔 Chegirma va aksiyalar haqida xabardor bo‘lish.  
      
*Afzalliklarimiz:*  
- 🌟 Sifatli mahsulotlar va arzon narxlar.  
- 🕒 Vaqtingizni tejash.  
- 🚛 Tezkor yetkazib berish.  
      
*Boshlash:*  
1. Start tugmasini bosing.  
2. Mahsulotlarni ko‘rib chiqing.  
3. Buyurtma berib, qulaylikdan bahramand bo‘ling!  
      
*NewEra Cash & Carry* bilan xaridlar endi yanada zavqli va qulay! 😊`,
      { parse_mode: "Markdown" }
    );
  }

  if (text === "/start") {
    bot.sendMessage(chatId, `Assalomu alaykum, ${msg.from.first_name}!`);
    bot.sendMessage(chatId, "Inline tugmalarni sinab ko'ring:", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Login", callback_data: "login" }, // Callback tugma
            { text: "Register", callback_data: "register" }, // Callback tugma
          ],
        ],
      },
    });
  }
});

bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;

  // Callback tugma bosilganda nima qilish kerak
  if (query.data === "login") {
    bot.sendMessage(chatId, "Login bo'limiga xush kelibsiz!");
  }

  if (query.data === "register") {
    bot.sendMessage(chatId, "Ro‘yxatdan o‘tish bo‘limiga xush kelibsiz!");
  }

  // Callbackni javob qaytarish orqali bekor qilish
  bot.answerCallbackQuery(query.id); 
});
