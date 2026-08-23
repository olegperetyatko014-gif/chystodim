// ===== Довідник категорій/підкатегорій сайту =====

const CATEGORIES = {
    laundry:     { label: "Прання",      subcats: { powder:"Порошки", capsules:"Капсули", gels:"Гелі", conditioner:"Кондиціонери", "stain-remover":"Плямовивідники" } },
    cleaning:    { label: "Прибирання",  subcats: { kitchen:"Для кухні", bathroom:"Для ванної", toilet:"Для туалету", cloths:"Ганчірки і серветки", home:"Для дому" } },
    care:        { label: "Догляд",      subcats: { shaving:"Для гоління", hair:"Для волосся", body:"Для тіла", dental:"Зубний догляд", deodorant:"Дезодоранти" } },
    hygiene:     { label: "Гігієна",     subcats: { diapers:"Підгузники", feminine:"Жіноча гігієна", "wet-wipes":"Вологі серветки", "toilet-paper":"Туалетний папір" } },
};

function fillCategorySelect(select){
    select.innerHTML = '<option value="">Оберіть категорію</option>';
    Object.entries(CATEGORIES).forEach(([value, data]) => {
        const opt = document.createElement("option");
        opt.value = value;
        opt.textContent = data.label;
        select.appendChild(opt);
    });
}

function fillSubcategorySelect(select, categoryValue, selectedValue){
    select.innerHTML = '<option value="">Оберіть підкатегорію</option>';
    const cat = CATEGORIES[categoryValue];
    if(!cat) return;
    Object.entries(cat.subcats).forEach(([value, label]) => {
        const opt = document.createElement("option");
        opt.value = value;
        opt.textContent = label;
        if(value === selectedValue) opt.selected = true;
        select.appendChild(opt);
    });
}

function wireCategoryPair(categorySelectId, subcategorySelectId){
    const categorySelect = document.getElementById(categorySelectId);
    const subcategorySelect = document.getElementById(subcategorySelectId);
    if(!categorySelect || !subcategorySelect) return;

    fillCategorySelect(categorySelect);

    categorySelect.addEventListener("change", () => {
        fillSubcategorySelect(subcategorySelect, categorySelect.value);
        subcategorySelect.dispatchEvent(new Event("change"));
    });
}

wireCategoryPair("productCategory", "productSubcategory");
wireCategoryPair("editCategory", "editSubcategory");


// ===== Завантаження фото (drag&drop / вибір файлу) в Supabase Storage =====
// ВАЖЛИВО: у Supabase має бути публічний Storage bucket з назвою "product-images".
// Якщо назвав його інакше — зміни значення STORAGE_BUCKET нижче.

const STORAGE_BUCKET = "product-images";

// ===== Автоматичне прибирання фону (@imgly/background-removal) =====
// Працює повністю в браузері (без сервера). Бібліотека вантажиться лише
// тоді, коли людина реально натискає кнопку "Вирізати фон".

let bgRemovalLib = null;

async function loadBgRemovalLib(){
    if(bgRemovalLib) return bgRemovalLib;
    // Transformers.js (Hugging Face) — офіційний, стабільний пайплайн
    // "background-removal", не потребує окремих peer-залежностей.
    const mod = await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1");
    const segmenter = await mod.pipeline("background-removal", "onnx-community/BEN2-ONNX");
    bgRemovalLib = segmenter;
    return bgRemovalLib;
}

