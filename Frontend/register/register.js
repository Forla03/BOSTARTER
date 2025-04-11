document.getElementById("registerForm").addEventListener("submit", function (event) {
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;
    let adminCheckbox = document.getElementById("admin");

    if (password !== confirmPassword) {
        alert("Le password non coincidono!");
        event.preventDefault(); 
        return;
    }

    if(adminCheckbox.checked) {
        let adminCode = document.querySelector("input[name='adminCode']");  
        let adminCodePattern = /^\d{5}$/;
        if (!adminCode || !adminCodePattern.test(adminCode.value)) {
            alert("Il codice admin deve essere di 5 cifre!");
            event.preventDefault(); 
            return;
        }

    }

    alert("Registrazione completata con successo!");
});

document.addEventListener("DOMContentLoaded", function () {
    let adminCheckbox = document.getElementById("admin");
    adminCheckbox.addEventListener("change", function () {

        if (adminCheckbox.checked) {

            let adminLabel = document.createElement("label");
            adminLabel.setAttribute("for", "adminCode");
            adminLabel.textContent = "Codice Admin";

            let adminCode = document.createElement("input");
            adminCode.type = "text";
            adminCode.name = "adminCode";
            adminCode.id = "adminCode"; 
            adminCode.required = true;
            adminCode.placeholder = "Codice Admin (5 cifre)";

            let luogoNascitaField = document.getElementById("luogo_nascita");
            luogoNascitaField.parentNode.insertBefore(adminLabel, luogoNascitaField.nextSibling);
            adminLabel.parentNode.insertBefore(adminCode, adminLabel.nextSibling);

        } else {
            let adminLabel = document.querySelector("label[for='adminCode']");
            let adminCode = document.getElementById("adminCode");
            if (adminLabel) adminLabel.parentNode.removeChild(adminLabel);
            if (adminCode) adminCode.parentNode.removeChild(adminCode);
        }
    });
});