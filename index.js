import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config(); // .env faylidan o'qish

const token = process.env.BOT_TOKEN; // Bot tokenini olish

// Botni yaratish
const bot = new TelegramBot(token, { polling: true });

// JSON fayli yo'qligini tekshirish va yaratish
const dataFile = './data.json';
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify({ users: [], products: [], orders: [] }, null, 2));
}

// JSON faylni o'qish
const readData = () => {
  const data = fs.readFileSync(dataFile, 'utf8');
  return JSON.parse(data);
};

// JSON faylni yozish
const writeData = (data) => {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
};

// Komandalar va ularning tavsiflari
bot.setMyCommands([
  { command: '/start', description: 'Boshlash' },
  { command: '/info', description: 'Bot haqida malumot' },
  { command: '/help', description: 'Yordam' },
]);

// Start komandasi
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const inlineKeyboard = [
    [{ text: 'Login', callback_data: 'login' }, { text: 'Register', callback_data: 'register' }],
  ];
  bot.sendMessage(
    chatId,
    `Assalomu alaykum, ${msg.from?.first_name}! O'z kabinetingizga kirish uchun quyidagi tugmalardan birini tanlang:`,
    { reply_markup: { inline_keyboard: inlineKeyboard } }
  );
});

// Callback query handler
bot.on('callback_query', (callbackQuery) => {
  const { id, data } = callbackQuery;
  const chatId = callbackQuery.message.chat.id;

  switch (data) {
    case 'login':
      handleLogin(chatId);
      break;
    case 'register':
      handleRegister(chatId);
      break;
    case 'manage_products':
      showProductManagement(chatId);
      break;
    case 'add_product':
      handleAddProduct(chatId);
      break;
    case 'update_product':
      handleUpdateProduct(chatId);
      break;
    case 'delete_product':
      handleDeleteProduct(chatId);
      break;
    case 'manage_orders':
      showOrderManagement(chatId);
      break;
    case 'view_orders':
      handleViewOrders(chatId);
      break;
    case 'make_order':
      handleMakeOrder(chatId);
      break;
    case 'view_products':
      handleViewProducts(chatId);
      break;
    case 'delete_order':
      handleDeleteOrder(chatId);
      break;
    default:
      bot.sendMessage(chatId, 'Noto‘g ‘ri buyruq. Iltimos, qayta urinib ko‘ring.');
  }
  bot.answerCallbackQuery(id);
});

const handleRegister = (chatId) => {
  bot.sendMessage(chatId, 'Iltimos, ismingizni kiriting:');
  bot.once('message', (msg) => {
    const name = msg.text;
    bot.sendMessage(chatId, 'Telefon raqamingizni kiriting:');
    bot.once('message', (msg) => {
      const phone = msg.text;
      const users = readData().users;
      const existingUser = users.find((u) => u.phone === phone);

      if (existingUser) {
        bot.sendMessage(chatId, 'Ushbu telefon raqami allaqachon ro‘yxatdan o‘tgan.');
        return;
      }

      bot.sendMessage(chatId, 'Parol kiriting:');
      bot.once('message', (msg) => {
        const password = msg.text;
        // Create new user object
        const newUser = { name, phone, password, role: 'user' };
        const data = readData();
        data.users.push(newUser);
        writeData(data);
        bot.sendMessage(chatId, `Ro‘yxatdan o‘tinganligingizni tasdiqlaymiz, ${name}! Endi tizimga kirishingiz mumkin.`);
        // Redirect to login screen
        handleLogin(chatId);
      });
    });
  });
};


// Functions
const handleLogin = (chatId) => {
  bot.sendMessage(chatId, 'Login uchun telefon raqamingizni yuboring:');
  bot.once('message', (msg) => {
    const phone = msg.text;
    const users = readData().users;
    const user = users.find((u) => u.phone === phone);

    if (user) {
      bot.sendMessage(chatId, 'Parolingizni kiriting:');
      bot.once('message', (msg) => {
        const password = msg.text;
        if (user.password === password) {
          showDashboard(chatId, user);
        } else {
          bot.sendMessage(chatId, 'Noto‘g‘ri parol. Iltimos, qayta urinib ko‘ring.');
        }
      });
    } else {
      bot.sendMessage(chatId, 'Telefon raqami topilmadi. Iltimos, avval ro‘yxatdan o‘ting.');
    }
  });
};

