<?php
session_start();
require '../../Backend/config.php';
?>

<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Progetti</title>
    <link rel="stylesheet" href="progetti.css">
</head>
<body>

    <header>
        <h1>Elenco Progetti</h1>
    </header>

    <section class="projects-container">
        <ul id="projects-list">
            <?php
            try {
                // Chiamata alla stored procedure
                $stmt = $conn->prepare("CALL VisualizzaProgettiDisponibili()");
                $stmt->execute();

                // Recupera i risultati
                $progetti = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Chiude il cursore per permettere altre query
                $stmt->closeCursor();

                // Controlla se ci sono progetti
                if (count($progetti) > 0) {
                    foreach ($progetti as $progetto) {
                        echo "<li>";
                        echo "<h2>" . htmlspecialchars($progetto['nome']) . "</h2>";
                        echo "<p>" . nl2br(htmlspecialchars($progetto['descrizione'])) . "</p>";
                        echo "<p><strong>Budget:</strong> €" . number_format($progetto['budget'], 2) . "</p>";
                        echo "<p><strong>Data limite:</strong> " . htmlspecialchars($progetto['data_limite']) . "</p>";
                        echo "<p><strong>Creatore:</strong> " . htmlspecialchars($progetto['email_creatore']) . "</p>";
                        echo "</li>";
                    }
                } else {
                    echo "<li>Nessun progetto disponibile</li>";
                }
            } catch (PDOException $e) {
                echo "<li>Errore nel recupero dei progetti: " . htmlspecialchars($e->getMessage()) . "</li>";
            }
            ?>
        </ul>
    </section>

</body>
</html>
