

-------------------

`;

    let total = 0;

    const { data: products } = await db
        .from("products")
        .select("*");
            for (const [id, qty] of Object.entries(cart)) {

        const product = products.find(p => String(p.id) === String(id));

        if (!product) continue;

        const sum = product.price * qty;

        total += sum;

        await db.from("order_items").insert({
            order_id: orderData.id,
            product_id: id,
            quantity: qty,
            price: product.price
        });

        await db.rpc("decrease_stock", {
            product_id: id,
            qty: qty
        });

        text += `• ${product.name} × ${qty} = ${sum} ₴\n`;
    }

    text += `\nРазом: ${total} ₴`;
        try {

        const res = await fetch("https://chystodim-server.onrender.com/order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text })
        });

        const result = await res.json();

        if (result.success) {

            localStorage.removeItem("chystodim_cart");

            alert("Замовлення оформлено 🎉");

            location.href = "index.html";

        } else {

            alert("Помилка Telegram");

            confirmOrderBtn.disabled = false;
            confirmOrderBtn.textContent = "Підтвердити замовлення";

        }

    } catch (e) {

        console.error(e);

        alert("Помилка сервера");

        confirmOrderBtn.disabled = false;
        confirmOrderBtn.textContent = "Підтвердити замовлення";

    }

}
[
    "customerSurname",
    "customerName",
    "customerFather",
    "customerPhone",
    "deliveryMethod",
    "customerBranch",
    "customerCity"
].forEach(id => {

    const field = document.getElementById(id);

    if (!field) return;

    field.addEventListener("input", () => {
        field.classList.remove("error");
    });

    field.addEventListener("change", () => {
        field.classList.remove("error");
    });

});
const deliveryModal = document.getElementById("deliveryModal");
const openDeliveryBtn = document.getElementById("openDeliveryBtn");
const closeDeliveryBtn = document.getElementById("closeDeliveryBtn");

if (deliveryModal && openDeliveryBtn && closeDeliveryBtn) {

    openDeliveryBtn.addEventListener("click", (e) => {
        e.preventDefault();
        deliveryModal.classList.add("active");
    });

    closeDeliveryBtn.addEventListener("click", () => {
        deliveryModal.classList.remove("active");
    });

    deliveryModal.addEventListener("click", (e) => {
        if (e.target === deliveryModal) {
            deliveryModal.classList.remove("active");
        }
    });

}
