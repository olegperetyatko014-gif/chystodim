const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "20kb" }));

// Захист від спаму замовленнями:
// максимум 5 запитів з однієї IP-адреси за 1 хвилину
const orderLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: "Забагато запитів. Спробуйте пізніше."
    }
});

app.post("/order", orderLimiter, async (req, res) => {
    const { text } = req.body;

    // Перевірка отриманих даних
    if (
        typeof text !== "string" ||
        text.trim().length === 0 ||
        text.length > 4000
    ) {
        return res.status(400).json({
            success: false,
            error: "Некоректне замовлення"
        });
    }

    try {
        const chatIds = [
            "1987865626",
            "5497736440"
        ];

        for (const chatId of chatIds) {
            const response = await fetch(
                `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: text
                    })
                }
            );

            const result = await response.json();

            console.log(chatId, result);

            if (!response.ok || !result.ok) {
                throw new Error("Помилка Telegram API");
            }
        }

        return res.json({
            success: true
        });

    } catch (error) {
        console.error("ORDER SERVER ERROR:", error);

        return res.status(500).json({
            success: false,
            error: "Помилка сервера"
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