function setupBgRemovalButton(btnId, urlInputId, previewImgId, dropzoneId){

    const btn = document.getElementById(btnId);
    const urlInput = document.getElementById(urlInputId);
    const previewImg = document.getElementById(previewImgId);
    const dropzone = document.getElementById(dropzoneId);

    if(!btn || !urlInput) return;

    btn.addEventListener("click", async () => {

        const currentUrl = urlInput.value.trim();

        if(!currentUrl){
            alert("Спочатку завантаж або вкажи фото");
            return;
        }

        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Вирізаємо фон (перший раз довше)...';

        try{

            const segmenter = await loadBgRemovalLib();
            const output = await segmenter(currentUrl);
            const resultBlob = await output[0].toBlob();

            const fileName = `${Date.now()}-no-bg.png`;
            const resultFile = new File([resultBlob], fileName, { type: "image/png" });

            const { data, error } = await db.storage
                .from(STORAGE_BUCKET)
                .upload(fileName, resultFile, { cacheControl: "3600", upsert: false });

            if(error){
                alert("Не вдалося зберегти фото без фону: " + error.message);
                return;
            }

            const { data: publicUrlData } = db.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(data.path);

            urlInput.value = publicUrlData.publicUrl;
            urlInput.dispatchEvent(new Event("input"));
            urlInput.dispatchEvent(new Event("change"));

            if(previewImg) previewImg.src = publicUrlData.publicUrl;
            if(dropzone) dropzone.classList.add("has-preview");

        } catch(bgError){
            console.error(bgError);
            alert("Не вдалося вирізати фон: " + bgError.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }

    });

}

function setupImageDropzone(dropzoneId, fileInputId, urlInputId, previewImgId, removeBgBtnId, progressId, progressTextId){

    const dropzone = document.getElementById(dropzoneId);
    const fileInput = document.getElementById(fileInputId);
    const urlInput = document.getElementById(urlInputId);
    const previewImg = document.getElementById(previewImgId);
    const removeBgBtn = document.getElementById(removeBgBtnId);
    const progressEl = document.getElementById(progressId);
    const progressText = document.getElementById(progressTextId);

    if(!dropzone || !fileInput || !urlInput) return;

    function showPreview(url){
        previewImg.src = url;
        dropzone.classList.add("has-preview");
        if(removeBgBtn) removeBgBtn.style.display = "flex";
    }

    // якщо посилання вже вписане вручну — теж покажемо прев'ю
    urlInput.addEventListener("input", () => {
        if(urlInput.value.trim()){
            showPreview(urlInput.value.trim());
        } else {
            dropzone.classList.remove("has-preview");
            if(removeBgBtn) removeBgBtn.style.display = "none";
        }
    });

    async function uploadFile(file){

        if(!file || !file.type.startsWith("image/")){
            alert("Можна завантажувати лише зображення");
            return;
        }

        dropzone.classList.add("is-uploading");

        if(progressEl){
            progressEl.style.display = "flex";
            progressText.textContent = "Завантажуємо...";
        }

        const safeName = file.name
            .toLowerCase()
            .replace(/[^a-z0-9.]+/g, "-");

        const filePath = `${Date.now()}-${safeName}`;

        const { data, error } = await db.storage
            .from(STORAGE_BUCKET)
            .upload(filePath, file, { cacheControl: "3600", upsert: false });

        dropzone.classList.remove("is-uploading");
        if(progressEl) progressEl.style.display = "none";

        if(error){
            alert("Не вдалося завантажити фото: " + error.message);
            console.error(error);
            return;
        }

        const { data: publicUrlData } = db.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(data.path);

        const publicUrl = publicUrlData.publicUrl;

        urlInput.value = publicUrl;
        urlInput.dispatchEvent(new Event("input"));
        urlInput.dispatchEvent(new Event("change"));

        showPreview(publicUrl);

    }

    dropzone.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", () => {
        if(fileInput.files[0]) uploadFile(fileInput.files[0]);
    });

    ["dragenter", "dragover"].forEach(evt => {
        dropzone.addEventListener(evt, (e) => {
            e.preventDefault();
            dropzone.classList.add("is-dragover");
        });
    });

    ["dragleave", "drop"].forEach(evt => {
        dropzone.addEventListener(evt, (e) => {
            e.preventDefault();
            dropzone.classList.remove("is-dragover");
        });
    });

    dropzone.addEventListener("drop", (e) => {
        const file = e.dataTransfer.files[0];
        if(file) uploadFile(file);
    });

}

setupImageDropzone("productDropzone", "productImageFile", "productImage", "productDropzonePreview", "productRemoveBgBtn", "productDropzoneProgress", "productDropzoneProgressText");
setupImageDropzone("editDropzone", "editImageFile", "editImage", "editDropzonePreview", "editRemoveBgBtn", "editDropzoneProgress", "editDropzoneProgressText");

