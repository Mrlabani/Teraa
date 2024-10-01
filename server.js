// server.js
const express = require('express');
const { initDb } = require('./db');
const bot = require('./bot');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('TeraBox Bot is running!');
});

app.listen(port, async () => {
    await initDb();
    console.log(`Server is running on port ${port}`);
});
