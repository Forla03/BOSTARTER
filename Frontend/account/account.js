document.addEventListener("DOMContentLoaded", function () {
    fetch("../../Backend/account.php")
        .then(response => {
            if (!response.ok) {
                throw new Error("Server internal error");
            }
            return response.json();
        })
        .then(data => {
            console.log("Received data:", data);

            if (data.success) {
                let user = data.user;

                document.title = user.nickname;
                document.getElementById("nickname").textContent = user.nickname;
                document.getElementById("name").textContent = user.nome;
                document.getElementById("surname").textContent = user.cognome;
                document.getElementById("email").textContent = user.email;
                document.getElementById("year").textContent = user.anno_nascita;
                document.getElementById("place").textContent = user.luogo_nascita;

                // Display the skills
                let skillsContainer = document.getElementById("skills");
                skillsContainer.innerHTML = ""; // Clear existing skills

                if (user.skills && user.skills.length > 0) {
                    user.skills.forEach(skill => {
                        let skillWrapper = document.createElement("div");
                        skillWrapper.className = "skill-wrapper";

                        let skillElement = document.createElement("span");
                        skillElement.className = "skill";
                        skillElement.textContent = `${skill.nome_skill} - Livello: ${skill.livello_skill}`;

                        let skillDelete = document.createElement("button");
                        skillDelete.className = "delete";
                        skillDelete.textContent = "Elimina";
                        skillDelete.onclick = function () {
                            fetch("../../Backend/remove_skillsFromCurriculum.php", {
                                method: "POST",
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                body: 'skill=' + encodeURIComponent(skill.nome_skill) + '&level=' + encodeURIComponent(skill.livello_skill)
                            })
                                .then(response => {
                                    skillWrapper.remove();                                  
                                })
                                .catch(error => {
                                    console.error("Error removing skill:", error);
                                    alert("Errore durante l'eliminazione della skill.");
                                });
                        };

                        skillWrapper.appendChild(skillElement);
                        skillWrapper.appendChild(skillDelete);
                        skillsContainer.appendChild(skillWrapper);
                    });
                } else {
                    skillsContainer.innerHTML = "<p>Nessuna skill registrata.</p>";
                }
            } else {
                document.body.innerHTML = "<h2>Utente non trovato</h2>";
            }
        })
        .catch(error => {
            console.error("An error occurred while fetching the data:", error);
            document.body.innerHTML = "<h2>Errore nel caricamento dei dati</h2>";
        });
});
