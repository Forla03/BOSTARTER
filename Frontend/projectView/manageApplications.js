document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectName = urlParams.get('nome_progetto');
    const profileName = urlParams.get('nome_profilo');

    let pageTitle = document.querySelector("h1");
    pageTitle.textContent = `Candidature ricevute per ${profileName}`;

    const tableBody = document.querySelector("#candidature-table tbody");

    // Function to load applications
    function loadCandidature() {
        fetch("../../Backend/project/manage_applications.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                nome_progetto: projectName,
                nome_profilo: profileName
            }),
        })
        .then(response => response.json())
        .then(data => {
            tableBody.innerHTML = ""; // Clear previous data in the table

            if (data.success && data.candidature) {
                const candidati = Array.isArray(data.candidature) ? data.candidature : [data.candidature];

                candidati.forEach(c => {
                    const row = document.createElement("tr");

                    row.innerHTML = `
                        <td>${c.email_utente}</td>
                        <td>${c.nome_progetto}</td>
                        <td>${c.nome_profilo}</td>
                        <td><button class="accept-btn" data-email="${c.email_utente}">Accetta</button>
                            <button class="reject-btn" data-email="${c.email_utente}">Rifiuta</button>
                        </td>
                    `;

                    tableBody.appendChild(row);
                });

                document.querySelectorAll(".accept-btn").forEach(button => {
                    button.addEventListener("click", () => {
                        const email = button.dataset.email;
                        acceptCandidate(email);
                    });
                });

                document.querySelectorAll(".reject-btn").forEach(button => {
                    button.addEventListener("click", () => {
                        const email = button.dataset.email;
                        rejectCandidate(email);
                    });
                });

            } else {
                const row = document.createElement("tr");
                row.innerHTML = `<td colspan="4">Nessuna candidatura trovata.</td>`;
                tableBody.appendChild(row);
            }
        })
        .catch(error => {
            console.error("Errore nella fetch:", error);
        });
    }

    // Function to accept a candidate
    async function acceptCandidate(email) {

        fetch("../../Backend/project/accept_candidate.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email_utente: email,
                nome_progetto: projectName,
                nome_profilo: profileName
            }),
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                loadCandidature(); // Reload tables without reloading the page
            } else {
                showPopup("Errore durante l'accettazione.");
            }
        })
        .catch(err => {
            console.error("Errore nella richiesta di accettazione:", err);
        });
    }

    async function rejectCandidate(email) {

        fetch("../../Backend/project/reject_candidate.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email_utente: email,
                nome_progetto: projectName,
                nome_profilo: profileName
            }),
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                loadCandidature(); // Reload tables without reloading the page
            } else {
                showPopup( "Errore durante l'accettazione.");
            }
        })
        .catch(err => {
            console.error("Errore nella richiesta di accettazione:", err);
        });
    }

    loadCandidature(); 
});

// Funzioni per il popup
function showPopup(message) {
    document.getElementById('popupMessage').innerText = message;
    document.getElementById('popupOverlay').style.display = 'flex';
}

function closePopup() {
    document.getElementById('popupOverlay').style.display = 'none';
}