setupBgRemovalButton("productRemoveBgBtn", "productImage", "productDropzonePreview", "productDropzone");
setupBgRemovalButton("editRemoveBgBtn", "editImage", "editDropzonePreview", "editDropzone");

const imageInput = document.getElementById("productImage");

// Тільки цифри в полях "Ціна" і "Кількість"
["productPrice", "productStock"].forEach(id => {
    const field = document.getElementById(id);
    if (!field) return;
    field.addEventListener("input", () => {
        field.value = field.value.replace(/[^\d]/g, "");
    });
});

// ===== Жива картка товару =====

function setupLivePreview(){

    const nameInput = document.getElementById("productName");
    const priceInput = document.getElementById("productPrice");
    const categoryInput = document.getElementById("productCategory");
    const volInput = document.getElementById("productVol");
    const badgeInput = document.getElementById("productBadge");
    const stockInput = document.getElementById("productStock");

    if(!nameInput) return;

    // --- елементи адмін-картки ---
    const previewName = document.getElementById("previewName");
    const previewPrice = document.getElementById("previewPrice");
    const previewCategory = document.getElementById("previewCategory");
    const previewVol = document.getElementById("previewVol");
    const previewBadgeAdmin = document.getElementById("previewBadgeAdmin");
    const previewStock = document.getElementById("previewStock");
    const previewNoImageAdmin = document.getElementById("previewNoImageAdmin");
    const imagePreviewAdmin = document.getElementById("imagePreviewAdmin");

    // --- елементи картки як на сайті ---
    const previewNameSite = document.getElementById("previewNameSite");
    const previewPriceSite = document.getElementById("previewPriceSite");
    const previewVolSite = document.getElementById("previewVolSite");
    const previewBadgeSite = document.getElementById("previewBadgeSite");
    const previewNoImageSite = document.getElementById("previewNoImageSite");
    const imagePreviewSite = document.getElementById("imagePreviewSite");
    const previewCartBtn = document.getElementById("previewCartBtn");

    // --- картки ---
    const cardAdmin = document.getElementById("livePreviewCardAdmin");
    const cardSite = document.getElementById("livePreviewCardSite");

    function update(){

        const name = nameInput.value.trim() || "Назва товару";
        const price = priceInput.value.trim();
        const category = CATEGORIES[categoryInput.value]?.label || "Категорія";
        const vol = volInput.value.trim();
        const badge = badgeInput.value.trim();
        const stock = stockInput.value.trim();
        const hasImage = imageInput.value.trim();

        // ===== АДМІН-КАРТКА (з кількістю, БЕЗ сердечка) =====
        previewName.textContent = name;
        previewPrice.textContent = price ? `${price} ₴` : "0 ₴";
        previewCategory.textContent = category;
        previewVol.textContent = vol ? `Об'єм / вага: ${vol}` : "Об'єм / вага";
        previewStock.textContent = `В наявності: ${stock || 0}`;

        if(badge){
            previewBadgeAdmin.textContent = badge;
            previewBadgeAdmin.style.display = "block";
        } else {
            previewBadgeAdmin.style.display = "none";
        }

        if(hasImage){
            imagePreviewAdmin.style.display = "block";
            imagePreviewAdmin.src = imageInput.value;
            previewNoImageAdmin.style.display = "none";
        } else {
            imagePreviewAdmin.style.display = "none";
            previewNoImageAdmin.style.display = "flex";
        }

        // ===== КАРТКА САЙТУ (з сердечком, БЕЗ кількості) =====
        previewNameSite.textContent = name;
        previewPriceSite.textContent = price ? `${price} ₴` : "0 ₴";
        previewVolSite.textContent = vol ? `Об'єм/вага: ${vol}` : "Об'єм/вага: —";

        if(badge){
            previewBadgeSite.textContent = badge;
            previewBadgeSite.style.display = "block";
        } else {
            previewBadgeSite.style.display = "none";
        }

        if(hasImage){
            imagePreviewSite.style.display = "block";
            imagePreviewSite.src = imageInput.value;
            previewNoImageSite.style.display = "none";
        } else {
            imagePreviewSite.style.display = "none";
            previewNoImageSite.style.display = "flex";
        }

        const stockNum = Number(stock) || 0;
        if(stockNum > 0){
            previewCartBtn.textContent = "В кошик";
            previewCartBtn.disabled = false;
        } else {
            previewCartBtn.textContent = "Немає в наявності";
            previewCartBtn.disabled = true;
        }

    }

    [nameInput, priceInput, categoryInput, volInput, badgeInput, stockInput, imageInput].forEach(input => {
        input.addEventListener("input", update);
        input.addEventListener("change", update);
    });

    update();

    // --- перемикач "Вигляд адміна" / "Вигляд сайту" ---
    const switchButtons = document.querySelectorAll(".preview-switch__btn");
    const switchThumb = document.getElementById("previewSwitchThumb");

    switchButtons.forEach((btn, index) => {
        btn.addEventListener("click", () => {

            switchButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            switchThumb.style.transform = `translateX(${index * 100}%)`;

            const view = btn.dataset.view;

            // ПОКАЗУЄМО ПОТРІБНУ КАРТКУ
            if (view === "admin") {
                cardAdmin.style.display = "block";
                cardSite.style.display = "none";
            } else {
                cardAdmin.style.display = "none";
                cardSite.style.display = "block";
            }

        });
    });

    // Спочатку показуємо адмін-картку
    cardAdmin.style.display = "block";
    cardSite.style.display = "none";

    // кнопка "В кошик" у прев'ю нічого не робить — це лише демонстрація
    if (previewCartBtn) {
        previewCartBtn.addEventListener("click", (e) => {
            e.preventDefault();
        });
    }

}

