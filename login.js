
const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");

registerBtn.addEventListener("click", () => {
    container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
    container.classList.remove("active");
});
// ===== Реєстрація =====

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    const { data, error } = await db.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: name
            }
        }
    });

    console.log("DATA:", data);
console.log("ERROR:", error);

    alert("✅ Акаунт успішно створено!");
});
// ===== Вхід =====

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    console.log("Email:", email);
console.log("Password:", password);

    const { data, error } = await db.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
    console.log(error);
    alert(error.message);
    return;
}

    const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

console.log("UID користувача:", data.user.id);

console.log("PROFILE:", profile);

console.log("ERROR:", profileError);

alert(
    "UID: " + data.user.id +
    "\nPROFILE: " + JSON.stringify(profile) +
    "\nERROR: " + JSON.stringify(profileError)
);

if (profile?.role === "admin") {
    console.log("ADMIN");
    alert("Переходимо в адмінку");
    window.location.href = "admin.html";
} else {
    alert("Звичайний користувач");
    window.location.href = "index.html";
}
});