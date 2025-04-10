document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const projectName = urlParams.get('nomeProgetto');
    const projectType = urlParams.get('tipoProgetto');
    url = "../../Backend/project/get_projectData.php";
    var profilesData = null; 
    var projectImages = null;

    //Get user email
    const userEmailRequest = await fetch("../../Backend/session.php") ?? null;
    const userData = await userEmailRequest.json();
    const userEmail = userData.email_value ?? null;

    if (projectType.toLowerCase() === "software") {
        try {
            const response = await fetch("../../Backend/project/get_profiles.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ nome_progetto: projectName }),
            });
            profilesData = await response.json();
            if (profilesData.error) {
                console.error("Errore nel recupero dei profili:", profilesData.error);
                displayError(profilesData.error);
                return;
            }
            console.log("Dati dei profili recuperati:", profilesData); // Debug
        } catch (error) {
            console.error("Errore nella richiesta dei profili:", error);
            displayError("Errore nel caricamento dei profili.");
            return;
        }
    }

    // Get project images if any
    try {
        const projectImagesRequest = await fetch("../../Backend/project/get_projectImages.php", {
            method: "POST",
            body: JSON.stringify({ nome_progetto: projectName }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        projectImages = await projectImagesRequest.json();
    } catch (error) {
        console.error("Errore nel recupero delle immagini del progetto:", error);
        displayError("Errore nel caricamento delle immagini del progetto.");
    }

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
            renderProjectData(data, projectType, profilesData, userEmail, projectImages);
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


function renderProjectData(data, projectType, profilesData, userEmail, projectImages) {
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
        Math.round((data.progetto.totale_finanziato / data.progetto.budget) * 100), 
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

    // Project images section
    if (projectImages && projectImages.images && projectImages.images.length > 0) {
        const imageSection = document.createElement("div");
        imageSection.classList.add("project-images-section");
    
        const imageTitle = document.createElement("h2");
        imageTitle.textContent = "Galleria Immagini";
        imageSection.appendChild(imageTitle);
    
        const imageSlider = document.createElement("div");
        imageSlider.classList.add("image-slider");
    
        projectImages.images.forEach(base64Str => {
            const img = document.createElement("img");
            img.src = `data:image/jpeg;base64,${base64Str}`;
            img.alt = "Immagine progetto";
            img.classList.add("slider-image");
            imageSlider.appendChild(img);
        });
    
        imageSection.appendChild(imageSlider);
        container.appendChild(imageSection);
    }

    if (profilesData) {
        // Profiles section
        const profilesContainer = document.createElement("div");
        profilesContainer.classList.add('profiles-section');
        profilesContainer.innerHTML = "<h2>Profili</h2>";
    
        const profilesList = document.createElement("div");
        profilesList.classList.add('profiles-list');
    
        profilesData.profiles.forEach(profile => {
            const profileElement = document.createElement("div");
            profileElement.classList.add('profile-card');
    
            // Profile details
            profileElement.innerHTML = `
                <h3>${profile.nome_profilo}</h3>
                <ul class="skills-list">
                    ${profile.skills.map(skill => `
                        <li>
                            <strong>${skill.nome_skill}</strong> - Livello: ${skill.livello}
                        </li>
                    `).join('')}
                </ul>
            `;
    
            // Apply button
            const applyButton = document.createElement("button");
            applyButton.classList.add('apply-button');
            applyButton.textContent = "Candidati";
            applyButton.addEventListener("click", () => {
                fetch("../../Backend/project/apply_profile.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        nome_profilo: profile.nome_profilo,
                        nome_progetto: data.progetto.nome,
                    }),
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        alert("Candidatura inviata con successo!");
                    } else {
                        const tooltip = document.createElement("div");
                        tooltip.classList.add("tooltip-bubble");

                        tooltip.textContent = result.message;

                        // Calculate position for the tooltip
                        const buttonRect = applyButton.getBoundingClientRect();
                        const viewportHeight = window.innerHeight;
                        const tooltipHeight = 50; 

                        // Avoid border overflow
                        if (buttonRect.bottom + tooltipHeight + 10 > viewportHeight) {
                            // Show tooltip above the button if there's not enough space below
                            tooltip.style.top = `${buttonRect.top - tooltipHeight - 5}px`;
                            tooltip.classList.add('top-position');
                        } else {
                            tooltip.style.top = `${buttonRect.bottom + 5}px`;
                        }

                        tooltip.style.left = `${buttonRect.left + (buttonRect.width / 2)}px`;
                        tooltip.style.transform = 'translateX(-50%)';

                        document.body.appendChild(tooltip);

                        // Display the tooltip for 3 seconds
                        setTimeout(() => {
                            tooltip.remove();
                        }, 3000);
                    }
                })
                .catch(error => {
                    console.error("Errore nella richiesta di candidatura:", error);
                    displayError("Errore nell'invio della candidatura.");
                });
               
            });
    
            profileElement.appendChild(applyButton);

            //Manage candidacy button

            if(data.progetto.email_creatore === userEmail){
                const viewProfileButton = document.createElement("a");
                viewProfileButton.classList.add('view-profile-button');
                viewProfileButton.textContent = "Gestisci le candidature"
                viewProfileButton.href = `./manageApplications.html?nome_profilo=${profile.nome_profilo}&nome_progetto=${data.progetto.nome}`;

                profileElement.appendChild(applyButton);
                profileElement.appendChild(viewProfileButton);
                profilesList.appendChild(profileElement);
            }

            profilesList.appendChild(profileElement);
        });
    
        profilesContainer.appendChild(profilesList);
        container.appendChild(profilesContainer);
    }


    // Rewards section
    rewardUrl = "../../Backend/project/get_rewards.php";
    fetch(rewardUrl, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ nome_progetto: data.progetto.nome }),
    })
    .then(response => response.json())
    .then(rewardsData => {
        if (rewardsData.error) {
            console.error("Errore nel recupero delle ricompense:", rewardsData.error);
            displayError(rewardsData.error);
            return;
        }

        if (rewardsData && rewardsData.length > 0) {
            const rewardsContainer = document.createElement("div");
            rewardsContainer.classList.add('rewards-section');
            rewardsContainer.innerHTML = "<h2>Ricompense</h2>";

            const rewardsList = document.createElement("div");
            rewardsList.classList.add('rewards-list');

            rewardsData.forEach(reward => {
                const rewardElement = document.createElement("div");
                rewardElement.classList.add('reward-card');
                rewardElement.innerHTML = `
                    <h3>${reward.descrizione}</h3>
                    <img src="${reward.foto}" class="reward-image">
                `;
                rewardsList.appendChild(rewardElement);
            });

            rewardsContainer.appendChild(rewardsList);
            container.appendChild(rewardsContainer);
        } else {
            console.log("Nessuna ricompensa trovata per questo progetto.");
        }
    })
    .catch(error => {
        console.error("Errore nella richiesta delle ricompense:", error);
        displayError("Errore nel caricamento delle ricompense.");
    });

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
            <div class="comment-header" data-comment-id="${comment.id}">
                <strong class="comment-author">${comment.nickname}</strong>
                <span class="comment-date">${new Date(comment.data).toLocaleDateString()}</span>
            </div>
            <p class="comment-text">${comment.testo}</p>
        `;

        if (comment.risposte && comment.risposte.length > 0) {
            // For now, a comment can have only one reply, so we take the first one
            const reply = comment.risposte[0];
            const replyElement = document.createElement("div");
            replyElement.classList.add('comment-reply');
            replyElement.innerHTML = `
                <div class="reply-header">
                    <strong class="reply-author">${reply.nickname}</strong>
                </div>
                <p class="reply-text">${reply.testo}</p>
            `;
            commentElement.appendChild(replyElement);
        } 
        // If the user is the creator of the project and it has not replies, show the reply button
        else if (data.progetto.email_creatore === userEmail) {
            const replyButton = document.createElement("button");
            replyButton.classList.add("reply-button");
            replyButton.textContent = "Rispondi al commento";
            replyButton.addEventListener("click", function () {
                // Avoid multiple forms
                const existingForm = commentElement.querySelector(".reply-form");
                if (existingForm){
                    existingForm.remove();
                    return;
                }            
                // Create the reply form
                const form = document.createElement("div");
                form.classList.add("reply-form");
                form.innerHTML = `
                    <textarea class="reply-input" placeholder="Scrivi la tua risposta..."></textarea>
                    <button class="send-reply-button">INVIA RISPOSTA</button>
                `;
            
                commentElement.appendChild(form);
            
                // Manage the reply button and post the reply
                const sendButton = form.querySelector(".send-reply-button");
                sendButton.addEventListener("click", async () => {
                    const replyText = form.querySelector(".reply-input").value.trim();
            
                    if (replyText === "") {
                        alert("Il testo della risposta non può essere vuoto.");
                        return;
                    }
            
                    try {
                        const response = await fetch("../../Backend/project/add_reply.php", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                id_commento: comment.id,
                                testo: replyText
                            })
                        });
            
                        const result = await response.json();
            
                        if (result.success) {                           
                            const replyElement = document.createElement("div");
                            replyElement.classList.add("comment-reply");
                            replyElement.innerHTML = `
                                <div class="reply-header">
                                    <strong class="reply-author">${result.username}</strong>
                                </div>
                                <p class="reply-text">${replyText}</p>
                            `;
                              
                            form.remove();
                            replyButton.remove();
            
                            // Add the reply after removing the form and button
                            commentElement.appendChild(replyElement);
                        } else {
                            alert("Errore durante l'invio della risposta: " + result.error);
                        }
                    } catch (error) {
                        console.error("Errore nella richiesta:", error);
                        alert("Errore nella richiesta.");
                    }
                });
            });
            commentElement.appendChild(replyButton);
        }

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