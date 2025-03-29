document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const projectName = urlParams.get('nomeProgetto');
    const projectType = urlParams.get('tipoProgetto');
    url = "../../Backend/project/get_projectData.php";

    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome_progetto: projectName }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log("Dati del progetto:", data);
            renderProjectData(data, projectType);
        } else {
            console.error("Errore nel recupero dati:", data.message);
            displayError(data.message);
        }
    })
    .catch(error => {
        console.error("Errore nella richiesta:", error);
        displayError("Errore nel caricamento dei dati del progetto");
    });
});

function renderProjectData(data, projectType) {
    const container = document.getElementById("project-container");
    if (!container) {
        console.error("Elemento project-container non trovato");
        return;
    }

    // Clena before adding new elements
    container.innerHTML = '';

    // Main project's information section
    const projectInfo = document.createElement("div");
    projectInfo.classList.add('project-info');
    
    const percentualeFinanziamento = Math.min(
        Math.round((data.progetto.totale_finanziato / data.progetto.fondi_totali) * 100), 
        100
    );

    projectInfo.innerHTML = `
        <h1 class="project-title">${data.progetto.nome}</h1>
        <p class="project-description">${data.progetto.descrizione}</p>
        
        <div class="project-stats">
            <div class="funding-info">
                <span class="funding-amount">${data.progetto.totale_finanziato}€</span>
                <span>raccolti su ${data.progetto.budget}€</span>
            </div>
            
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${percentualeFinanziamento}%"></div>
            </div>
            
            <div class="project-meta">
                <span><strong>Categoria:</strong> ${projectType}</span>
                <span><strong>Data scadenza:</strong> ${new Date(data.progetto.data_limite).toLocaleDateString()}</span>
                <a href = "./contribute.html?nomeProgetto=${data.progetto.nome}" class="contribute-button">Contribuisci</a>
            </div>
        </div>
    `;
    container.appendChild(projectInfo);

    // Rewards section
    if (data.rewards && data.rewards.length > 0) {
        const rewardsContainer = document.createElement("div");
        rewardsContainer.classList.add('rewards-section');
        rewardsContainer.innerHTML = "<h2>Ricompense</h2>";
        
        const rewardsList = document.createElement("div");
        rewardsList.classList.add('rewards-list');
        
        data.rewards.forEach(reward => {
            const rewardElement = document.createElement("div");
            rewardElement.classList.add('reward-card');
            rewardElement.innerHTML = `
                <h3>${reward.descrizione}</h3>
                <p class="reward-minimum">Contributo minimo: ${reward.importo_minimo}€</p>
            `;
            rewardsList.appendChild(rewardElement);
        });
        
        rewardsContainer.appendChild(rewardsList);
        container.appendChild(rewardsContainer);
    }

    // Comment section
    const commentsContainer = document.createElement("div");
    commentsContainer.classList.add('comments-section');
    commentsContainer.innerHTML = "<h2>Commenti</h2>";

    // Comment form
    const commentForm = document.createElement("div");
    commentForm.classList.add('comment-form');
    let textArea = document.createElement("textarea");
    textArea.classList.add('comment-input');
    textArea.placeholder = "Scrivi il tuo commento...";
    textArea.rows = 3;
    let commentButton = document.createElement("button");
    commentButton.classList.add('comment-submit');
    commentButton.id = "comment-button";
    commentButton.textContent = "Invia commento";
    commentForm.appendChild(textArea);
    commentForm.appendChild(commentButton);
    commentButton.addEventListener("click", function() {  
        const commentText = textArea.value.trim();
        if (commentText) {
            fetch("../../Backend/project/add_comment.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nome_progetto: data.progetto.nome,
                    testo: commentText,
                    data: new Date().toISOString().slice(0, 19).replace("T", " "),
                }),
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const newComment = document.createElement("div");
                    newComment.classList.add('comment');
                    newComment.innerHTML = `
                        <div class="comment-header">
                            <strong class="comment-author">${result.username}</strong>
                            <span class="comment-date">${new Date().toLocaleDateString()}</span>
                        </div>
                        <p class="comment-text">${commentText}</p>
                    `;
                    commentsList.appendChild(newComment);
                    textArea.value = ""; // Clear the textarea after submission
                } else {
                    console.error("Errore nell'invio del commento:", result.message);
                    displayError(result.message);
                }
            })
            .catch(error => {
                console.error("Errore nella richiesta di invio commento:", error);
                displayError("Errore nell'invio del commento");
            });
        } else {
            alert("Il commento non può essere vuoto.");
        }
    });
    commentsContainer.appendChild(commentForm);

    // Comments list
    const commentsList = document.createElement("div");
    commentsList.classList.add('comments-list');

    data.commenti.forEach(comment => {
        const commentElement = document.createElement("div");
        commentElement.classList.add('comment');
        commentElement.innerHTML = `
            <div class="comment-header">
                <strong class="comment-author">${comment.nickname}</strong>
                <span class="comment-date">${new Date(comment.data).toLocaleDateString()}</span>
            </div>
            <p class="comment-text">${comment.testo}</p>
        `;
        commentsList.appendChild(commentElement);
    });

    commentsContainer.appendChild(commentsList);
    container.appendChild(commentsContainer);

    }
function displayError(message) {
    const container = document.getElementById("project-container") || document.body;
    const errorElement = document.createElement("div");
    errorElement.classList.add('error-message');
    errorElement.textContent = message;
    container.appendChild(errorElement);
    }