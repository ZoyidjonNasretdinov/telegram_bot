import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();  // .env faylidan o'qish

const token = process.env.BOT_TOKEN;  // Bot tokenini olish

// Botni yaratish
const bot = new TelegramBot(token, { polling: true });

// Komandalar va ularning tavsiflari
const commands = [
  {
    command: '/info',
    description: 'NewEra Cash & Carry haqida ma\'lumot',
  },
  {
    command: '/help',
    description: 'Bot yordamiga oid ma\'lumot',
  },
  // Boshqa komandalarni shu yerga qo'shishingiz mumkin
];

// Komandalarni botga qo'shish
bot.setMyCommands(commands);

// Foydalanuvchi komandani yuborganida, javob berish
bot.onText(/\/info/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `NewEra Cash & Carry Telegram Botga Xush Kelibsiz!* 🎉  
      
NewEra Cash & Carry boti xaridlaringizni oson, tez va qulay qilish uchun yaratilgan. Endi istalgan joydan mahsulotlarimizni ko‘rib chiqing, buyurtma bering va tez yetkazib berish xizmatidan foydalaning.  
      
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
      
*NewEra Cash & Carry* bilan xaridlar endi yanada zavqli va qulay! 😊`);
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Bot yordamiga oid ma\'lumot: ...');
});


bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const inlineKeyboard = [
    [
      { text: "Login", callback_data: "login" },
      { text: "Register", callback_data: "register" },
    ]
  ];

  bot.sendMessage(chatId, `Assalomu aleykum ! ${msg.from?.first_name} o'z kabinetizga kirishiz mumkin`, {
    reply_markup: { inline_keyboard: inlineKeyboard },
  });
});

// Callback query ishlov berish
bot.on('callback_query', (callbackQuery) => {
  const { id, data } = callbackQuery;
  const chatId = callbackQuery.message.chat.id;

  if (data === 'login') {
    bot.sendMessage(chatId, 'Siz Login tugmasini tanladingiz.');
  } else if (data === 'register') {
    bot.sendMessage(chatId, 'Siz Register tugmasini tanladingiz.');
  }

  // Callback queryga javob berish
  bot.answerCallbackQuery(id);
});

// Xato yuzaga kelganida foydalanuvchiga xabar yuborish
bot.on('polling_error', (error) => {
  console.log(error); // Xato konsolga chiqariladi
});