async function loadTexts(){

    const {data,error}=await db
    .from("site_texts")
    .select("*")
    .order("id");


    console.log("TEXTS:",data);
    console.log("ERROR:",error);


    const box=document.getElementById("textsList");


    if(error){
        box.innerHTML="Помилка завантаження";
        return;
    }


    box.innerHTML="";


    data.forEach(item=>{

        box.innerHTML += `

        <div class="text-card">

            <h3>${item.title}</h3>

            <p class="text-preview">
${item.content.substring(0,120)}...
</p>

<button onclick="editText(${item.id})">
✏️ Редагувати
</button>

        </div>

        `;

    });

}
async function editText(id){

    const {data,error}=await db
    .from("site_texts")
    .select("*")
    .eq("id",id)
    .single();

    if(error){
    showToast("❌ " + error.message);
    return;
}

    if(newText === null) return;

    await db
        .from("site_texts")
        .update({
            content:newText
        })
        .eq("id",id);

    loadTexts();

}


loadTexts();



async function saveText(id){

    const content=document
    .getElementById("text-"+id)
    .value;


    const {error}=await db
    .from("site_texts")
    .update({
        content:content
    })
    .eq("id",id);


    if(error){

    showToast("❌ Помилка");
    console.log(error);

}else{

    showToast("✅ Збережено");

}

}
function showToast(message){

    const toast = document.createElement("div");

    toast.className = "admin-toast";

    toast.innerHTML = message;


    document.body.appendChild(toast);


    setTimeout(()=>{

        toast.classList.add("show");

    },50);



    setTimeout(()=>{

        toast.classList.remove("show");


        setTimeout(()=>{

            toast.remove();

        },300);


    },2500);

}