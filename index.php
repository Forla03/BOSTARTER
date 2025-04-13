<?php session_start(); ?>

<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BOSTARTER - Crowdfunding</title>
    <link rel="stylesheet" href="home.css">
</head>
<body>
    <script>
     // Effettua una richiesta AJAX per verificare la connessione
     fetch("/Backend/config.php")
     .then(response => response.text())
     .then(data => {
         console.log("Connessione al DB effettuata.");
     })
     .catch(error => {
          console.log("Errore nella richiesta.");
     });
    </script>

    <header>
        <div class="logo">BOSTARTER</div>
        <nav>
            <ul>
                <li>
                 <a href="<?php echo isset($_SESSION['email']) ? 'Frontend/creator/creator.html' : 'Frontend/login/login.html'; ?>">Crea un progetto</a>
                </li>
                <li><a href="Frontend/rankings/rankings.HTML">Classifiche</a></li>
                <li><a href="Frontend/skills/skills.php">Skills</a></li>
                <li><a href="Frontend/closedProjects/closed.HTML">Progetti chiusi</a></li>
            </ul>
        </nav>
        <button id="loginBtn">Accedi</button>
    </header>

    <section class="hero">
        <h1>Finanzia e scopri progetti innovativi</h1>
        <p>Unisciti alla community e supporta lo sviluppo di idee rivoluzionarie.</p>
        <button class="cta" onclick="window.location.href= 'Frontend/general_projectsView/general.HTML'">Esplora i progetti</button>
    </section>

    <section class="the_best">
        <h2>In evidenza</h2>
        <div class="best-list" id="bestList">
            
        </div>
    </section>

    <footer>
        <p>© 2025 BOSTARTER - Tutti i diritti riservati</p>
    </footer>

    <script src="home.js"></script>
</body>
</html>


