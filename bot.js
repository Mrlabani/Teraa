// bot.js
const TelegramBot = require('node-telegram-bot-api');
const { getUsersCollection } = require('./db');
const { isTeraboxLink, checkSubscription, processTeraboxLink } = require('./helpers');

const token = process.env.BOT_TOKEN;
const updatesChannel = process.env.OP_CHANNEL;
const bot = new TelegramBot(token, { polling: true });

const sendStartMessage = (chatId) => {
    bot.sendPhoto(chatId, 'https://i.ibb.co/pQjpkxd/366bccb7f35f.jpg', {
        caption: `👋 *Welcome to TeraBox Video Player Bot!*\n\n*Paste your TeraBox link and watch your video instantly—no TeraBox app needed!*\n\nPlease subscribe to our [Updates Channel](https://t.me/NOOBPRIVATE) and click /start again to begin using the bot.`,
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Join Channel to Use Me', url: 'https://t.me/NOOBPrivate' }],
                [{ text: 'How to use Bot', url: 'https://t.me/NOOBPV_BOT?start=Y29weV8tMTAwMjIxMzEzMDM2Nl8xMzk4XzEzOTg=' }]
            ]
        }
    });
};

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const isSubscribed = await checkSubscription(chatId, updatesChannel);
        if (isSubscribed) {
            bot.sendPhoto(chatId, 'https://i.ibb.co/GWLD0nX/214876ed20b5.jpg', {
                caption: `🎉 *Welcome back!* 😊\n\n*Send a TeraBox link to watch or download your video.* 🍿`,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [{ text: "Any Help?", url: "https://t.me/l_abani" }]
                }
            });
        } else {
            sendStartMessage(chatId);
        }
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, `❌ *An error occurred. Please try again later.*`);
    }
});

bot.onText(/\/stat/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const usersCollection = getUsersCollection();
        const userCount = await usersCollection.countDocuments();
        const linkCount = await usersCollection.aggregate([
            { $unwind: "$links" },
            { $count: "count" }
        ]).toArray();

        bot.sendPhoto(chatId, 'https://i.ibb.co/pQjpkxd/366bccb7f35f.jpg', {
            caption: `📊 *Current Bot Stats:*\n\n👥 *Total Users:* ${userCount}\n🔗 *Links Processed:* ${linkCount[0]?.count || 0}`,
            parse_mode: 'Markdown',
        });
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, `❌ *An error occurred while retrieving statistics.*`);
    }
});

bot.onText(/\/broad (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const broadcastMessage = match[1];

    const ownerId = process.env.OWNER_ID;
    if (chatId.toString() !== ownerId) {
        bot.sendMessage(chatId, `❌ *You do not have permission to use this command.*`);
        return;
    }

    try {
        const usersCollection = getUsersCollection();
        const users = await usersCollection.find().toArray();
        for (const user of users) {
            bot.sendMessage(user._id.toString(), `📢 *Broadcast Message:*\n\n${broadcastMessage}`).catch(console.error);
        }
        bot.sendMessage(chatId, `✅ *Broadcast message sent to all users.*`);
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, `❌ *An error occurred while sending the broadcast message.*`);
    }
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text.startsWith('/start') || text.startsWith('/stat') || text.startsWith('/broad')) {
        return;
    }

    try {
        const isSubscribed = await checkSubscription(chatId, updatesChannel);
        if (!isSubscribed) {
            sendStartMessage(chatId);
            return;
        }

        if (!isTeraboxLink(text)) {
            bot.sendMessage(chatId, `❌ *That is not a valid TeraBox link.*`);
            return;
        }

        const downloadUrl = await processTeraboxLink(text);
        bot.sendPhoto(chatId, 'https://i.ibb.co/GWLD0nX/214876ed20b5.jpg', {
            caption: `✅ *Your video is ready!*\n\n📥 *Click the button below to view or download it.*`,
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[{ text: 'ᢱ Watch/Download ⎙', url: downloadUrl }]]
            }
        });
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, `❌ *An error occurred. Please try again later.*`);
    }
});

module.exports = bot;
