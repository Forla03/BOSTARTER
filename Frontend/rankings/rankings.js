document.addEventListener("DOMContentLoaded", () => {
    const titleEl = document.getElementById("ranking-title");
    const contentEl = document.getElementById("ranking-content");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
  
    const titles = [
      "Top Creators",
      "Progetti Vicini al Completamento",
      "Top Funders"
    ];
  
    let currentIndex = 0;
    let rankingsData = [];
  
    fetch("../../Backend/rankings_views/rankings.php") 
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          rankingsData = [
            data.rankings.top_creators,
            data.rankings.near_completion,
            data.rankings.top_funders
          ];
          renderRanking(currentIndex);
        } else {
          contentEl.innerHTML = `<p>Errore nel caricamento: ${data.message}</p>`;
        }
      })
      .catch(err => {
        contentEl.innerHTML = `<p>Errore di rete: ${err.message}</p>`;
      });
  
    function renderRanking(index) {
      titleEl.textContent = titles[index];
      const items = rankingsData[index];
  
      if (!items || items.length === 0) {
        contentEl.innerHTML = "<p>Nessun dato disponibile.</p>";
        return;
      }
  
      // Ranking is built dynamically
      let html = "<ol>";
      items.forEach((item, i) => {
        if (index === 0) {
          // Top creators
          html += `<li>${item.nickname} - Affidabilità: ${item.affidabilita}</li>`;
        } else if (index === 1) {
          // Near completion projects
          html += `<li>
            <strong>${item.NomeProgetto}</strong><br>
            ${item.Descrizione}<br>
            Budget: €${item.Budget} - Finanziato: €${item.TotaleFinanziato} <br>
            Mancano: €${item.Differenza}
          </li>`;
        } else if (index === 2) {
          // Top funders
          html += `<li>${item.nickname} - Totale donato: €${item.TotaleFinanziato}</li>`;
        }
      });
      html += "</ol>";
      contentEl.innerHTML = html;
    }
  
    prevBtn.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + titles.length) % titles.length;
      renderRanking(currentIndex);
    });
  
    nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % titles.length;
      renderRanking(currentIndex);
    });
  });
  