document.addEventListener("DOMContentLoaded", function () {
    fetch("../../Backend/get_skill.php")
        .then(response => response.json())
        .then(data => {
            const skills = Array.isArray(data) ? data : [data];
            const skillTableBody = document.getElementById("skillTableBody");

            skills.forEach(skill => {
                let row = document.createElement("tr");
                row.innerHTML = `
                    <td>${skill.nome_skill}</td>
                    <td>${skill.livello}</td>
                    <td><input type="checkbox" class="skill-checkbox" value="${skill.nome_skill}" data-livello="${skill.livello}"></td>
                `;
                skillTableBody.appendChild(row);
            });
        })
        .catch(error => console.error("Errore nel caricamento delle skill:", error));
});


let controllo=0;
// Mostra/Nasconde i form in base al tipo di progetto selezionato
document.getElementById("cb_hardware").addEventListener("change", function() {
    if (this.checked) {
        document.getElementById("cb_software").disabled = true;
        document.getElementById("input_hardware").style.visibility = "visible";
        controllo=1;
    } else {
        document.getElementById("cb_software").disabled = false;
        document.getElementById("input_hardware").style.visibility = "hidden";
        controllo=0;
    }
});

document.getElementById("cb_software").addEventListener("change", function() {
    if (this.checked) {
        document.getElementById("cb_hardware").disabled = true;
        document.getElementById("input_software").style.visibility = "visible";
        controllo=2;
    } else {
        document.getElementById("cb_hardware").disabled = false;
        document.getElementById("input_software").style.visibility = "hidden";
        controllo=0;
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
            <button class="rimuovi-componente">Rimuovi</button>
        `;

        // Aggiungi la riga alla lista
        document.getElementById("lista-componenti").appendChild(componenteDiv);

        // Rendi gli input del form vuoti dopo aver aggiunto un componente
        document.getElementById("form-componente").reset();
        
        // Gestione del bottone "Rimuovi"
        componenteDiv.querySelector(".rimuovi-componente").addEventListener("click", function() {
            componenteDiv.remove(); // Rimuove il componente dalla lista
        });
    }
});


// Tabella delle skill selezionate
// Recupera la tabella e il corpo della tabella
const selectedSkillTable = document.getElementById("selectedSkillTable");
const selectedSkillTableBody = document.getElementById("selectedSkillTableBody");

// Nasconde la tabella inizialmente
selectedSkillTable.style.display = "none";

// Mappa per tenere traccia delle skill selezionate
const selectedSkills = new Map();

document.getElementById("aggiungiSkill").addEventListener("click", function () {
    let selectedAny = false;

    document.querySelectorAll(".skill-checkbox:checked").forEach(checkbox => {
        const skillName = checkbox.value;
        const skillLevel = checkbox.dataset.livello;

        if (!selectedSkills.has(skillName)) {
            selectedSkills.set(skillName, skillLevel);

            let row = document.createElement("tr");
            row.setAttribute("data-skill", skillName);
            row.innerHTML = `
                <td>${skillName}</td>
                <td>${skillLevel}</td>
                <td><button class="remove-skill">Rimuovi</button></td>
            `;
            selectedSkillTableBody.appendChild(row);

            // Aggiunge l'evento per rimuovere la skill
            row.querySelector(".remove-skill").addEventListener("click", function () {
                selectedSkills.delete(skillName); // Rimuove dalla mappa
                row.remove();
                checkSkillTableVisibility();
            });

            selectedAny = true;
        }

        // Deseleziona la checkbox dopo l'aggiunta
        checkbox.checked = false;
    });

    // Mostra la tabella solo se ci sono skill aggiunte
    checkSkillTableVisibility();
});

// Funzione per controllare se la tabella deve essere mostrata
function checkSkillTableVisibility() {
    if (selectedSkills.size > 0) {
        selectedSkillTable.style.display = "table";
    } else {
        selectedSkillTable.style.display = "none";
    }
}

document.getElementById("crea_progetto").addEventListener("click", function() {
    if (controllo == 0) {
        alert("Seleziona la tipologia di progetto che vuoi creare");
    } else if (controllo == 1) {
        // Gestione per hardware
    } else {
        // Seleziona il form
        let form = document.getElementById("creaProgettoForm");
        let formData = new FormData(form); // Passa il form al costruttore FormData

        // Invia la richiesta al server per creare il progetto
        fetch("../../Backend/create_project_software.php", {
            method: "POST",
            body: formData
        })
        .catch(error => {
            console.error("Errore:", error);
            document.getElementById("response").innerText = "Errore nell'invio dei dati.";
        });

        // Per ogni skill, invia una richiesta separata
        selectedSkills.forEach((livello, skill) => {
            // Crea un oggetto per la skill
            const skillData = {
                nome: skill,
                livello: livello
            };

            // Invia la richiesta per ogni skill selezionata
            fetch("../../Backend/add_skills_to_software_project.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(skillData), // Invia solo la skill singola
            })
            .then(response => response.text())
            .then(data => {
                console.log(`Skill ${skill} aggiunta con successo!`);
                // Puoi anche gestire la risposta dal server, ad esempio, visualizzando un messaggio.
            })
            .catch(error => {
                console.error("Errore durante l'aggiunta della skill:", error);
            });
        });

        // Aggiungi eventuali altre azioni, come la gestione delle immagini o altre informazioni
    }
});
