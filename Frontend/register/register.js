document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault(); 
    let formData = new FormData(document.getElementById("registerForm"));
    let responseMessage = ""; 
    try {
        let response = await fetch("/Backend/register.php", {
            method: "POST",
            body: formData,
        });

        let result = await response.json();
        responseMessage = result.message; 
        if (result.success) {
            showPopup(responseMessage);
        } else {
            showPopup(responseMessage);
        }
    } catch (error) {
        responseMessage = "Errore durante la registrazione. Riprova più tardi.";
        showPopup(responseMessage);
    }
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

// Funzioni per il popup
function showPopup(message) {
    document.getElementById('popupMessage').innerText = message;
    document.getElementById('popupOverlay').style.display = 'flex';
}

function closePopup() {
    document.getElementById('popupOverlay').style.display = 'none';
}
