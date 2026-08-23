const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");

registerBtn.addEventListener("click", () => {
    container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
    container.classList.remove("active");
});

const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

if (showRegister) {
    showRegister.addEventListener("click", (e) => {
        e.preventDefault();
        container.classList.add("active");
    });
}

if (showLogin) {
    showLogin.addEventListener("click", (e) => {
        e.preventDefault();
        container.classList.remove("active");
    });
}
// ===== Валідація без alert =====

function validateFields(ids, messageEl, emptyText){
    let valid = true;

    ids.forEach(id => {
        const field = document.getElementById(id);
        if (!field.value.trim()) {
            field.classList.add("error");
            valid = false;
        } else {
            field.classList.remove("error");
        }
    });

    messageEl.classList.remove("success");

    if (!valid) {
        messageEl.textContent = emptyText;
        messageEl.classList.add("show");
    } else {
        messageEl.textContent = "";
        messageEl.classList.remove("show");
    }

    return valid;
}

function clearFieldError(id, messageEl){
    const field = document.getElementById(id);
    if (!field) return;
    const clear = () => {
        field.classList.remove("error");
        if (![...document.querySelectorAll(`#${field.form.id} input`)].some(i => i.classList.contains("error"))) {
            messageEl.textContent = "";
            messageEl.classList.remove("show");
        }
    };
    field.addEventListener("input", clear);
    field.addEventListener("change", clear);
}

const signupMessage = document.getElementById("signupMessage");
const loginMessage = document.getElementById("loginMessage");

["signupName", "signupEmail", "signupPassword"].forEach(id => clearFieldError(id, signupMessage));
["loginEmail", "loginPassword"].forEach(id => clearFieldError(id, loginMessage));

// ===== Реєстрація =====

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    if (!validateFields(["signupName", "signupEmail", "signupPassword"], signupMessage, "Будь ласка, заповніть усі поля")) {
        return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        document.getElementById("signupEmail").classList.add("error");
        signupMessage.textContent = "Введіть коректну email адресу";
        signupMessage.classList.add("show");
        return;
    }

    if (password.length < 6) {
        document.getElementById("signupPassword").classList.add("error");
        signupMessage.textContent = "Пароль має містити щонайменше 6 символів";
        signupMessage.classList.add("show");
        return;
    }

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

    if (error) {
        signupMessage.textContent = error.message;
        signupMessage.classList.add("show");
        return;
    }

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

    if (!validateFields(["loginEmail", "loginPassword"], loginMessage, "Будь ласка, заповніть усі поля")) {
        return;
    }

    const { data, error } = await db.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
    console.log(error);
    loginMessage.classList.remove("success");
    loginMessage.textContent = error.message;
    loginMessage.classList.add("show");
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

if (profile?.role === "admin") {
    window.location.href = "admin.html";
} else {
    window.location.href = "index.html";
}
});

// ===== Забули пароль =====

const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const loginEmailInput = document.getElementById("loginEmail");

forgotPasswordBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const email = loginEmailInput.value.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        loginEmailInput.classList.add("error");
        loginMessage.textContent = "Спочатку введіть свій email у полі вище";
        loginMessage.classList.add("show");
        return;
    }

    loginMessage.textContent = "Надсилаємо лист...";
    loginMessage.classList.add("show");

    const { error } = await db.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password.html"
    });

    if (error) {
        loginMessage.textContent = error.message;
        loginMessage.classList.add("show");
        return;
    }

    loginMessage.classList.add("success");
    loginMessage.textContent = "Лист для відновлення пароля надіслано на " + email;
    loginMessage.classList.add("show");
});
