document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectName = urlParams.get('nomeProgetto');
    
    let pageTitle = document.getElementById("page-title");
    pageTitle.textContent = `Contribuisci a ${projectName}`;

    let donateButton = document.getElementById("donate-button");
    let donationAmount = document.getElementById("donation-amount");

    donateButton.addEventListener("click", function(){
        let amount = donationAmount.value;
        if (amount <= 0) {
            alert("L'importo deve essere maggiore di zero.");
            return;
        }
        
        // Call the backend to handle the donation
        fetch("../../Backend/project/donate.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ nome_progetto: projectName, importo: amount }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Donazione effettuata con successo!");
            } else {
                alert("Errore nella donazione: " + data.message);
            }
        })
        .catch(error => {
            console.error("Errore nella richiesta:", error);
            alert("Errore nella donazione. Riprova più tardi.");
        });
    });

    
   
});