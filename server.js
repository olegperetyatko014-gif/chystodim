const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.post("/order", async (req, res) => {
    const { text } = req.body;

    try {

        const chatIds = [
            "1987865626",
            "5497736440"
        ];

        for (const chatId of chatIds) {
            const response = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        chat_id: chatId,
        text: text
    })
});

const result = await response.json();
console.log(chatId, result);
