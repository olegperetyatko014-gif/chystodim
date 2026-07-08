app.post("/order", async (req, res) => {
    const { text } = req.body;

    try {

        const chatIds = [
            "1987865626",
            "7204226375"
        ];

        for (const chatId of chatIds) {
            await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text
                })
            });
        }

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});
