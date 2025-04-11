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

document.getElementById("addReward-button").addEventListener("click", function() {;
    const rewardDescription = document.getElementById("reward_description").value.trim();
    const rewardPic = document.getElementById("reward_pic").files[0];

    if (!rewardDescription || !rewardPic) {
        alert("Compila tutti i campi obbligatori per aggiungere una ricompensa.");
        return;
    }

    const rewardDiv = document.createElement("div");
    rewardDiv.classList.add("reward", "reward-item");

    let rewardHTML = `
        <p><strong>Descrizione:</strong> ${rewardDescription}</p>
    `;

    const removeButton = document.createElement("button");
    removeButton.textContent = "Rimuovi";
    removeButton.classList.add("remove-reward");
    removeButton.addEventListener("click", function() {
        rewardDiv.remove(); 
    });

    rewardDiv.dataset.fileIndex = Date.now(); 

    if (rewardPic) {
        const reader = new FileReader();
        reader.onload = function(e) {
            rewardDiv.innerHTML = rewardHTML + `<img src="${e.target.result}" alt="Immagine Ricompensa" style="max-width: 200px; max-height: 200px;">`;
            rewardDiv.appendChild(document.createElement("br")); 
            rewardDiv.appendChild(removeButton); 
        };
        reader.readAsDataURL(rewardPic);
        
        let imageReference = rewardPic;
        rewardDiv.file = imageReference; // Append the image reference to the div
    } else {
        rewardDiv.innerHTML = rewardHTML;
        rewardDiv.appendChild(removeButton);
    }

    document.getElementById("rewards-container").appendChild(rewardDiv);

    document.getElementById("reward_description").value = "";
    document.getElementById("reward_pic").value = "";
});



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
    const nome = document.getElementById("nome_componente").value;
    const descrizione = document.getElementById("descrizione_componente").value;
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

        // Add to the list if not already present
        // Else, update the existing component by adding the quantity
        let listComponenti =Array.from(document.getElementById("lista-componenti").children);
        let presente = false;
        listComponenti.forEach(componente => {
            if(componente.querySelector("p:nth-child(1)").textContent.replace("Nome: ", "").trim() === nome) {
                currentAmount = parseInt(componenteDiv.querySelector("p:nth-child(4)").textContent.replace("Quantità: ", "").trim(), 10);
                componente.querySelector("p:nth-child(4)").textContent = "Quantità: " + (parseInt(componente.querySelector("p:nth-child(4)").textContent.replace("Quantità: ", "").trim(), 10) + currentAmount);
                presente = true;
                return;
            }
        });
        
        if(!presente){
            document.getElementById("lista-componenti").appendChild(componenteDiv);
            // Gestione del bottone "Rimuovi"
            componenteDiv.querySelector(".rimuovi-componente").addEventListener("click", function() {
                componenteDiv.remove(); // Rimuove il componente dalla lista
            });
        }
    }
});


// Tabella delle skill selezionate
// Recupera la tabella e il corpo della tabella
const selectedSkillTable = document.getElementById("selectedSkillTable");
const selectedSkillTableBody = document.getElementById("selectedSkillTableBody");

// Nasconde la tabella inizialmente
selectedSkillTable.style.display = "none";
const profili = new Map();

document.getElementById("aggiungiProfilo").addEventListener("click", function() {
    const nomeProfilo = document.getElementById("nome_profilo").value.trim();
    if (!nomeProfilo || profili.has(nomeProfilo)) {
        alert("Nome profilo già esistente o non valido.");
        return;
    }
    let selectedSkills = Array.from(document.querySelectorAll("#skillTableBody .skill-checkbox:checked")).map(checkbox => {
        return {
            nome_skill: checkbox.value,
            livello: checkbox.dataset.livello
        };
    });

    if (selectedSkills.length === 0) {
        alert("Seleziona almeno una skill per il profilo.");
        return;
    }
    
    profili.set(nomeProfilo, selectedSkills);

    
    // Aggiorna l'interfaccia: aggiungi la "card" del profilo con pulsante Rimuovi
    const profiloCard = document.createElement("div");
    profiloCard.classList.add("profilo-card");
    profiloCard.dataset.nomeProfilo = nomeProfilo;
    profiloCard.innerHTML = `<h3>${nomeProfilo}</h3>
                             <p>Skills:</p>
                             <ul>
                                ${selectedSkills.map(skill => `<li>${skill.nome_skill} (Livello: ${skill.livello})</li>`).join("")}
                             </ul>
                             <button class="remove-profilo">Rimuovi</button>`;
    document.getElementById("listaProfili").appendChild(profiloCard);
    document.getElementById("nome_profilo").value = "";

    // Listener per il pulsante "Rimuovi" della card
    profiloCard.querySelector(".remove-profilo").addEventListener("click", function() {
        profili.delete(nomeProfilo); // Rimuove il profilo dalla mappa
        profiloCard.remove(); // Rimuove la card del profilo
    });
});

