// JavaScript source code
document.addEventListener("DOMContentLoaded", function () {
    const toggleAdmin = document.getElementById("toggleAdmin");
    const adminFields = document.getElementById("adminFields");
    const loginForm = document.getElementById("loginForm");

    toggleAdmin.addEventListener("click", function (event) {
        event.preventDefault(); // Evita il ricaricamento della pagina
        if (adminFields.style.display === "none" || adminFields.style.display === "") {
            adminFields.style.display = "block";
            toggleAdmin.textContent = "Accedi come utente normale";
            loginForm.action = "../../Backend/loginAdministrator.php";
        } else {
            adminFields.style.display = "none";
            toggleAdmin.textContent = "Accedi come amministratore";
            loginForm.action = "../../Backend/login.php";
        }
    });
});
