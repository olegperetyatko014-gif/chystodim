const SUPABASE_URL = "https://misjubvcloitgtyyximr.supabase.co";
const SUPABASE_KEY = "sb_publishable_tjERGfE2aVnK-LWT_GxbWQ_qUgXq9-o";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const cart = JSON.parse(localStorage.getItem("chystodim_cart")) || {};

const checkoutItems = document.getElementById("checkoutItems");
const checkoutCount = document.getElementById("checkoutCount");
const checkoutTotal = document.getElementById("checkoutTotal");

async function loadCheckout() {

    if (Object.keys(cart).length === 0) {
        checkoutItems.innerHTML = "<p>Кошик порожній.</p>";
        checkoutCount.textContent = "0";
        checkoutTotal.textContent = "0 ₴";
        return;
    }

    const { data: products, error } = await db
        .from("products")
        .select("*");

    if (error) {
        console.error(error);
        checkoutItems.innerHTML = "<p>Помилка завантаження.</p>";
        return;
    }

    let total = 0;
    let count = 0;

    checkoutItems.innerHTML = "";

    for (const [id, qty] of Object.entries(cart)) {

        const product = products.find(p => String(p.id) === String(id));

        if (!product) continue;

        total += product.price * qty;
        count += qty;

        checkoutItems.innerHTML += `
            <div class="checkout-item">

                <img class="checkout-image"
                     src="${product.image}"
                     alt="${product.name}">

                <div class="checkout-info">
                    <h4>${product.name}</h4>
                    <div>${qty} × ${product.price} ₴</div>
                </div>

                <div>
                    ${product.price * qty} ₴
                </div>

            </div>
        `;
    }

    checkoutCount.textContent = count;
    checkoutTotal.textContent = total + " ₴";
}

loadCheckout();
const confirmOrderBtn = document.getElementById("confirmOrderBtn");

confirmOrderBtn.addEventListener("click", sendOrder);

async function sendOrder() {

    const surname = document.getElementById("customerSurname").value.trim();
    const name = document.getElementById("customerName").value.trim();
    const father = document.getElementById("customerFather").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();
    const email = document.getElementById("customerEmail").value.trim();
    const delivery = document.getElementById("deliveryMethod").value;
    const branch = document.getElementById("customerBranch").value.trim();
    const city = document.getElementById("customerCity").value.trim();
    const comment = document.getElementById("customerComment").value.trim();

    const requiredFields = [
    "customerSurname",
    "customerName",
    "customerFather",
    "customerPhone",
    "deliveryMethod",
    "customerBranch",
    "customerCity"
];

let valid = true;

requiredFields.forEach(id => {
    const field = document.getElementById(id);

    if (!field.value.trim()) {
        field.classList.add("error");
        valid = false;
    } else {
        field.classList.remove("error");
    }
});

if (!valid) return;

    confirmOrderBtn.disabled = true;
    confirmOrderBtn.textContent = "Оформлення...";
        const { data: orderData, error: orderError } = await db
        .from("orders")
        .insert({
            customer_name: `${surname} ${name} ${father}`,
            customer_phone: phone,
            customer_email: email,
            customer_city: city,
            delivery: delivery,
            branch: branch,
            comment: comment
        })
        .select()
        .single();

    if (orderError) {
console.log(orderError);
alert(JSON.stringify(orderError));
        confirmOrderBtn.disabled = false;
        confirmOrderBtn.textContent = "Підтвердити замовлення";
        return;
    }
        let text = `🛒 НОВЕ ЗАМОВЛЕННЯ

Прізвище: ${surname} 
Ім'я: ${name} 
По-батькові: ${father}
Телефон: ${phone}
Email: ${email}

Місто: ${city}
Пошта: ${delivery}
Віділення: ${branch}

Коментар: ${comment}

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
