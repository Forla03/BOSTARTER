document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectName = urlParams.get('nomeProgetto');
    
    let pageTitle = document.getElementById("page-title");
    pageTitle.textContent = `Contribuisci a ${projectName}`;

    let donateButton = document.getElementById("donate-button");
    let donationAmount = document.getElementById("donation-amount");

    donateButton.addEventListener("click", function(){
        event.preventDefault();
        let amount = donationAmount.value;
        if (amount <= 0) {
            alert("L'importo deve essere maggiore di zero.");
            return;
        }
        let selectedReward = document.querySelector(".reward-card.selected");
        let rewardId = selectedReward ? selectedReward.getAttribute("data-id") : null;
        // Call the backend to handle the donation
        fetch("../../Backend/project/donate.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ nome_progetto: projectName, importo: amount, id_reward: rewardId }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Donazione effettuata con successo!");
            } else {
                alert("Puoi donare ad un progetto solo una volta al giorno. Riprova domani.");
            }
        })
        .catch(error => {
            console.error("Errore nella richiesta:", error);
            alert("Errore nella donazione. Riprova più tardi.");
        });
    });

    rewardUrl = "../../Backend/project/get_rewards.php";
    fetch(rewardUrl, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ nome_progetto: projectName }),
    })
    .then(response => response.json())
    .then(rewardsData => {
        if (rewardsData.error) {
            console.error("Errore nel recupero delle ricompense:", rewardsData.error);
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
                rewardElement.setAttribute("data-id", reward.codice);
                rewardElement.addEventListener("click", function() {
                    const currentlySelected = document.querySelector(".reward-card.selected");
            
                    if (currentlySelected && currentlySelected !== rewardElement) {
                        currentlySelected.classList.remove("selected");
                    }
            
                    rewardElement.classList.toggle("selected");
                });
                rewardsList.appendChild(rewardElement);
            });

            let rewardsSection = document.getElementById("rewards-section");
            rewardsContainer.appendChild(rewardsList);
            rewardsSection.appendChild(rewardsContainer);
        } else {
            console.log("Nessuna ricompensa trovata per questo progetto.");
        }
    })
    .catch(error => {
        console.error("Errore nella richiesta delle ricompense:", error);
    });


    
   
});