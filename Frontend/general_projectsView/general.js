document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Fetch data from the PHP backend
        const response = await fetch("../../Backend/generalView.php");
        const jsonResponse = await response.json();
        console.log("OK "+jsonResponse);  

        // Check if the response indicates success
        if (!jsonResponse.success) {
            throw new Error(jsonResponse.message || "Errore sconosciuto dal server");
        }

        const projects = jsonResponse.data;
        const projectsContainer = document.getElementById('projectsContainer');

        // Iterate over the projects and create project cards
        projects.forEach(project => {
            let projectCard = document.createElement('div');
            projectCard.classList.add('project');
        
            let title = document.createElement('h3');
            let titleLink = document.createElement('a'); 
            titleLink.textContent = project.NomeProgetto;
            titleLink.href = `../projectView/projectView.html?nomeProgetto=${encodeURIComponent(project.NomeProgetto)}`;
            title.appendChild(titleLink);
        
            let description = document.createElement('p');
            description.textContent = project.Descrizione;
        
            let progressBarContainer = document.createElement('div');
            progressBarContainer.classList.add('progress-bar-container');
        
            let progressBar = document.createElement('div');
            progressBar.classList.add('progress-bar');
            progressBar.style.width = project.TotaleFinanziato + '%';
        
            progressBarContainer.appendChild(progressBar);
        
            let currentBudget = document.createElement('h4');
            currentBudget.textContent = "Budget attuale: " + project.TotaleFinanziato + '€';
        
            let objectiveBudget = document.createElement('h4');
            objectiveBudget.textContent = "Obbiettivo: " + project.Budget + '€';
        
            projectCard.appendChild(title);
            projectCard.appendChild(description);
            projectCard.appendChild(progressBarContainer);
            projectCard.appendChild(currentBudget);
            projectCard.appendChild(objectiveBudget);
        
            projectsContainer.appendChild(projectCard);
        });
    } catch (error) {
        console.error("Errore durante il caricamento dei progetti:", error);
        alert("Si è verificato un errore durante il caricamento dei progetti. Riprova più tardi.");
    }
});