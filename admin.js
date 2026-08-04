const imageInput = document.getElementById("productImage");
const imagePreview = document.getElementById("imagePreview");


if(imageInput && imagePreview){

    imageInput.addEventListener("input", ()=>{

        imagePreview.src = imageInput.value;

    });

}
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

</div>


<div class="product-card__body">


<span class="product-card__cat">
${product.category}
</span>


<h3 class="product-card__title">
${product.name}
</h3>


<span class="product-card__vol">
Об'єм/вага: ${product.vol || ''}
</span>
${product.badge ? `
<span class="product-card__badge">
${product.badge}
</span>
` : ''}


<span class="product-card__stock">
В наявності: ${product.stock || 0}
</span>

<div class="product-card__footer">


<span class="product-card__price">
${product.price} ₴
</span>


<div style="display:flex;gap:8px">

<button 
class="add-btn"
onclick="editProduct('${product.id}')">
✏️
</button>


<button 
class="add-btn"
style="background:#e74c3c"
onclick="deleteProduct('${product.id}')">
🗑
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



    const productName = document.getElementById("productName").value;
const price = Number(document.getElementById("productPrice").value);
const category = document.getElementById("productCategory").value;
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


    alert("✅ Товар додано");


    loadProducts();

});
async function deleteProduct(id) {

    const confirmDelete = confirm(
        "Видалити цей товар?"
    );

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


    alert("✅ Товар видалено");


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
    document.getElementById("editCategory").value = product.category;
    document.getElementById("editImage").value = product.image || "";
    document.getElementById("editVol").value = product.vol || "";
    document.getElementById("editBadge").value = product.badge || "";

document.getElementById("editStock").value = product.stock || "";


    document.getElementById("editModal").style.display="flex";

}



async function saveEdit(){

    const {error} = await db
    .from("products")
    .update({

        name: document.getElementById("editName").value,

        price: Number(document.getElementById("editPrice").value),

        category: document.getElementById("editCategory").value,

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

    document.getElementById("editModal").style.display="none";

}
function openTab(id, btn){

    document.querySelectorAll(".tab-content").forEach(tab=>{
        tab.style.display="none";
    });


    document.getElementById(id).style.display="block";


    document.querySelectorAll(".sidebar button").forEach(button=>{
        button.classList.remove("active-menu");
    });


    btn.classList.add("active-menu");

}
