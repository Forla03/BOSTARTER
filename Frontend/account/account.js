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

            if (data.success && Array.isArray(data.user) && data.user.length > 0) {
                let firstEntry = data.user[0]; // Prendiamo i dati generali dell'utente dalla prima riga
                
                document.title = firstEntry.nickname;
                document.getElementById("nickname").textContent = firstEntry.nickname;
                document.getElementById("name").textContent = firstEntry.nome;
                document.getElementById("surname").textContent = firstEntry.cognome;
                document.getElementById("email").textContent = firstEntry.email;
                document.getElementById("year").textContent = firstEntry.anno_nascita;
                document.getElementById("place").textContent = firstEntry.luogo_nascita;

                // Raggruppiamo le skill uniche con il relativo livello
                let skillsContainer = document.getElementById("skills");
                skillsContainer.innerHTML = ""; // Puliamo eventuali dati esistenti
                
                let skillsMap = new Map();

                data.user.forEach(entry => {
                    if (entry.nome_skill) {
                        skillsMap.set(entry.nome_skill, entry.livello_skill);
                    }
                });

                if (skillsMap.size > 0) {
                    skillsMap.forEach((livello, skill) => {
                        let skillElement = document.createElement("div");
                        skillElement.className = "skill";
                        skillElement.textContent = `${skill} (Livello: ${livello})`;
                        skillsContainer.appendChild(skillElement);
                    });
                } else {
                    skillsContainer.innerHTML = "<p>Nessuna skill registrata.</p>";
                }

               // Display projects if available
               if (data.projects) {
                const container = document.querySelector(".container");
                const createProjectSection = (projects, title) => {
                    if (!projects || projects.length === 0) return;

                    const section = document.createElement("div");
                    section.className = "projects-container";
                    
                    const titleElement = document.createElement("h3");
                    titleElement.textContent = title;
                    
                    const scrollContainer = document.createElement("div");
                    scrollContainer.className = "scroll-container";

                    projects.forEach(project => {
                        const projectElement = document.createElement("div");
                        projectElement.className = "project";
                        
                        // Project Name
                        const name = document.createElement("h4");
                        name.className = "project-name";
                        name.textContent = project.NomeProgetto;
                        
                        // Project Budget
                        const budget = document.createElement("p");
                        budget.className = "project-budget";
                        budget.textContent = `Budget: €${project.Budget.toLocaleString('it-IT')}`;
                        
                        // Project Deadline
                        const deadline = document.createElement("p");
                        deadline.className = "project-deadline";
                        const date = new Date(project.DataLimite);
                        deadline.textContent = `Scadenza: ${date.toLocaleDateString('it-IT', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                        })}`;

                        projectElement.append(name, budget, deadline);
                        scrollContainer.appendChild(projectElement);
                    });

                    section.append(titleElement, scrollContainer);
                    container.appendChild(section);
                };

                createProjectSection(data.projects.software, "Progetti Software");
                createProjectSection(data.projects.hardware, "Progetti Hardware");         
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