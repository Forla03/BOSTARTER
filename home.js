document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById("loginBtn");

    // Use an AJAX request to check the connection
    fetch("/Backend/session.php")
        .then(response => response.json())
        .then(data => {
            if (data.logged_in) {
                // If the user is logged in display the nickname
                // clicking on the nickname will redirect the user to the account page
                loginBtn.textContent = `${data.nickname}`;
                loginBtn.addEventListener("click", function () {
                    window.location.href = "/Frontend/account/account.html";
                });
            } else {
                // If the user is not logged in display the login button
                loginBtn.textContent = "Accedi";
                loginBtn.addEventListener("click", function () {
                    window.location.href = "/Frontend/login/login.html";
                });
            }
        })
        .catch(error => console.error("Errore nel recupero dello stato della sessione:", error));
});
