<?php
session_start();
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
            <!-- Qui verranno elencate le competenze -->
            <?php
            require '../../Backend/config.php';
            try{
               $stmt = $conn->prepare("SELECT * FROM CurriculumSkill");
               $stmt->execute();
               while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                 echo "<li>" . htmlspecialchars($row['nome_skill']) . "</li>"; 
               }
               $utente = $stmt->fetch(PDO::FETCH_ASSOC);
            }
            catch (PDOException $e) {
                echo "Errore nel login: " . $e->getMessage();
              }
            ?>
        </ul>

        <?php
        if (isset($_SESSION["is_admin"]) && $_SESSION["is_admin"] === true) {
            echo '<a href="add_skill.html" class="add-skill-btn">Aggiungi Skill</a>';
        }
        ?>
    </section>

</body>
</html>