const showDashboard = (chatId, user) => {
  const keyboard = user.role === 'admin'
    ? [
        [{ text: 'Mahsulotlarni boshqarish', callback_data: 'manage_products' }],
        [{ text: 'Buyurtmalarni boshqarish', callback_data: 'manage_orders' }],
      ]
    : [
        [{ text: 'Mahsulotlar ro‘yxati', callback_data: 'view_products' }],
        [{ text: 'Buyurtma berish', callback_data: 'make_order' }],
      ];
  bot.sendMessage(
    chatId,
    `Xush kelibsiz, ${user.name}! Dashboardga kirish uchun quyidagi tugmalardan birini tanlang:`,
    { reply_markup: { inline_keyboard: keyboard } }
  );
};

const showProductManagement = (chatId) => {
  bot.sendMessage(chatId, 'Mahsulotlarni boshqarish uchun quyidagi buyruqlarni kiriting:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Yangi mahsulot qo‘shish', callback_data: 'add_product' }],
        [{ text: 'Mahsulotni o‘zgartirish', callback_data: 'update_product' }],
        [{ text: 'Mahsulotni o‘chirish', callback_data: 'delete_product' }],
      ],
    },
  });
};

const handleAddProduct = (chatId) => {
  bot.sendMessage(chatId, 'Mahsulot nomini kiriting:');
  bot.once('message', (msg) => {
    const name = msg.text;
    bot.sendMessage(chatId, 'Mahsulot narxini kiriting:');
    bot.once('message', (msg) => {
      const price = parseFloat(msg.text);
      if (isNaN(price)) {
        bot.sendMessage(chatId, 'Iltimos, narxni to‘g‘ri kiriting.');
        return;
      }
      const data = readData();
      data.products.push({ name, price });
      writeData(data);
      bot.sendMessage(chatId, `Mahsulot qo‘shildi: ${name} - ${price} so‘m.`);
    });
  });
};

const handleUpdateProduct = (chatId) => {
  bot.sendMessage(chatId, 'Mahsulotni o‘zgartirish uchun nomini kiriting:');
  bot.once('message', (msg) => {
    const name = msg.text;
    bot.sendMessage(chatId, 'Mahsulotning yangi narxini kiriting:');
    bot.once('message', (msg) => {
      const newPrice = parseFloat(msg.text);
      if (isNaN(newPrice)) {
        bot.sendMessage(chatId, 'Iltimos, narxni to‘g‘ri kiriting.');
        return;
      }
      const data = readData();
      const product = data.products.find((p) => p.name === name);
      if (product) {
        product.price = newPrice;
        writeData(data);
        bot.sendMessage(chatId, `Mahsulot yangilandi: ${name} - ${newPrice} so‘m.`);
      } else {
        bot.sendMessage(chatId, 'Mahsulot topilmadi.');
      }
    });
  });
};

const handleDeleteProduct = (chatId) => {
  bot.sendMessage(chatId, 'Mahsulotni o‘chirish uchun nomini kiriting:');
  bot.once('message', (msg) => {
    const name = msg.text.trim();
    if (!name) {
      bot.sendMessage(chatId, 'Mahsulot nomi kiritilmagan. Iltimos, qaytadan urinib ko‘ring.');
      return;
    }

    const data = readData();
    const index = data.products.findIndex((p) => p.name.toLowerCase() === name.toLowerCase());

    if (index !== -1) {
      const deletedProduct = data.products.splice(index, 1);
      writeData(data);
      bot.sendMessage(chatId, `Mahsulot o‘chirildi: ${deletedProduct[0].name}.`);
    } else {
      bot.sendMessage(chatId, 'Mahsulot topilmadi.');
    }
  });
};

