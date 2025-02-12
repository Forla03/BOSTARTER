<?php
session_start();
require '../../Backend/config.php';
?>

<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Competenze di Programmazione</title>
    <link rel="stylesheet" href="skills.css">
</head>
<body>

<header>
    <h1>Competenze di Programmazione</h1>
</header>

<section class="skills-container">
    <ul id="skills-list">
        <?php
        try {
            $stmt = $conn->prepare("SELECT * FROM CurriculumSkill");
            $stmt->execute();

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $nomeSkill = htmlspecialchars($row['nome_skill']);
                $livello = htmlspecialchars($row['livello']);

                echo "<li>$nomeSkill - Livello: $livello";

                if (isset($_SESSION["email"])) {
                    $emailUtente = $_SESSION["email"];

                    // Controllo se l'utente ha già questa skill
                    $checkStmt = $conn->prepare("SELECT * FROM Possedimento WHERE emailUtente = :email AND skill = :skill AND livello_skill = :livello");
                    $checkStmt->bindParam(":email", $emailUtente);
                    $checkStmt->bindParam(":skill", $row['nome_skill']);
                    $checkStmt->bindParam(":livello", $row['livello']);
                    $checkStmt->execute();
                    $possiede = $checkStmt->fetch(PDO::FETCH_ASSOC);

                    if ($possiede) {
                        echo " <button class='remove-btn' onclick=\"removeSkill('$nomeSkill', '$livello')\">Elimina dal Curriculum</button>";
                    } else {
                        echo " <button class='add-btn' onclick=\"addSkill('$nomeSkill', '$livello')\">Aggiungi al Curriculum</button>";
                    }
                } else {
                    // Se non è loggato, reindirizza al login
                    echo " <button class='login-btn' onclick=\"window.location.href='../login/login.html'\">Accedi per aggiungere</button>";
                }

                echo "</li>";
            }
        } catch (PDOException $e) {
            echo "<p>Errore nel recupero delle competenze: " . htmlspecialchars($e->getMessage()) . "</p>";
        }
        ?>
    </ul>

    <?php
    if (isset($_SESSION["is_admin"]) && $_SESSION["is_admin"] === true) {
        echo '<a href="add_skill.php" class="add-skill-btn">Aggiungi Skill</a>';
    }
    ?>
</section>

<script>
function addSkill(skill, level) {
    fetch('../../Backend/add_skillsToCurriculum.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'skill=' + encodeURIComponent(skill) + '&level=' + encodeURIComponent(level)
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        location.reload(); // Ricarica la pagina per aggiornare il pulsante
    })
    .catch(error => console.error('Errore:', error));
}

function removeSkill(skill, level) {
    fetch('../../Backend/remove_skillsFromCurriculum.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'skill=' + encodeURIComponent(skill) + '&level=' + encodeURIComponent(level)
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        location.reload(); // Ricarica la pagina per aggiornare il pulsante
    })
    .catch(error => console.error('Errore:', error));
}
</script>

</body>
</html>



