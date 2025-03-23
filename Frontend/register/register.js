document.getElementById("registerForm").addEventListener("submit", function (event) {
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Le password non coincidono!");
        event.preventDefault(); 
        return;
    }

    alert("Registrazione completata con successo!");
});
