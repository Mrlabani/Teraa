// db.js
const { MongoClient } = require('mongodb');

const mongoUri = process.env.MONGODB_URI;
const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
let db, usersCollection;

const initDb = async () => {
    try {
        await client.connect();
        db = client.db('telegramBot');
        usersCollection = db.collection('users');
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
};

const getUsersCollection = () => usersCollection;

module.exports = {
    initDb,
    getUsersCollection,
};
