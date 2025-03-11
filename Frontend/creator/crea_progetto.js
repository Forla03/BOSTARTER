document.getElementById("hardware").addEventListener("change", function() {
    if (this.checked) {
        document.getElementById("software").disabled = true; // Disabilita la seconda checkbox
        document.getElementById("input_hardware").style.visibility= "visible";
    } else {
        document.getElementById("software").disabled = false; // Riabilita la seconda checkbox
        document.getElementById("input_hardware").style.visibility= "hidden";
    }
});

document.getElementById("software").addEventListener("change", function() {
    if (this.checked) {
        document.getElementById("hardware").disabled = true; // Disabilita la prima checkbox
    } else {
        document.getElementById("hardware").disabled = false; // Riabilita la prima checkbox
    }
});

document.getElementById("aggiungiComponente").addEventListener("click", function() {
    // Ottieni i valori degli input
    const nome = document.getElementById("nome").value;
    const descrizione = document.getElementById("descrizione").value;
    const prezzo = document.getElementById("prezzo").value;
    const quantita = document.getElementById("quantita").value;

    // Verifica che tutti i campi siano compilati
    if (nome && descrizione && prezzo && quantita > 0) {
        // Crea una nuova riga con le informazioni del componente
        const componenteDiv = document.createElement("div");
        componenteDiv.classList.add("componente");

        // Aggiungi le informazioni del componente alla riga
        componenteDiv.innerHTML = `
            <p><strong>Nome:</strong> ${nome}</p>
            <p><strong>Descrizione:</strong> ${descrizione}</p>
            <p><strong>Prezzo:</strong> €${prezzo}</p>
            <p><strong>Quantità:</strong> ${quantita}</p>
            <button class="aggiungi-definitivo">Aggiungi alla lista definitiva</button>
        `;

        // Aggiungi la riga alla lista
        document.getElementById("lista-componenti").appendChild(componenteDiv);

        // Rendi gli input del form vuoti dopo aver aggiunto un componente
        document.getElementById("form-componente").reset();
        
        // Gestione del bottone "Aggiungi alla lista definitiva"
        componenteDiv.querySelector(".aggiungi-definitivo").addEventListener("click", function() {
            // Una volta cliccato il bottone, rendiamo non modificabili i dati
            componenteDiv.querySelectorAll("input").forEach(input => {
                input.disabled = true; // Disabilita gli input (se ci sono)
            });
            componenteDiv.querySelector(".aggiungi-definitivo").disabled = true; // Disabilita il bottone

            // Mostra un messaggio che il componente è stato aggiunto alla lista
            const aggiuntoMessage = document.createElement("span");
            aggiuntoMessage.classList.add("aggiunto");
            aggiuntoMessage.textContent = " (Componente aggiunto alla lista definitiva)";
            componenteDiv.appendChild(aggiuntoMessage);
        });
    } else {
        alert("Per favore, compila tutti i campi correttamente!");
    }
});