setupLivePreview();

["productName", "productPrice", "productCategory", "productVol", "productStock"].forEach(id => {
    const field = document.getElementById(id);
    if (!field) return;
    field.addEventListener("input", () => field.classList.remove("error"));
});

async function checkAdmin() {

    const { data: sessionData, error } = await db.auth.getSession();

    console.log("SESSION:", sessionData);
    console.log("ERROR:", error);

    const session = sessionData.session;

    if (!session) {
        console.log("Немає сесії");
        location.href = "login.html";
        return;
    }

    const user = session.user;

    const { data: profile, error: profileError } = await db
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    console.log("PROFILE:", profile);
    console.log("PROFILE ERROR:", profileError);

    if (profile?.role !== "admin") {
        console.log("Не адмін");
        location.href = "index.html";
        return;
    }

    console.log("Адмін підтверджений");
}

checkAdmin();


async function logout() {

    await db.auth.signOut();

    location.href = "login.html";

}

async function loadProducts() {

    const { data: products, error } = await db
        .from("products")
        .select("*");

    console.log("PRODUCTS:", products);
    console.log("ERROR:", error);

    const container = document.getElementById("productsList");

    if (error) {
        container.innerHTML = "Помилка завантаження товарів";
        return;
    }

    container.innerHTML = "";

    products.forEach(product => {

        container.innerHTML += `

<article class="product-card">

    <div class="product-card__media">
        ${product.image 
            ? `<img src="${product.image}" class="product-image">`
            : ''}
        ${product.badge ? `<span class="product-card__badge">${product.badge}</span>` : ''}
    </div>

    <div class="product-card__body">

        <span class="product-card__cat">${product.category || ''}</span>

        <h3 class="product-card__title">${product.name}</h3>

        <span class="product-card__vol">Об'єм/вага: ${product.vol || ''}</span>

        <span class="product-card__stock">В наявності: ${product.stock || 0}</span>

        <div class="product-card__footer">
            <span class="product-card__price">${product.price} ₴</span>
            <div style="display:flex;gap:8px">
                <button class="add-btn" onclick="editProduct('${product.id}')">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="add-btn delete-btn" onclick="deleteProduct('${product.id}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>

    </div>

</article>

`;

    });

}

loadProducts();

const addBtn = document.getElementById("addProduct");

