document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById("loginBtn");

    // Effettua una richiesta AJAX per controllare lo stato della sessione
    fetch("../../Backend/session.php")
        .then(response => response.json())
        .then(data => {
            if (data.logged_in) {
                // L'utente è loggato: "Logout (nickname)"
                loginBtn.textContent = `Logout (${data.nickname})`;
                loginBtn.addEventListener("click", function () {
                    window.location.href = "/Backend/logout.php";
                });
            } else {
                // L'utente non è loggato:  "Accedi"
                loginBtn.textContent = "Accedi";
                loginBtn.addEventListener("click", function () {
                    window.location.href = "/Frontend/login/login.html";
                });
            }
        })
        .catch(error => console.error("Errore nel recupero dello stato della sessione:", error));
});
