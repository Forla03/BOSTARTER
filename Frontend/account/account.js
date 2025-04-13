document.addEventListener("DOMContentLoaded", function () {
    let userData = null;
    let projectData = null;
    let rewardsData = null;
    let applicationsData = null;

    function fetchUserData() {
        fetch("../../Backend/account-view/account.php")
            .then(response => {
                if (!response.ok) throw new Error("Server internal error");
                return response.json();
            })
            .then(data => {
                console.log("Received data:", data);
                if (data.success && Array.isArray(data.user) && data.user.length > 0) {
                    userData = data.user;
                    projectData = data.projects || null;
                    renderUserOverview();
                } else {
                    document.body.innerHTML = "<h2>Utente non trovato</h2>";
                }
            })
            .catch(error => {
                console.error("Errore nel caricamento:", error);
                document.body.innerHTML = "<h2>Errore nel caricamento dei dati</h2>";
            });
    }

    function fetchUserRewards() {
        fetch("../../Backend/account-view/get_rewards.php")
            .then(response => {
                if (!response.ok) throw new Error("Errore nel caricamento dei reward");
                return response.json();
            })
            .then(data => {
                console.log("Received rewards data:", data);
                if (data.success && Array.isArray(data.data)) {
                    rewardsData = data.data;
                } else {
                    const container = document.querySelector(".container");
                    container.innerHTML = "<h2>Nessun reward trovato</h2>";
                }
            })
            .catch(error => {
                console.error("Errore nel caricamento dei reward:", error);
                const container = document.querySelector(".container");
                container.innerHTML = "<h2>Errore nel caricamento delle ricompense</h2>";
            });
    }

    function fetchUserApplications() {
        fetch("../../Backend/account-view/get_applications.php")
            .then(response => {
                if (!response.ok) throw new Error("Errore nel caricamento delle applicazioni");
                return response.json();
            })
            .then(data => {
                console.log("Received applications data:", data);
                if (data.success && Array.isArray(data.data)) {
                    applicationsData = data.data;
                } else {
                    const container = document.querySelector(".container");
                    container.innerHTML = "<h2>Nessuna applicazione trovata</h2>";
                }
            })
            .catch(error => {
                console.error("Errore nel caricamento delle applicazioni:", error);
                const container = document.querySelector(".container");
                container.innerHTML = "<h2>Errore nel caricamento delle applicazioni</h2>";
            });
    }

    function renderUserOverview() {
        const container = document.querySelector(".container");
        container.innerHTML = `
            <h1 id="nickname">${userData[0].nickname}</h1>
            <div class="info">
                <p><strong>Nome:</strong> <span id="name">${userData[0].nome}</span></p>
                <p><strong>Cognome:</strong> <span id="surname">${userData[0].cognome}</span></p>
                <p><strong>Email:</strong> <span id="email">${userData[0].email}</span></p>
                <p><strong>Anno di nascita:</strong> <span id="year">${userData[0].anno_nascita}</span></p>
                <p><strong>Luogo di nascita:</strong> <span id="place">${userData[0].luogo_nascita}</span></p>
            </div>
            <div class="skills-container">
                <h3>Skill</h3>
                <div id="skills"></div>
            </div>
        `;

        const skillsContainer = document.getElementById("skills");
        skillsContainer.innerHTML = "";

        const skillsMap = new Map();
        userData.forEach(entry => {
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
    }

    function renderProjectsView(titoloGenerale) {
        const container = document.querySelector(".container");
        container.innerHTML = `<h1>${titoloGenerale}</h1>`;
    
        const aggiungiSezione = (projects, titolo, tipo) => {
            if (!projects || projects.length === 0) return;
    
            const section = document.createElement("div");
            section.className = "projects-container";
    
            const header = document.createElement("h3");
            header.textContent = titolo;
            section.appendChild(header);
    
            const scrollContainer = document.createElement("div");
            scrollContainer.className = "scroll-container";
    
            projects.forEach(project => {
                const projectElement = document.createElement("div");
                projectElement.className = "project";
    
                const name = document.createElement("h4");
                name.className = "project-name";
                name.textContent = project.NomeProgetto;
    
                const budget = document.createElement("p");
                budget.className = "project-budget";
                budget.textContent = `Budget: €${project.Budget.toLocaleString('it-IT')}`;
    
                const deadline = document.createElement("p");
                deadline.className = "project-deadline";
                const date = new Date(project.DataLimite);
                deadline.textContent = `Scadenza: ${date.toLocaleDateString('it-IT', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                })}`;

                projectElement.addEventListener("click", () => {
                    window.location.href = `../projectView/projectView.html?nomeProgetto=${encodeURIComponent(project.NomeProgetto)}&tipoProgetto=${encodeURIComponent(tipo)}`;
                });
    
                projectElement.append(name, budget, deadline);
                scrollContainer.appendChild(projectElement);
            });
    
            section.appendChild(scrollContainer);
            container.appendChild(section);
        };
    
        aggiungiSezione(projectData.software, "Progetti software", "Software");
        aggiungiSezione(projectData.hardware, "Progetti hardware", "Hardware");
    
        if ((!projectData.software || projectData.software.length === 0) &&
            (!projectData.hardware || projectData.hardware.length === 0)) {
            container.innerHTML += "<p>Nessun progetto disponibile.</p>";
        }
    }

    function renderRewardsView(titoloGenerale, rewards) {
        const container = document.querySelector(".container");
        container.innerHTML = `<h1>${titoloGenerale}</h1>`;
    
        if (!rewards || rewards.length === 0) {
            container.innerHTML += "<p>Nessun reward disponibile.</p>";
            return;
        }
    
        const carousel = document.createElement("div");
        carousel.className = "carousel";
    
        const leftArrow = document.createElement("button");
        leftArrow.className = "carousel-arrow left-arrow";
        leftArrow.textContent = "←";
    
        const rightArrow = document.createElement("button");
        rightArrow.className = "carousel-arrow right-arrow";
        rightArrow.textContent = "→";
    
        const rewardsContainer = document.createElement("div");
        rewardsContainer.className = "carousel-container";
    
        rewards.forEach(reward => {
            const rewardElement = document.createElement("div");
            rewardElement.className = "reward";
    
            const name = document.createElement("h4");
            name.className = "reward-name";
            name.textContent = `Progetto: ${reward.NomeProgetto}`;
    
            const description = document.createElement("p");
            description.className = "reward-description";
            description.textContent = `Descrizione: ${reward.DescrizioneReward}`;
    
            const amount = document.createElement("p");
            amount.className = "reward-amount";
            amount.textContent = `Importo finanziato: €${parseFloat(reward.ImportoFinanziato).toLocaleString('it-IT')}`;
    
            const img = document.createElement("img");
            img.className = "reward-image";
            img.src = `data:image/jpeg;base64,${reward.FotoReward}`;
            img.alt = "Immagine reward";
    
            rewardElement.append(name, description, amount, img);
            rewardsContainer.appendChild(rewardElement);
        });
    
        let currentIndex = 0;
    
        const updateCarousel = () => {
            const rewardElements = rewardsContainer.querySelectorAll(".reward");
            rewardElements.forEach((el, index) => {
                el.style.display = index === currentIndex ? "block" : "none";
            });
        };
    
        leftArrow.addEventListener("click", () => {
            currentIndex = (currentIndex - 1 + rewards.length) % rewards.length;
            updateCarousel();
        });
    
        rightArrow.addEventListener("click", () => {
            currentIndex = (currentIndex + 1) % rewards.length;
            updateCarousel();
        });
    
        carousel.appendChild(leftArrow);
        carousel.appendChild(rewardsContainer);
        carousel.appendChild(rightArrow);
        container.appendChild(carousel);
    
        updateCarousel();
    }

    function renderApplicationsView(titoloGenerale, applications) {
        const container = document.querySelector(".container");
        container.innerHTML = `<h1>${titoloGenerale}</h1>`;
    
        if (!applications || applications.length === 0) {
            container.innerHTML += "<p>Nessuna candidatura disponibile.</p>";
            return;
        }
    
        const scrollableContainer = document.createElement("div");
        scrollableContainer.className = "scrollable-container";
    
        applications.forEach(application => {
            const applicationElement = document.createElement("div");
            applicationElement.className = "application";
    
            const projectName = document.createElement("h4");
            projectName.className = "application-project-name";
            projectName.textContent = `Progetto: ${application.NomeProgetto}`;
    
            const profileName = document.createElement("p");
            profileName.className = "application-profile-name";
            profileName.textContent = `Profilo: ${application.NomeProfilo}`;
    
            applicationElement.append(projectName, profileName);
            scrollableContainer.appendChild(applicationElement);
        });
    
        container.appendChild(scrollableContainer);
    }
    

    // Event listeners
    document.getElementById("starting_view_button").addEventListener("click", () => {
        renderUserOverview();
    });

    document.getElementById("show_projects").addEventListener("click", () => {
        renderProjectsView("Progetti da te creati");
    });
    
    document.getElementById("collaborate_projects").addEventListener("click", () => {
        renderApplicationsView("Progetti a cui hai collaborato", applicationsData);
    });

    document.getElementById("rewards").addEventListener("click", () => {
        renderRewardsView("Le tue ricompense", rewardsData);
    });
    
    fetchUserData();
    fetchUserRewards();
    fetchUserApplications();
});