addBtn.addEventListener("click", async () => {

    const requiredFields = [
        "productName",
        "productPrice",
        "productCategory",
        "productVol",
        "productStock"
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

    const productName = document.getElementById("productName").value;
    const price = Number(document.getElementById("productPrice").value);
    const category = document.getElementById("productCategory").value;
    const subcategory = document.getElementById("productSubcategory").value;
    const image = document.getElementById("productImage").value;
    const vol = document.getElementById("productVol").value;
    const badge = document.getElementById("productBadge").value;
    const stock = Number(document.getElementById("productStock").value);

    const { data, error } = await db
        .from("products")
        .insert([
            {
                name: productName,
                price: price,
                category,
                subcategory,
                image,
                vol,
                badge,
                stock
            }
        ]);

    console.log("ADD:", data);
    console.log("ERROR:", error);

    if(error){
        alert("Помилка: " + error.message);
        return;
    }

    alert("Товар додано");

    loadProducts();

});

async function deleteProduct(id) {

    const confirmDelete = confirm("Видалити цей товар?");

    if (!confirmDelete) {
        return;
    }

    const { error } = await db
        .from("products")
        .delete()
        .eq("id", id);

    if (error) {
        alert("Помилка: " + error.message);
        console.log(error);
        return;
    }

    

    loadProducts();

}

let editId = null;

async function editProduct(id){

    editId = id;

    const {data: product, error} = await db
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

    if(error){
        alert(error.message);
        return;
    }

    document.getElementById("editName").value = product.name;
    document.getElementById("editPrice").value = product.price;
    document.getElementById("editCategory").value = product.category || "";
    fillSubcategorySelect(document.getElementById("editSubcategory"), product.category, product.subcategory || "");
    document.getElementById("editImage").value = product.image || "";
    document.getElementById("editImage").dispatchEvent(new Event("input"));
    document.getElementById("editVol").value = product.vol || "";
    document.getElementById("editBadge").value = product.badge || "";
    document.getElementById("editStock").value = product.stock || "";

    document.getElementById("editModal").style.display = "flex";

}

async function saveEdit(){

    const {error} = await db
        .from("products")
        .update({
            name: document.getElementById("editName").value,
            price: Number(document.getElementById("editPrice").value),
            category: document.getElementById("editCategory").value,
            subcategory: document.getElementById("editSubcategory").value,
            image: document.getElementById("editImage").value,
            vol: document.getElementById("editVol").value,
            badge: document.getElementById("editBadge").value,
            stock: Number(document.getElementById("editStock").value)
        })
        .eq("id", editId);

    if(error){
        alert(error.message);
        return;
    }

    closeEdit();

    loadProducts();

}

function closeEdit(){

    document.getElementById("editModal").style.display = "none";

}

function openTab(id, btn){

    document.querySelectorAll(".tab-content").forEach(tab=>{
        tab.style.display = "none";
    });

    document.getElementById(id).style.display = "block";

    document.querySelectorAll(".sidebar button, .mobile-nav__item").forEach(button=>{
        button.classList.remove("active-menu");
    });

    document.querySelectorAll(`.sidebar button[onclick*="'${id}'"], .mobile-nav__item[data-tab="${id}"]`).forEach(button=>{
        button.classList.add("active-menu");
    });

}

// ===== ЗАМОВЛЕННЯ (ПЕРЕРОБЛЕНО) =====

let allOrders = [];

async function loadOrders() {

    const { data: orders, error } = await db
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

    console.log("ORDERS:", orders);
    console.log("ERROR:", error);

    if (error) {
        document.getElementById("ordersList").innerHTML = `
            <tr>
                <td colspan="8" style="padding:40px;text-align:center;color:var(--accent);">
                    <i class="fa-solid fa-circle-exclamation" style="font-size:24px;display:block;margin-bottom:10px;"></i>
                    Помилка завантаження: ${error.message}
                </td>
            </tr>
        `;
        return;
    }

    allOrders = orders || [];
    renderOrders(allOrders);

}

function renderOrders(orders) {

    const tbody = document.getElementById("ordersList");

    if (!orders || orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="padding:40px;text-align:center;color:var(--muted);">
                    <i class="fa-solid fa-inbox" style="font-size:32px;display:block;margin-bottom:10px;"></i>
                    Немає замовлень
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = orders.map((order, index) => {

        const date = new Date(order.created_at);
        const formattedDate = date.toLocaleDateString('uk-UA') + ' ' + date.toLocaleTimeString('uk-UA', {hour:'2-digit', minute:'2-digit'});

        let comment = order.comment || '—';
        if (comment.length > 25) {
            comment = comment.slice(0, 25) + '...';
        }

        // СКЛЕЮЄМО ПІБ В ОДИН РЯДОК
        const lastName = order.surname || '';
        const firstName = order.name || '';
        const middleName = order.middle_name || '';
        const fullName = [lastName, firstName, middleName].filter(Boolean).join(' ') || '—';

        return `
            <tr style="border-bottom:1px solid var(--border);transition:background .2s;" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background='transparent'">
                <td style="padding:10px 12px;font-weight:600;color:var(--muted);text-align:center;white-space:nowrap;">${index + 1}</td>
                
                <!-- ПІБ -->
                <td style="padding:10px 12px;font-weight:500;color:var(--text);white-space:normal;max-width:200px;word-break:break-word;">
                    ${fullName}
                </td>

                <!-- Email (замість Телефону) -->
                <td style="padding:10px 12px;color:var(--muted);white-space:nowrap;max-width:160px;overflow:hidden;text-overflow:ellipsis;">${order.email || '—'}</td>

                <td style="padding:10px 12px;font-weight:600;color:var(--text);white-space:nowrap;">${order.total || 0} ₴</td>
                <td style="padding:10px 12px;color:var(--muted);font-size:12px;white-space:nowrap;">${formattedDate}</td>
                <td style="padding:10px 12px;color:var(--muted);font-size:13px;white-space:nowrap;max-width:120px;overflow:hidden;text-overflow:ellipsis;">${order.delivery_method || '—'}</td>
                <td style="padding:10px 12px;color:var(--muted);font-size:13px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${order.comment || ''}">${comment}</td>
                
                <td style="padding:10px 12px;text-align:center;white-space:nowrap;">
                    <button onclick="deleteOrder('${order.id}')" style="padding:6px 10px;border-radius:8px;border:none;background:#FDEDEB;color:var(--accent-dark);cursor:pointer;font-size:13px;transition:all .2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

}

function filterOrders() {

    const status = document.getElementById("filterStatus").value;
    const search = document.getElementById("searchOrders").value.toLowerCase().trim();

    let filtered = allOrders;

    if (status !== 'all') {
        filtered = filtered.filter(order => order.status === status);
    }

    if (search) {
        filtered = filtered.filter(order => 
            (order.surname && order.surname.toLowerCase().includes(search)) ||
            (order.name && order.name.toLowerCase().includes(search)) ||
            (order.middle_name && order.middle_name.toLowerCase().includes(search)) ||
            (order.phone && order.phone.includes(search))
        );
    }

    renderOrders(filtered);

}

async function deleteOrder(id) {

    if (!confirm("Видалити це замовлення?")) return;

    const { error } = await db
        .from("orders")
        .delete()
        .eq("id", id);

    if (error) {
        alert("Помилка: " + error.message);
        return;
    }

    allOrders = allOrders.filter(o => o.id !== id);
    filterOrders();
    showToast("✅ Замовлення видалено");

}

function showToast(message) {
    let toast = document.querySelector('.admin-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'admin-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Завантажуємо замовлення при першому завантаженні
setTimeout(loadOrders, 1000);

// Додаємо завантаження замовлень при відкритті вкладки
const originalOpenTab = window.openTab;
window.openTab = function(id, btn) {
    originalOpenTab(id, btn);
    if (id === 'orders') {
        loadOrders();
    }
};

async function deleteAllOrders() {
    const { data: orders, error } = await db
        .from("orders")
        .select("id");
    
    if (error) {
        alert("Помилка отримання замовлень: " + error.message);
        return;
    }
    
    if (orders.length === 0) {
        alert("Немає замовлень для видалення");
        return;
    }
    
    if (!confirm(`Видалити всі ${orders.length} замовлень? Цю дію не можна скасувати!`)) {
        return;
    }
    
    let deleted = 0;
    for (const order of orders) {
        const { error: deleteError } = await db
            .from("orders")
            .delete()
            .eq("id", order.id);
        
        if (!deleteError) {
            deleted++;
        }
    }
    
    showToast(`✅ Видалено ${deleted} замовлень`);
    loadOrders();
}
