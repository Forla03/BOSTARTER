document.addEventListener('DOMContentLoaded', async function() {
    let allProjects = []; // Array to hold all projects

    const hardwareCheckbox = document.getElementById('hardware');
    const softwareCheckbox = document.getElementById('software');
    const projectsContainer = document.getElementById('projectsContainer');

    try {
        const response = await fetch("../../Backend/generalView.php");
        const jsonResponse = await response.json();
        console.log("OK ", jsonResponse);

        if (!jsonResponse.success) {
            throw new Error(jsonResponse.message || "Errore sconosciuto dal server");
        }

        allProjects = jsonResponse.data;

        // function used to display the projects
        function displayProjects() {
            projectsContainer.innerHTML = ''; // clean the container

            const showHardware = hardwareCheckbox.checked;
            const showSoftware = softwareCheckbox.checked;

            const filtered = allProjects.filter(project => {
                if (!showHardware && !showSoftware) return true;
                if (showHardware && project.TipoProgetto === 'Hardware') return true;
                if (showSoftware && project.TipoProgetto === 'Software') return true;
                return false;
            });

            filtered.forEach(project => {
                let projectCard = document.createElement('div');
                projectCard.classList.add('project');

                let title = document.createElement('h3');
                let titleLink = document.createElement('a');
                titleLink.textContent = project.NomeProgetto;

                if (jsonResponse.logged) {
                    titleLink.href = `../projectView/projectView.html?nomeProgetto=${encodeURIComponent(project.NomeProgetto)}&tipoProgetto=${encodeURIComponent(project.TipoProgetto)}`;
                } else {
                    titleLink.href = `../login/login.html`;
                }

                title.appendChild(titleLink);

                let description = document.createElement('p');
                description.textContent = project.Descrizione;

                let progressBarContainer = document.createElement('div');
                progressBarContainer.classList.add('progress-bar-container');

                let progressBar = document.createElement('div');
                progressBar.classList.add('progress-bar');
                let progressPercentage = (project.TotaleFinanziato / project.Budget) * 100;
                progressBar.style.width = progressPercentage + '%';

                progressBarContainer.appendChild(progressBar);

                let currentBudget = document.createElement('h4');
                currentBudget.textContent = "Budget attuale: " + project.TotaleFinanziato + '€';

                let objectiveBudget = document.createElement('h4');
                objectiveBudget.textContent = "Obiettivo: " + project.Budget + '€';

                projectCard.appendChild(title);
                projectCard.appendChild(description);
                projectCard.appendChild(progressBarContainer);
                projectCard.appendChild(currentBudget);
                projectCard.appendChild(objectiveBudget);

                projectsContainer.appendChild(projectCard);
            });
        }

        // At the beginning, show all projects
        displayProjects();

        // and add the listener to the checkboxes
        hardwareCheckbox.addEventListener('change', displayProjects);
        softwareCheckbox.addEventListener('change', displayProjects);

    } catch (error) {
        console.error("Errore durante il caricamento dei progetti:", error);
        showPopup("Si è verificato un errore durante il caricamento dei progetti. Riprova più tardi.");
    }
});

// Funzioni per il popup
function showPopup(message) {
    document.getElementById('popupMessage').innerText = message;
    document.getElementById('popupOverlay').style.display = 'flex';
}

function closePopup() {
    document.getElementById('popupOverlay').style.display = 'none';
}

