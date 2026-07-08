app.post("/order", async (req, res) => {
    const { text } = req.body;

    try {

        const chatIds = [
    "1987865626",
    "7204226375"
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

    console.log(await response.text());
}