const showOrderManagement = (chatId) => {
  bot.sendMessage(chatId, 'Buyurtmalarni boshqarish uchun quyidagi buyruqlarni kiriting:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Buyurtmalar ro‘yxatini ko‘rish', callback_data: 'view_orders' }],
        [{ text: 'Buyurtmani o‘chirish', callback_data: 'delete_order' }],
      ],
    },
  });
};

const handleViewOrders = (chatId) => {
  const orders = readData().orders;
  if (orders.length === 0) {
    bot.sendMessage(chatId, 'Hozirda buyurtmalar yo‘q.');
  } else {
    const orderList = orders.map(o => `Buyurtma ID: ${o.id}
Foydalanuvchi: ${o.user}
Mahsulot: ${o.product}
Miqdor: ${o.quantity}`).join('\n\n');
    bot.sendMessage(chatId, `Buyurtmalar ro‘yxati:\n\n${orderList}`);
  }
};

const handleMakeOrder = (chatId) => {
  const products = readData().products;
  if (products.length === 0) {
    bot.sendMessage(chatId, 'Hozirda mahsulotlar mavjud emas.');
    return;
  }

  const productOptions = products.map((p, index) => [{ text: p.name, callback_data: `product_${index}` }]);
  bot.sendMessage(chatId, 'Buyurtma berish uchun mahsulotni tanlang:', {
    reply_markup: { inline_keyboard: productOptions },
  });
};

bot.on('callback_query', (callbackQuery) => {
  const { data } = callbackQuery;
  const chatId = callbackQuery.message.chat.id;

  if (data.startsWith('product_')) {
    const productIndex = parseInt(data.split('_')[1]);
    const product = readData().products[productIndex];
    bot.sendMessage(chatId, `Mahsulot: ${product.name} - ${product.price} so‘m.\nMiqdorni kiriting:`);
    bot.once('message', (msg) => {
      const quantity = parseInt(msg.text);
      if (isNaN(quantity) || quantity <= 0) {
        bot.sendMessage(chatId, 'Iltimos, miqdorni to‘g‘ri kiriting.');
        return;
      }
      const order = { id: Date.now(), user: msg.from.first_name, product: product.name, quantity };
      const data = readData();
      data.orders.push(order);
      writeData(data);
      bot.sendMessage(chatId, `Buyurtma qabul qilindi: ${product.name} x ${quantity}`);
      bot.sendMessage(chatId, `${product.name}ni umumiy narxi ${product.price * quantity}`);
    });
  }
});

const handleViewProducts = (chatId) => {
  const products = readData().products;
  if (products.length === 0) {
    bot.sendMessage(chatId, 'Hozirda mahsulotlar mavjud emas.');
  } else {
    const productList = products.map(p => `${p.name} - ${p.price} so‘m`).join('\n');
    bot.sendMessage(chatId, `Mahsulotlar ro‘yxati:\n\n${productList}`);
  }
};

const handleDeleteOrder = (chatId) => {
  const orders = readData().orders;
  if (orders.length === 0) {
    bot.sendMessage(chatId, 'Hozirda buyurtmalar mavjud emas.');
    return;
  }

  const orderOptions = orders.map((o, index) => [{
    text: `Buyurtma ID: ${o.id} - ${o.product}`,
    callback_data: `order_${index}`
  }]);

  bot.sendMessage(chatId, 'O‘chirish uchun buyurtmani tanlang:', {
    reply_markup: { inline_keyboard: orderOptions },
  });
};


bot.on('callback_query', (callbackQuery) => {
  const { data } = callbackQuery;
  const chatId = callbackQuery.message.chat.id;

  if (data.startsWith('order_')) {
    const orderIndex = parseInt(data.split('_')[1]);
    const deletedOrder = readData().orders.splice(orderIndex, 1);
    writeData(data);
    bot.sendMessage(chatId, `Buyurtma o‘chirildi: ${deletedOrder[0].id}`);
  }
});
