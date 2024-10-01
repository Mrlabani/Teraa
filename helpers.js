// helpers.js
const axios = require('axios');
const bot = require('./bot');

const teraboxDomains = [
    "www.mirrobox.com", "www.nephobox.com", "freeterabox.com", "www.freeterabox.com", "1024tera.com",
    "4funbox.co", "www.4funbox.com", "teraboxlink.com", "terasharelink.com", "terabox.app", "terabox.com",
    "www.terabox.app", "terabox.fun", "www.terabox.com", "www.1024tera.com", "www.momerybox.com",
    "teraboxapp.com", "momerybox.com", "tibibox.com", "www.teraboxshare.com", "www.teraboxapp.com"
];

// Function to validate TeraBox links
const isTeraboxLink = (link) => {
    return teraboxDomains.some(domain => link.includes(domain));
};

// Check if a user is subscribed to the updates channel
const checkSubscription = async (userId, updatesChannel) => {
    try {
        const chatMember = await bot.getChatMember(updatesChannel, userId);
        return chatMember.status === 'member' || chatMember.status === 'administrator' || chatMember.status === 'creator';
    } catch (error) {
        console.error(error);
        return false;
    }
};

// Fetch download URL from TeraBox API
const processTeraboxLink = async (link) => {
    try {
        const response = await axios.get(`https://tera.ronok.workers.dev/?link=${link}&apikey=45f4ed14a9e10627e5697301507c1363b03ef82a`);
        return response.data.url;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to process the TeraBox link');
    }
};

module.exports = {
    isTeraboxLink,
    checkSubscription,
    processTeraboxLink,
};