// Funzione per controllare se la tabella deve essere mostrata
function checkSkillTableVisibility() {
    if (selectedSkills.size > 0) {
        selectedSkillTable.style.display = "table";
    } else {
        selectedSkillTable.style.display = "none";
    }
}

function getRewards() {
    const rewards = [];
    const rewardDivs = document.querySelectorAll(".reward-item");

    rewardDivs.forEach(rewardDiv => {
        const description = rewardDiv.querySelector("p:nth-child(1)").textContent.replace("Descrizione: ", "").trim();
        const imageFile = rewardDiv.file; // Get the image reference from the div

        rewards.push({
            description: description,
            image: imageFile
        });
    });

    return rewards;
}

function postRewards(rewards, nome_progetto) {
    const formData = new FormData();
    formData.append('nome_progetto', nome_progetto);

    rewards.forEach((reward, index) => {
        formData.append(`rewards[${index}][description]`, reward.description);
        formData.append(`rewards[${index}][image]`, reward.image, reward.image.name); 
    });
    
    return fetch("../../Backend/add_reward.php", {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
}

document.getElementById("crea-progetto").addEventListener("click", async function() {
    if (controllo == 0) {
        alert("Seleziona la tipologia di progetto che vuoi creare");
    } else if (controllo == 1) {
        // Manage hardware project
        let form = document.getElementById("creaProgettoForm");
        const formData = new FormData();
    
        formData.append('nome', form.querySelector('#nome').value);
        formData.append('descrizione', form.querySelector('#descrizione').value);
        formData.append('budget', form.querySelector('#budget').value);
        formData.append('data_inserimento', form.querySelector('#data_inserimento').value);
        formData.append('data_limite', form.querySelector('#data_limite').value);
    
        const fileInput = form.querySelector('#immagini');
        for (let i = 0; i < fileInput.files.length; i++) {
            formData.append('immagini[]', fileInput.files[i]);
        }
    
        const componenti = [];
        document.querySelectorAll(".componente").forEach(componenteDiv => {
            componenti.push({
                nome_componente: componenteDiv.querySelector("p:nth-child(1)").textContent.replace("Nome: ", "").trim(),
                descrizione: componenteDiv.querySelector("p:nth-child(2)").textContent.replace("Descrizione: ", "").trim(),
                prezzo: parseFloat(componenteDiv.querySelector("p:nth-child(3)").textContent.replace("Prezzo: €", "").trim()),
                quantita: parseInt(componenteDiv.querySelector("p:nth-child(4)").textContent.replace("Quantità: ", "").trim(), 10)
            });
        });
        formData.append('componenti', JSON.stringify(componenti));    
        
        try {
            const response = await fetch("../../Backend/create_project_hardware.php", {
                method: "POST",
                body: formData 
            });

            const data = await response.json();

            if (!data.success) {
                // Specific error handling based on the message returned from the server
                if (data.message.includes("The total cost of components")) {
                    alert("Errore: Il costo totale dei componenti non corrisponde al budget specificato. Verifica i dati inseriti.");
                } else {
                    throw new Error(data.message || "Errore sconosciuto");
                }
                return;
            }

            const rewardResponse = await postRewards(getRewards(), form.querySelector('#nome').value);

            if (rewardResponse.success) {
                form.reset();
                document.getElementById("lista-componenti").innerHTML = "";
            } else {
                throw new Error("Errore durante l'inserimento delle ricompense.");
            }
        } catch (error) {
            console.error("Errore:", error);
            alert("Errore durante la creazione del progetto: " + error.message);
        }
    } else {
        // Manage the software project
        let form = document.getElementById("creaProgettoForm");
        const formData = new FormData();
    
        formData.append('nome', form.querySelector('#nome').value);
        formData.append('descrizione', form.querySelector('#descrizione').value);
        formData.append('budget', form.querySelector('#budget').value);
        formData.append('data_inserimento', form.querySelector('#data_inserimento').value);
        formData.append('data_limite', form.querySelector('#data_limite').value);
    
        const fileInput = form.querySelector('#immagini');
        for (let i = 0; i < fileInput.files.length; i++) {
            formData.append('immagini[]', fileInput.files[i]);
        }

        const profiliArray = Array.from(profili, ([nomeProfilo, skills]) => ({
            nome_profilo: nomeProfilo,
            skills: skills
        }));

        formData.append('profili', JSON.stringify(profiliArray));

        try {
            const response = await fetch("../../Backend/create_project_software.php", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            const rewardResponse = await postRewards(getRewards(), form.querySelector('#nome').value);

            if (data.success && rewardResponse.success) {
                form.reset();
                profili.clear();
            } else {
                throw new Error("Errore sconosciuto");
            }
        } catch (error) {
            console.error("Errore:", error);
        }
    }

    // Reset the selected skills table
    document.getElementById("selectedSkillTable").innerHTML = "";
});