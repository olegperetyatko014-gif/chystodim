const resetForm = document.getElementById("resetForm");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const resetMessage = document.getElementById("resetMessage");

function showMessage(text, isSuccess){
    resetMessage.textContent = text;
    resetMessage.classList.toggle("success", !!isSuccess);
    resetMessage.classList.add("show");
}

[newPasswordInput, confirmPasswordInput].forEach(field => {
    field.addEventListener("input", () => {
        field.classList.remove("error");
    });
});

// Supabase кладе токен відновлення в URL і сама створює сесію користувача
db.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") {
        showMessage("Введіть новий пароль нижче", true);
    }
});

resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = newPasswordInput.value;
    const confirm = confirmPasswordInput.value;

    if (!password || !confirm) {
        if (!password) newPasswordInput.classList.add("error");
        if (!confirm) confirmPasswordInput.classList.add("error");
        showMessage("Будь ласка, заповніть усі поля", false);
        return;
    }

    if (password.length < 6) {
        newPasswordInput.classList.add("error");
        showMessage("Пароль має містити щонайменше 6 символів", false);
        return;
    }

    if (password !== confirm) {
        newPasswordInput.classList.add("error");
        confirmPasswordInput.classList.add("error");
        showMessage("Паролі не збігаються", false);
        return;
    }

    const submitBtn = resetForm.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Зберігаємо...";

    const { error } = await db.auth.updateUser({ password });

    if (error) {
        showMessage(error.message, false);
        submitBtn.disabled = false;
        submitBtn.textContent = "Зберегти пароль";
        return;
    }

    showMessage("Пароль успішно змінено! Перенаправляємо на вхід...", true);

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1500);
});