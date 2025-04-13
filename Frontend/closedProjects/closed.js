document.addEventListener('DOMContentLoaded', async function() {
    let allProjects = [];

    const hardwareCheckbox = document.getElementById('hardware');
    const softwareCheckbox = document.getElementById('software');
    const onTargetCheckbox = document.getElementById('on_target');
    const failedCheckbox = document.getElementById('failed');
    const projectsContainer = document.getElementById('projectsContainer');

    try {
        const response = await fetch("../../Backend/closed_projects.php");
        const jsonResponse = await response.json();
        console.log("OK ", jsonResponse);

        if (!jsonResponse.success) {
            throw new Error(jsonResponse.message || "Errore sconosciuto dal server");
        }

        allProjects = jsonResponse.data;

        function displayProjects() {
            projectsContainer.innerHTML = '';

            const showHardware = hardwareCheckbox.checked;
            const showSoftware = softwareCheckbox.checked;
            const showOnTarget = onTargetCheckbox.checked;
            const showFailed = failedCheckbox.checked;

            const filtered = allProjects.filter(project => {
                if (!showHardware && !showSoftware && !showOnTarget && !showFailed) return true;
                if (showHardware && project.TipoProgetto === 'Hardware') return true;
                if (showSoftware && project.TipoProgetto === 'Software') return true;
                if (showOnTarget && project.FinanziatoCompletamente) return true;
                if (showFailed && !project.FinanziatoCompletamente) return true;
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
            
                let deadline = document.createElement('h4');
                deadline.textContent = "Scaduto il: " + project.DataLimite;
            
                let statusContainer = document.createElement('div');
                statusContainer.classList.add('status-container');
            
                let status = document.createElement('h4');
                status.textContent = project.FinanziatoCompletamente ? "Stato: Finanziato completamente" : "Stato: Non finanziato";
            
                let statusIcon = document.createElement('img');
                statusIcon.src = project.FinanziatoCompletamente ? "../assets/green_tick.png" : "../assets/red_cross.png";
                statusIcon.alt = project.FinanziatoCompletamente ? "Finanziato completamente" : "Non finanziato";
                statusIcon.classList.add('status-icon');
            
                statusContainer.appendChild(status);
                statusContainer.appendChild(statusIcon);
            
                projectCard.appendChild(title);
                projectCard.appendChild(description);
                projectCard.appendChild(deadline);
                projectCard.appendChild(statusContainer);
            
                projectsContainer.appendChild(projectCard);
            });
        }

        displayProjects();

        hardwareCheckbox.addEventListener('change', displayProjects);
        softwareCheckbox.addEventListener('change', displayProjects);
        onTargetCheckbox.addEventListener('change', displayProjects);
        failedCheckbox.addEventListener('change', displayProjects);

    } catch (error) {
        console.error("Errore durante il caricamento dei progetti:", error);
        alert("Si è verificato un errore durante il caricamento dei progetti. Riprova più tardi.");
    }
});
