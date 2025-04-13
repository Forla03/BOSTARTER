document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById("loginBtn");

    // Use an AJAX request to check the connection
    fetch("/Backend/session.php")
        .then(response => response.json())
        .then(data => {
            if (data.logged_in) {
                // If the user is logged in display the nickname
                // clicking on the nickname will redirect the user to the account page
                loginBtn.textContent = `${data.nickname}`;
                loginBtn.addEventListener("click", function () {
                    window.location.href = "/Frontend/account/account.html";
                });
            } else {
                // If the user is not logged in display the login button
                loginBtn.textContent = "Accedi";
                loginBtn.addEventListener("click", function () {
                    window.location.href = "/Frontend/login/login.html";
                });
            }
        })
        .catch(error => console.error("Errore nel recupero dello stato della sessione:", error));

        fetch('/Backend/rankings_views/rankings.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const rankings = data.rankings;
                const bestList = document.getElementById('bestList');

                // Add the most reliable creator
                if (rankings.top_creators && rankings.top_creators.length > 0) {
                    const topCreator = rankings.top_creators[0];
                    const creatorDiv = document.createElement('div');
                    creatorDiv.className = 'best-item';
                    creatorDiv.innerHTML = `
                        <h3>Il creatore più affidabile</h3>
                        <div>
                        <p>${topCreator.nickname} (Affidabilità: ${topCreator.affidabilita})</p>
                        </div>
                    `;
                    bestList.appendChild(creatorDiv);
                }

                // Add the most near to be completed project
                if (rankings.near_completion && rankings.near_completion.length > 0) {
                    const nearCompletion = rankings.near_completion[0];
                    const projectDiv = document.createElement('div');
                    projectDiv.className = 'best-item';
                    projectDiv.innerHTML = `
                        <h3>Il progetto più vicino al completamento</h3>
                        <p>${nearCompletion.NomeProgetto}</p>
                        <p>Budget: €${nearCompletion.Budget}, Finanziato: €${nearCompletion.TotaleFinanziato}</p>
                    `;
                    bestList.appendChild(projectDiv);
                }

                // Add the most generous funder
                if (rankings.top_funders && rankings.top_funders.length > 0) {
                    const topFunder = rankings.top_funders[0];
                    const funderDiv = document.createElement('div');
                    funderDiv.className = 'best-item';
                    funderDiv.innerHTML = `
                        <h3>Il finanziatore più generoso</h3>
                        <div>
                        <p>${topFunder.nickname} (Totale finanziato: €${topFunder.TotaleFinanziato})</p>
                        </div>
                    `;
                    bestList.appendChild(funderDiv);
                }
            } else {
                console.error('Errore nel caricamento dei dati:', data.message);
            }
        })
        .catch(error => {
            console.error('Errore nella richiesta:', error);
        });
});
